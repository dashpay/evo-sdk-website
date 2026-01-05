# Evo SDK Website

An interactive documentation and testing website for the [Dash Platform Evo JS SDK](https://github.com/dashpay/platform/tree/master/packages/js-evo-sdk).

**Live site:** https://dashpay.github.io/evo-sdk-website/

## Related Repositories

- **[Dash Platform](https://github.com/dashpay/platform)** — The monorepo containing all Dash Platform components
- **[Evo JS SDK](https://github.com/dashpay/platform/tree/master/packages/js-evo-sdk)** — The JavaScript SDK for interacting with Dash Platform

## Local Development

### Serve the website locally
```bash
yarn serve
open http://localhost:8081/index.html
```

### Generate documentation
```bash
yarn generate
```
This regenerates `public/docs.html`, `public/AI_REFERENCE.md`, and copies the latest SDK bundle from `platform/packages/js-evo-sdk/dist` to `public/dist`.

### Check documentation status
```bash
yarn check
```

## Project Structure

- `public/index.html` — Main interactive SDK testing interface
- `public/docs.html` — Human-friendly documentation with examples
- `public/AI_REFERENCE.md` — Compact reference for AI assistants
- `public/api-definitions.json` — API definitions used by the generator
- `scripts/generate_docs.py` — Documentation generator script

## Notes

- The generator reads `public/api-definitions.json` (no fallbacks).
- The Evo SDK module is expected at `public/dist`. Build the SDK in the platform repo with `yarn workspace @dashevo/evo-sdk build` before regenerating docs.
