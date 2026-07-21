# Evo SDK Website

An interactive documentation and testing website for the [Dash Platform Evo JS SDK](https://github.com/dashpay/platform/tree/master/packages/js-evo-sdk).

**Live site:** <https://dashpay.github.io/evo-sdk-website/>

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

This regenerates `public/sdk-operation-catalog.json`, `public/docs.html`, the human-facing `public/TYPE_REFERENCE.html`, `public/AI_REFERENCE.md`, `public/TYPE_REFERENCE.md`, and copies the latest installed SDK bundle to `public/dist`. Operation metadata — method signatures, parameters, return types, and the recursively resolved input/output types they reference — is extracted from the declarations shipped by `@dashevo/evo-sdk`.

### Check documentation status

```bash
yarn check
```

## Testing

```bash
yarn test               # Full suite: unit tests then Playwright E2E
yarn test:unit          # Vitest unit tests + type-extraction tests
```

Playwright E2E:

```bash
yarn test:smoke         # Quick UI validation tests
yarn test:queries       # Query execution tests (parallel)
yarn test:playground    # Playground example tests
yarn test:transitions   # State transition tests (sequential, slow)
```

## Project Structure

- `public/index.html` — Main interactive SDK testing interface
- `public/playground.html` — Code playground for writing and running SDK snippets
- `public/docs.html` — Human-friendly documentation with examples
- `public/AI_REFERENCE.md` — Compact reference for AI assistants
- `public/TYPE_REFERENCE.html` — Human-facing reference for named input/output types reachable from documented methods
- `public/TYPE_REFERENCE.md` — Generated declarations for named input/output types reachable from documented methods
- `public/sdk-operation-catalog.json` — Versioned catalog of declaration-derived operation metadata (signatures, parameters, return types, referenced types)
- `public/api-definitions.json` — API definitions used by the generator
- `scripts/generate_docs.py` — Documentation generator script
- `scripts/extract_sdk_types.mjs` — Extracts operation metadata and recursively resolves referenced input/output types from the installed SDK declarations

## Notes

- The generator reads `public/api-definitions.json` (no fallbacks).
- The Evo SDK module is expected at `public/dist`. Build the SDK in the platform repo with `yarn workspace @dashevo/evo-sdk build` before regenerating docs.
