import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

const docs = fs.readFileSync(new URL('../../public/docs.html', import.meta.url), 'utf8');
const aiReference = fs.readFileSync(new URL('../../public/AI_REFERENCE.md', import.meta.url), 'utf8');
const typeReference = fs.readFileSync(new URL('../../public/TYPE_REFERENCE.md', import.meta.url), 'utf8');
const typeReferenceHtml = fs.readFileSync(new URL('../../public/TYPE_REFERENCE.html', import.meta.url), 'utf8');
const manifest = JSON.parse(fs.readFileSync(new URL('../../public/docs_manifest.json', import.meta.url), 'utf8'));
const catalog = JSON.parse(fs.readFileSync(new URL('../../public/sdk-operation-catalog.json', import.meta.url), 'utf8'));
const apiDefinitions = JSON.parse(fs.readFileSync(new URL('../../public/api-definitions.json', import.meta.url), 'utf8'));
const documentedMethods = ['queries', 'transitions'].flatMap((group) =>
  Object.values(apiDefinitions[group]).flatMap((category) =>
    Object.values(category[group]).map((operation) => operation.sdk_method),
  ),
);

describe('generated return type documentation', () => {
  it('documents every existing operation without fixed count assumptions', () => {
    expect(docs.match(/<div class="returns">/g)).toHaveLength(documentedMethods.length);
    expect(aiReference.match(/\nReturns:\n/g)).toHaveLength(documentedMethods.length);
    expect(manifest.documented_operations).toBe(documentedMethods.length);
    expect(manifest.resolved_sdk_methods).toBe(new Set(documentedMethods).size);
  });

  it('renders representative query and transition return types', () => {
    expect(aiReference).toContain('- `Promise<Map<string, bigint | undefined>>`');
    expect(aiReference).toContain('- `Promise<wasm.TokenMintResult>`');
    expect(docs).toContain('Promise&lt;wasm.Identity | undefined&gt;');
    expect(docs).toContain('Promise&lt;void&gt;');
  });

  it('links named return types to generated declarations', () => {
    expect(aiReference).toContain('  - Type declarations: [`wasm.Identity`](TYPE_REFERENCE.md#type-identity)');
    expect(typeReference).toContain('<a id="type-identity"></a>');
    expect(typeReference).toContain('export class Identity');
    expect(docs).toContain('TYPE_REFERENCE.html#type-identity');
    expect(docs).not.toContain('TYPE_REFERENCE.md#type-identity');
    expect(typeReferenceHtml).toContain('id="type-identity"');
    expect(typeReferenceHtml).toContain('export class Identity');
  });

  it('records the declaration source version', () => {
    expect(manifest.sdk_types).toMatchObject({ name: '@dashevo/evo-sdk', version: '4.0.0', declarationRoot: 'dist' });
    expect(aiReference).toContain('`@dashevo/evo-sdk@4.0.0`');
  });

  it('publishes declaration-derived signatures and option properties', () => {
    expect(catalog.schemaVersion).toBe(1);
    expect(catalog.methods['identities.fetch'].signature).toBe(
      'fetch(identityId: wasm.IdentifierLike): Promise<wasm.Identity | undefined>',
    );
    const createOptions = catalog.methods['documents.create'].parameters[0];
    expect(createOptions.type).toBe('wasm.DocumentCreateOptions');
    expect(createOptions.properties).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'document', type: 'Document', optional: false }),
      expect.objectContaining({ name: 'settings', type: 'PutSettings', optional: true }),
    ]));
    expect(aiReference).toContain('Signature: `create(options: wasm.DocumentCreateOptions): Promise<void>`');
    expect(docs).toContain('create(options: wasm.DocumentCreateOptions): Promise&lt;void&gt;');
  });

  it('keeps playground construction fields out of SDK documentation', () => {
    expect(aiReference).not.toContain('Parameters (payload fields)');
    expect(aiReference).not.toContain('Generate New Seed');
    expect(docs).not.toContain('Generate New Seed');
    expect(aiReference).not.toContain('Seed Phrase` (textarea');
  });

  it('keeps generated query examples consistent with async return types and declarations', () => {
    expect(aiReference).toContain("const result = await sdk.dpns.convertToHomographSafe('ąlice');");
    expect(aiReference).not.toContain("const result = sdk.dpns.convertToHomographSafe('ąlice');");
    expect(aiReference).not.toMatch(/evonodesProposedBlocksByRange\(\{[^}]*orderAscending/s);
    expect(docs).not.toMatch(/evonodesProposedBlocksByRange\(\{[^}]*orderAscending/s);
  });
});
