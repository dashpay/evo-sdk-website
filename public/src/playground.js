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
export const EXAMPLES = [
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
    };
  } catch (_) {
    // Highlighting unavailable — fall back to the raw textarea.
    return textarea;
  }
}

export function createPlayground({ editor, output, runButton, clearButton, resetButton, copyButton, examplesContainer }) {
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
    appendLine('Running…', 'log');

    const code = rewriteSdkSpecifier(editor.value);
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const restoreConsole = captureConsole();
    try {
      await import(/* webpackIgnore: true */ /* @vite-ignore */ url);
      appendLine('Done.', 'result');
    } catch (err) {
      appendLine(err && (err.stack || err.message) ? (err.stack || err.message) : String(err), 'error');
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
  }

  // Replace the editor contents with an example, confirming first if the editor
  // holds anything other than the default or that same example (so edits aren't
  // lost silently).
  function insertExample(example) {
    if (editor.value !== DEFAULT_SCRIPT && editor.value !== example.code &&
        !window.confirm(`Replace your code with the "${example.title}" example? Your current code will be lost.`)) {
      return;
    }
    editor.value = example.code;
    editor.scrollTop = 0;
    editor.focus();
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

  function renderExamples() {
    if (!examplesContainer) return;
    examplesContainer.textContent = '';
    for (const example of EXAMPLES) {
      const card = document.createElement('div');
      card.className = 'pg-example';

      const title = document.createElement('h3');
      title.className = 'pg-example-title';
      title.textContent = example.title;

      const desc = document.createElement('p');
      desc.className = 'pg-example-desc';
      desc.textContent = example.description;

      const actions = document.createElement('div');
      actions.className = 'pg-example-actions';

      const insertBtn = document.createElement('button');
      insertBtn.className = 'pg-button';
      insertBtn.textContent = 'Insert into editor';
      insertBtn.addEventListener('click', () => insertExample(example));

      const copyBtn = document.createElement('button');
      copyBtn.className = 'pg-button';
      copyBtn.textContent = 'Copy';
      copyBtn.addEventListener('click', () => copyExample(example, copyBtn));

      actions.append(insertBtn, copyBtn);
      card.append(title, desc, actions);
      examplesContainer.appendChild(card);
    }
  }

  editor.value = DEFAULT_SCRIPT;
  runButton.addEventListener('click', run);
  clearButton.addEventListener('click', clearOutput);
  resetButton.addEventListener('click', reset);
  if (copyButton) copyButton.addEventListener('click', () => copyCode(copyButton));
  renderExamples();

  return { run, reset, clearOutput, insertExample, copyExample, copyCode };
}

document.addEventListener('DOMContentLoaded', async () => {
  const textarea = document.getElementById('playgroundCode');
  const output = document.getElementById('playgroundOutput');
  const runButton = document.getElementById('playgroundRun');
  const clearButton = document.getElementById('playgroundClear');
  const resetButton = document.getElementById('playgroundReset');
  const copyButton = document.getElementById('playgroundCopy');
  const examplesContainer = document.getElementById('playgroundExamples');
  if (!textarea || !output || !runButton || !clearButton || !resetButton) return;
  const editor = await attachEditor(textarea);
  createPlayground({ editor, output, runButton, clearButton, resetButton, copyButton, examplesContainer });
});
