import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProfileForm } from "./ProfileForm";

describe("ProfileForm", () => {
  it("renders with default name", () => {
    render(<ProfileForm defaultName="Jane" onSubmit={async () => {}} />);
    const input = screen.getByLabelText("Display name") as HTMLInputElement;
    expect(input.value).toBe("Jane");
  });

  it("calls onSubmit with trimmed name", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ProfileForm defaultName="Jane" onSubmit={onSubmit} />);

    const input = screen.getByLabelText("Display name") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "  New Name  " } });
    fireEvent.submit(screen.getByTestId("profile-form"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith("New Name");
    });
  });

  it("shows error on empty name submission", async () => {
    render(<ProfileForm defaultName="" onSubmit={async () => {}} />);

    fireEvent.submit(screen.getByTestId("profile-form"));

    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toContain("empty");
    });
  });

  it("shows error from onSubmit rejection", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("Server error"));
    render(<ProfileForm defaultName="Jane" onSubmit={onSubmit} />);

    fireEvent.submit(screen.getByTestId("profile-form"));

    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toContain("Server error");
    });
  });

  it("shows success message after save", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ProfileForm defaultName="Jane" onSubmit={onSubmit} />);

    fireEvent.submit(screen.getByTestId("profile-form"));

    await waitFor(() => {
      expect(screen.getByRole("status").textContent).toContain("Saved");
    });
  });

  it("disables button while saving", async () => {
    const onSubmit = () => new Promise<void>(() => {}); // never resolves
    render(<ProfileForm defaultName="Jane" onSubmit={onSubmit} />);

    fireEvent.submit(screen.getByTestId("profile-form"));

    await waitFor(() => {
      const button = screen.getByRole("button");
      expect(button.textContent).toContain("Saving");
      expect((button as HTMLButtonElement).disabled).toBe(true);
    });
  });
});
