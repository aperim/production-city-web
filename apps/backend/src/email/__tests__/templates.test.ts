import { describe, it, expect } from "vitest";
import {
  escapeHtml,
  renderMagicLinkHtml,
  renderMagicLinkText,
} from "../templates/magic-link.js";
import {
  renderInvitationHtml,
  renderInvitationText,
  validateInvitationMessage,
  INVITATION_MESSAGE_MAX_LENGTH,
} from "../templates/invitation.js";

describe("escapeHtml", () => {
  it("escapes all HTML special characters", () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;",
    );
  });

  it("escapes ampersands", () => {
    expect(escapeHtml("foo & bar")).toBe("foo &amp; bar");
  });

  it("escapes single quotes", () => {
    expect(escapeHtml("it's")).toBe("it&#x27;s");
  });

  it("returns empty string unchanged", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("returns safe string unchanged", () => {
    expect(escapeHtml("hello world")).toBe("hello world");
  });
});

describe("Magic Link Email Templates", () => {
  const params = {
    magicLinkUrl: "https://production.city/auth/verify?token=abc123",
    code: "123456",
    expiresIn: "15 minutes",
  };

  describe("renderMagicLinkHtml", () => {
    it("renders valid HTML", () => {
      const html = renderMagicLinkHtml(params);
      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("</html>");
    });

    it("includes the magic link URL", () => {
      const html = renderMagicLinkHtml(params);
      expect(html).toContain(params.magicLinkUrl);
    });

    it("includes the 6-digit code", () => {
      const html = renderMagicLinkHtml(params);
      expect(html).toContain("123456");
    });

    it("includes expiry notice", () => {
      const html = renderMagicLinkHtml(params);
      expect(html).toContain("15 minutes");
    });

    it("includes sign-in subject text", () => {
      const html = renderMagicLinkHtml(params);
      expect(html).toContain("Sign in to Production City");
    });

    it("includes safety notice", () => {
      const html = renderMagicLinkHtml(params);
      expect(html).toContain("you can safely ignore this email");
    });

    it("escapes user-controllable content in URL", () => {
      const html = renderMagicLinkHtml({
        ...params,
        magicLinkUrl: 'https://evil.com/"><script>alert(1)</script>',
      });
      expect(html).not.toContain("<script>");
      expect(html).toContain("&lt;script&gt;");
    });
  });

  describe("renderMagicLinkText", () => {
    it("includes the magic link URL", () => {
      const text = renderMagicLinkText(params);
      expect(text).toContain(params.magicLinkUrl);
    });

    it("includes the code", () => {
      const text = renderMagicLinkText(params);
      expect(text).toContain("123456");
    });

    it("includes expiry notice", () => {
      const text = renderMagicLinkText(params);
      expect(text).toContain("15 minutes");
    });

    it("does not contain HTML tags", () => {
      const text = renderMagicLinkText(params);
      expect(text).not.toMatch(/<[a-z][^>]*>/i);
    });
  });
});

describe("Invitation Email Templates", () => {
  const params = {
    inviterName: "Alice Admin",
    message: "Welcome to the team!",
    magicLinkUrl: "https://production.city/auth/verify?token=xyz789",
    code: "654321",
    expiresIn: "7 days",
  };

  describe("renderInvitationHtml", () => {
    it("renders valid HTML", () => {
      const html = renderInvitationHtml(params);
      expect(html).toContain("<!DOCTYPE html>");
    });

    it("includes inviter name", () => {
      const html = renderInvitationHtml(params);
      expect(html).toContain("Alice Admin");
    });

    it("includes personal message", () => {
      const html = renderInvitationHtml(params);
      expect(html).toContain("Welcome to the team!");
    });

    it("includes magic link URL", () => {
      const html = renderInvitationHtml(params);
      expect(html).toContain(params.magicLinkUrl);
    });

    it("includes the code", () => {
      const html = renderInvitationHtml(params);
      expect(html).toContain("654321");
    });

    it("includes expiry notice", () => {
      const html = renderInvitationHtml(params);
      expect(html).toContain("7 days");
    });

    it("omits message block when no message provided", () => {
      const html = renderInvitationHtml({ ...params, message: undefined });
      expect(html).not.toContain("font-style:italic");
    });

    it("escapes HTML in inviter name", () => {
      const html = renderInvitationHtml({
        ...params,
        inviterName: '<img src=x onerror="alert(1)">',
      });
      expect(html).not.toContain("<img");
      expect(html).toContain("&lt;img");
    });

    it("escapes HTML in personal message", () => {
      const html = renderInvitationHtml({
        ...params,
        message: '<script>alert("xss")</script>',
      });
      expect(html).not.toContain("<script>");
      expect(html).toContain("&lt;script&gt;");
    });
  });

  describe("renderInvitationText", () => {
    it("includes inviter name", () => {
      const text = renderInvitationText(params);
      expect(text).toContain("Alice Admin");
    });

    it("includes personal message", () => {
      const text = renderInvitationText(params);
      expect(text).toContain("Welcome to the team!");
    });

    it("omits message when not provided", () => {
      const text = renderInvitationText({ ...params, message: undefined });
      expect(text).not.toContain("Personal message");
    });

    it("does not contain HTML tags", () => {
      const text = renderInvitationText(params);
      expect(text).not.toMatch(/<[a-z][^>]*>/i);
    });
  });
});

describe("validateInvitationMessage", () => {
  it("accepts a valid short message", () => {
    expect(validateInvitationMessage("Welcome!")).toEqual({ valid: true });
  });

  it("accepts a message at the max length", () => {
    const msg = "a".repeat(INVITATION_MESSAGE_MAX_LENGTH);
    expect(validateInvitationMessage(msg)).toEqual({ valid: true });
  });

  it("rejects a message exceeding max length", () => {
    const msg = "a".repeat(INVITATION_MESSAGE_MAX_LENGTH + 1);
    const result = validateInvitationMessage(msg);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toContain("500");
    }
  });

  it("rejects HTML tags", () => {
    const result = validateInvitationMessage("Hello <b>world</b>");
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toContain("HTML");
    }
  });

  it("rejects URLs", () => {
    const result = validateInvitationMessage("Visit https://evil.com for more");
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toContain("URL");
    }
  });

  it("rejects http URLs", () => {
    const result = validateInvitationMessage("Visit http://evil.com");
    expect(result.valid).toBe(false);
  });

  it("accepts message with no HTML or URLs", () => {
    expect(
      validateInvitationMessage("Looking forward to working with you!"),
    ).toEqual({ valid: true });
  });
});
