import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { FAQSection } from "./FAQSection";

const faqs = [
  { question: "What is Production City?", answer: "A creative campus." },
  { question: "Where is it located?", answer: "Queensland, Australia." },
  { question: "How do I apply?", answer: "Submit an EOI." },
];

describe("FAQSection", () => {
  it("renders heading", () => {
    render(<FAQSection heading="FAQ" items={faqs} />);
    expect(screen.getByText("FAQ")).toBeInTheDocument();
  });

  it("renders all FAQ items", () => {
    render(<FAQSection heading="FAQ" items={faqs} />);
    expect(screen.getByText("What is Production City?")).toBeInTheDocument();
    expect(screen.getByText("Where is it located?")).toBeInTheDocument();
    expect(screen.getByText("How do I apply?")).toBeInTheDocument();
  });

  it("filters items when search is used", async () => {
    const user = userEvent.setup();
    render(<FAQSection heading="FAQ" items={faqs} searchPlaceholder="Search..." />);
    const searchInput = screen.getByPlaceholderText("Search...");
    await user.type(searchInput, "located");
    expect(screen.getByText("Where is it located?")).toBeInTheDocument();
    expect(screen.queryByText("How do I apply?")).not.toBeInTheDocument();
  });

  it("shows empty results message when no matches", async () => {
    const user = userEvent.setup();
    render(<FAQSection heading="FAQ" items={faqs} searchPlaceholder="Search..." emptyMessage="No results." />);
    await user.type(screen.getByPlaceholderText("Search..."), "zzzzz");
    expect(screen.getByText("No results.")).toBeInTheDocument();
  });
});
