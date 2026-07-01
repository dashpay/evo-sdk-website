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

// Whether a module specifier is the SDK, in either form a user might write it:
//   '@dashevo/evo-sdk' (and '@dashevo/evo-sdk/...') or any '...evo-sdk.module.js'.
function isSdkSpecifier(spec) {
  return /^@dashevo\/evo-sdk(?:\/.*)?$/.test(spec) || /evo-sdk\.module\.js$/.test(spec);
}

// Rewrite the SDK specifier in `import` forms to the bundled module's absolute
// URL. Inside a blob module a relative path resolves against the blob URL (and
// fails), and a bare package specifier has no resolver, so any un-rewritten
// occurrence throws the opaque "Failed to resolve module specifier" error this
// rewriter exists to prevent. We normalize the SDK specifier in:
//   import { EvoSDK } from '<spec>';   import EvoSDK from '<spec>';
//   import * as sdk from '<spec>';     import '<spec>';        (side-effect)
//   const { EvoSDK } = await import('<spec>');                 (dynamic, literal)
// Dynamic imports and side-effect imports are common in external tutorials, so
// pasted code using them must work too — not just the `from` form the built-in
// examples use.
//
// This is a tiny single-pass scanner, not a regex over raw text. A naive
// /from ['"]...['"]/ also matches that text inside a *string literal* or
// comment and would corrupt valid user code such as
// `const msg = "from '@dashevo/evo-sdk'"`. Since this is the code the playground
// exists to run, that's a real bug — but pulling a full ES parser into this
// build-less page is overkill. Instead we skip strings, template literals, and
// comments, and only act on a real `import` keyword in code context.
//
// Left untouched: `import.meta` (no specifier), `export ... from` re-exports
// (no example uses them), and dynamic imports whose argument is a *computed*
// expression rather than a string literal (nothing to rewrite). Known
// limitation: a regex literal like /import 'x'/ isn't tracked; such a literal
// also matching the SDK pattern is vanishingly unlikely.
function rewriteSdkSpecifier(code) {
  const target = JSON.stringify(SDK_MODULE_URL);
  const n = code.length;
  const isIdent = (ch) => ch === '_' || ch === '$' || (!!ch && /[\p{L}\p{N}]/u.test(ch));

  // If `i` starts a string/template/comment, return the index just past it,
  // else -1. Used to skip over regions where `import`/`from` aren't keywords.
  function endOfToken(i) {
    const ch = code[i];
    if (ch === '/' && code[i + 1] === '/') {
      const end = code.indexOf('\n', i);
      return end === -1 ? n : end;
    }
    if (ch === '/' && code[i + 1] === '*') {
      const end = code.indexOf('*/', i + 2);
      return end === -1 ? n : end + 2;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      let j = i + 1;
      while (j < n) {
        const c = code[j];
        if (c === '\\') { j += 2; continue; }
        if (c === ch) return j + 1;
        j++;
      }
      return n;
    }
    return -1;
  }

  // Given an `import` keyword at `i`, locate the SDK specifier string. Returns
  // { open, close } (indexes of its quotes) when the specifier is the SDK, else
  // null. Handles four forms:
  //   import '<spec>'            (bare side-effect)
  //   import <clause> from '<spec>'
  //   import('<spec>')           (dynamic, string-literal argument)
  // `import.meta` and computed dynamic args have no rewritable specifier.
  function findSdkSpecifier(i) {
    let j = i + 6; // past "import"
    while (j < n && /\s/.test(code[j])) j++;

    // Dynamic import: import( ... ). Rewrite only a string-literal argument.
    if (code[j] === '(') {
      j++;
      while (j < n && /\s/.test(code[j])) j++;
      return matchSpec(j); // returns null if the arg isn't a plain string
    }

    // import.meta — no specifier.
    if (code[j] === '.') return null;

    // Bare side-effect import.
    if (code[j] === '"' || code[j] === "'") return matchSpec(j);

    // Otherwise scan the clause for a real `from` keyword. An import statement
    // may span lines, so only a `;` ends it early; a bare `import` with no
    // `from` (and no `;`) simply runs to EOF and matches nothing.
    while (j < n) {
      const c = code[j];
      if (c === ';') return null;
      if (c === 'f' && code.startsWith('from', j) &&
          !isIdent(code[j - 1]) && !isIdent(code[j + 4])) {
        let k = j + 4;
        while (k < n && /\s/.test(code[k])) k++;
        return matchSpec(k);
      }
      j++;
    }
    return null;
  }

  // If `p` opens a quoted specifier that is the SDK, return its { open, close }
  // quote indexes; else null.
  function matchSpec(p) {
    const q = code[p];
    if (q !== '"' && q !== "'") return null;
    const close = code.indexOf(q, p + 1);
    if (close === -1) return null;
    return isSdkSpecifier(code.slice(p + 1, close)) ? { open: p, close } : null;
  }

  let out = '';
  let i = 0;
  while (i < n) {
    // Skip strings/templates/comments verbatim — `import`/`from` inside them
    // are not keywords (this is what the old raw-text regex got wrong).
    const skipped = endOfToken(i);
    if (skipped !== -1) { out += code.slice(i, skipped); i = skipped; continue; }

    // A real `import` keyword/callee in code context. The `import` token is a
    // boundary — the next char can't be an identifier char (so `imported`,
    // `importScripts` don't match); it may be whitespace, `(`, `.`, or a quote.
    // findSdkSpecifier() sorts out static vs dynamic vs import.meta.
    if (code[i] === 'i' && code.startsWith('import', i) &&
        !isIdent(code[i - 1]) && !isIdent(code[i + 6])) {
      const spec = findSdkSpecifier(i);
      if (spec) {
        // Emit through the opening quote unchanged, swap the specifier body for
        // the target URL (which includes its own quotes), and resume past it.
        out += code.slice(i, spec.open) + target;
        i = spec.close + 1;
        continue;
      }
    }

    out += code[i];
    i++;
  }

  return out;
}

