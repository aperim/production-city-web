import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MediaAttribution } from "./MediaAttribution";

describe("MediaAttribution", () => {
  it("renders AttributionLink with correct props", () => {
    render(
      <MediaAttribution
        photographer="Jane Doe"
        photographerUrl="https://example.com/jane"
        source="Pexels"
        sourceUrl="https://pexels.com"
      />,
    );
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Pexels")).toBeInTheDocument();
  });

  it("shows AI-assisted badge when aiAssisted is true", () => {
    render(
      <MediaAttribution
        photographer="Jane Doe"
        source="Pexels"
        aiAssisted
      />,
    );
    expect(screen.getByLabelText("AI-assisted media")).toBeInTheDocument();
  });

  it("shows AI-generated badge when aiGenerated is true", () => {
    render(
      <MediaAttribution
        photographer="Jane Doe"
        source="Pexels"
        aiGenerated
      />,
    );
    expect(screen.getByLabelText("AI-generated media")).toBeInTheDocument();
  });

  it("shows First Nations badge when hasFirstNationsPermission is true", () => {
    render(
      <MediaAttribution
        photographer="Jane Doe"
        source="Pexels"
        hasFirstNationsPermission
      />,
    );
    expect(
      screen.getByLabelText("First Nations cultural permission"),
    ).toBeInTheDocument();
  });

  it("shows multiple badges simultaneously", () => {
    render(
      <MediaAttribution
        photographer="Jane Doe"
        source="Pexels"
        aiAssisted
        aiGenerated
        hasFirstNationsPermission
      />,
    );
    expect(screen.getByLabelText("AI-assisted media")).toBeInTheDocument();
    expect(screen.getByLabelText("AI-generated media")).toBeInTheDocument();
    expect(
      screen.getByLabelText("First Nations cultural permission"),
    ).toBeInTheDocument();
  });

  it("shows no badges when all flags are false", () => {
    render(
      <MediaAttribution photographer="Jane Doe" source="Pexels" />,
    );
    expect(screen.queryByLabelText("AI-assisted media")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("AI-generated media")).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText("First Nations cultural permission"),
    ).not.toBeInTheDocument();
  });

  it("merges custom className", () => {
    const { container } = render(
      <MediaAttribution
        photographer="Jane"
        source="Pexels"
        className="custom-test"
      />,
    );
    expect(container.firstElementChild?.className).toContain("custom-test");
  });
});
