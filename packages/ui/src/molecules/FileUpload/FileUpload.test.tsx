import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FileUpload, type UploadFile } from "./FileUpload";

describe("FileUpload", () => {
  it("renders drop zone with default label", () => {
    render(<FileUpload />);
    expect(screen.getByRole("button", { name: "Upload files" })).toBeInTheDocument();
  });

  it("uses custom aria-label", () => {
    render(<FileUpload aria-label="Upload images" />);
    expect(screen.getByRole("button", { name: "Upload images" })).toBeInTheDocument();
  });

  it("shows accept info when provided", () => {
    render(<FileUpload accept="image/*" />);
    expect(screen.getByText(/Accepted: image\/\*/)).toBeInTheDocument();
  });

  it("shows max size info when provided", () => {
    render(<FileUpload maxSize={1024 * 1024} />);
    expect(screen.getByText(/Max size: 1\.0 MB/)).toBeInTheDocument();
  });

  it("is disabled when disabled=true", () => {
    render(<FileUpload disabled />);
    const zone = screen.getByRole("button");
    expect(zone).toHaveAttribute("aria-disabled", "true");
  });

  it("renders file list when files provided", () => {
    const files: UploadFile[] = [
      {
        id: "f1",
        name: "document.pdf",
        size: 1024,
        file: new File(["content"], "document.pdf"),
      },
    ];
    render(<FileUpload files={files} />);
    expect(screen.getByText("document.pdf")).toBeInTheDocument();
  });

  it("shows file size in file list", () => {
    const files: UploadFile[] = [
      {
        id: "f1",
        name: "doc.pdf",
        size: 2048,
        file: new File(["content"], "doc.pdf"),
      },
    ];
    render(<FileUpload files={files} />);
    expect(screen.getByText("2.0 KB")).toBeInTheDocument();
  });

  it("renders remove button when onRemove provided", () => {
    const files: UploadFile[] = [
      {
        id: "f1",
        name: "image.png",
        size: 512,
        file: new File(["x"], "image.png"),
      },
    ];
    render(<FileUpload files={files} onRemove={() => {}} />);
    expect(screen.getByRole("button", { name: "Remove image.png" })).toBeInTheDocument();
  });

  it("calls onRemove with file id when remove clicked", async () => {
    const handleRemove = vi.fn();
    const files: UploadFile[] = [
      {
        id: "f1",
        name: "file.txt",
        size: 100,
        file: new File(["x"], "file.txt"),
      },
    ];
    render(<FileUpload files={files} onRemove={handleRemove} />);
    await userEvent.click(screen.getByRole("button", { name: "Remove file.txt" }));
    expect(handleRemove).toHaveBeenCalledWith("f1");
  });

  it("shows progress bar when progress is set", () => {
    const files: UploadFile[] = [
      {
        id: "f1",
        name: "upload.zip",
        size: 5000,
        progress: 60,
        file: new File(["x"], "upload.zip"),
      },
    ];
    render(<FileUpload files={files} />);
    expect(screen.getByRole("progressbar", { name: /Uploading upload\.zip/ })).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "60");
  });

  it("shows error state for errored files", () => {
    const files: UploadFile[] = [
      {
        id: "f1",
        name: "bad.exe",
        size: 1000,
        error: "File type not allowed",
        file: new File(["x"], "bad.exe"),
      },
    ];
    render(<FileUpload files={files} />);
    expect(screen.getByText("File type not allowed")).toBeInTheDocument();
  });

  it("calls onChange when files are dropped", () => {
    const handleChange = vi.fn();
    render(<FileUpload onChange={handleChange} />);
    const dropZone = screen.getByRole("button", { name: "Upload files" });
    const file = new File(["content"], "test.txt", { type: "text/plain" });
    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] },
    });
    expect(handleChange).toHaveBeenCalledWith([file]);
  });

  it("rejects files exceeding maxSize", () => {
    const handleChange = vi.fn();
    render(<FileUpload onChange={handleChange} maxSize={100} />);
    const dropZone = screen.getByRole("button", { name: "Upload files" });
    const bigFile = new File(["x".repeat(200)], "big.txt", { type: "text/plain" });
    fireEvent.drop(dropZone, {
      dataTransfer: { files: [bigFile] },
    });
    expect(handleChange).not.toHaveBeenCalled();
  });
});
