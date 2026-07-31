import { TRANSITION_AUTH_REQUIREMENTS } from './definitions.js';
import { elements } from './state.js';
import {
  CONTRACT_SECURITY_LEVELS,
  DEFAULT_SECURITY_LEVELS,
  createSigner,
  getIdentityKey,
  prepareTransition,
} from './transition-auth.js';

export { CONTRACT_SECURITY_LEVELS, DEFAULT_SECURITY_LEVELS, createSigner, getIdentityKey, prepareTransition };

export function computeAuthRequirements(operationKey, definition) {
  const config = TRANSITION_AUTH_REQUIREMENTS[operationKey] || {};
  const auth = {
    identity: config.identity
      ? {
        required: !!config.identity.required,
        targets: Array.isArray(config.identity.targets) ? [...config.identity.targets] : [],
      }
      : null,
    assetLockProof: config.assetLockProof
      ? {
        required: !!config.assetLockProof.required,
        target: config.assetLockProof.target || 'assetLockProof',
      }
      : null,
    privateKey: config.privateKey
      ? {
        required: config.privateKey.required !== false,
        targets: Array.isArray(config.privateKey.targets)
          ? [...config.privateKey.targets]
          : (config.privateKey.target ? [config.privateKey.target] : []),
        allowKeyId: !!config.privateKey.allowKeyId,
        keyIdTarget: config.privateKey.keyIdTarget || null,
      }
      : null,
  };

  const sdkParams = Array.isArray(definition?.sdk_params) ? definition.sdk_params : [];
  if (sdkParams.length) {
    const names = new Set(sdkParams.map(param => param.name));
    if (names.has('assetLockProof')) {
      if (!auth.assetLockProof) {
        auth.assetLockProof = { required: true, target: 'assetLockProof' };
      } else {
        auth.assetLockProof.required = true;
        if (!auth.assetLockProof.target) auth.assetLockProof.target = 'assetLockProof';
      }
    }
    if (names.has('assetLockProofPrivateKey')) {
      if (!auth.privateKey) {
        auth.privateKey = {
          required: true,
          targets: ['assetLockPrivateKeyWif'],
          allowKeyId: false,
          keyIdTarget: null,
        };
      } else {
        auth.privateKey.required = true;
        if (!auth.privateKey.targets.length) {
          auth.privateKey.targets = ['assetLockPrivateKeyWif'];
        }
        auth.privateKey.allowKeyId = !!auth.privateKey.allowKeyId;
      }
    }
    if (names.has('identityId')) {
      if (!auth.identity) {
        auth.identity = { required: true, targets: ['identityId'] };
      } else {
        auth.identity.required = true;
        if (!auth.identity.targets.length) {
          auth.identity.targets = ['identityId'];
        }
      }
    }
  }

  if (auth.identity && !auth.identity.targets.length) {
    auth.identity = null;
  }
  if (auth.privateKey && !auth.privateKey.targets.length) {
    auth.privateKey = null;
  }

  if (!auth.identity && !auth.assetLockProof && !auth.privateKey) {
    return null;
  }

  return auth;
}

export function updateAuthInputsVisibility(auth) {
  const showIdentity = !!(auth?.identity?.targets?.length);
  const showAssetLock = !!(auth?.assetLockProof?.required);
  const showPrivateKey = !!(auth?.privateKey?.targets?.length);

  if (elements.identityIdGroup) {
    elements.identityIdGroup.style.display = showIdentity ? '' : 'none';
  }
  if (elements.identityIdInput) {
    elements.identityIdInput.required = !!(auth?.identity?.required);
  }

  if (elements.assetLockProofGroup) {
    elements.assetLockProofGroup.style.display = showAssetLock ? '' : 'none';
  }
  if (elements.assetLockProofInput) {
    elements.assetLockProofInput.required = showAssetLock;
  }

  if (elements.privateKeyGroup) {
    elements.privateKeyGroup.style.display = showPrivateKey ? '' : 'none';
  }
  if (elements.privateKeyInput) {
    elements.privateKeyInput.required = !!(auth?.privateKey?.required);
  }

  if (elements.authenticationInputs) {
    elements.authenticationInputs.style.display = (showIdentity || showAssetLock || showPrivateKey) ? 'block' : 'none';
  }
}

export function collectAuthArgs(requirements) {
  if (!requirements) return {};

  const extras = {};

  if (requirements.identity?.targets?.length) {
    const identityValue = elements.identityIdInput?.value.trim() || '';
    if (!identityValue) {
      if (requirements.identity.required) {
        throw new Error('Identity ID is required for this operation.');
      }
    } else {
      requirements.identity.targets.forEach(target => {
        extras[target] = identityValue;
      });
    }
  }

  if (requirements.assetLockProof?.required) {
    const proofValue = elements.assetLockProofInput?.value.trim() || '';
    if (!proofValue) {
      throw new Error('Asset Lock Proof is required for this operation.');
    }
    const targetName = requirements.assetLockProof.target || 'assetLockProof';
    extras[targetName] = proofValue;
  }

  if (requirements.privateKey?.targets?.length) {
    const rawValue = elements.privateKeyInput?.value.trim() || '';
    if (!rawValue) {
      if (requirements.privateKey.required) {
        throw new Error('Private key is required for this operation.');
      }
    } else {
      if (!requirements.privateKey.allowKeyId && rawValue.includes(':')) {
        throw new Error('Key ID suffix is not supported for this operation.');
      }
      let keyValue = rawValue;
      let keyIdValue;
      if (requirements.privateKey.allowKeyId) {
        const colonIndex = rawValue.lastIndexOf(':');
        if (colonIndex > -1) {
          if (colonIndex === 0) {
            throw new Error('Private key is required before specifying a key ID.');
          }
          const suffix = rawValue.slice(colonIndex + 1).trim();
          if (!suffix) {
            throw new Error('Key ID suffix must be provided after ":".');
          }
          keyValue = rawValue.slice(0, colonIndex).trim();
          if (!keyValue) {
            throw new Error('Private key is required before specifying a key ID.');
          }
          const parsed = Number(suffix);
          if (!Number.isInteger(parsed) || parsed < 0) {
            throw new Error('Key ID suffix must be a non-negative integer.');
          }
          keyIdValue = parsed;
        }
      }

      requirements.privateKey.targets.forEach(target => {
        extras[target] = keyValue;
      });

      if (keyIdValue !== undefined) {
        const keyIdTarget = requirements.privateKey.keyIdTarget || 'keyId';
        extras[keyIdTarget] = keyIdValue;
      }
    }
  }

  return extras;
}
