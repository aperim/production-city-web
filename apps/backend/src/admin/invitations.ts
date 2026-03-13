/**
 * Admin invitation management:
 * GET /v1/admin/invitations — list
 * POST /v1/admin/invitations — create and send
 * DELETE /v1/admin/invitations/:id — revoke
 * POST /v1/admin/invitations/:id/resend — resend
 */

import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { createPrismaClient } from "../lib/prisma.js";
import { authMiddleware, requirePermission } from "../auth/middleware.js";
import type { AuthContext } from "../auth/middleware.js";
import { createAuditLog } from "../auth/audit.js";
import {
  generateToken,
  generateCode,
  sha256Hex,
  hmacSha256Hex,
  sendInvitationEmail,
  invalidatePreviousMagicLinks,
} from "../email/service.js";

type Bindings = {
  DB: D1Database;
  ALLOWED_ORIGIN: string;
  POSTMARK_API_TOKEN: string;
  HMAC_SECRET: string;
};

export const invitationsApp = new OpenAPIHono<{
  Bindings: Bindings;
  Variables: { auth: AuthContext };
}>();

/** --- Schemas --- */

const InvitationListQuerySchema = z.object({
  page: z.string().optional().default("1"),
  pageSize: z.string().optional().default("25"),
  status: z.string().optional(),
});

const InvitationSchema = z.object({
  id: z.string(),
  email: z.string(),
  status: z.string(),
  message: z.string().nullable(),
  createdAt: z.string(),
  expiresAt: z.string(),
});

const InvitationListResponseSchema = z.object({
  invitations: z.array(InvitationSchema),
  pagination: z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

const CreateInvitationBodySchema = z.object({
  email: z.string().email(),
  roleIds: z.array(z.string().min(1)).min(1),
  message: z.string().max(500).optional(),
});

const CreateInvitationResponseSchema = z.object({
  invitation: InvitationSchema,
  deliveryStatus: z.string(),
});

const ErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
});

const MessageSchema = z.object({
  message: z.string(),
});

/** --- Route Definitions --- */

const listInvitationsRoute = createRoute({
  method: "get",
  path: "/v1/admin/invitations",
  summary: "List invitations",
  request: { query: InvitationListQuerySchema },
  responses: {
    200: { content: { "application/json": { schema: InvitationListResponseSchema } }, description: "Invitation list" },
  },
});

const createInvitationRoute = createRoute({
  method: "post",
  path: "/v1/admin/invitations",
  summary: "Create and send invitation",
  request: {
    body: { content: { "application/json": { schema: CreateInvitationBodySchema } } },
  },
  responses: {
    201: { content: { "application/json": { schema: CreateInvitationResponseSchema } }, description: "Created" },
    400: { content: { "application/json": { schema: ErrorSchema } }, description: "Validation error" },
    409: { content: { "application/json": { schema: ErrorSchema } }, description: "Conflict" },
  },
});

const revokeInvitationRoute = createRoute({
  method: "delete",
  path: "/v1/admin/invitations/{id}",
  summary: "Revoke an invitation",
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: { content: { "application/json": { schema: MessageSchema } }, description: "Revoked" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Not found" },
  },
});

const resendInvitationRoute = createRoute({
  method: "post",
  path: "/v1/admin/invitations/{id}/resend",
  summary: "Resend invitation email",
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: { content: { "application/json": { schema: MessageSchema } }, description: "Resent" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Not found" },
    400: { content: { "application/json": { schema: ErrorSchema } }, description: "Invalid state" },
  },
});

/** --- Apply auth + permissions --- */
invitationsApp.use("/v1/admin/*", authMiddleware());
// GET list requires read; POST create requires create
invitationsApp.use("/v1/admin/invitations", async (c, next) => {
  if (c.req.method === "GET") {
    return requirePermission("invitation", "read")(c, next);
  }
  // POST = create
  return requirePermission("invitation", "create")(c, next);
});
// DELETE = revoke, POST resend = create
invitationsApp.use("/v1/admin/invitations/:id", async (c, next) => {
  if (c.req.method === "DELETE") {
    return requirePermission("invitation", "revoke")(c, next);
  }
  return requirePermission("invitation", "read")(c, next);
});
invitationsApp.use("/v1/admin/invitations/:id/resend", requirePermission("invitation", "create"));

/** --- Handlers --- */

