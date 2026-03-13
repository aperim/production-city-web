import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileUpload, type UploadFile } from "./FileUpload";

const meta = {
  title: "Molecules/FileUpload",
  component: FileUpload,
  tags: ["autodocs"],
  argTypes: {
    multiple: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof FileUpload>;

export default meta;

export const Default: StoryObj = {
  render: () => {
    const [files, setFiles] = useState<UploadFile[]>([]);
    return (
      <FileUpload
        multiple
        onChange={(newFiles) => {
          const entries: UploadFile[] = newFiles.map((f) => ({
            id: crypto.randomUUID(),
            name: f.name,
            size: f.size,
            file: f,
            progress: 100,
          }));
          setFiles((prev) => [...prev, ...entries]);
        }}
        files={files}
        onRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
      />
    );
  },
};

export const ImageOnly: StoryObj = {
  render: () => (
    <FileUpload
      accept="image/*"
      maxSize={5 * 1024 * 1024}
      aria-label="Upload images"
    />
  ),
};

export const WithProgress: StoryObj = {
  render: () => {
    const files: UploadFile[] = [
      { id: "f1", name: "report.pdf", size: 204800, progress: 45, file: new File([], "report.pdf") },
      { id: "f2", name: "image.png", size: 51200, progress: 100, file: new File([], "image.png") },
      { id: "f3", name: "bad.exe", size: 1024, error: "File type not allowed", file: new File([], "bad.exe") },
    ];
    return <FileUpload files={files} onRemove={() => {}} />;
  },
};

export const Disabled: StoryObj = {
  render: () => <FileUpload disabled aria-label="Upload files (disabled)" />,
};
