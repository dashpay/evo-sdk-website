#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const SCRIPT_FILE = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(SCRIPT_FILE), '..');
const BUILT_INS = new Set([
  'Promise', 'Map', 'Set', 'Array', 'ReadonlyArray', 'Record', 'Partial', 'Required',
  'Pick', 'Omit', 'Exclude', 'Extract', 'NonNullable', 'Uint8Array', 'Date',
]);
const NAMESPACE_DIRS = { stateTransitions: 'state-transitions' };
// Upstream 4.0.0 declarations refer to the public pooling enum by its Rust
// name in one high-level options interface, while exporting it as PoolingWasm.
const DECLARATION_ALIASES = { Pooling: 'PoolingWasm' };

function fail(message) { throw new Error(message); }
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function anchorFor(name) { return `type-${name.replace(/^wasm\./, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`; }

export function documentedMethods(api) {
  const result = [];
  for (const groupName of ['queries', 'transitions']) {
    for (const [categoryName, category] of Object.entries(api[groupName] || {})) {
      for (const [key, item] of Object.entries(category[groupName] || {})) {
        if (!item.sdk_method) fail(`${groupName}.${key} has no sdk_method`);
        if (item.sdk_params) fail(`${groupName}.${key} contains legacy sdk_params; SDK parameters must come from declarations`);
        result.push({
          key, group: groupName, category: categoryName, sdkMethod: item.sdk_method,
          label: item.label || key, description: item.description || '', disabled: item.disabled || null,
          inputs: item.inputs || [], sdkExample: item.sdk_example || '',
        });
      }
    }
  }
  return result;
}

function parseFile(file) {
  return ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

function methodDeclarations(source, methodName) {
  const matches = [];
  function visit(node) {
    if ((ts.isMethodDeclaration(node) || ts.isMethodSignature(node)) && node.name?.getText(source) === methodName) matches.push(node);
    ts.forEachChild(node, visit);
  }
  visit(source);
  return matches;
}

function normalizeType(text) {
  const source = ts.createSourceFile('type.ts', `type X = ${text};`, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const alias = source.statements.find(ts.isTypeAliasDeclaration);
  if (!alias) fail(`Unable to parse type: ${text}`);
  return ts.createPrinter({ removeComments: true }).printNode(ts.EmitHint.Unspecified, alias.type, source).replace(/\s+/g, ' ').trim();
}

function descriptionFor(node, source) {
  const docs = ts.getJSDocCommentsAndTags(node).filter(ts.isJSDoc);
  return docs.map((doc) => typeof doc.comment === 'string' ? doc.comment : '').filter(Boolean).join('\n').trim();
}

function referencedNames(typeNode, source) {
  const names = new Set();
  function visit(node) {
    if (ts.isTypeReferenceNode(node)) {
      const text = node.typeName.getText(source);
      if (!BUILT_INS.has(text)) names.add(text);
    }
    ts.forEachChild(node, visit);
  }
  visit(typeNode);
  return [...names].sort();
}

function declarationReferences(node, source) {
  const names = new Set();
  function visit(current) {
    if (ts.isTypeReferenceNode(current)) {
      const text = current.typeName.getText(source);
      if (!BUILT_INS.has(text)) names.add(text);
    }
    ts.forEachChild(current, visit);
  }
  visit(node);
  return [...names].sort();
}

function collectDeclarationIndex(files) {
  const index = new Map();
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const source = parseFile(file);
    for (const statement of source.statements) {
      if (statement.name && (ts.isClassDeclaration(statement) || ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement) || ts.isEnumDeclaration(statement))) {
        const name = statement.name.text;
        if (!index.has(name)) index.set(name, []);
        index.get(name).push({ file, source, node: statement });
      }
    }
  }
  return index;
}

function walkDts(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkDts(target);
    return entry.name.endsWith('.d.ts') ? [target] : [];
  });
}

function resolveDeclaration(index, reference) {
  const requestedName = reference.replace(/^wasm\./, '');
  const name = DECLARATION_ALIASES[requestedName] || requestedName;
  const matches = index.get(name) || [];
  if (!matches.length) fail(`Referenced type ${reference} has no declaration`);
  // wasm-sdk contains a few generated duplicate names. Prefer the first
  // declaration whose own references can all be resolved; package/file order
  // otherwise keeps the documented high-level write option ahead of internals.
  const match = matches.find((candidate) => declarationReferences(candidate.node, candidate.source)
    .every((item) => {
      const referenced = item.replace(/^wasm\./, '');
      return BUILT_INS.has(item) || index.has(DECLARATION_ALIASES[referenced] || referenced);
    })) || matches[0];
  return { name: requestedName, declarationName: name, ...match };
}

