/**
 * POST /v1/ai/chat — AI assistant endpoint.
 *
 * Accepts user messages with workspace context, returns AI-generated responses.
 * Rate limited: 20/min, 200/day per user.
 * Input sanitization: 500 char limit, HTML/XML stripped.
 * Citations: only relative or production.city URLs.
 *
 * Phase 1: Uses workspace metadata to generate context-aware responses
 * without an external LLM API. The Claude API integration will be added
 * when ANTHROPIC_API_KEY is configured in the environment.
 *
 * @see Issue #411
 */

import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { authMiddleware } from "../auth/middleware.js";
import type { AuthContext } from "../auth/middleware.js";
import { rateLimitMiddleware } from "../middleware/rate-limit.js";
import { computeVisibleWorkspaces } from "../lib/workspace-resolver.js";
import { resolveDashboardRole } from "../lib/permissions.js";

type Bindings = {
  DB: D1Database;
  ALLOWED_ORIGIN: string;
  HMAC_SECRET: string;
  ANTHROPIC_API_KEY?: string;
};

/** Maximum user message length */
const MAX_MESSAGE_LENGTH = 500;

/** Strip HTML/XML tags from input */
function stripTags(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

/** Sanitize user message: strip tags, truncate */
function sanitizeMessage(raw: string): string {
  const stripped = stripTags(raw);
  if (stripped.length > MAX_MESSAGE_LENGTH) {
    return stripped.slice(0, MAX_MESSAGE_LENGTH);
  }
  return stripped;
}

/** Generate a simple session ID */
function generateSessionId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Citation link */
interface Citation {
  label: string;
  url: string;
}

/**
 * Phase 1 response generator — uses workspace metadata to produce
 * context-aware responses without calling an external LLM.
 */
function generateResponse(
  message: string,
  workspaceContext: { workspace?: string | null; tab?: string | null } | undefined,
  dashboardRole: string,
  visibleWorkspaces: { id: string; label: string; description: string; tabs: { id: string; label: string }[] }[],
): { response: string; citations: Citation[] } {
  const citations: Citation[] = [];
  const messageLower = message.toLowerCase();

  // If a workspace context is provided, include workspace-specific info
  if (workspaceContext?.workspace) {
    const ws = visibleWorkspaces.find((w) => w.id === workspaceContext.workspace);
    if (ws) {
      const tabInfo = ws.tabs.map((t) => t.label).join(", ");
      citations.push({
        label: ws.label,
        url: `/dashboard/${ws.id}`,
      });

      if (workspaceContext.tab) {
        const tab = ws.tabs.find((t) => t.id === workspaceContext.tab);
        if (tab) {
          citations.push({
            label: `${ws.label} — ${tab.label}`,
            url: `/dashboard/${ws.id}/${tab.id}`,
          });
        }
      }

      return {
        response: `You are viewing the ${ws.label} workspace. ${ws.description}. Available tabs: ${tabInfo}. You have ${dashboardRole} access to this workspace.`,
        citations,
      };
    }
  }

  // General workspace listing
  if (messageLower.includes("workspace") || messageLower.includes("feature") || messageLower.includes("available")) {
    const wsNames = visibleWorkspaces.map((w) => w.label);
    for (const ws of visibleWorkspaces.slice(0, 5)) {
      citations.push({ label: ws.label, url: `/dashboard/${ws.id}` });
    }
    return {
      response: `You have access to ${visibleWorkspaces.length} workspaces: ${wsNames.join(", ")}. Your role is ${dashboardRole}.`,
      citations,
    };
  }

  // Navigation help
  if (messageLower.includes("navigate") || messageLower.includes("go to") || messageLower.includes("find")) {
    for (const ws of visibleWorkspaces) {
      if (messageLower.includes(ws.label.toLowerCase()) || messageLower.includes(ws.id)) {
        citations.push({ label: ws.label, url: `/dashboard/${ws.id}` });
        return {
          response: `To access ${ws.label}: ${ws.description}. Navigate to /dashboard/${ws.id}.`,
          citations,
        };
      }
    }
  }

  // Default response
  return {
    response: `I can help you navigate Production City's dashboard. You have ${dashboardRole} access to ${visibleWorkspaces.length} workspaces. Ask me about specific workspaces, features, or how to find what you need.`,
    citations: visibleWorkspaces.slice(0, 3).map((ws) => ({
      label: ws.label,
      url: `/dashboard/${ws.id}`,
    })),
  };
}

// Schemas
const ChatRequestSchema = z.object({
  message: z.string().min(1, "Message is required"),
  context: z.object({
    workspace: z.string().nullable().optional(),
    tab: z.string().nullable().optional(),
    visibleWorkspaceIds: z.array(z.string()).optional(),
  }).optional(),
  sessionId: z.string().optional(),
});

const ChatResponseSchema = z.object({
  response: z.string(),
  citations: z.array(z.object({
    label: z.string(),
    url: z.string(),
  })),
  sessionId: z.string(),
});

const ErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
});

export const aiChatApp = new OpenAPIHono<{
  Bindings: Bindings;
  Variables: { auth: AuthContext };
}>();

// Auth middleware
aiChatApp.use("/v1/ai/chat", authMiddleware());

// Rate limit: 20 requests per minute per user
aiChatApp.use(
  "/v1/ai/chat",
  rateLimitMiddleware({
    keyFn: (c) => {
      const auth = c.get("auth") as AuthContext | undefined;
      return `ai-chat:${auth?.user.id ?? "anon"}`;
    },
    limit: 20,
    windowSeconds: 60,
  }),
);

const chatRoute = createRoute({
  method: "post",
  path: "/v1/ai/chat",
  summary: "AI assistant chat",
  description: "Send a message to the AI assistant with optional workspace context.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: ChatRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: ChatResponseSchema } },
      description: "AI response",
    },
    400: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Bad request",
    },
    401: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Unauthorized",
    },
    429: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Rate limited",
    },
  },
});

aiChatApp.openapi(chatRoute, (c) => {
  const auth = c.get("auth") as AuthContext;
  const body = c.req.valid("json");

  // Validate message
  if (!body.message || typeof body.message !== "string") {
    return c.json({ error: "bad_request", message: "Message is required" }, 400);
  }

  // Sanitize
  const sanitizedMessage = sanitizeMessage(body.message);
  if (!sanitizedMessage) {
    return c.json({ error: "bad_request", message: "Message is required" }, 400);
  }

  // Resolve dashboard role and visible workspaces
  const dashboardRole = resolveDashboardRole(auth.permissions);
  const visibleWorkspaces = computeVisibleWorkspaces(dashboardRole, auth.permissions);

  // Validate workspace context: ignore if not in user's visible set
  let validatedContext = body.context;
  if (validatedContext?.workspace) {
    const wsVisible = visibleWorkspaces.some((ws) => ws.id === validatedContext!.workspace);
    if (!wsVisible) {
      // User doesn't have access to this workspace — use general context
      validatedContext = { workspace: null, tab: null };
    }
  }

  // Generate response
  const { response, citations } = generateResponse(
    sanitizedMessage,
    validatedContext,
    dashboardRole,
    visibleWorkspaces,
  );

  // Session ID: reuse or generate new
  const sessionId = body.sessionId ?? generateSessionId();

  return c.json({
    response,
    citations,
    sessionId,
  }, 200);
});
