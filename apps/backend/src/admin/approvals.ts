/**
 * Admin approval workflow:
 * GET /v1/admin/approvals — list pending users
 * POST /v1/admin/approvals/:userId/approve — approve user
 * POST /v1/admin/approvals/:userId/reject — reject user
 */

import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { createPrismaClient } from "../lib/prisma.js";
import { authMiddleware, requirePermission } from "../auth/middleware.js";
import type { AuthContext } from "../auth/middleware.js";
import { createAuditLog } from "../auth/audit.js";

type Bindings = {
  DB: D1Database;
  ALLOWED_ORIGIN: string;
  POSTMARK_API_TOKEN: string;
};

export const approvalsApp = new OpenAPIHono<{
  Bindings: Bindings;
  Variables: { auth: AuthContext };
}>();

/** --- Schemas --- */

const PendingUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().nullable(),
  createdAt: z.string(),
});

const PendingUsersResponseSchema = z.object({
  users: z.array(PendingUserSchema),
});

const RejectBodySchema = z.object({
  reason: z.string().max(500).optional(),
});

const ErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
});

const MessageSchema = z.object({
  message: z.string(),
});

/** --- Routes --- */

const listApprovalsRoute = createRoute({
  method: "get",
  path: "/v1/admin/approvals",
  summary: "List users pending approval",
  responses: {
    200: { content: { "application/json": { schema: PendingUsersResponseSchema } }, description: "Pending users" },
  },
});

const approveRoute = createRoute({
  method: "post",
  path: "/v1/admin/approvals/{userId}/approve",
  summary: "Approve a pending user",
  request: { params: z.object({ userId: z.string() }) },
  responses: {
    200: { content: { "application/json": { schema: MessageSchema } }, description: "Approved" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Not found" },
    409: { content: { "application/json": { schema: ErrorSchema } }, description: "Invalid state" },
  },
});

const rejectRoute = createRoute({
  method: "post",
  path: "/v1/admin/approvals/{userId}/reject",
  summary: "Reject a pending user",
  request: {
    params: z.object({ userId: z.string() }),
    body: { content: { "application/json": { schema: RejectBodySchema } } },
  },
  responses: {
    200: { content: { "application/json": { schema: MessageSchema } }, description: "Rejected" },
    400: { content: { "application/json": { schema: ErrorSchema } }, description: "Invalid input" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Not found" },
    409: { content: { "application/json": { schema: ErrorSchema } }, description: "Invalid state" },
  },
});

/** --- Auth --- */
approvalsApp.use("/v1/admin/*", authMiddleware());
approvalsApp.use("/v1/admin/approvals", requirePermission("user", "update"));
approvalsApp.use("/v1/admin/approvals/*", requirePermission("user", "update"));

/** --- Handlers --- */

approvalsApp.openapi(listApprovalsRoute, async (c) => {
  const prisma = await createPrismaClient(c.env.DB);
  try {
    const users = await prisma.user.findMany({
      where: { status: "pending_approval" },
      orderBy: { createdAt: "asc" },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    return c.json({
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        createdAt: u.createdAt.toISOString(),
      })),
    }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

approvalsApp.openapi(approveRoute, async (c) => {
  const { userId } = c.req.valid("param");
  const auth = c.get("auth") as AuthContext;
  const prisma = await createPrismaClient(c.env.DB);

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, status: true, userRoles: { select: { id: true } } },
    });

    if (!user) {
      return c.json({ error: "not_found", message: "User not found." }, 404);
    }

    if (user.status !== "pending_approval") {
      return c.json({ error: "conflict", message: "User is not pending approval." }, 409);
    }

    // Verify at least one role
    if (user.userRoles.length === 0) {
      return c.json({ error: "conflict", message: "Cannot approve user with no roles." }, 409);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { status: "active" },
    });

    await createAuditLog(prisma, {
      action: "approval.approved",
      resource: "user",
      actorId: auth.user.id,
      subjectId: userId,
      details: { email: user.email },
      ipAddress: c.req.header("CF-Connecting-IP"),
      userAgent: c.req.header("User-Agent"),
    });

    await createAuditLog(prisma, {
      action: "user.status_changed",
      resource: "user",
      actorId: auth.user.id,
      subjectId: userId,
      details: { previousStatus: "pending_approval", newStatus: "active" },
      ipAddress: c.req.header("CF-Connecting-IP"),
      userAgent: c.req.header("User-Agent"),
    });

    return c.json({ message: "User approved." }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

approvalsApp.openapi(rejectRoute, async (c) => {
  const { userId } = c.req.valid("param");
  const body = c.req.valid("json");
  const auth = c.get("auth") as AuthContext;
  const prisma = await createPrismaClient(c.env.DB);

  try {
    // Validate reason: no HTML
    if (body.reason && /<[^>]*>/.test(body.reason)) {
      return c.json({ error: "invalid_input", message: "Reason must not contain HTML tags." }, 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, status: true },
    });

    if (!user) {
      return c.json({ error: "not_found", message: "User not found." }, 404);
    }

    if (user.status !== "pending_approval") {
      return c.json({ error: "conflict", message: "User is not pending approval." }, 409);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { status: "deactivated", deactivatedAt: new Date() },
    });

    await createAuditLog(prisma, {
      action: "approval.rejected",
      resource: "user",
      actorId: auth.user.id,
      subjectId: userId,
      details: { email: user.email },
      ipAddress: c.req.header("CF-Connecting-IP"),
      userAgent: c.req.header("User-Agent"),
    });

    await createAuditLog(prisma, {
      action: "user.status_changed",
      resource: "user",
      actorId: auth.user.id,
      subjectId: userId,
      details: { previousStatus: "pending_approval", newStatus: "deactivated" },
      ipAddress: c.req.header("CF-Connecting-IP"),
      userAgent: c.req.header("User-Agent"),
    });

    // Send rejection notification email (no detailed reason per spec)
    const postmarkApiToken = c.env.POSTMARK_API_TOKEN || "";
    if (postmarkApiToken) {
      try {
        await fetch("https://api.postmarkapp.com/email", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-Postmark-Server-Token": postmarkApiToken,
          },
          body: JSON.stringify({
            From: "Production City <noreply@mail.production.city>",
            To: user.email,
            Subject: "Production City — Access Request Update",
            TextBody:
              "Your access request for Production City was not approved. If you believe this is an error, please contact the administrator.",
            HtmlBody: `<p>Your access request for Production City was not approved.</p><p>If you believe this is an error, please contact the administrator.</p>`,
            MessageStream: "outbound",
            Tag: "rejection-notification",
          }),
        });
      } catch (err) {
        console.error(JSON.stringify({ event: "rejection.email.failed", error: String(err) }));
      }
    }

    return c.json({ message: "User rejected." }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});
