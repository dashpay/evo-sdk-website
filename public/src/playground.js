// Code playground: run arbitrary user-authored SDK scripts in the browser.
//
// User code is executed as a dynamically-imported ES module via a blob URL.
// This is the only approach compatible with the site's CSP (which permits
// 'wasm-unsafe-eval' but NOT 'unsafe-eval', so eval / new Function /
// new AsyncFunction are all blocked). Note: a blob: URL is NOT treated as
// 'self' for module script loading, so playground.html's CSP lists `blob:`
// in script-src explicitly (this does not enable eval).
import { formatResult } from './result-format.js';

// Absolute URL of the bundled SDK module, resolved against this page so it works
// both locally and under the GitHub Pages subpath (/evo-sdk-website/).
const SDK_MODULE_URL = new URL('../dist/evo-sdk.module.js', import.meta.url).href;

// Pinned ESM builds of the syntax-highlighting editor, loaded on demand from
// jsdelivr (already allowed by playground.html's script-src). CodeJar is a tiny
// contenteditable wrapper; highlight.js does the actual tokenizing. Versions are
// pinned so a published-package change can't alter behavior without a code edit.
const CODEJAR_URL = 'https://cdn.jsdelivr.net/npm/codejar@4.2.0/dist/codejar.js';
const HLJS_URL = 'https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.9.0/es/highlight.min.js';

// Known-good default script. Single source of truth for the initial editor value
// and the "Reset to default" button. Uses the package-style import that mirrors
// real SDK usage; the specifier is rewritten to SDK_MODULE_URL before execution.
export const DEFAULT_SCRIPT = `import { EvoSDK } from '@dashevo/evo-sdk';

const sdk = EvoSDK.testnetTrusted();
await sdk.connect();

const identity = await sdk.identities.fetch(
  '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk'
);
console.log(identity?.toJSON());
`;

// Read-only example scripts adapted from the platform-tutorials repo.
// Each is fully self-contained: it constructs its own client with
// EvoSDK.testnetTrusted() and connect() (no setupDashClient / keys / env), so
// every example runs in the playground as-is. State-transition tutorials
// (anything that signs or writes) are intentionally excluded.
// Ordered by importance — identity, contract, query come first (they become
// the inline example pills), followed by system status and the DPNS examples
// (which fall into the "All N" overflow dropdown).
export const EXAMPLES = [
  {
    id: 'identity-retrieve',
    title: 'Retrieve an identity',
    description: 'Fetch an identity by ID and print its full details.',
    code: `import { EvoSDK } from '@dashevo/evo-sdk';

const sdk = EvoSDK.testnetTrusted();
await sdk.connect();

const IDENTITY_ID = '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk';

const identity = await sdk.identities.fetch(IDENTITY_ID);
console.log('Identity retrieved:\\n', identity.toJSON());
`,
  },
  {
    id: 'contract-retrieve',
    title: 'Retrieve a data contract',
    description: 'Fetch a data contract by ID and print its schema.',
    code: `import { EvoSDK } from '@dashevo/evo-sdk';

const sdk = EvoSDK.testnetTrusted();
await sdk.connect();

const DATA_CONTRACT_ID = 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec';

const contract = await sdk.contracts.fetch(DATA_CONTRACT_ID);
console.log('Contract retrieved:\\n', contract.toJSON());
`,
  },
  {
    id: 'document-query',
    title: 'Query documents',
    description: 'Query documents of a given type from a contract, with a limit.',
    code: `import { EvoSDK } from '@dashevo/evo-sdk';

const sdk = EvoSDK.testnetTrusted();
await sdk.connect();

const DATA_CONTRACT_ID = 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec';

const results = await sdk.documents.query({
  dataContractId: DATA_CONTRACT_ID,
  documentTypeName: 'domain',
  limit: 5,
});

for (const [id, doc] of results) {
  console.log('Document:', id.toString(), doc.toJSON());
}
`,
  },
  {
    id: 'system-status',
    title: 'System status',
    description: 'Connect to testnet and read overall platform status.',
    code: `import { EvoSDK } from '@dashevo/evo-sdk';

const sdk = EvoSDK.testnetTrusted();
await sdk.connect();

const status = await sdk.system.status();
console.log('Connected. System status:\\n', status.toJSON());
`,
  },
  {
    id: 'name-resolve',
    title: 'Resolve a DPNS name',
    description: 'Resolve a full DPNS name (e.g. name.dash) to its identity ID.',
    code: `import { EvoSDK } from '@dashevo/evo-sdk';

const sdk = EvoSDK.testnetTrusted();
await sdk.connect();

const NAME = 'quantumexplorer.dash';

const result = await sdk.dpns.resolveName(NAME);
console.log(\`Identity ID for "\${NAME}": \${result}\`);
`,
  },
  {
    id: 'name-search',
    title: 'Search DPNS names by prefix',
    description: 'Query the DPNS contract for domain names matching a prefix.',
    code: `import { EvoSDK } from '@dashevo/evo-sdk';

const sdk = EvoSDK.testnetTrusted();
await sdk.connect();

const DPNS_CONTRACT_ID = 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec';
const PREFIX = 'test';

const normalizedPrefix = await sdk.dpns.convertToHomographSafe(PREFIX);

const results = await sdk.documents.query({
  dataContractId: DPNS_CONTRACT_ID,
  documentTypeName: 'domain',
  where: [
    ['normalizedParentDomainName', '==', 'dash'],
    ['normalizedLabel', 'startsWith', normalizedPrefix],
  ],
  orderBy: [['normalizedLabel', 'asc']],
});

for (const [id, doc] of results) {
  const { label, parentDomainName } = doc.toJSON();
  console.log(\`\${label}.\${parentDomainName} (ID: \${id.toString()})\`);
}
`,
  },
  {
    id: 'identity-names',
    title: 'Get DPNS names for an identity',
    description: 'Reverse-lookup: list all DPNS usernames registered to an identity.',
    code: `import { EvoSDK } from '@dashevo/evo-sdk';

const sdk = EvoSDK.testnetTrusted();
await sdk.connect();

const IDENTITY_ID = 'GgZekwh38XcWQTyWWWvmw6CEYFnLU7yiZFPWZEjqKHit';

const usernames = await sdk.dpns.usernames({ identityId: IDENTITY_ID });
console.log(\`Name(s) for \${IDENTITY_ID}:\\n\`, usernames);
`,
  },
];

