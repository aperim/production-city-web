import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { LanguageSwitcher } from "../molecules/LanguageSwitcher/LanguageSwitcher";
import { EOIForm } from "../molecules/EOIForm/EOIForm";
import { FormField } from "../molecules/FormField/FormField";

const languages = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "hi", label: "हिन्दी" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
];

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
];

describe("Issue #214 — LanguageSwitcher dropdown background", () => {
  it("dropdown menu has bg-background class for opaque background", async () => {
    const user = userEvent.setup();
    render(
      <LanguageSwitcher
        languages={languages}
        currentLanguage="en"
        onLanguageChange={() => {}}
      />,
    );
    await user.click(screen.getByRole("button", { name: /language/i }));
    const menu = screen.getByRole("menu");
    const classList = menu.className;
    // Must have a background class that provides an opaque background
    expect(classList).toMatch(/bg-/);
  });

  it("dropdown menu renders with shadow for visual separation", async () => {
    const user = userEvent.setup();
    render(
      <LanguageSwitcher
        languages={languages}
        currentLanguage="en"
        onLanguageChange={() => {}}
      />,
    );
    await user.click(screen.getByRole("button", { name: /language/i }));
    const menu = screen.getByRole("menu");
    expect(menu.className).toMatch(/shadow/);
  });
});

describe("Issue #214 — EOIForm label layout", () => {
  it("form fields use flex-col layout so labels do not overlap", () => {
    const { container } = render(
      <EOIForm
        labels={defaultLabels}
        categories={categories}
        onSubmit={() => Promise.resolve()}
      />,
    );
    // Each field wrapper should use flex-col (vertical stacking)
    const fieldWrappers = container.querySelectorAll(".flex.flex-col.gap-1\\.5");
    expect(fieldWrappers.length).toBeGreaterThanOrEqual(5);
  });

  it("each label has proper text-sm font-medium styling", () => {
    render(
      <EOIForm
        labels={defaultLabels}
        categories={categories}
        onSubmit={() => Promise.resolve()}
      />,
    );
    const nameLabel = screen.getByText("Name");
    expect(nameLabel.tagName).toBe("LABEL");
    expect(nameLabel.className).toContain("text-sm");
    expect(nameLabel.className).toContain("font-medium");
  });

  it("form container is relative so honeypot absolute positioning is scoped", () => {
    const { container } = render(
      <EOIForm
        labels={defaultLabels}
        categories={categories}
        onSubmit={() => Promise.resolve()}
      />,
    );
    const form = container.querySelector("form");
    expect(form?.className).toContain("relative");
  });

  it("honeypot field uses sr-only instead of absolute positioning", () => {
    const { container } = render(
      <EOIForm
        labels={defaultLabels}
        categories={categories}
        onSubmit={() => Promise.resolve()}
      />,
    );
    const honeypot = container.querySelector('input[name="website"]');
    const wrapper = honeypot?.closest("[aria-hidden]");
    expect(wrapper?.className).toContain("sr-only");
  });
});

describe("Issue #214 — FormField label positioning", () => {
  it("renders label above input (flex-col) by default, not overlapping", () => {
    const { container } = render(
      <FormField label="Test Label">
        <input id="test" type="text" />
      </FormField>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain("flex-col");
    expect(root.className).not.toContain("flex-row");
  });

  it("label has leading-none to prevent layout shift", () => {
    render(
      <FormField label="Test Label">
        <input id="test" type="text" />
      </FormField>,
    );
    const label = screen.getByText("Test Label");
    expect(label.className).toContain("leading-none");
  });
});
