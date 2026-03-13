import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { ThemedImage } from "./ThemedImage";

describe("ThemedImage", () => {
  beforeEach(() => {
    document.documentElement.setAttribute("data-theme", "light");
  });

  afterEach(() => {
    document.documentElement.removeAttribute("data-theme");
  });

  it("renders light image when data-theme='light'", () => {
    render(
      <ThemedImage
        lightSrc="/media/light.jpg"
        darkSrc="/media/dark.jpg"
        alt="Test image"
        width={800}
        height={600}
      />,
    );
    const img = screen.getByRole("img", { name: "Test image" });
    expect(img).toHaveAttribute("src", "/media/light.jpg");
  });

  it("renders dark image when data-theme='dark'", () => {
    document.documentElement.setAttribute("data-theme", "dark");
    render(
      <ThemedImage
        lightSrc="/media/light.jpg"
        darkSrc="/media/dark.jpg"
        alt="Test image"
        width={800}
        height={600}
      />,
    );
    const img = screen.getByRole("img", { name: "Test image" });
    expect(img).toHaveAttribute("src", "/media/dark.jpg");
  });

  it("switches image when theme attribute changes", async () => {
    render(
      <ThemedImage
        lightSrc="/media/light.jpg"
        darkSrc="/media/dark.jpg"
        alt="Test image"
        width={800}
        height={600}
      />,
    );
    const img = screen.getByRole("img", { name: "Test image" });
    expect(img).toHaveAttribute("src", "/media/light.jpg");

    await act(() => {
      document.documentElement.setAttribute("data-theme", "dark");
    });
    expect(img).toHaveAttribute("src", "/media/dark.jpg");
  });

  it("shows skeleton while loading", () => {
    const { container } = render(
      <ThemedImage
        lightSrc="/media/light.jpg"
        alt="Test image"
        width={800}
        height={600}
      />,
    );
    expect(container.querySelector("[aria-hidden='true']")).toBeInTheDocument();
  });

  it("hides skeleton after image loads", () => {
    render(
      <ThemedImage
        lightSrc="/media/light.jpg"
        alt="Test image"
        width={800}
        height={600}
      />,
    );
    const img = screen.getByRole("img", { name: "Test image" });
    fireEvent.load(img);
    // After load, skeleton should not be visible
    expect(img.closest("[data-loading]")?.getAttribute("data-loading")).toBe("false");
  });

  it("shows error state on image load failure", () => {
    render(
      <ThemedImage
        lightSrc="/media/light.jpg"
        alt="Test image"
        width={800}
        height={600}
      />,
    );
    const img = screen.getByRole("img", { name: "Test image" });
    fireEvent.error(img);
    expect(screen.getByText("Image unavailable")).toBeInTheDocument();
  });

  it("uses lightSrc as fallback when only one variant provided", () => {
    document.documentElement.setAttribute("data-theme", "dark");
    render(
      <ThemedImage
        lightSrc="/media/only.jpg"
        alt="Test image"
        width={800}
        height={600}
      />,
    );
    const img = screen.getByRole("img", { name: "Test image" });
    expect(img).toHaveAttribute("src", "/media/only.jpg");
  });

  it("has loading='lazy' by default", () => {
    render(
      <ThemedImage
        lightSrc="/media/light.jpg"
        alt="Test image"
        width={800}
        height={600}
      />,
    );
    const img = screen.getByRole("img", { name: "Test image" });
    expect(img).toHaveAttribute("loading", "lazy");
  });

  it("has decoding='async' attribute", () => {
    render(
      <ThemedImage
        lightSrc="/media/light.jpg"
        alt="Test image"
        width={800}
        height={600}
      />,
    );
    const img = screen.getByRole("img", { name: "Test image" });
    expect(img).toHaveAttribute("decoding", "async");
  });

  it("accepts loading='eager' prop", () => {
    render(
      <ThemedImage
        lightSrc="/media/light.jpg"
        alt="Test image"
        width={800}
        height={600}
        loading="eager"
      />,
    );
    const img = screen.getByRole("img", { name: "Test image" });
    expect(img).toHaveAttribute("loading", "eager");
  });

  it("accepts fetchPriority='high' prop", () => {
    render(
      <ThemedImage
        lightSrc="/media/light.jpg"
        alt="Test image"
        width={800}
        height={600}
        fetchPriority="high"
      />,
    );
    const img = screen.getByRole("img", { name: "Test image" });
    expect(img).toHaveAttribute("fetchpriority", "high");
  });

  it("rejects external URL and shows error state", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <ThemedImage
        lightSrc="https://images.pexels.com/photo.jpg"
        alt="Test image"
        width={800}
        height={600}
      />,
    );
    expect(screen.getByText("Image unavailable")).toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("external URL"),
    );
    consoleSpy.mockRestore();
  });

  it("allows relative /media/ paths", () => {
    render(
      <ThemedImage
        lightSrc="/media/photo.jpg"
        alt="Test image"
        width={800}
        height={600}
      />,
    );
    expect(screen.queryByText("Image unavailable")).not.toBeInTheDocument();
  });

  it("rejects protocol-relative URLs", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <ThemedImage
        lightSrc="//evil.example/photo.jpg"
        alt="Test image"
        width={800}
        height={600}
      />,
    );
    expect(screen.getByText("Image unavailable")).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it("rejects data: URLs", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <ThemedImage
        lightSrc="data:image/svg+xml,<svg></svg>"
        alt="Test image"
        width={800}
        height={600}
      />,
    );
    expect(screen.getByText("Image unavailable")).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it("rejects blob: URLs", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <ThemedImage
        lightSrc="blob:http://localhost/abc"
        alt="Test image"
        width={800}
        height={600}
      />,
    );
    expect(screen.getByText("Image unavailable")).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it("preloads inactive variant via hidden img", () => {
    const { container } = render(
      <ThemedImage
        lightSrc="/media/light.jpg"
        darkSrc="/media/dark.jpg"
        alt="Test image"
        width={800}
        height={600}
      />,
    );
    const preloadImg = container.querySelector("img[data-preload='true']");
    expect(preloadImg).toHaveAttribute("src", "/media/dark.jpg");
  });
});
