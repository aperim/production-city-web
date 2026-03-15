import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SessionList, type SessionData } from "./SessionList";

const now = new Date().toISOString();
const hourAgo = new Date(Date.now() - 3600000).toISOString();

const mockSessions: SessionData[] = [
  { id: "current", browser: "Chrome 133", os: "macOS 15.3", createdAt: now, lastActiveAt: now, isCurrent: true },
  { id: "other", browser: "Firefox 130", os: "Windows 10+", createdAt: now, lastActiveAt: hourAgo, isCurrent: false },
];

describe("SessionList", () => {
  it("renders sessions correctly", () => {
    render(<SessionList sessions={mockSessions} onRevoke={async () => {}} />);
    expect(screen.getByText(/Chrome 133/)).toBeDefined();
    expect(screen.getByText(/Firefox 130/)).toBeDefined();
  });

  it("shows current session indicator", () => {
    render(<SessionList sessions={mockSessions} onRevoke={async () => {}} />);
    expect(screen.getByText("(Current session)")).toBeDefined();
  });

  it("hides revoke button for current session", () => {
    render(<SessionList sessions={mockSessions} onRevoke={async () => {}} />);
    // Current session should not have a revoke button
    expect(screen.queryByTestId("revoke-current")).toBeNull();
    // Other session should have one
    expect(screen.getByTestId("revoke-other")).toBeDefined();
  });

  it("shows inline confirmation on revoke click", async () => {
    render(<SessionList sessions={mockSessions} onRevoke={async () => {}} />);

    fireEvent.click(screen.getByTestId("revoke-other"));

    await waitFor(() => {
      expect(screen.getByTestId("confirm-revoke-other")).toBeDefined();
    });
  });

  it("calls onRevoke when confirmed", async () => {
    const onRevoke = vi.fn().mockResolvedValue(undefined);
    render(<SessionList sessions={mockSessions} onRevoke={onRevoke} />);

    fireEvent.click(screen.getByTestId("revoke-other"));
    fireEvent.click(screen.getByTestId("confirm-revoke-other"));

    await waitFor(() => {
      expect(onRevoke).toHaveBeenCalledWith("other");
    });
  });

  it("shows error message when revoke fails", async () => {
    const onRevoke = vi.fn().mockRejectedValue(new Error("Network error"));
    render(<SessionList sessions={mockSessions} onRevoke={onRevoke} />);

    fireEvent.click(screen.getByTestId("revoke-other"));
    fireEvent.click(screen.getByTestId("confirm-revoke-other"));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeDefined();
      expect(screen.getByText("Failed to revoke session")).toBeDefined();
    });
  });

  it("shows no other sessions message when only current", () => {
    render(
      <SessionList
        sessions={[mockSessions[0]!]}
        onRevoke={async () => {}}
      />,
    );
    expect(screen.getByText("No other active sessions")).toBeDefined();
  });
});
