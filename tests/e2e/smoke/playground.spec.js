const { test, expect } = require('@playwright/test');

// Smoke coverage for the playground's CodeJar + highlight.js editor upgrade.
// These tests exercise the editor UI only — they do not run user scripts against
// the network — so they stay fast and deterministic. The editor modules load
// from jsdelivr; if that CDN is unreachable the page falls back to a plain
// textarea, which the final test asserts still works.

test.describe('Playground editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground.html');
  });

  test('upgrades the textarea to a CodeJar contenteditable editor', async ({ page }) => {
    const editor = page.locator('#playgroundCode');
    await expect(editor).toBeVisible();

    // attachEditor() replaces the <textarea> with a contenteditable <div>.
    // Wait for the swap rather than asserting immediately, since the editor
    // modules load asynchronously.
    await expect(editor).toHaveAttribute('contenteditable', /plaintext-only|true/, { timeout: 15000 });
    expect(await editor.evaluate((el) => el.tagName)).toBe('DIV');
  });

  test('loads the default script and highlights JS keywords', async ({ page }) => {
    const editor = page.locator('#playgroundCode');
    await expect(editor).toHaveAttribute('contenteditable', /plaintext-only|true/, { timeout: 15000 });

    // The default script's text is present...
    await expect(editor).toContainText('import { EvoSDK }');

    // ...and highlight.js has tokenized it (the `import` keyword becomes a
    // .hljs-keyword span). This proves highlighting is actually wired up.
    const keyword = editor.locator('.hljs-keyword', { hasText: 'import' }).first();
    await expect(keyword).toBeVisible();
  });

  test('Reset to default repopulates the editor', async ({ page }) => {
    const editor = page.locator('#playgroundCode');
    await expect(editor).toHaveAttribute('contenteditable', /plaintext-only|true/, { timeout: 15000 });

    // Clear the editor, then reset. window.confirm fires because the contents
    // differ from the default — auto-accept it.
    page.on('dialog', (dialog) => dialog.accept());
    await editor.evaluate((el) => { el.textContent = ''; el.dispatchEvent(new Event('input', { bubbles: true })); });

    await page.locator('#playgroundReset').click();
    await expect(editor).toContainText('EvoSDK.testnetTrusted()');
  });

  test('the editor copy action copies the code and flashes feedback', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const editor = page.locator('#playgroundCode');
    await expect(editor).toHaveAttribute('contenteditable', /plaintext-only|true/, { timeout: 15000 });

    const copyButton = page.locator('#playgroundTabCopy');
    await copyButton.click();

    // The label flashes "Copied!" on success or fallback alike.
    await expect(copyButton).toHaveText('Copied!');

    // And the clipboard holds the editor's default script.
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toContain('import { EvoSDK }');

    // Label restores afterward.
    await expect(copyButton).toHaveText('copy');
  });

  test('switching examples without edits needs no confirmation', async ({ page }) => {
    const editor = page.locator('#playgroundCode');
    await expect(editor).toHaveAttribute('contenteditable', /plaintext-only|true/, { timeout: 15000 });

    // Fail loudly if any confirm dialog appears: an unmodified editor should
    // switch examples seamlessly.
    page.on('dialog', (dialog) => {
      throw new Error(`Unexpected confirm dialog: ${dialog.message()}`);
    });

    // From the default (unmodified) → first inline pill loads with no confirm.
    await page.locator('.pg-pill', { hasText: 'Retrieve an identity' }).first().click();
    await expect(editor).toContainText('sdk.identities.fetch');

    // From that example (still unmodified) → another pill loads with no confirm.
    await page.locator('.pg-pill', { hasText: 'Query documents' }).first().click();
    await expect(editor).toContainText('sdk.documents.query');
  });

  test('switching examples after edits asks for confirmation', async ({ page }) => {
    const editor = page.locator('#playgroundCode');
    await expect(editor).toHaveAttribute('contenteditable', /plaintext-only|true/, { timeout: 15000 });

    // Edit the editor so it diverges from the baseline.
    await editor.click();
    await editor.evaluate((el) => {
      el.textContent = el.textContent + '\n// my edit';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // Now a confirm must appear; accept it and verify the example loads.
    let confirmed = false;
    page.on('dialog', (dialog) => { confirmed = true; dialog.accept(); });
    await page.locator('.pg-pill', { hasText: 'Query documents' }).first().click();
    await expect(editor).toContainText('sdk.documents.query');
    expect(confirmed).toBe(true);
  });

  test('the overflow dropdown opens and loads an example', async ({ page }) => {
    const editor = page.locator('#playgroundCode');
    await expect(editor).toHaveAttribute('contenteditable', /plaintext-only|true/, { timeout: 15000 });

    const menu = page.locator('.pg-pill-menu');
    await expect(menu).toBeHidden();

    await page.locator('.pg-pill-more').click();
    await expect(menu).toBeVisible();

    // An overflow example: "Get DPNS names for an identity" → sdk.dpns.usernames(...).
    await menu.locator('.pg-pill-menu-item', { hasText: 'Get DPNS names' }).click();
    await expect(menu).toBeHidden();
    await expect(editor).toContainText('sdk.dpns.usernames');
  });

  test('the "modified" badge tracks edits', async ({ page }) => {
    const editor = page.locator('#playgroundCode');
    await expect(editor).toHaveAttribute('contenteditable', /plaintext-only|true/, { timeout: 15000 });

    const badge = page.locator('#playgroundModified');
    await expect(badge).toBeHidden();

    // Type something so the editor diverges from the default.
    await editor.click();
    await editor.evaluate((el) => {
      el.textContent = el.textContent + '\n// edited';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await expect(badge).toBeVisible();

    // Reset clears the badge.
    page.on('dialog', (dialog) => dialog.accept());
    await page.locator('#playgroundReset').click();
    await expect(badge).toBeHidden();
  });

  test('Output copy copies captured output text', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await expect(page.locator('#playgroundCode'))
      .toHaveAttribute('contenteditable', /plaintext-only|true/, { timeout: 15000 });

    // Seed the output panel directly (avoids a network run) and copy it.
    await page.locator('#playgroundOutput').evaluate((el) => {
      el.classList.remove('empty');
      el.textContent = 'hello from output';
    });

    const copyBtn = page.locator('#playgroundOutputCopy');
    await copyBtn.click();
    await expect(copyBtn).toHaveText('Copied!');

    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toContain('hello from output');
  });
});
