import { namedArgs } from '../form/parse-input.js';
import { documentTransitionOperations } from './document-operations.js';
import { identityTransitionOperations } from './identity-operations.js';
import { tokenTransitionOperations } from './token-operations.js';
import { contractTransitionOperations } from './contract-operations.js';
import { addressTransitionOperations } from './address-operations.js';
import { assetLockTransitionOperations } from './asset-lock-operations.js';

export const transitionOperations = Object.freeze({
  ...documentTransitionOperations,
  ...identityTransitionOperations,
  ...tokenTransitionOperations,
  ...contractTransitionOperations,
  ...addressTransitionOperations,
  ...assetLockTransitionOperations,
});

export function getTransitionOperation(operationKey) {
  return transitionOperations[operationKey] || null;
}

export function transitionValues(defs, args, extraArgs = {}) {
  return { ...namedArgs(defs, args), ...extraArgs };
}

export async function executeTransitionOperation(operationKey, defs, args, extraArgs, sdk) {
  const operation = getTransitionOperation(operationKey);
  if (!operation) return { handled: false, result: undefined };
  const values = transitionValues(defs, args, extraArgs);
  const prepared = await operation.prepare(values, sdk);
  return { handled: true, result: await operation.execute(prepared, sdk), prepared };
}

export function renderTransitionCode(operationKey, defs, args, extraArgs = {}) {
  const operation = getTransitionOperation(operationKey);
  if (!operation) return '';
  return operation.renderCode(transitionValues(defs, args, extraArgs));
}