function propertyMetadata(found, index, visiting = new Set()) {
  if (!ts.isInterfaceDeclaration(found.node) && !ts.isClassDeclaration(found.node)) return [];
  if (visiting.has(found.name)) fail(`Circular inherited type ${found.name}`);
  const nextVisiting = new Set(visiting).add(found.name);
  const properties = [];
  for (const clause of found.node.heritageClauses || []) {
    for (const type of clause.types) {
      const base = resolveDeclaration(index, type.expression.getText(found.source));
      properties.push(...propertyMetadata(base, index, nextVisiting));
    }
  }
  for (const member of found.node.members || []) {
    if (!ts.isPropertySignature(member) && !ts.isPropertyDeclaration(member)) continue;
    if (!member.name || !member.type) continue;
    const name = member.name.getText(found.source);
    properties.push({
      name,
      type: normalizeType(member.type.getText(found.source)),
      optional: Boolean(member.questionToken),
      description: descriptionFor(member, found.source),
      references: referencedNames(member.type, found.source),
    });
  }
  const unique = new Map();
  for (const property of properties) {
    if (unique.has(property.name) && JSON.stringify(unique.get(property.name)) !== JSON.stringify(property)) {
      fail(`Conflicting property ${found.name}.${property.name}`);
    }
    unique.set(property.name, property);
  }
  return [...unique.values()];
}

function validateInputMappings(entry, method) {
  for (const input of entry.inputs) {
    const mapping = input.sdk_parameter || input.sdk_property;
    if (!mapping) continue;
    const parts = mapping.split('.');
    const parameter = method.parameters.find((item) => item.name === parts[0]);
    if (!parameter) fail(`${entry.group}.${entry.key} input ${input.name} maps to unknown SDK parameter ${mapping}`);
    if (parts.length > 1 && !parameter.properties.some((item) => item.name === parts.slice(1).join('.'))) {
      fail(`${entry.group}.${entry.key} input ${input.name} maps to unknown SDK property ${mapping}`);
    }
  }
}

