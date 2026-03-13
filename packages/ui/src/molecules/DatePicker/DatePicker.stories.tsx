import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DatePicker } from "./DatePicker";

const meta = {
  title: "Molecules/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    locale: { control: "text" },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;

export const Default: StoryObj = {
  render: () => {
    const [date, setDate] = useState<Date | null>(null);
    return (
      <DatePicker
        value={date}
        onChange={setDate}
        placeholder="Select a date"
      />
    );
  },
};

export const WithPreselectedDate: StoryObj = {
  render: () => {
    const [date, setDate] = useState<Date | null>(new Date(2026, 2, 15));
    return <DatePicker value={date} onChange={setDate} />;
  },
};

export const WithMinMax: StoryObj = {
  render: () => {
    const [date, setDate] = useState<Date | null>(null);
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    return (
      <DatePicker
        value={date}
        onChange={setDate}
        minDate={today}
        maxDate={nextWeek}
        placeholder="This week only"
      />
    );
  },
};

export const Disabled: StoryObj = {
  render: () => <DatePicker disabled placeholder="Disabled" />,
};
