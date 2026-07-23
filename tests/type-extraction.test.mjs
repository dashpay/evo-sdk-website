import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { extractTypes } from '../scripts/extract_sdk_types.mjs';

function fixture({ method = 'sample', methodDocs = '', parameters = '', returnType = 'Promise<void>', declarations = '', overload = false, annotated = true, input = {} } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'evo-type-test-'));
  const packageRoot = path.join(root, 'node_modules/@dashevo/evo-sdk');
  const wasmRoot = path.join(root, 'node_modules/@dashevo/wasm-sdk');
  fs.mkdirSync(path.join(packageRoot, 'dist/example'), { recursive: true });
  fs.mkdirSync(path.join(wasmRoot, 'dist/raw'), { recursive: true });
  fs.writeFileSync(path.join(packageRoot, 'package.json'), JSON.stringify({ name: '@dashevo/evo-sdk', version: '4.0.0' }));
  fs.writeFileSync(path.join(wasmRoot, 'package.json'), JSON.stringify({ name: '@dashevo/wasm-sdk', version: '4.0.0' }));
  const signature = annotated ? `${method}(${parameters}): ${returnType};` : `${method}(${parameters});`;
  fs.writeFileSync(path.join(packageRoot, 'dist/example/facade.d.ts'), `export declare class ExampleFacade {\n${methodDocs}\n${signature}\n${overload ? signature : ''}\n}`);
  fs.writeFileSync(path.join(wasmRoot, 'dist/raw/wasm_sdk.d.ts'), declarations);
  const apiFile = path.join(root, 'api.json');
  fs.writeFileSync(apiFile, JSON.stringify({ queries: { example: { queries: { operation: { sdk_method: `example.${method}`, ...input } } } }, transitions: {} }));
  return { root, packageRoot, apiFile };
}

test('preserves exact primitive, union, array, nested generic, inline object, and qualified types', () => {
  const returnType = 'Promise<Map<string, wasm.ResultType | undefined> | Array<{ count: bigint; values: string[] }>>';
  const fx = fixture({ returnType, declarations: 'export interface ResultType { value: bigint; }' });
  const extracted = extractTypes(fx);
  assert.equal(
    extracted.methods['example.sample'].returnType,
    'Promise<Map<string, wasm.ResultType | undefined> | Array<{ count: bigint; values: string[]; }>>',
  );
  assert.deepEqual(extracted.methods['example.sample'].references, ['wasm.ResultType']);
  assert.equal(extracted.operations[0].signature, 'sample(): Promise<Map<string, wasm.ResultType | undefined> | Array<{ count: bigint; values: string[]; }>>');
  assert.deepEqual(extracted.operations[0].references, ['wasm.ResultType']);
  assert.match(extracted.types.ResultType.declaration, /interface ResultType/);
});

test('preserves Promise<void>', () => {
  const fx = fixture();
  assert.equal(extractTypes(fx).methods['example.sample'].returnType, 'Promise<void>');
});

test('fails for an unknown method', () => {
  const fx = fixture({ method: 'present' });
  const api = JSON.parse(fs.readFileSync(fx.apiFile));
  api.queries.example.queries.operation.sdk_method = 'example.missing';
  fs.writeFileSync(fx.apiFile, JSON.stringify(api));
  assert.throws(() => extractTypes(fx), /resolved to 0 declarations/);
});

test('fails for an absent return annotation', () => {
  const fx = fixture({ annotated: false });
  assert.throws(() => extractTypes(fx), /has no return annotation/);
});

test('fails for overload ambiguity', () => {
  const fx = fixture({ overload: true });
  assert.throws(() => extractTypes(fx), /resolved to 2 declarations/);
});

test('fails when a referenced type declaration is missing', () => {
  const fx = fixture({ returnType: 'Promise<wasm.MissingType>' });
  assert.throws(() => extractTypes(fx), /has no declaration/);
});

test('extracts positional and object parameters, optional properties, inheritance, and JSDoc', () => {
  const declarations = `
    export interface BaseOptions { inherited: bigint; }
    export interface SampleOptions extends BaseOptions {
      /** Required value description. */
      value: string;
      optional?: number;
    }
  `;
  const fx = fixture({
    methodDocs: '/**\n * Method description.\n * @param options Options description.\n */',
    parameters: 'options: wasm.SampleOptions, cursor?: string, ...ids: string[]',
    returnType: 'Promise<wasm.SampleOptions>',
    declarations,
  });
  const method = extractTypes(fx).methods['example.sample'];
  assert.equal(method.signature, 'sample(options: wasm.SampleOptions, cursor?: string, ...ids: string[]): Promise<wasm.SampleOptions>');
  assert.equal(method.description, 'Method description.');
  assert.equal(method.parameters[0].description, 'Options description.');
  assert.deepEqual(method.parameters.map(({ name, optional, rest }) => ({ name, optional, rest })), [
    { name: 'options', optional: false, rest: false },
    { name: 'cursor', optional: true, rest: false },
    { name: 'ids', optional: false, rest: true },
  ]);
  assert.deepEqual(method.parameters[0].properties.map(({ name, optional }) => ({ name, optional })), [
    { name: 'inherited', optional: false },
    { name: 'value', optional: false },
    { name: 'optional', optional: true },
  ]);
  assert.match(method.parameters[0].properties[1].description, /Required value/);
});

test('fails when legacy sdk_params remain in metadata', () => {
  const fx = fixture({ input: { sdk_params: [{ name: 'value' }] } });
  assert.throws(() => extractTypes(fx), /legacy sdk_params/);
});

test('validates explicit playground-to-SDK mappings', () => {
  const fx = fixture({
    parameters: 'options: wasm.SampleOptions',
    declarations: 'export interface SampleOptions { value: string; }',
    input: { inputs: [{ name: 'formValue', sdk_property: 'options.missing' }] },
  });
  assert.throws(() => extractTypes(fx), /unknown SDK property options\.missing/);
});

test('rejects unknown option keys in curated SDK examples', () => {
  const fx = fixture({
    parameters: 'options: wasm.SampleOptions',
    declarations: 'export interface SampleOptions { value: string; }',
    input: { sdk_example: 'await sdk.example.sample({ missing: value });' },
  });
  assert.throws(() => extractTypes(fx), /sdk_example uses unknown SDK property missing/);
});

test('does not count the same method on a different namespace', () => {
  const fx = fixture({
    parameters: 'options: wasm.SampleOptions',
    declarations: 'export interface SampleOptions { value: string; }',
    input: { sdk_example: 'await sdk.other.sample({ value });' },
  });
  assert.throws(() => extractTypes(fx), /sdk_example must call example\.sample exactly once/);
});

test('fails for conflicting inherited properties', () => {
  const fx = fixture({
    parameters: 'options: wasm.SampleOptions',
    declarations: `
      export interface First { value: string; }
      export interface Second { value: number; }
      export interface SampleOptions extends First, Second {}
    `,
  });
  assert.throws(() => extractTypes(fx), /Conflicting property SampleOptions\.value/);
});