// Rewrite the SDK import specifier to the bundled module's absolute URL.
// Inside a blob module a relative path resolves against the blob URL (and fails),
// and a bare package specifier has no resolver, so we normalize both forms:
//   '@dashevo/evo-sdk' (and '@dashevo/evo-sdk/...') and any '...evo-sdk.module.js'.
// Only the SDK specifier is touched; all other imports are left untouched.
function rewriteSdkSpecifier(code) {
  const target = JSON.stringify(SDK_MODULE_URL);
  return code.replace(
    /(\bfrom\s*)(['"])(@dashevo\/evo-sdk(?:\/[^'"]*)?|[^'"]*evo-sdk\.module\.js)\2/g,
    (_match, fromKeyword) => `${fromKeyword}${target}`
  );
}

// Format a single console argument for display. Strings pass through verbatim;
// everything else is run through the SDK-aware formatter (handles WASM objects,
// Maps, BigInt, .toJSON()/.toObject(), etc.).
function formatArg(arg) {
  if (typeof arg === 'string') return arg;
  try {
    return formatResult(arg);
  } catch (_) {
    try { return String(arg); } catch { return '[unprintable]'; }
  }
}

// Upgrade a plain <textarea> into a syntax-highlighted CodeJar editor, in place.
// Returns an adapter that exposes the same surface createPlayground() uses on a
// textarea — `value` (get/set), `scrollTop`, and `focus()` — so the rest of the
// playground is agnostic to which editor backs it. On any failure (CDN blocked,
// import error) the original textarea is left untouched and returned as-is, so
// the playground stays fully functional without highlighting.
async function attachEditor(textarea) {
  try {
    const [{ CodeJar }, { default: hljs }] = await Promise.all([
      import(/* webpackIgnore: true */ /* @vite-ignore */ CODEJAR_URL),
      import(/* webpackIgnore: true */ /* @vite-ignore */ HLJS_URL),
    ]);

    // contenteditable div that inherits the textarea's id/styling.
    const code = document.createElement('div');
    code.id = textarea.id;
    code.setAttribute('contenteditable', 'plaintext-only');
    code.setAttribute('spellcheck', 'false');
    code.setAttribute('autocapitalize', 'off');
    textarea.replaceWith(code);

    const highlight = (el) => {
      el.innerHTML = hljs.highlight(el.textContent, { language: 'javascript' }).value;
    };
    const jar = CodeJar(code, highlight, { tab: '  ' });

    return {
      get value() { return jar.toString(); },
      set value(v) { jar.updateCode(v); },
      get scrollTop() { return code.scrollTop; },
      set scrollTop(v) { code.scrollTop = v; },
      focus() { code.focus(); },
      // Delegate listeners to the underlying contenteditable element so callers
      // can subscribe to `input` (CodeJar dispatches it on every edit).
      addEventListener(...args) { code.addEventListener(...args); },
      removeEventListener(...args) { code.removeEventListener(...args); },
    };
  } catch (_) {
    // Highlighting unavailable — fall back to the raw textarea.
    return textarea;
  }
}

