import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EOISection } from "./EOISection";

const defaultLabels = {
  name: "Name",
  email: "Email",
  company: "Company",
  message: "Message",
  category: "Category",
  consent: "I agree to the Privacy Policy",
  updates: "Receive updates",
  submit: "Submit",
  submitting: "Submitting...",
  success: "Thank you!",
  error: "Error occurred.",
  privacyUrl: "/privacy",
};

const categories = [
  { value: "creator", label: "Creator" },
  { value: "investor", label: "Investor" },
];

describe("EOISection", () => {
  it("renders section heading", () => {
    render(
      <EOISection
        heading="Express Your Interest"
        formLabels={defaultLabels}
        categories={categories}
        onSubmit={() => Promise.resolve()}
      />
    );
    expect(screen.getByText("Express Your Interest")).toBeInTheDocument();
  });

  it("renders context text when provided", () => {
    render(
      <EOISection
        heading="Interest"
        contextText="Tell us about your project."
        formLabels={defaultLabels}
        categories={categories}
        onSubmit={() => Promise.resolve()}
      />
    );
    expect(screen.getByText("Tell us about your project.")).toBeInTheDocument();
  });

  it("renders EOI form", () => {
    render(
      <EOISection
        heading="Interest"
        formLabels={defaultLabels}
        categories={categories}
        onSubmit={() => Promise.resolve()}
      />
    );
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("passes defaultCategory to form", () => {
    render(
      <EOISection
        heading="Interest"
        formLabels={defaultLabels}
        categories={categories}
        defaultCategory="investor"
        onSubmit={() => Promise.resolve()}
      />
    );
    const select = screen.getByLabelText("Category") as HTMLSelectElement;
    expect(select.value).toBe("investor");
  });
});