// Format a single console argument for display. Strings pass through verbatim;
// everything else is run through the SDK-aware formatter (handles WASM objects,
// Maps, BigInt, .toJSON()/.toObject(), etc.).
function formatArg(arg) {
  if (arg instanceof Error) return formatError(arg);
  if (typeof arg === 'string') return relabelBlobUrls(arg);
  try {
    return formatResult(arg);
  } catch (_) {
    try { return String(arg); } catch { return '[unprintable]'; }
  }
}

// Replace the internal blob: object URL (origin + a random UUID) with
// "your code", while preserving any trailing ":line:col" the stack appends —
// so a trace reads "at your code:12:22" and still maps to the editor. The UUID
// contains no ':' so the lazy match stops before the line/column.
function relabelBlobUrls(text) {
  return text.replace(/blob:\S*?\/[0-9a-f-]{8,}/gi, 'your code');
}

// Turn a thrown error into user-facing text. We show the real error verbatim —
// no interpretation — just with the blob: URLs relabelled.
function formatError(err) {
  const raw = err && (err.stack || err.message) ? (err.stack || err.message) : String(err);
  return relabelBlobUrls(raw);
}

export function createPlayground({
  editor, output, runButton, clearButton, resetButton,
  tabCopyButton, outputCopyButton, modifiedBadge, statusEl, examplesContainer,
  highlightEl,
}) {
  // Whether Prism loaded as a `'self'` classic script (see playground.html).
  // It's vendored, not CDN-loaded, so this is true in practice — but if it
  // ever fails to load we degrade to a plain visible textarea rather than
  // leaving transparent (unreadable) text. Decided once at init below.
  const hasPrism = typeof window !== 'undefined' && !!window.Prism &&
    !!window.Prism.languages && !!window.Prism.languages.javascript;

  // Re-render the highlight layer to mirror the editor's current text. The
  // textarea remains the source of truth; this only repaints the colored <pre>
  // behind it. A trailing newline is added so the last line's height matches
  // the textarea (an unterminated final line would leave the layers a row off).
  function syncHighlight() {
    if (!highlightEl || !hasPrism) return;
    const value = editor.value.endsWith('\n') ? editor.value : editor.value + '\n';
    highlightEl.innerHTML = window.Prism.highlight(
      value, window.Prism.languages.javascript, 'javascript');
  }

  // Keep the highlight layer scrolled in lockstep with the textarea.
  function syncScroll() {
    if (!highlightEl) return;
    const pre = highlightEl.parentElement;
    if (!pre) return;
    pre.scrollTop = editor.scrollTop;
    pre.scrollLeft = editor.scrollLeft;
  }

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
      appendLine(formatError(err), 'error');
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
    syncHighlight();
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
    syncHighlight();
    syncScroll();
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
  // If Prism didn't load, mark the surface so CSS reverts the textarea to plain
  // visible text (the colored layer would otherwise leave it transparent).
  if (!hasPrism && highlightEl) {
    const surface = highlightEl.closest('.pg-editor-surface');
    if (surface) surface.classList.add('no-highlight');
  }
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
  // Recompute the "modified" badge + active-pill highlight and repaint the
  // syntax-highlight layer on every edit; keep the layer scrolled with the text.
  editor.addEventListener('input', () => { updateModified(); syncHighlight(); });
  editor.addEventListener('scroll', syncScroll);
  renderExamples();
  updateModified();
  syncHighlight();

  return { run, reset, clearOutput, insertExample, copyExample, copyCode, copyOutput, syncHighlight };
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
  const highlightEl = document.getElementById('playgroundHighlight');
  if (!editor || !output || !runButton || !clearButton || !resetButton) return;

  createPlayground({
    editor, output, runButton, clearButton, resetButton,
    tabCopyButton, outputCopyButton, modifiedBadge, statusEl, examplesContainer,
    highlightEl,
  });
});
