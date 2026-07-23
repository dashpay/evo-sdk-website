import fs from 'node:fs';
import { transitionOperations } from '../public/src/transitions/registry.js';

const definitions = JSON.parse(fs.readFileSync(new URL('../public/api-definitions.json', import.meta.url), 'utf8'));
const byKey = new Map();
for (const category of Object.values(definitions.transitions || {})) {
  for (const [key, definition] of Object.entries(category.transitions || {})) byKey.set(key, definition);
}

const examples = {};
for (const [key, operation] of Object.entries(transitionOperations)) {
  const definition = byKey.get(key);
  if (!definition) continue;
  const values = Object.fromEntries((definition.inputs || []).map(input => [input.name, `<${input.name}>`]));
  values.ownerId = '<ownerId>';
  values.buyerId = '<buyerId>';
  values.keyId = 0;
  values.privateKeyWif = '<privateKeyWif>';
  examples[key] = operation.renderCode(values);
}

process.stdout.write(JSON.stringify(examples));
