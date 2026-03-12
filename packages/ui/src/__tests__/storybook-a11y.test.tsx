import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import axe from "axe-core";
import { Button } from "../atoms/Button/Button";
import { Badge } from "../atoms/Badge/Badge";
import { Text } from "../atoms/Text/Text";

afterEach(() => {
  cleanup();
  delete document.documentElement.dataset.theme;
});

async function expectNoViolations(ui: React.ReactElement, theme: "light" | "dark") {
  document.documentElement.dataset.theme = theme;
  const { container } = render(ui);
  const results = await axe.run(container, {
    rules: {
      "color-contrast": { enabled: false },
      region: { enabled: false },
    },
  });

  expect(results.violations).toHaveLength(0);
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
});
