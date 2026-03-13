import type { Meta, StoryObj } from "@storybook/react-vite";
import { EOIForm } from "./EOIForm";

const defaultLabels = {
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
  { value: "community", label: "Community Partner" },
  { value: "other", label: "Other" },
];

const meta = {
  title: "Molecules/EOIForm",
  component: EOIForm,
  tags: ["autodocs"],
  args: {
    labels: defaultLabels,
    categories,
    onSubmit: async (data) => {
      console.log("Form submitted:", data);
      await new Promise((r) => setTimeout(r, 1000));
    },
  },
} satisfies Meta<typeof EOIForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const PreselectedCategory: Story = {
  args: { defaultCategory: "creator" },
};

export const SubmissionError: Story = {
  args: {
    onSubmit: async () => {
      await new Promise((r) => setTimeout(r, 500));
      throw new Error("Network error");
    },
  },
};

export const RTL: Story = {
  args: {
    labels: {
      name: "الاسم",
      email: "البريد الإلكتروني",
      company: "الشركة",
      message: "الرسالة",
      category: "الفئة",
      consent: "لقد قرأت ووافقت على سياسة الخصوصية",
      updates: "أود تلقي تحديثات حول مدينة الإنتاج",
      submit: "إرسال",
      submitting: "جارٍ الإرسال...",
      success: "!شكرًا لك! سنتواصل معك قريبًا",
      error: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
      privacyUrl: "/privacy",
    },
    categories: [
      { value: "creator", label: "منشئ / شركة إنتاج" },
      { value: "investor", label: "مستثمر" },
    ],
  },
  decorators: [
    (Story) => (
      <div dir="rtl" lang="ar">
        <Story />
      </div>
    ),
  ],
};
