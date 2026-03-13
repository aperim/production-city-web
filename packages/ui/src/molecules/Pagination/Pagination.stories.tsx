import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pagination } from "./Pagination";

const meta = {
  title: "Molecules/Pagination",
  component: Pagination,
  tags: ["autodocs"],
} satisfies Meta<typeof Pagination>;

export default meta;

export const Default: StoryObj = {
  render: () => {
    const [page, setPage] = useState(1);
    return (
      <Pagination page={page} totalPages={10} onPageChange={setPage} />
    );
  },
};

export const WithTotal: StoryObj = {
  render: () => {
    const [page, setPage] = useState(1);
    return (
      <Pagination
        page={page}
        totalPages={10}
        onPageChange={setPage}
        showTotal
        totalItems={100}
        pageSize={10}
      />
    );
  },
};

export const FewPages: StoryObj = {
  render: () => {
    const [page, setPage] = useState(1);
    return <Pagination page={page} totalPages={3} onPageChange={setPage} />;
  },
};

export const ManyPages: StoryObj = {
  render: () => {
    const [page, setPage] = useState(5);
    return <Pagination page={page} totalPages={50} onPageChange={setPage} />;
  },
};
