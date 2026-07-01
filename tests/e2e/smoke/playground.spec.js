const { test, expect } = require('@playwright/test');

// Smoke coverage for the playground editor UI. These tests exercise the UI
// only — they do not run user scripts against the network — so they stay fast
// and deterministic. The editor is a plain <textarea>.

test.describe('Playground editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground.html');
  });

  test('loads the default script into the editor', async ({ page }) => {
    const editor = page.locator('#playgroundCode');
    await expect(editor).toBeVisible();
    await expect(editor).toHaveValue(/import \{ EvoSDK \}/);
  });

  // Open the "Load example" dropdown and click the example with the given title.
  async function loadExample(page, title) {
    await page.locator('#playgroundLoadExample').click();
    const menu = page.locator('.pg-pill-menu');
    await expect(menu).toBeVisible();
    await menu.locator('.pg-pill-menu-item', { hasText: title }).first().click();
    await expect(menu).toBeHidden();
  }

  test('the "Load example" dropdown is present on load', async ({ page }) => {
    await expect(page.locator('#playgroundLoadExample')).toBeVisible();
  });

  test('Reset to default repopulates the editor', async ({ page }) => {
    const editor = page.locator('#playgroundCode');
    await expect(editor).toBeVisible();

    // Clear the editor, then reset. window.confirm fires because the contents
    // differ from the default — auto-accept it.
    page.on('dialog', (dialog) => dialog.accept());
    await editor.fill('');

    await page.locator('#playgroundReset').click();
    await expect(editor).toHaveValue(/EvoSDK\.testnetTrusted\(\)/);
  });

  test('resetting an unmodified example needs no confirmation', async ({ page }) => {
    const editor = page.locator('#playgroundCode');
    await expect(editor).toBeVisible();

    // Any confirm here is a regression — an unmodified example should reset
    // straight back to the default.
    page.on('dialog', (dialog) => {
      throw new Error(`Unexpected confirm dialog: ${dialog.message()}`);
    });

    await loadExample(page, 'Query documents');
    await expect(editor).toHaveValue(/sdk\.documents\.query/);

    await page.locator('#playgroundReset').click();
    await expect(editor).toHaveValue(/Edit the code or pick another example/);
  });

  test('the editor copy icon copies the code and flashes feedback', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await expect(page.locator('#playgroundCode')).toBeVisible();

    const copyButton = page.locator('#playgroundTabCopy');
    await copyButton.click();

    // Flashes confirmation via the is-copied class + "Copied!" tooltip.
    await expect(copyButton).toHaveClass(/is-copied/);
    await expect(copyButton).toHaveAttribute('title', 'Copied!');

    // And the clipboard holds the editor's default script.
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toContain('import { EvoSDK }');

    // Reverts afterward.
    await expect(copyButton).not.toHaveClass(/is-copied/);
  });

  test('the dropdown is grouped by category', async ({ page }) => {
    await page.locator('#playgroundLoadExample').click();
    const menu = page.locator('.pg-pill-menu');
    await expect(menu).toBeVisible();
    await expect(menu.locator('.pg-pill-menu-header', { hasText: 'Identities' })).toBeVisible();
    await expect(menu.locator('.pg-pill-menu-header', { hasText: 'DPNS' })).toBeVisible();
  });

  test('the caret reflects open/closed state via aria-expanded', async ({ page }) => {
    const toggle = page.locator('#playgroundLoadExample');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    // Close again (Escape) and the state reverts.
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('switching examples without edits needs no confirmation', async ({ page }) => {
    const editor = page.locator('#playgroundCode');
    await expect(editor).toBeVisible();

    // Fail loudly if any confirm dialog appears: an unmodified editor should
    // switch examples seamlessly.
    page.on('dialog', (dialog) => {
      throw new Error(`Unexpected confirm dialog: ${dialog.message()}`);
    });

    await loadExample(page, 'Retrieve an identity');
    await expect(editor).toHaveValue(/sdk\.identities\.fetch/);

    // From that example (still unmodified) → another loads with no confirm.
    await loadExample(page, 'Query documents');
    await expect(editor).toHaveValue(/sdk\.documents\.query/);
  });

  test('switching examples after edits asks for confirmation', async ({ page }) => {
    const editor = page.locator('#playgroundCode');
    await expect(editor).toBeVisible();

    // Edit the editor so it diverges from the baseline.
    await editor.click();
    await editor.press('End');
    await editor.pressSequentially('\n// my edit');

    // Now a confirm must appear; accept it and verify the example loads.
    let confirmed = false;
    page.on('dialog', (dialog) => { confirmed = true; dialog.accept(); });
    await loadExample(page, 'Query documents');
    await expect(editor).toHaveValue(/sdk\.documents\.query/);
    expect(confirmed).toBe(true);
  });

  test('the active example is highlighted in the dropdown', async ({ page }) => {
    await loadExample(page, 'Get DPNS names');
    await expect(page.locator('#playgroundCode')).toHaveValue(/sdk\.dpns\.usernames/);

    // Reopen the menu — the loaded example's item is marked active.
    await page.locator('#playgroundLoadExample').click();
    const active = page.locator('.pg-pill-menu-item.is-active', { hasText: 'Get DPNS names' });
    await expect(active).toBeVisible();
  });

  test('the "modified" badge tracks edits', async ({ page }) => {
    const editor = page.locator('#playgroundCode');
    await expect(editor).toBeVisible();

    const badge = page.locator('#playgroundModified');
    await expect(badge).toBeHidden();

    // Type something so the editor diverges from the default.
    await editor.click();
    await editor.press('End');
    await editor.pressSequentially('\n// edited');
    await expect(badge).toBeVisible();

    // Reset clears the badge.
    page.on('dialog', (dialog) => dialog.accept());
    await page.locator('#playgroundReset').click();
    await expect(badge).toBeHidden();
  });

  test('Output copy copies captured output text', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await expect(page.locator('#playgroundCode')).toBeVisible();

    // Seed the output panel directly (avoids a network run) and copy it.
    await page.locator('#playgroundOutput').evaluate((el) => {
      el.classList.remove('empty');
      el.textContent = 'hello from output';
    });

    const copyBtn = page.locator('#playgroundOutputCopy');
    await copyBtn.click();
    await expect(copyBtn).toHaveClass(/is-copied/);

    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toContain('hello from output');
  });

  test('Ctrl/Cmd+Enter runs the code', async ({ page }) => {
    const editor = page.locator('#playgroundCode');
    await expect(editor).toBeVisible();

    // Replace with a trivial network-free script, then run via the shortcut.
    page.on('dialog', (dialog) => dialog.accept());
    await editor.fill('console.log("ran via shortcut");');
    await editor.press('ControlOrMeta+Enter');

    await expect(page.locator('#playgroundOutput')).toContainText('ran via shortcut');
  });

  // Import-specifier rewriting: before running, the SDK import specifier is
  // rewritten to the bundled module's URL. That rewrite must only touch real
  // import syntax (static declarations and dynamic import()) — not text that
  // merely looks like one.

  test('a string that looks like an import is left intact', async ({ page }) => {
    const editor = page.locator('#playgroundCode');
    await expect(editor).toBeVisible();

    // This is valid user code: a plain string that happens to contain
    // `from '@dashevo/evo-sdk'`. A naive raw-text rewrite would corrupt it into
    // invalid JS; the scanner must leave it verbatim so the script runs and
    // logs the string unchanged.
    page.on('dialog', (dialog) => dialog.accept());
    await editor.fill(`console.log("from '@dashevo/evo-sdk'");`);
    await editor.press('ControlOrMeta+Enter');

    const output = page.locator('#playgroundOutput');
    await expect(output).toContainText(`from '@dashevo/evo-sdk'`);
    // And the run finished cleanly (no syntax error from a mangled string).
    await expect(page.locator('#playgroundStatus')).toHaveText('Done');
  });

  test('a real SDK import is still rewritten and resolves', async ({ page }) => {
    const editor = page.locator('#playgroundCode');
    await expect(editor).toBeVisible();

    // Importing the SDK loads the bundled module (same-origin, no testnet) and
    // reads a symbol — proving the specifier was rewritten to a resolvable URL.
    // No .connect() / DAPI call, so this stays network-free like the rest of
    // the smoke suite.
    page.on('dialog', (dialog) => dialog.accept());
    await editor.fill(
      `import { EvoSDK } from '@dashevo/evo-sdk';\nconsole.log('EvoSDK type:', typeof EvoSDK);`
    );
    await editor.press('ControlOrMeta+Enter');

    await expect(page.locator('#playgroundOutput')).toContainText(/EvoSDK type: (function|object)/);
    await expect(page.locator('#playgroundStatus')).toHaveText('Done');
  });

  test('a dynamic import() of the SDK is rewritten and resolves', async ({ page }) => {
    const editor = page.locator('#playgroundCode');
    await expect(editor).toBeVisible();

    // `await import('@dashevo/evo-sdk')` is a common pattern in external docs.
    // Its bare specifier can't resolve inside the blob module unless rewritten,
    // so this guards that the rewrite covers the dynamic form, not just `from`.
    page.on('dialog', (dialog) => dialog.accept());
    await editor.fill(
      `const { EvoSDK } = await import('@dashevo/evo-sdk');\nconsole.log('EvoSDK type:', typeof EvoSDK);`
    );
    await editor.press('ControlOrMeta+Enter');

    await expect(page.locator('#playgroundOutput')).toContainText(/EvoSDK type: (function|object)/);
    await expect(page.locator('#playgroundStatus')).toHaveText('Done');
  });

  test('a bare side-effect SDK import is rewritten and resolves', async ({ page }) => {
    const editor = page.locator('#playgroundCode');
    await expect(editor).toBeVisible();

    // Side-effect `import '@dashevo/evo-sdk';` (no `from`) must resolve too — a
    // bare specifier here would otherwise throw the opaque module-resolution
    // error. It exposes no binding, so we assert only that the run finishes.
    page.on('dialog', (dialog) => dialog.accept());
    await editor.fill(`import '@dashevo/evo-sdk';\nconsole.log('side-effect import ok');`);
    await editor.press('ControlOrMeta+Enter');

    await expect(page.locator('#playgroundOutput')).toContainText('side-effect import ok');
    await expect(page.locator('#playgroundStatus')).toHaveText('Done');
  });

  // Syntax highlighting: a Prism-highlighted <pre> mirrors the textarea behind
  // it. These assert the layer tracks the editor and is vendored (not CDN).

  test('the highlight layer mirrors the editor text', async ({ page }) => {
    const editor = page.locator('#playgroundCode');
    const highlight = page.locator('#playgroundHighlight');
    await expect(editor).toBeVisible();

    // On load it reflects the default script (textContent strips the markup;
    // trailing whitespace differs because we pad the layer with a newline).
    const editorValue = await editor.inputValue();
    await expect(highlight).toContainText('import { EvoSDK }');
    expect((await highlight.textContent()).trimEnd()).toBe(editorValue.trimEnd());

    // Loading another example updates the layer to match.
    await loadExample(page, 'Query documents');
    await expect(highlight).toContainText('sdk.documents.query');
  });

  test('keywords are tokenized in the highlight layer', async ({ page }) => {
    await expect(page.locator('#playgroundCode')).toBeVisible();
    // The default script has `import`, `const`, `await` — all keywords.
    await expect(page.locator('#playgroundHighlight .token.keyword').first()).toBeVisible();
  });

  test('typing updates the highlight layer', async ({ page }) => {
    const editor = page.locator('#playgroundCode');
    const highlight = page.locator('#playgroundHighlight');
    await expect(editor).toBeVisible();

    await editor.click();
    await editor.press('End');
    await editor.pressSequentially('\nconst marker = 42;');

    await expect(highlight).toContainText('const marker = 42;');
  });

  test('Prism is vendored, not loaded from a CDN', async ({ page }) => {
    const origin = new URL(page.url()).origin;
    // Only media.dash.org (favicons) is an allowed cross-origin reference.
    const isExternal = (u) =>
      /^https?:/i.test(u) && !u.startsWith(origin) && !/media\.dash\.org/.test(u);

    // Capture every request made while reloading the page — a transient CDN
    // fetch during load would appear here even if it left no trace in the
    // final DOM (the DOM-only check below can't see a script that was fetched
    // and then removed, or a fetch()/import() to a CDN).
    const requests = [];
    page.on('request', (req) => requests.push(req.url()));
    await page.reload({ waitUntil: 'networkidle' });

    // The highlighter is present...
    expect(await page.evaluate(() => typeof window.Prism)).toBe('object');

    // ...no external request was made during load...
    expect(requests.filter(isExternal)).toEqual([]);

    // ...and every script/style in the final DOM is same-origin (no CDN).
    const externalSources = await page.evaluate(() => {
      const urls = [];
      document.querySelectorAll('script[src]').forEach((s) => urls.push(s.src));
      document.querySelectorAll('link[href]').forEach((l) => urls.push(l.href));
      return urls;
    });
    expect(externalSources.filter(isExternal)).toEqual([]);
  });
});
