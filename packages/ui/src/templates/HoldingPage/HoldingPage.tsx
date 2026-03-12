import { Text } from "../../atoms/Text/Text";

/**
 * HoldingPage template — placeholder landing page layout.
 *
 * This template provides the structural skeleton for the holding/landing page.
 * Content will be implemented by the landing page agent.
 */
function HoldingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <Text as="h1">Production City</Text>
      <Text as="p" className="mt-4 text-muted-foreground">
        Coming soon.
      </Text>
    </main>
  );
}

export { HoldingPage };
