/**
 * Tests for announcement editor utility functions (shared library).
 * Mirrors the original tests from apps/web/app/dashboard/announcements/editor-utils.test.ts.
 *
 * @see Issue #443
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  stripCRLF,
  validatePublish,
  hasErrors,
  getAutoSaveKey,
  saveDraftToLocalStorage,
  loadDraftFromLocalStorage,
  clearDraftFromLocalStorage,
} from "./announcement-editor-utils";

describe("stripCRLF", () => {
  it("removes carriage returns", () => {
    expect(stripCRLF("hello\rworld")).toBe("helloworld");
  });

  it("removes newlines", () => {
    expect(stripCRLF("hello\nworld")).toBe("helloworld");
  });

  it("removes CRLF sequences", () => {
    expect(stripCRLF("hello\r\nworld")).toBe("helloworld");
  });

  it("passes through clean strings unchanged", () => {
    expect(stripCRLF("hello world")).toBe("hello world");
  });

  it("handles empty string", () => {
    expect(stripCRLF("")).toBe("");
  });

  it("handles multiple CRLF sequences", () => {
    expect(stripCRLF("a\rb\nc\r\nd")).toBe("abcd");
  });
});

describe("validatePublish", () => {
  const validInput = {
    title: "Test Title",
    summary: "Test summary",
    contentBlocks: [
      { id: "1", position: 0, type: "text" as const, markdown: "hello" },
    ],
    categoryIds: ["cat-1"],
    visibility: "public" as const,
    roleIds: [],
  };

  it("returns no errors for valid input", () => {
    const errors = validatePublish(validInput);
    expect(hasErrors(errors)).toBe(false);
  });

  it("requires title", () => {
    const errors = validatePublish({ ...validInput, title: "" });
    expect(errors.title).toBe("Title is required");
  });

  it("requires title with content (not just spaces)", () => {
    const errors = validatePublish({ ...validInput, title: "   " });
    expect(errors.title).toBe("Title is required");
  });

  it("requires summary", () => {
    const errors = validatePublish({ ...validInput, summary: "" });
    expect(errors.summary).toBe("Summary is required");
  });

  it("requires at least one content block", () => {
    const errors = validatePublish({ ...validInput, contentBlocks: [] });
    expect(errors.content).toBe("At least one content block is required");
  });

  it("requires at least one category", () => {
    const errors = validatePublish({ ...validInput, categoryIds: [] });
    expect(errors.categories).toBe("At least one category is required");
  });

  it("requires roles for private announcements", () => {
    const errors = validatePublish({
      ...validInput,
      visibility: "private",
      roleIds: [],
    });
    expect(errors.roles).toBe("Private announcements require at least one role");
  });

  it("does not require roles for public announcements", () => {
    const errors = validatePublish({
      ...validInput,
      visibility: "public",
      roleIds: [],
    });
    expect(errors.roles).toBeUndefined();
  });

  it("returns multiple errors", () => {
    const errors = validatePublish({
      title: "",
      summary: "",
      contentBlocks: [],
      categoryIds: [],
      visibility: "private",
      roleIds: [],
    });
    expect(hasErrors(errors)).toBe(true);
    expect(errors.title).toBeDefined();
    expect(errors.summary).toBeDefined();
    expect(errors.content).toBeDefined();
    expect(errors.categories).toBeDefined();
    expect(errors.roles).toBeDefined();
  });
});

describe("hasErrors", () => {
  it("returns false for empty object", () => {
    expect(hasErrors({})).toBe(false);
  });

  it("returns true when errors exist", () => {
    expect(hasErrors({ title: "error" })).toBe(true);
  });
});

describe("getAutoSaveKey", () => {
  it("returns new key when no id", () => {
    expect(getAutoSaveKey()).toBe("announcement-draft-new");
  });

  it("returns id-specific key", () => {
    expect(getAutoSaveKey("abc-123")).toBe("announcement-draft-abc-123");
  });
});

describe("localStorage draft management", () => {
  const mockStorage = new Map<string, string>();
  const originalLocalStorage = Object.getOwnPropertyDescriptor(window, "localStorage");

  beforeEach(() => {
    mockStorage.clear();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
      getItem: (key: string) => mockStorage.get(key) ?? null,
      setItem: (key: string, value: string) => mockStorage.set(key, value),
      removeItem: (key: string) => mockStorage.delete(key),
      },
    });
  });

  afterEach(() => {
    if (originalLocalStorage) {
      Object.defineProperty(window, "localStorage", originalLocalStorage);
    }
  });

  const draftData = {
    title: "Test",
    summary: "Summary",
    contentBlocks: [],
    visibility: "public",
    categoryIds: ["cat-1"],
    tagIds: [],
    roleIds: [],
  };

  it("saves and loads draft", () => {
    const key = "test-key";
    saveDraftToLocalStorage(key, draftData);
    const loaded = loadDraftFromLocalStorage(key);
    expect(loaded).not.toBeNull();
    expect(loaded!.title).toBe("Test");
    expect(loaded!.categoryIds).toEqual(["cat-1"]);
  });

  it("returns null for missing key", () => {
    expect(loadDraftFromLocalStorage("nonexistent")).toBeNull();
  });

  it("clears draft", () => {
    const key = "test-key";
    saveDraftToLocalStorage(key, draftData);
    clearDraftFromLocalStorage(key);
    expect(loadDraftFromLocalStorage(key)).toBeNull();
  });

  it("expires drafts older than 24 hours", () => {
    const key = "test-key";
    const oldData = {
      ...draftData,
      savedAt: Date.now() - 25 * 60 * 60 * 1000,
    };
    mockStorage.set(key, JSON.stringify(oldData));
    expect(loadDraftFromLocalStorage(key)).toBeNull();
  });

  it("handles corrupted data gracefully", () => {
    mockStorage.set("bad-key", "not-json{{{");
    expect(loadDraftFromLocalStorage("bad-key")).toBeNull();
  });

  it("rejects drafts with invalid visibility", () => {
    const badDraft = {
      ...draftData,
      visibility: "hacked",
      savedAt: Date.now(),
    };
    mockStorage.set("bad-vis", JSON.stringify(badDraft));
    expect(loadDraftFromLocalStorage("bad-vis")).toBeNull();
  });

  it("rejects drafts with non-string categoryIds", () => {
    const badDraft = {
      ...draftData,
      categoryIds: [123, null],
      savedAt: Date.now(),
    };
    mockStorage.set("bad-cats", JSON.stringify(badDraft));
    expect(loadDraftFromLocalStorage("bad-cats")).toBeNull();
  });

  it("rejects drafts with missing fields", () => {
    mockStorage.set("partial", JSON.stringify({ title: "only title", savedAt: Date.now() }));
    expect(loadDraftFromLocalStorage("partial")).toBeNull();
  });
});