export function createPlayground({
  editor, output, runButton, clearButton, resetButton,
  tabCopyButton, outputCopyButton, modifiedBadge, statusEl, examplesContainer,
}) {
  // Show transient run state ("Running…" / "Done" / "Error") beside the Output
  // title, rather than as lines in the output body. `kind` drives the color.
  function setStatus(text, kind) {
    if (!statusEl) return;
    statusEl.hidden = !text;
    statusEl.textContent = text || '';
    statusEl.className = `pg-status${kind ? ' ' + kind : ''}`;
  }

  // Baseline the editor is compared against for the "modified" badge: the
  // default script, or the last example inserted. The badge shows whenever the
  // current code differs from this baseline.
  let baseline = DEFAULT_SCRIPT;

  function updateModified() {
    if (!modifiedBadge) return;
    const isModified = editor.value !== baseline;
    modifiedBadge.hidden = !isModified;
  }

  function setBaseline(value) {
    baseline = value;
    updateModified();
  }

  function appendLine(text, kind) {
    output.classList.remove('empty');
    const line = document.createElement('div');
    line.className = `pg-line ${kind}`;
    line.textContent = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }

  function clearOutput() {
    output.textContent = '';
    output.classList.add('empty');
    setStatus('');
  }

  // Temporarily route console output to the panel while still forwarding to the
  // real console. Returns a restore function to call when execution finishes.
  function captureConsole() {
    const methods = ['log', 'info', 'warn', 'error', 'debug'];
    const original = {};
    for (const method of methods) {
      original[method] = console[method];
      console[method] = (...args) => {
        original[method].apply(console, args);
        const kind = method === 'error' ? 'error' : method === 'warn' ? 'warn' : 'log';
        appendLine(args.map(formatArg).join(' '), kind);
      };
    }
    return () => {
      for (const method of methods) console[method] = original[method];
    };
  }

  async function run() {
    runButton.disabled = true;
    clearOutput();
    setStatus('Running…', 'running');

    const code = rewriteSdkSpecifier(editor.value);
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const restoreConsole = captureConsole();
    try {
      await import(/* webpackIgnore: true */ /* @vite-ignore */ url);
      setStatus('Done', 'done');
      // A successful run that logged nothing leaves the panel blank; hint at it.
      if (output.classList.contains('empty')) {
        output.textContent = 'Finished with no output.';
      }
    } catch (err) {
      appendLine(err && (err.stack || err.message) ? (err.stack || err.message) : String(err), 'error');
      setStatus('Error', 'error');
    } finally {
      restoreConsole();
      URL.revokeObjectURL(url);
      runButton.disabled = false;
    }
  }

  function reset() {
    if (editor.value !== DEFAULT_SCRIPT &&
        !window.confirm('Replace your code with the default script? Your current code will be lost.')) {
      return;
    }
    editor.value = DEFAULT_SCRIPT;
    setBaseline(DEFAULT_SCRIPT);
  }

  // Replace the editor contents with an example. Only confirm when the editor
  // has unsaved edits (differs from the current baseline — the default script
  // or last-inserted example); switching between unmodified examples is
  // seamless.
  function insertExample(example) {
    if (editor.value !== baseline &&
        !window.confirm(`Replace your code with the "${example.title}" example? Your current code will be lost.`)) {
      return;
    }
    editor.value = example.code;
    editor.scrollTop = 0;
    editor.focus();
    setBaseline(example.code);
  }

  // Copy text to the clipboard, with a fallback for browsers/contexts without
  // the async clipboard API, and flash "Copied!" on the triggering button.
  async function copyText(text, button) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (_) { /* ignore */ }
      document.body.removeChild(ta);
    }
    if (button) {
      const label = button.textContent;
      button.textContent = 'Copied!';
      setTimeout(() => { button.textContent = label; }, 1500);
    }
  }

  function copyExample(example, button) {
    return copyText(example.code, button);
  }

  function copyCode(button) {
    return copyText(editor.value, button);
  }

  // Copy the captured console output. No-op (no flash) when the panel is empty.
  function copyOutput(button) {
    const text = output.innerText.trim();
    if (!text) return;
    return copyText(text, button);
  }

  // Number of examples shown as inline pills; the "All examples" dropdown
  // always lists every example regardless of this.
  const INLINE_EXAMPLE_COUNT = 4;

  // Render example pills into the examples bar. The first few examples are
  // inline pills for quick access; an "All examples ▾" dropdown lists every
  // example. Both routes call insertExample(). Closes over examplesContainer.
  function renderExamples() {
    if (!examplesContainer) return;
    examplesContainer.textContent = '';

    const inline = EXAMPLES.slice(0, INLINE_EXAMPLE_COUNT);

    for (const example of inline) {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'pg-pill';
      pill.textContent = example.title;
      pill.addEventListener('click', () => insertExample(example));
      examplesContainer.appendChild(pill);
    }

    // "All examples ▾" pill toggling a dropdown of every example.
    const moreBtn = document.createElement('button');
    moreBtn.type = 'button';
    moreBtn.className = 'pg-pill pg-pill-more';
    moreBtn.setAttribute('aria-haspopup', 'true');
    moreBtn.setAttribute('aria-expanded', 'false');
    moreBtn.innerHTML =
      `All examples <span class="pg-pill-caret" aria-hidden="true">▾</span>`;

    const menu = document.createElement('div');
    menu.className = 'pg-pill-menu';
    menu.hidden = true;

    for (const example of EXAMPLES) {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'pg-pill-menu-item';
      const title = document.createElement('span');
      title.textContent = example.title;
      const desc = document.createElement('span');
      desc.className = 'pg-pill-menu-desc';
      desc.textContent = example.description;
      item.append(title, desc);
      item.addEventListener('click', () => {
        closeMenu();
        insertExample(example);
      });
      menu.appendChild(item);
    }

    function openMenu() {
      menu.hidden = false;
      moreBtn.setAttribute('aria-expanded', 'true');
      document.addEventListener('click', onDocClick);
      document.addEventListener('keydown', onKeydown);
    }
    function closeMenu() {
      if (menu.hidden) return;
      menu.hidden = true;
      moreBtn.setAttribute('aria-expanded', 'false');
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKeydown);
    }
    function onDocClick(e) {
      if (!menu.contains(e.target) && e.target !== moreBtn) closeMenu();
    }
    function onKeydown(e) {
      if (e.key === 'Escape') closeMenu();
    }

    moreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (menu.hidden) openMenu(); else closeMenu();
    });

    examplesContainer.append(moreBtn, menu);
  }

  editor.value = DEFAULT_SCRIPT;
  runButton.addEventListener('click', run);
  clearButton.addEventListener('click', clearOutput);
  resetButton.addEventListener('click', reset);
  if (tabCopyButton) tabCopyButton.addEventListener('click', () => copyCode(tabCopyButton));
  if (outputCopyButton) outputCopyButton.addEventListener('click', () => copyOutput(outputCopyButton));
  // The editor element (textarea or CodeJar's contenteditable div) emits
  // `input` on every keystroke; recompute the "modified" badge from it.
  if (editor.addEventListener) editor.addEventListener('input', updateModified);
  updateModified();
  renderExamples();

  return { run, reset, clearOutput, insertExample, copyExample, copyCode, copyOutput };
}

document.addEventListener('DOMContentLoaded', async () => {
  const textarea = document.getElementById('playgroundCode');
  const output = document.getElementById('playgroundOutput');
  const runButton = document.getElementById('playgroundRun');
  const clearButton = document.getElementById('playgroundClear');
  const resetButton = document.getElementById('playgroundReset');
  const tabCopyButton = document.getElementById('playgroundTabCopy');
  const outputCopyButton = document.getElementById('playgroundOutputCopy');
  const modifiedBadge = document.getElementById('playgroundModified');
  const statusEl = document.getElementById('playgroundStatus');
  const examplesContainer = document.getElementById('playgroundExamples');
  if (!textarea || !output || !runButton || !clearButton || !resetButton) return;
  const editor = await attachEditor(textarea);
  createPlayground({
    editor, output, runButton, clearButton, resetButton,
    tabCopyButton, outputCopyButton, modifiedBadge, statusEl, examplesContainer,
  });
});