invitationsApp.openapi(listInvitationsRoute, async (c) => {
  const query = c.req.valid("query");
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize, 10) || 25));

  const prisma = await createPrismaClient(c.env.DB);
  try {
    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;

    const [invitations, total] = await Promise.all([
      prisma.invitation.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          status: true,
          message: true,
          createdAt: true,
          expiresAt: true,
        },
      }),
      prisma.invitation.count({ where }),
    ]);

    return c.json({
      invitations: invitations.map((inv) => ({
        id: inv.id,
        email: inv.email,
        status: inv.status,
        message: inv.message,
        createdAt: inv.createdAt.toISOString(),
        expiresAt: inv.expiresAt.toISOString(),
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

invitationsApp.openapi(createInvitationRoute, async (c) => {
  const body = c.req.valid("json");
  const auth = c.get("auth") as AuthContext;
  const prisma = await createPrismaClient(c.env.DB);

  try {
    const email = body.email.toLowerCase().trim();

    // Validate message: no HTML
    if (body.message && /<[^>]*>/.test(body.message)) {
      return c.json({ error: "invalid_input", message: "Message must not contain HTML tags." }, 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existingUser) {
      return c.json({ error: "conflict", message: "A user with this email already exists." }, 409);
    }

    // Check for pending invitation
    const pendingInvitation = await prisma.invitation.findFirst({
      where: { email, status: "pending" },
      select: { id: true },
    });
    if (pendingInvitation) {
      return c.json({ error: "conflict", message: "A pending invitation already exists for this email." }, 409);
    }

    // Validate roles exist
    const roles = await prisma.role.findMany({
      where: { id: { in: body.roleIds } },
      select: { id: true },
    });
    if (roles.length !== body.roleIds.length) {
      return c.json({ error: "invalid_input", message: "One or more roles not found." }, 400);
    }

    // Create invitation with 7-day expiry
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const invitation = await prisma.invitation.create({
      data: {
        email,
        invitedById: auth.user.id,
        status: "pending",
        activeEmail: email,
        message: body.message ?? null,
        expiresAt,
        invitationRoles: {
          create: body.roleIds.map((roleId) => ({ roleId })),
        },
      },
    });

    // Generate magic link for invitation
    const token = generateToken();
    const code = generateCode();
    const tokenHash = await sha256Hex(token);
    const hmacSecret = c.env.HMAC_SECRET || "default-hmac-secret";
    const codeHash = await hmacSha256Hex(
      hmacSecret,
      `${email}invitation_accept${tokenHash}${code}`,
    );

    await prisma.magicLink.create({
      data: {
        email,
        tokenHash,
        codeHash,
        purpose: "invitation_accept",
        deliveryStatus: "sending",
        expiresAt,
      },
    });

    // Send invitation email
    const baseUrl = c.env.ALLOWED_ORIGIN || "http://localhost:4321";
    const magicLinkUrl = `${baseUrl}/auth/verify?token=${encodeURIComponent(token)}`;
    const postmarkApiToken = c.env.POSTMARK_API_TOKEN || "";

    let deliveryStatus = "sending";
    if (postmarkApiToken) {
      const emailResult = await sendInvitationEmail(postmarkApiToken, {
        email,
        inviterName: auth.user.name || auth.user.email,
        message: body.message,
        token,
        code,
        magicLinkUrl,
        expiresIn: "7 days",
      });
      deliveryStatus = emailResult.ok ? "sent" : "failed";
    }

    await createAuditLog(prisma, {
      action: "invitation.created",
      resource: "invitation",
      actorId: auth.user.id,
      details: { email },
      ipAddress: c.req.header("CF-Connecting-IP"),
      userAgent: c.req.header("User-Agent"),
    });

    return c.json({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        status: invitation.status,
        message: invitation.message,
        createdAt: invitation.createdAt.toISOString(),
        expiresAt: invitation.expiresAt.toISOString(),
      },
      deliveryStatus,
    }, 201);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

invitationsApp.openapi(revokeInvitationRoute, async (c) => {
  const { id } = c.req.valid("param");
  const auth = c.get("auth") as AuthContext;
  const prisma = await createPrismaClient(c.env.DB);

  try {
    // Atomic: only revoke if still pending
    const result = await prisma.invitation.updateMany({
      where: { id, status: "pending" },
      data: { status: "revoked", activeEmail: null, revokedAt: new Date() },
    });

    if (result.count === 0) {
      return c.json({ error: "not_found", message: "Invitation not found or already processed." }, 404);
    }

    const invitation = await prisma.invitation.findUnique({
      where: { id },
      select: { email: true },
    });

    await createAuditLog(prisma, {
      action: "invitation.revoked",
      resource: "invitation",
      actorId: auth.user.id,
      details: { email: invitation?.email },
      ipAddress: c.req.header("CF-Connecting-IP"),
      userAgent: c.req.header("User-Agent"),
    });

    return c.json({ message: "Invitation revoked." }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

invitationsApp.openapi(resendInvitationRoute, async (c) => {
  const { id } = c.req.valid("param");
  const auth = c.get("auth") as AuthContext;
  const prisma = await createPrismaClient(c.env.DB);

  try {
    const invitation = await prisma.invitation.findUnique({
      where: { id },
      select: { id: true, email: true, status: true },
    });

    if (!invitation) {
      return c.json({ error: "not_found", message: "Invitation not found." }, 404);
    }

    if (invitation.status !== "pending") {
      return c.json({ error: "invalid_state", message: "Only pending invitations can be resent." }, 400);
    }

    // Invalidate previous magic links for this email
    await invalidatePreviousMagicLinks(prisma, invitation.email, "invitation_accept");

    // Generate new magic link
    const token = generateToken();
    const code = generateCode();
    const tokenHash = await sha256Hex(token);
    const hmacSecret = c.env.HMAC_SECRET || "default-hmac-secret";
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const codeHash = await hmacSha256Hex(
      hmacSecret,
      `${invitation.email}invitation_accept${tokenHash}${code}`,
    );

    await prisma.magicLink.create({
      data: {
        email: invitation.email,
        tokenHash,
        codeHash,
        purpose: "invitation_accept",
        deliveryStatus: "sending",
        expiresAt,
      },
    });

    // Send email
    const baseUrl = c.env.ALLOWED_ORIGIN || "http://localhost:4321";
    const magicLinkUrl = `${baseUrl}/auth/verify?token=${encodeURIComponent(token)}`;
    const postmarkApiToken = c.env.POSTMARK_API_TOKEN || "";

    if (postmarkApiToken) {
      await sendInvitationEmail(postmarkApiToken, {
        email: invitation.email,
        inviterName: auth.user.name || auth.user.email,
        token,
        code,
        magicLinkUrl,
        expiresIn: "7 days",
      });
    }

    await createAuditLog(prisma, {
      action: "invitation.resent",
      resource: "invitation",
      actorId: auth.user.id,
      details: { email: invitation.email },
      ipAddress: c.req.header("CF-Connecting-IP"),
      userAgent: c.req.header("User-Agent"),
    });

    return c.json({ message: "Invitation resent." }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});
