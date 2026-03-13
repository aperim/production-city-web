/**
 * Global test setup: reset and seed before each test file.
 */

import { test as base } from "@playwright/test";
import { resetTestState, seedTestUsers } from "./test-api";

/**
 * Extended test fixture that resets and seeds test state before each test.
 */
export const test = base.extend<{ testSetup: void }>({
  testSetup: [
    async ({}, use) => {
      await resetTestState();
      await seedTestUsers();
      await use();
    },
    { auto: true },
  ],
});

export { expect } from "@playwright/test";
