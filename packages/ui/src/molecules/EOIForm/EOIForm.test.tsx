import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EOIForm } from "./EOIForm";

describe("EOIForm", () => {
  const defaultLabels = {
    name: "Name",
    email: "Email",
    company: "Company",
    message: "Message",
    category: "Category",
    consent: "I have read and agree to the Privacy Policy",
    updates: "I'd like to receive updates about Production City",
    submit: "Submit",
    submitting: "Submitting...",
    success: "Thank you! We'll be in touch.",
    error: "Something went wrong. Please try again.",
    privacyUrl: "/privacy",
  };

  const categories = [
    { value: "creator", label: "Creator" },
    { value: "investor", label: "Investor" },
    { value: "government", label: "Government" },
  ];

  it("renders form fields", () => {
    render(<EOIForm labels={defaultLabels} categories={categories} onSubmit={() => Promise.resolve()} />);
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Message")).toBeInTheDocument();
  });

  it("renders category select", () => {
    render(<EOIForm labels={defaultLabels} categories={categories} onSubmit={() => Promise.resolve()} />);
    expect(screen.getByLabelText("Category")).toBeInTheDocument();
  });

  it("renders consent checkbox", () => {
    render(<EOIForm labels={defaultLabels} categories={categories} onSubmit={() => Promise.resolve()} />);
    expect(screen.getByLabelText(/Privacy Policy/)).toBeInTheDocument();
  });

  it("renders optional updates checkbox", () => {
    render(<EOIForm labels={defaultLabels} categories={categories} onSubmit={() => Promise.resolve()} />);
    expect(screen.getByLabelText(/updates/)).toBeInTheDocument();
  });

  it("includes honeypot field that is invisible", () => {
    const { container } = render(<EOIForm labels={defaultLabels} categories={categories} onSubmit={() => Promise.resolve()} />);
    const honeypot = container.querySelector('input[name="website"]');
    expect(honeypot).toBeInTheDocument();
    expect(honeypot?.getAttribute("tabindex")).toBe("-1");
    expect(honeypot?.getAttribute("autocomplete")).toBe("off");
  });

  it("disables submit until consent is given", () => {
    render(<EOIForm labels={defaultLabels} categories={categories} onSubmit={() => Promise.resolve()} />);
    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
  });

  it("enables submit when consent is checked", async () => {
    const user = userEvent.setup();
    render(<EOIForm labels={defaultLabels} categories={categories} onSubmit={() => Promise.resolve()} />);
    await user.click(screen.getByLabelText(/Privacy Policy/));
    expect(screen.getByRole("button", { name: "Submit" })).not.toBeDisabled();
  });

  it("calls onSubmit with form data", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<EOIForm labels={defaultLabels} categories={categories} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Name"), "John");
    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.click(screen.getByLabelText(/Privacy Policy/));
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "John",
        email: "john@example.com",
        consent: true,
      })
    );
  });

  it("shows success message after submission", async () => {
    const user = userEvent.setup();
    render(<EOIForm labels={defaultLabels} categories={categories} onSubmit={() => Promise.resolve()} />);

    await user.type(screen.getByLabelText("Name"), "John");
    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.click(screen.getByLabelText(/Privacy Policy/));
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByText(defaultLabels.success)).toBeInTheDocument();
  });

  it("shows error message on submission failure", async () => {
    const user = userEvent.setup();
    render(
      <EOIForm
        labels={defaultLabels}
        categories={categories}
        onSubmit={() => Promise.reject(new Error("fail"))}
      />
    );

    await user.type(screen.getByLabelText("Name"), "John");
    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.click(screen.getByLabelText(/Privacy Policy/));
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByText(defaultLabels.error)).toBeInTheDocument();
  });

  it("pre-selects category when defaultCategory is provided", () => {
    render(
      <EOIForm
        labels={defaultLabels}
        categories={categories}
        defaultCategory="investor"
        onSubmit={() => Promise.resolve()}
      />
    );
    const select = screen.getByLabelText("Category") as HTMLSelectElement;
    expect(select.value).toBe("investor");
  });

  it("merges custom className", () => {
    const { container } = render(
      <EOIForm labels={defaultLabels} categories={categories} onSubmit={() => Promise.resolve()} className="custom" />
    );
    expect(container.firstElementChild?.getAttribute("class")).toContain("custom");
  });
});
