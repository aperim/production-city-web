import type { Meta, StoryObj } from "@storybook/react-vite";
import { EOISection } from "./EOISection";

const formLabels = {
  name: "Name",
  email: "Email",
  company: "Company",
  message: "Message",
  category: "Category",
  consent: "I have read and agree to the Privacy Policy",
  updates: "I'd like to receive updates about Production City",
  submit: "Submit Expression of Interest",
  submitting: "Submitting...",
  success: "Thank you! We'll be in touch soon.",
  error: "Something went wrong. Please try again.",
  privacyUrl: "/privacy",
};

const categories = [
  { value: "creator", label: "Creator / Production Company" },
  { value: "investor", label: "Investor" },
  { value: "government", label: "Government / Agency" },
  { value: "other", label: "Other" },
];

const meta = {
  title: "Organisms/EOISection",
  component: EOISection,
  tags: ["autodocs"],
  args: {
    heading: "Express Your Interest",
    contextText: "Tell us about your project and how Production City can help.",
    formLabels,
    categories,
    onSubmit: async (data) => {
      console.log("Submit:", data);
      await new Promise((r) => setTimeout(r, 1000));
    },
  },
} satisfies Meta<typeof EOISection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const PreselectedCategory: Story = {
  args: { defaultCategory: "creator" },
};
