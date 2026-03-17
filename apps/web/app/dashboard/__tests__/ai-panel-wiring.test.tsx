/**
 * Integration tests for AI panel wiring in the dashboard.
 *
 * @see Issue #412
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act, cleanup } from "@testing-library/react";
import { AIPanelWired } from "../components/AIPanelWired";

// Mock useAIContext
vi.mock("../hooks/useAIContext", () => ({
  useAIContext: () => ({
    workspace: "productions",
    tab: "overview",
    visibleWorkspaceIds: ["productions", "finance"],
    toAPIContext: () => ({
      workspace: "productions",
      tab: "overview",
      visibleWorkspaceIds: ["productions", "finance"],
    }),
  }),
}));

// Mock useRegistry (required by useAIContext's internal dependency chain)
vi.mock("../components/RegistryProvider", () => ({
  useRegistry: () => ({
    visibleWorkspaceIds: ["productions", "finance"],
    getVisibleTabIds: () => ["overview"],
    currentPhase: "company_formation",
    visibleFeatureIds: [],
    isWorkspaceVisible: () => true,
  }),
}));

const originalFetch = global.fetch;

/** Helper to type into an input and submit */
async function typeAndSubmit(input: HTMLElement, text: string) {
  fireEvent.change(input, { target: { value: text } });
  fireEvent.submit(input.closest("form")!);
}

describe("AI Panel wiring", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    Object.defineProperty(window, "location", {
      value: { pathname: "/dashboard/productions/overview", hostname: "localhost" },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    cleanup();
    global.fetch = originalFetch;
  });

  it("renders toggle button when closed", () => {
    render(<AIPanelWired />);
    expect(screen.getByLabelText("Open AI assistant")).toBeDefined();
  });

  it("opens panel when toggle clicked", () => {
    render(<AIPanelWired />);
    fireEvent.click(screen.getByLabelText("Open AI assistant"));
    expect(screen.getByLabelText("AI assistant")).toBeDefined();
  });

  it("opens panel with Cmd+J keyboard shortcut", () => {
    render(<AIPanelWired />);
    fireEvent.keyDown(document, { key: "j", metaKey: true });
    expect(screen.getByLabelText("AI assistant")).toBeDefined();
  });

  it("sends message to POST /v1/ai/chat and displays response", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          response: "The Productions workspace manages film and TV production lifecycle.",
          citations: [{ label: "Productions", url: "/dashboard/productions" }],
          sessionId: "session-abc-123",
        }),
    });

    render(<AIPanelWired defaultOpen />);

    const input = screen.getByLabelText("Message input");
    await act(async () => {
      await typeAndSubmit(input, "What is the Productions workspace?");
    });

    // Verify fetch was called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/ai/chat"),
        expect.objectContaining({
          method: "POST",
          credentials: "include",
        }),
      );
    });

    // Verify the request body
    const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]!;
    const requestBody = JSON.parse(fetchCall[1].body as string);
    expect(requestBody.message).toBe("What is the Productions workspace?");
    expect(requestBody.context).toEqual({
      workspace: "productions",
      tab: "overview",
      visibleWorkspaceIds: ["productions", "finance"],
    });

    // Verify response is displayed
    await waitFor(() => {
      expect(screen.getByText(/Productions workspace manages film/)).toBeDefined();
    });
  });

  it("shows loading state while waiting for response", async () => {
    let resolvePromise: (value: unknown) => void;
    const responsePromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    (global.fetch as ReturnType<typeof vi.fn>).mockReturnValueOnce(responsePromise);

    render(<AIPanelWired defaultOpen />);

    const input = screen.getByLabelText("Message input");
    await act(async () => {
      await typeAndSubmit(input, "Test message");
    });

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText("Thinking...")).toBeDefined();
    });

    // Resolve the promise
    await act(async () => {
      resolvePromise!({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            response: "Here is the answer.",
            citations: [],
            sessionId: "session-123",
          }),
      });
    });

    // Loading should clear
    await waitFor(() => {
      expect(screen.queryByText("Thinking...")).toBeNull();
    });
  });

  it("shows error state for failed requests", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: "internal", message: "Server error" }),
    });

    render(<AIPanelWired defaultOpen />);

    const input = screen.getByLabelText("Message input");
    await act(async () => {
      await typeAndSubmit(input, "Trigger error");
    });

    await waitFor(() => {
      const matches = screen.getAllByText(/try again/i);
      expect(matches.length).toBeGreaterThan(0);
    });
  });

  it("preserves sessionId across multiple messages", async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            response: "First response",
            citations: [],
            sessionId: "session-first",
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            response: "Second response",
            citations: [],
            sessionId: "session-first",
          }),
      });

    render(<AIPanelWired defaultOpen />);

    const input = screen.getByLabelText("Message input");

    // Send first message
    await act(async () => {
      await typeAndSubmit(input, "First question");
    });

    await waitFor(() => {
      expect(screen.getByText("First response")).toBeDefined();
    });

    // Send second message
    await act(async () => {
      await typeAndSubmit(input, "Follow up");
    });

    await waitFor(() => {
      expect(screen.getByText("Second response")).toBeDefined();
    });

    // Second call should include sessionId from first response
    const secondCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[1]!;
    const secondBody = JSON.parse(secondCall[1].body as string);
    expect(secondBody.sessionId).toBe("session-first");
  });
});
