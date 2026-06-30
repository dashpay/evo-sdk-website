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

// Read-only example scripts adapted from the platform-tutorials repo.
// Each is fully self-contained: it constructs its own client with
// EvoSDK.testnetTrusted() and connect() (no setupDashClient / keys / env), so
// every example runs in the playground as-is. State-transition tutorials
// (anything that signs or writes) are intentionally excluded.
// `category` groups examples under headers in the "Load example" dropdown;
// EXAMPLE_CATEGORIES below defines the header order.
export const EXAMPLES = [
  {
    id: 'identity-retrieve',
    category: 'Identities',
    title: 'Retrieve an identity',
    description: 'Fetch an identity by ID and print its full details.',
    code: `// Fetch an identity by ID and print its full details.
import { EvoSDK } from '@dashevo/evo-sdk';

const sdk = EvoSDK.testnetTrusted();
await sdk.connect();

const IDENTITY_ID = '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk';

const identity = await sdk.identities.fetch(IDENTITY_ID);
console.log('Identity retrieved:\\n', identity.toJSON());
`,
  },
  {
    id: 'contract-retrieve',
    category: 'Contracts',
    title: 'Retrieve a data contract',
    description: 'Fetch a data contract by ID and print its schema.',
    code: `// Fetch a data contract by ID and print its schema.
import { EvoSDK } from '@dashevo/evo-sdk';

const sdk = EvoSDK.testnetTrusted();
await sdk.connect();

const DATA_CONTRACT_ID = 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec';

const contract = await sdk.contracts.fetch(DATA_CONTRACT_ID);
console.log('Contract retrieved:\\n', contract.toJSON());
`,
  },
  {
    id: 'document-query',
    category: 'Documents',
    title: 'Query documents',
    description: 'Query documents of a given type from a contract, with a limit.',
    code: `// Query documents of a given type from a contract, with a limit.
import { EvoSDK } from '@dashevo/evo-sdk';

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
    category: 'System',
    title: 'System status',
    description: 'Connect to testnet and read overall platform status.',
    code: `// Connect to testnet and read overall platform status.
import { EvoSDK } from '@dashevo/evo-sdk';

const sdk = EvoSDK.testnetTrusted();
await sdk.connect();

const status = await sdk.system.status();
console.log('Connected. System status:\\n', status.toJSON());
`,
  },
  {
    id: 'name-resolve',
    category: 'DPNS',
    title: 'Resolve a DPNS name',
    description: 'Resolve a full DPNS name (e.g. name.dash) to its identity ID.',
    code: `// Resolve a full DPNS name (e.g. name.dash) to its identity ID.
import { EvoSDK } from '@dashevo/evo-sdk';

const sdk = EvoSDK.testnetTrusted();
await sdk.connect();

const NAME = 'quantumexplorer.dash';

const result = await sdk.dpns.resolveName(NAME);
console.log(\`Identity ID for "\${NAME}": \${result}\`);
`,
  },
  {
    id: 'name-search',
    category: 'DPNS',
    title: 'Search DPNS names by prefix',
    description: 'Query the DPNS contract for domain names matching a prefix.',
    code: `// Query the DPNS contract for domain names matching a prefix.
import { EvoSDK } from '@dashevo/evo-sdk';

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
    category: 'DPNS',
    title: 'Get DPNS names for an identity',
    description: 'Reverse-lookup: list all DPNS usernames registered to an identity.',
    code: `// List all DPNS usernames registered to an identity (reverse lookup).
import { EvoSDK } from '@dashevo/evo-sdk';

const sdk = EvoSDK.testnetTrusted();
await sdk.connect();

const IDENTITY_ID = 'GgZekwh38XcWQTyWWWvmw6CEYFnLU7yiZFPWZEjqKHit';

const usernames = await sdk.dpns.usernames({ identityId: IDENTITY_ID });
console.log(\`Name(s) for \${IDENTITY_ID}:\\n\`, usernames);
`,
  },
];

// Category header order for the "Load example" dropdown. Any example whose
// category isn't listed here is appended under its own header at the end.
export const EXAMPLE_CATEGORIES = ['Identities', 'Contracts', 'Documents', 'DPNS', 'System'];

// Initial editor value and "Reset" target. Reuses the "Retrieve an identity"
// example (single source of truth) and prepends a one-line orientation hint so
// a first-time visitor knows what to do next. Loading that example from the
// dropdown gives the same code minus this hint.
export const DEFAULT_SCRIPT =
  `// Edit the code or pick another example above, then hit Run.\n` +
  EXAMPLES.find((e) => e.id === 'identity-retrieve').code;

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

  // Menu item button per example id, populated by renderExamples(); used to
  // show the "active" highlight on whichever example the editor matches.
  const menuItems = new Map();

  function refreshActiveItem() {
    const current = editor.value;
    for (const [id, button] of menuItems) {
      const example = EXAMPLES.find((e) => e.id === id);
      button.classList.toggle('is-active', !!example && example.code === current);
    }
  }

  function updateModified() {
    if (modifiedBadge) modifiedBadge.hidden = editor.value === baseline;
    refreshActiveItem();
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

  // Reset to the default script. Only confirm when the editor has unsaved edits
  // (differs from its baseline — the default or a cleanly-loaded example);
  // resetting an unmodified example is seamless. No-op if already at the default.
  function reset() {
    if (editor.value === DEFAULT_SCRIPT) return;
    if (editor.value !== baseline &&
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
  // the async clipboard API. Flashes confirmation on the triggering button via
  // an `is-copied` class (CSS swaps the icon to a check) and the title/tooltip.
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
      const title = button.getAttribute('title');
      button.classList.add('is-copied');
      button.setAttribute('title', 'Copied!');
      setTimeout(() => {
        button.classList.remove('is-copied');
        if (title != null) button.setAttribute('title', title);
      }, 1500);
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

  // Order examples by EXAMPLE_CATEGORIES, returning [categoryName, examples[]]
  // groups. Categories not listed are appended (in first-seen order) at the end.
  function groupExamples() {
    const byCategory = new Map();
    for (const example of EXAMPLES) {
      const cat = example.category || 'Other';
      if (!byCategory.has(cat)) byCategory.set(cat, []);
      byCategory.get(cat).push(example);
    }
    const ordered = [];
    for (const cat of EXAMPLE_CATEGORIES) {
      if (byCategory.has(cat)) { ordered.push([cat, byCategory.get(cat)]); byCategory.delete(cat); }
    }
    for (const [cat, items] of byCategory) ordered.push([cat, items]);
    return ordered;
  }

  // Render a "Load example ▾" button in the editor tab bar that opens a
  // dropdown of all examples, grouped under category headers. Selecting an item
  // calls insertExample(). Closes over examplesContainer.
  function renderExamples() {
    if (!examplesContainer) return;
    examplesContainer.textContent = '';
    menuItems.clear();

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.id = 'playgroundLoadExample';
    toggle.className = 'pg-load-example';
    toggle.setAttribute('aria-haspopup', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('title', 'Load a ready-made example into the editor');
    toggle.innerHTML = `Load example <span class="pg-pill-caret" aria-hidden="true">▾</span>`;

    const menu = document.createElement('div');
    menu.className = 'pg-pill-menu';
    menu.hidden = true;

    for (const [category, examples] of groupExamples()) {
      const header = document.createElement('div');
      header.className = 'pg-pill-menu-header';
      header.textContent = category;
      menu.appendChild(header);

      for (const example of examples) {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'pg-pill-menu-item';
        const title = document.createElement('span');
        title.className = 'pg-pill-menu-title';
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
        menuItems.set(example.id, item);
      }
    }

    function openMenu() {
      menu.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      document.addEventListener('click', onDocClick);
      document.addEventListener('keydown', onKeydown);
    }
    function closeMenu() {
      if (menu.hidden) return;
      menu.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKeydown);
    }
    function onDocClick(e) {
      if (!menu.contains(e.target) && e.target !== toggle) closeMenu();
    }
    function onKeydown(e) {
      if (e.key === 'Escape') closeMenu();
    }

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (menu.hidden) openMenu(); else closeMenu();
    });

    examplesContainer.append(toggle, menu);
  }

  editor.value = DEFAULT_SCRIPT;
  runButton.addEventListener('click', run);
  clearButton.addEventListener('click', clearOutput);
  resetButton.addEventListener('click', reset);
  if (tabCopyButton) tabCopyButton.addEventListener('click', () => copyCode(tabCopyButton));
  if (outputCopyButton) outputCopyButton.addEventListener('click', () => copyOutput(outputCopyButton));
  // Run the code with Ctrl+Enter / Cmd+Enter while editing.
  editor.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!runButton.disabled) run();
    }
  });
  // Recompute the "modified" badge and active-pill highlight on every edit.
  editor.addEventListener('input', updateModified);
  renderExamples();
  updateModified();

  return { run, reset, clearOutput, insertExample, copyExample, copyCode, copyOutput };
}

document.addEventListener('DOMContentLoaded', () => {
  const editor = document.getElementById('playgroundCode');
  const output = document.getElementById('playgroundOutput');
  const runButton = document.getElementById('playgroundRun');
  const clearButton = document.getElementById('playgroundClear');
  const resetButton = document.getElementById('playgroundReset');
  const tabCopyButton = document.getElementById('playgroundTabCopy');
  const outputCopyButton = document.getElementById('playgroundOutputCopy');
  const modifiedBadge = document.getElementById('playgroundModified');
  const statusEl = document.getElementById('playgroundStatus');
  const examplesContainer = document.getElementById('playgroundExamples');
  if (!editor || !output || !runButton || !clearButton || !resetButton) return;

  createPlayground({
    editor, output, runButton, clearButton, resetButton,
    tabCopyButton, outputCopyButton, modifiedBadge, statusEl, examplesContainer,
  });
});
