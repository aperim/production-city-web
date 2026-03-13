import { afterEach, describe, expect, it } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import axe from "axe-core";
import { Button } from "../atoms/Button/Button";
import { Badge } from "../atoms/Badge/Badge";
import { Text } from "../atoms/Text/Text";
import { Input } from "../atoms/Input/Input";
import { Textarea } from "../atoms/Textarea/Textarea";
import { Select } from "../atoms/Select/Select";
import { Checkbox } from "../atoms/Checkbox/Checkbox";
import { RadioGroup } from "../atoms/RadioGroup/RadioGroup";
import { Toggle } from "../atoms/Toggle/Toggle";
import { Avatar } from "../atoms/Avatar/Avatar";
import { Divider } from "../atoms/Divider/Divider";
import { Skeleton } from "../atoms/Skeleton/Skeleton";
import { Link } from "../atoms/Link/Link";

afterEach(() => {
  cleanup();
  delete document.documentElement.dataset.theme;
});

async function expectNoViolations(ui: React.ReactElement, theme: "light" | "dark") {
  document.documentElement.dataset.theme = theme;
  let container!: HTMLElement;
  await act(async () => {
    ({ container } = render(ui));
  });
  const results = await axe.run(container, {
    rules: {
      // Colour contrast requires computed styles unavailable in jsdom.
      // Evaluated in the Storybook a11y panel against real renders instead.
      "color-contrast": { enabled: false },
      // The region rule fires on isolated component renders without landmark context.
      region: { enabled: false },
    },
  });

  expect(
    results.violations,
    results.violations.map((v) => `${v.id}: ${v.description}`).join("\n"),
  ).toHaveLength(0);
}

describe("storybook accessibility baselines", () => {
  it("renders the Button component accessibly in light and dark themes", async () => {
    await expectNoViolations(<Button>Schedule Visit</Button>, "light");
    await expectNoViolations(<Button>Schedule Visit</Button>, "dark");
  });

  it("renders the Badge component accessibly in light and dark themes", async () => {
    await expectNoViolations(<Badge>Featured</Badge>, "light");
    await expectNoViolations(<Badge>Featured</Badge>, "dark");
  });

  it("renders the Text component accessibly in light and dark themes", async () => {
    await expectNoViolations(<Text as="p">Production City keeps the interface readable.</Text>, "light");
    await expectNoViolations(<Text as="p">Production City keeps the interface readable.</Text>, "dark");
  });

  it("renders the Input component accessibly in light and dark themes", async () => {
    await expectNoViolations(
      <Input label="Email address" type="email" placeholder="name@example.com" />,
      "light",
    );
    await expectNoViolations(
      <Input label="Email address" type="email" placeholder="name@example.com" />,
      "dark",
    );
  });

  it("renders the Input error state accessibly", async () => {
    await expectNoViolations(
      <Input label="Email address" type="email" errorMessage="Enter a valid email address" />,
      "light",
    );
  });

  it("renders the Textarea component accessibly", async () => {
    await expectNoViolations(
      <Textarea label="Message" placeholder="Enter your message" />,
      "light",
    );
    await expectNoViolations(
      <Textarea label="Message" placeholder="Enter your message" />,
      "dark",
    );
  });

  it("renders the Select component accessibly", async () => {
    await expectNoViolations(
      <Select
        label="Country"
        options={[
          { label: "Australia", value: "AU" },
          { label: "New Zealand", value: "NZ" },
        ]}
      />,
      "light",
    );
    await expectNoViolations(
      <Select
        label="Country"
        options={[
          { label: "Australia", value: "AU" },
          { label: "New Zealand", value: "NZ" },
        ]}
      />,
      "dark",
    );
  });

  it("renders the Checkbox component accessibly", async () => {
    await expectNoViolations(
      <Checkbox label="I agree to the terms and conditions" />,
      "light",
    );
    await expectNoViolations(
      <Checkbox label="I agree to the terms and conditions" />,
      "dark",
    );
  });

  it("renders the RadioGroup component accessibly", async () => {
    await expectNoViolations(
      <RadioGroup
        label="Preferred contact method"
        options={[
          { value: "email", label: "Email" },
          { value: "phone", label: "Phone" },
        ]}
      />,
      "light",
    );
    await expectNoViolations(
      <RadioGroup
        label="Preferred contact method"
        options={[
          { value: "email", label: "Email" },
          { value: "phone", label: "Phone" },
        ]}
      />,
      "dark",
    );
  });

  it("renders the Toggle component accessibly", async () => {
    await expectNoViolations(
      <Toggle label="Enable notifications" />,
      "light",
    );
    await expectNoViolations(
      <Toggle label="Enable notifications" />,
      "dark",
    );
  });

  it("renders the Avatar (initials fallback) accessibly", async () => {
    await expectNoViolations(
      <Avatar initials="AC" alt="Alex Chen" />,
      "light",
    );
    await expectNoViolations(
      <Avatar initials="AC" alt="Alex Chen" />,
      "dark",
    );
  });

  it("renders the Divider component accessibly", async () => {
    await expectNoViolations(
      <div>
        <span>Before</span>
        <Divider label="or" />
        <span>After</span>
      </div>,
      "light",
    );
    await expectNoViolations(
      <div>
        <span>Before</span>
        <Divider label="or" />
        <span>After</span>
      </div>,
      "dark",
    );
  });

  it("renders the Skeleton component accessibly", async () => {
    await expectNoViolations(
      <Skeleton aria-label="Loading content" />,
      "light",
    );
    await expectNoViolations(
      <Skeleton aria-label="Loading content" />,
      "dark",
    );
  });

  it("renders the Link component accessibly", async () => {
    await expectNoViolations(
      <Link href="https://production.city">Visit Production City</Link>,
      "light",
    );
    await expectNoViolations(
      <Link href="https://production.city">Visit Production City</Link>,
      "dark",
    );
  });
});
