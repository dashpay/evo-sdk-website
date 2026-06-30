# Vendored Prism

Syntax highlighter for the code playground editor. These are **vendored third-party files** — copied
verbatim from the published `prismjs` npm package, not authored here. They are committed to the repo
deliberately so the playground loads no third-party CDN (an earlier CDN-loaded highlighter took the
whole page down on a CDN outage).

- **Library:** [Prism](https://prismjs.com/) ([PrismJS/prism](https://github.com/PrismJS/prism))
- **Version:** 1.30.0
- **License:** MIT — full text in [`LICENSE`](./LICENSE)

## Files

Loaded in this order as classic `<script src>` tags (Prism core is not an ES module) in
`public/playground.html`, before the `playground.js` module:

1. `prism-core.min.js` — the highlighter engine; defines `window.Prism`.
2. `prism-clike.min.js` — the C-like base grammar.
3. `prism-javascript.min.js` — the JavaScript grammar; **extends `clike`**, so `prism-clike` must
   load first or `Prism.languages.javascript` is undefined.

Nothing else (no autoloader, no theme CSS, no plugins) is used. Token colors are an inline custom
theme in `public/playground.css`. The playground calls `Prism.highlight(code,
Prism.languages.javascript, 'javascript')` directly.

## Refreshing

From the npm registry tarball for the desired version, copy these three `components/prism-*.min.js`
files here verbatim and update the version above:

```sh
curl -sL https://registry.npmjs.org/prismjs/-/prismjs-<VERSION>.tgz -o prism.tgz
tar -xzf prism.tgz
cp package/components/prism-{core,clike,javascript}.min.js .
```
