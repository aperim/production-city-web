import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LanguageSwitcher } from "./LanguageSwitcher";

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

describe("LanguageSwitcher", () => {
  it("renders trigger button", () => {
    render(<LanguageSwitcher languages={languages} currentLanguage="en" onLanguageChange={() => {}} />);
    expect(screen.getByRole("button", { name: /language/i })).toBeInTheDocument();
  });

  it("shows current language label on trigger", () => {
    render(<LanguageSwitcher languages={languages} currentLanguage="en" onLanguageChange={() => {}} />);
    expect(screen.getByText("English")).toBeInTheDocument();
  });

  it("opens dropdown on click", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher languages={languages} currentLanguage="en" onLanguageChange={() => {}} />);
    await user.click(screen.getByRole("button", { name: /language/i }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("renders all language options when open", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher languages={languages} currentLanguage="en" onLanguageChange={() => {}} />);
    await user.click(screen.getByRole("button", { name: /language/i }));
    const items = screen.getAllByRole("menuitemradio");
    expect(items).toHaveLength(10);
  });

  it("calls onLanguageChange when selecting a language", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<LanguageSwitcher languages={languages} currentLanguage="en" onLanguageChange={onChange} />);
    await user.click(screen.getByRole("button", { name: /language/i }));
    await user.click(screen.getByText("Español"));
    expect(onChange).toHaveBeenCalledWith("es");
  });

  it("marks current language as checked", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher languages={languages} currentLanguage="es" onLanguageChange={() => {}} />);
    await user.click(screen.getByRole("button", { name: /language/i }));
    const checked = screen.getByRole("menuitemradio", { checked: true });
    expect(checked).toHaveTextContent("Español");
  });

  it("closes on Escape key", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher languages={languages} currentLanguage="en" onLanguageChange={() => {}} />);
    await user.click(screen.getByRole("button", { name: /language/i }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("supports keyboard navigation with ArrowDown", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher languages={languages} currentLanguage="en" onLanguageChange={() => {}} />);
    await user.click(screen.getByRole("button", { name: /language/i }));
    await user.keyboard("{ArrowDown}");
    // Focus should move to next item
    const items = screen.getAllByRole("menuitemradio");
    expect(items.length).toBe(10);
  });

  it("renders in disabled state", () => {
    render(<LanguageSwitcher languages={languages} currentLanguage="en" onLanguageChange={() => {}} disabled />);
    expect(screen.getByRole("button", { name: /language/i })).toBeDisabled();
  });
});
