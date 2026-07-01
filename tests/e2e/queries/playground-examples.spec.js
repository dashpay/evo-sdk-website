const { test, expect } = require('@playwright/test');

// Execution coverage for the playground's built-in examples. Unlike the smoke
// suite (tests/e2e/smoke/playground.spec.js), which is deliberately
// network-free, this file actually *runs* each example against testnet and
// asserts it finishes without error — so a stale hardcoded ID or an SDK
// regression that breaks an example is caught here rather than silently.
//
// Each example is self-contained (builds its own EvoSDK.testnetTrusted()
// client and only reads data), so running one is just: load it into the editor,
// click Run, and wait for the status to settle. We assert on run *status*
// (Done, not Error) rather than output contents, so the test stays robust when
// testnet data shifts — it fails only on real breakage.

test.describe('Playground examples execute', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground.html');
    await expect(page.locator('#playgroundCode')).toBeVisible();
  });

  // Read the example titles straight from the live "Load example" dropdown, so
  // this test automatically covers whatever examples the playground ships —
  // no separate list to keep in sync. (EXAMPLES is a browser module and can't
  // be required from a Node test.)
  async function exampleTitles(page) {
    await page.locator('#playgroundLoadExample').click();
    const menu = page.locator('.pg-pill-menu');
    await expect(menu).toBeVisible();
    const titles = await menu.locator('.pg-pill-menu-item .pg-pill-menu-title').allTextContents();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    return titles.map((t) => t.trim()).filter(Boolean);
  }

  // Load the named example, run it, and wait for the run to settle. Loading a
  // clean example from the default editor never triggers a confirm, but accept
  // one defensively so an unexpected dialog can't hang the run. Use a one-shot
  // listener (page.once): a persistent page.on would stack a new handler per
  // example, and a second handler firing on the same dialog throws "Cannot
  // accept dialog which is already handled".
  async function runExample(page, title) {
    page.once('dialog', (dialog) => dialog.accept());

    await page.locator('#playgroundLoadExample').click();
    const menu = page.locator('.pg-pill-menu');
    await expect(menu).toBeVisible();
    await menu.locator('.pg-pill-menu-item', { hasText: title }).first().click();
    await expect(menu).toBeHidden();

    await page.locator('#playgroundRun').click();

    // The Run handler sets the status to "Running…" and flips it to "Done" or
    // "Error" when the (async, networked) run resolves. Wait for it to leave
    // the running state, giving the SDK time to reach testnet.
    const status = page.locator('#playgroundStatus');
    await expect(status).not.toHaveText('Running…', { timeout: 60000 });
    return status;
  }

  // Enumerate examples from the live dropdown, then run each one in turn. The
  // example titles aren't known until the page is loaded, so this is a single
  // test that loops rather than a generated test-per-example — but each example
  // is wrapped in a named test.step(), so the report shows a labeled pass/fail
  // line per example rather than one opaque line for the whole run.
  test('every example runs without error', async ({ page }) => {
    const titles = await exampleTitles(page);
    expect(titles.length).toBeGreaterThan(0);

    for (const title of titles) {
      await test.step(title, async () => {
        const status = await runExample(page, title);

        // The run must have finished cleanly...
        await expect(status, `example "${title}" ended in Error`).toHaveText('Done');
        // ...and produced no error line in the output panel.
        const errorLines = page.locator('#playgroundOutput .pg-line.error');
        await expect(errorLines, `example "${title}" logged an error`).toHaveCount(0);

        // Reset back to the default so the next example loads from a clean,
        // unmodified baseline (no confirm) and the output panel is cleared.
        await page.locator('#playgroundReset').click();
      });
    }
  });
});