function validateSdkExample(entry, method) {
  if (!entry.sdkExample) return;
  const source = ts.createSourceFile('example.ts', entry.sdkExample, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const [expectedNamespace, expectedMethod] = entry.sdkMethod.split('.');
  let matchingCalls = 0;
  function visit(node) {
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)
      && node.expression.name.text === expectedMethod
      && ts.isPropertyAccessExpression(node.expression.expression)
      && node.expression.expression.name.text === expectedNamespace) {
      matchingCalls += 1;
      const argument = node.arguments[0];
      const options = method.parameters[0];
      if (argument && ts.isObjectLiteralExpression(argument) && options?.properties.length) {
        const allowed = new Set(options.properties.map((property) => property.name));
        for (const property of argument.properties) {
          if (!property.name || ts.isSpreadAssignment(property)) continue;
          const name = property.name.getText(source).replace(/^['"]|['"]$/g, '');
          if (!allowed.has(name)) fail(`${entry.group}.${entry.key} sdk_example uses unknown SDK property ${name}`);
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  if (matchingCalls !== 1) fail(`${entry.group}.${entry.key} sdk_example must call ${entry.sdkMethod} exactly once`);
}

export function extractTypes({ apiFile, packageRoot }) {
  const api = readJson(apiFile);
  const packageJson = readJson(path.join(packageRoot, 'package.json'));
  const dist = path.join(packageRoot, 'dist');
  const wasmRoot = path.dirname(fs.realpathSync(path.join(packageRoot, '..', 'wasm-sdk', 'package.json')));
  const declarationFiles = [...walkDts(dist), ...walkDts(path.join(wasmRoot, 'dist'))];
  const declarationIndex = collectDeclarationIndex(declarationFiles);
  const methods = {};
  const operations = [];
  const usedTypes = new Set();

  for (const entry of documentedMethods(api)) {
    const [namespace, methodName, ...extra] = entry.sdkMethod.split('.');
    if (!namespace || !methodName || extra.length) fail(`Invalid sdk_method: ${entry.sdkMethod}`);
    const facadeFile = path.join(dist, NAMESPACE_DIRS[namespace] || namespace, 'facade.d.ts');
    if (!fs.existsSync(facadeFile)) fail(`No facade declaration for ${entry.sdkMethod}: ${facadeFile}`);
    const source = parseFile(facadeFile);
    const declarations = methodDeclarations(source, methodName);
    if (declarations.length !== 1) fail(`${entry.sdkMethod} resolved to ${declarations.length} declarations in ${facadeFile}`);
    const declaration = declarations[0];
    if (!declaration.type) fail(`${entry.sdkMethod} has no return annotation`);

    const parameters = declaration.parameters.map((parameter) => {
      if (!parameter.type) fail(`${entry.sdkMethod} parameter ${parameter.name.getText(source)} has no type annotation`);
      const references = referencedNames(parameter.type, source);
      const directReference = references.length === 1 && parameter.type.kind === ts.SyntaxKind.TypeReference
        ? resolveDeclaration(declarationIndex, references[0]) : null;
      references.forEach((name) => usedTypes.add(name.replace(/^wasm\./, '')));
      return {
        name: parameter.name.getText(source),
        type: normalizeType(parameter.type.getText(source)),
        optional: Boolean(parameter.questionToken || parameter.initializer),
        rest: Boolean(parameter.dotDotDotToken),
        description: '',
        references,
        properties: directReference ? propertyMetadata(directReference, declarationIndex) : [],
      };
    });
    const jsDocTags = ts.getJSDocTags(declaration).filter(ts.isJSDocParameterTag);
    for (const tag of jsDocTags) {
      const parameter = parameters.find((item) => item.name === tag.name.getText(source));
      if (parameter) parameter.description = typeof tag.comment === 'string' ? tag.comment : '';
    }

    const returnType = normalizeType(declaration.type.getText(source));
    const returnReferences = referencedNames(declaration.type, source);
    returnReferences.forEach((name) => usedTypes.add(name.replace(/^wasm\./, '')));
    for (const parameter of parameters) {
      for (const property of parameter.properties) property.references.forEach((name) => usedTypes.add(name.replace(/^wasm\./, '')));
    }
    const signature = `${methodName}(${parameters.map((p) => `${p.rest ? '...' : ''}${p.name}${p.optional ? '?' : ''}: ${p.type}`).join(', ')}): ${returnType}`;
    const method = methods[entry.sdkMethod] || {
      sdkMethod: entry.sdkMethod, signature, description: descriptionFor(declaration, source), parameters,
      returnType, returnReferences, references: returnReferences, variants: [], source: path.relative(packageRoot, facadeFile),
    };
    if (method.signature !== signature) fail(`Conflicting declarations for ${entry.sdkMethod}`);
    validateInputMappings(entry, method);
    validateSdkExample(entry, method);
    method.variants.push({ key: entry.key, group: entry.group, category: entry.category });
    methods[entry.sdkMethod] = method;
    operations.push({
      key: entry.key, group: entry.group, category: entry.category, sdkMethod: entry.sdkMethod,
      label: entry.label, description: entry.description, disabled: entry.disabled,
      signature, parameters, returnType, references: returnReferences,
    });
  }

  const types = {};
  const pending = [...usedTypes].sort();
  const visited = new Set();
  while (pending.length) {
    const name = pending.shift();
    if (visited.has(name)) continue;
    visited.add(name);
    const found = resolveDeclaration(declarationIndex, name);
    const references = declarationReferences(found.node, found.source).map((item) => item.replace(/^wasm\./, ''));
    references.filter((item) => !visited.has(item)).forEach((item) => pending.push(item));
    types[name] = {
      kind: ts.SyntaxKind[found.node.kind], anchor: anchorFor(name),
      declaration: found.node.getText(found.source), properties: propertyMetadata(found, declarationIndex),
      references: references.sort(), source: path.relative(path.dirname(packageRoot), found.file),
    };
  }
  return {
    schemaVersion: 1,
    sdk: { name: packageJson.name, version: packageJson.version, declarationRoot: 'dist' },
    operations, methods, types,
  };
}

function parseArgs(argv) {
  const result = { apiFile: path.join(ROOT, 'public/api-definitions.json'), packageRoot: path.join(ROOT, 'node_modules/@dashevo/evo-sdk') };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--api') result.apiFile = path.resolve(argv[++i]);
    else if (argv[i] === '--package-root') result.packageRoot = path.resolve(argv[++i]);
    else fail(`Unknown argument: ${argv[i]}`);
  }
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_FILE) {
  try { process.stdout.write(`${JSON.stringify(extractTypes(parseArgs(process.argv.slice(2))), null, 2)}\n`); }
  catch (error) { process.stderr.write(`${error.message}\n`); process.exitCode = 1; }
}
