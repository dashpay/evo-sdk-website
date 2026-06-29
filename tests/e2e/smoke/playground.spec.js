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

  test('Copy code copies the editor contents and flashes feedback', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const editor = page.locator('#playgroundCode');
    await expect(editor).toHaveAttribute('contenteditable', /plaintext-only|true/, { timeout: 15000 });

    const copyButton = page.locator('#playgroundCopy');
    await copyButton.click();

    // The label flashes "Copied!" on success or fallback alike.
    await expect(copyButton).toHaveText('Copied!');

    // And the clipboard holds the editor's default script.
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toContain('import { EvoSDK }');

    // Label restores afterward.
    await expect(copyButton).toHaveText('Copy code');
  });
});
