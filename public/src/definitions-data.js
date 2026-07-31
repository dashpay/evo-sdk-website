import { normalizeType, SUPPORTED_INPUT_TYPES } from './input-types.js';

export const SUPPORTED_QUERIES = new Set([
  // Identity
  'getIdentity', 'getIdentityUnproved', 'getIdentityKeys', 'getIdentitiesContractKeys',
  'getIdentityNonce', 'getIdentityContractNonce', 'getIdentityBalance', 'getIdentitiesBalances',
  'getIdentityBalanceAndRevision', 'getIdentityByPublicKeyHash', 'getIdentityByNonUniquePublicKeyHash',
  'getIdentityTokenBalances', 'getIdentitiesTokenBalances', 'getIdentityTokenInfos', 'getIdentitiesTokenInfos',
  // Data Contracts
  'getDataContract', 'getDataContractHistory', 'getDataContracts',
  // Documents
  'getDocuments', 'getDocument',
  // Epoch
  'getEpochsInfo', 'getCurrentEpoch', 'getFinalizedEpochInfos', 'getEvonodesProposedEpochBlocksByIds', 'getEvonodesProposedEpochBlocksByRange',
  // Voting & Contested Resources
  'getContestedResources', 'getContestedResourceVotersForIdentity', 'getContestedResourceVoteState',
  'getContestedResourceIdentityVotes', 'getVotePollsByEndDate',
  // Protocol
  'getProtocolVersionUpgradeState', 'getProtocolVersionUpgradeVoteStatus',
  // Tokens
  'getTokenStatuses', 'getTokenDirectPurchasePrices', 'getTokenContractInfo', 'getTokenPerpetualDistributionLastClaim',
  'getTokenTotalSupply', 'getTokenPriceByContract',
  // Groups
  'getGroupInfo', 'getGroupInfos', 'getGroupMembers', 'getGroupActions', 'getGroupActionSigners',
  'getIdentityGroups', 'getGroupsDataContracts',
  // System
  'getStatus', 'getCurrentQuorumsInfo', 'getPrefundedSpecializedBalance', 'getTotalCreditsInPlatform', 'getPathElements',
  'waitForStateTransitionResult',
  // Platform Addresses
  'getPlatformAddress', 'getPlatformAddresses',
]);

export const SUPPORTED_TRANSITIONS = new Set([
  'identityCreate', 'identityTopUp', 'identityCreditTransfer', 'identityCreditWithdrawal', 'identityUpdate',
  'dataContractCreate', 'dataContractUpdate',
  'documentCreate', 'documentReplace', 'documentDelete', 'documentTransfer', 'documentPurchase', 'documentSetPrice',
  'tokenMint', 'tokenBurn', 'tokenTransfer', 'tokenFreeze', 'tokenUnfreeze', 'tokenDestroyFrozen', 'tokenSetPriceForDirectPurchase', 'tokenDirectPurchase', 'tokenClaim', 'tokenEmergencyAction',
  'masternodeVote',
  // Platform Addresses
  'addressTransfer', 'addressTopUpIdentity', 'addressWithdraw', 'addressTransferFromIdentity', 'addressFundFromAssetLock', 'addressCreateIdentity',
]);

export const DPNS_CATEGORY_DEFINITIONS = {
  lookup: {
    label: 'Lookup & Resolve',
    operations: {
      getDpnsUsername: {
        label: 'Get Primary Username',
        description: 'Fetch the primary DPNS username associated with an identity.',
        inputs: [
          { name: 'identityId', label: 'Identity ID', type: 'text', required: true },
        ],
      },
      getDpnsUsernames: {
        label: 'Get All Usernames',
        description: 'List DPNS usernames owned by an identity with an optional limit.',
        inputs: [
          { name: 'identityId', label: 'Identity ID', type: 'text', required: true },
          { name: 'limit', label: 'Limit', type: 'number', min: 1, max: 100, help: 'Optional maximum number of usernames to return.' },
        ],
      },
      getDpnsUsernameByName: {
        label: 'Get Username By Label',
        description: 'Fetch DPNS username information using its full label.',
        inputs: [
          { name: 'username', label: 'Username (e.g. alice)', type: 'text', required: true },
        ],
      },
      dpnsResolve: {
        label: 'Resolve Name',
        description: 'Resolve a fully-qualified DPNS name (e.g. alice.dash) to its identity.',
        inputs: [
          { name: 'name', label: 'DPNS Name', type: 'text', required: true },
        ],
      },
    },
  },
  validation: {
    label: 'Validation & Safety',
    operations: {
      dpnsCheckAvailability: {
        label: 'Is Name Available',
        description: 'Check if a DPNS label is currently available for registration.',
        inputs: [
          { name: 'label', label: 'Label', type: 'text', required: true },
        ],
      },
      dpnsConvertToHomographSafe: {
        label: 'Convert To Homograph Safe',
        description: 'Convert a DPNS label to its homograph-safe representation.',
        inputs: [
          { name: 'name', label: 'Label', type: 'text', required: true },
        ],
      },
      dpnsIsValidUsername: {
        label: 'Validate Username Format',
        description: 'Validate a DPNS label against format rules.',
        inputs: [
          { name: 'label', label: 'Label', type: 'text', required: true },
        ],
      },
      dpnsIsContestedUsername: {
        label: 'Is Contested Username',
        description: 'Determine if a label is part of the contested DPNS namespace.',
        inputs: [
          { name: 'label', label: 'Label', type: 'text', required: true },
        ],
      },
    },
  },
  // TODO(issue-67): Restore a Registration category after dpns.registerName
  // constructs Identity, IdentityPublicKey, IdentitySigner, and the preorder
  // callback required by the SDK's typed v4 options.
  /*
  registration: {
    label: 'Registration',
    operations: {
      dpnsRegisterName: {
        label: 'Register DPNS Name',
        description: 'Register a DPNS label using an identity owned key and private key.',
        inputs: [
          { name: 'label', label: 'Label', type: 'text', required: true },
          { name: 'publicKeyId', label: 'Identity Public Key ID', type: 'number', required: true, min: 0 },
        ],
      },
    },
  },
  */
};

export const PROOF_CAPABLE = new Set([
  // Identity
  'getIdentity', 'getIdentityKeys', 'getIdentitiesContractKeys', 'getIdentityNonce', 'getIdentityContractNonce',
  'getIdentityBalance', 'getIdentitiesBalances', 'getIdentityBalanceAndRevision', 'getIdentityByPublicKeyHash',
  'getIdentityByNonUniquePublicKeyHash', 'getIdentityTokenBalances', 'getIdentitiesTokenBalances', 'getIdentityTokenInfos',
  'getIdentitiesTokenInfos',
  // Data Contracts & Documents
  'getDataContract', 'getDataContractHistory', 'getDataContracts', 'getDocuments', 'getDocument',
  // DPNS
  'getDpnsUsername', 'getDpnsUsernames', 'getDpnsUsernameByName',
  // Epoch
  'getEpochsInfo', 'getCurrentEpoch', 'getFinalizedEpochInfos', 'getEvonodesProposedEpochBlocksByIds',
  'getEvonodesProposedEpochBlocksByRange',
  // Voting & Contested Resources
  'getContestedResources', 'getContestedResourceVotersForIdentity', 'getContestedResourceVoteState',
  'getContestedResourceIdentityVotes', 'getVotePollsByEndDate',
  // Protocol
  'getProtocolVersionUpgradeState', 'getProtocolVersionUpgradeVoteStatus',
  // Tokens
  'getTokenStatuses', 'getTokenDirectPurchasePrices', 'getTokenContractInfo',
  'getTokenPerpetualDistributionLastClaim', 'getTokenTotalSupply', 'getIdentitiesTokenInfos', 'getIdentityTokenInfos',
  'getIdentitiesTokenBalances', 'getIdentityTokenBalances',
  // Groups
  'getGroupInfo', 'getGroupInfos', 'getGroupMembers', 'getGroupActions', 'getGroupActionSigners',
  'getIdentityGroups', 'getGroupsDataContracts',
  // Platform Addresses
  'getPlatformAddress', 'getPlatformAddresses',
  // System
  'getPrefundedSpecializedBalance', 'getTotalCreditsInPlatform', 'getPathElements',
]);

export function getTypeConfig(type) {
  return TYPE_CONFIG[type] || null;
}

export const TRANSITION_AUTH_REQUIREMENTS = {
  identityCreate: {
    assetLockProof: { required: true, target: 'assetLockProof' },
    privateKey: { required: true, targets: ['assetLockPrivateKeyWif'] },
  },
  identityTopUp: {
    identity: { required: true, targets: ['identityId'] },
    assetLockProof: { required: true, target: 'assetLockProof' },
    privateKey: { required: true, targets: ['assetLockPrivateKeyWif'] },
  },
  identityCreditTransfer: {
    identity: { required: true, targets: ['identityId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true, keyIdTarget: 'keyId' },
  },
  identityCreditWithdrawal: {
    identity: { required: true, targets: ['identityId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true, keyIdTarget: 'keyId' },
  },
  identityUpdate: {
    identity: { required: true, targets: ['identityId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true },
  },
  dataContractCreate: {
    identity: { required: true, targets: ['ownerId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true, keyIdTarget: 'keyId' },
  },
  dataContractUpdate: {
    identity: { required: true, targets: ['ownerId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true, keyIdTarget: 'keyId' },
  },
  documentCreate: {
    identity: { required: true, targets: ['ownerId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true },
  },
  documentReplace: {
    identity: { required: true, targets: ['ownerId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true },
  },
  documentDelete: {
    identity: { required: true, targets: ['ownerId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true },
  },
  documentTransfer: {
    identity: { required: true, targets: ['ownerId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true },
  },
  documentPurchase: {
    identity: { required: true, targets: ['buyerId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true },
  },
  documentSetPrice: {
    identity: { required: true, targets: ['ownerId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true },
  },
  tokenMint: {
    identity: { required: true, targets: ['identityId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true },
  },
  tokenBurn: {
    identity: { required: true, targets: ['identityId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true },
  },
  tokenTransfer: {
    identity: { required: true, targets: ['identityId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true },
  },
  tokenFreeze: {
    identity: { required: true, targets: ['identityId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true },
  },
  tokenUnfreeze: {
    identity: { required: true, targets: ['identityId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true },
  },
  tokenDestroyFrozen: {
    identity: { required: true, targets: ['identityId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true },
  },
  tokenSetPriceForDirectPurchase: {
    identity: { required: true, targets: ['identityId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true },
  },
  tokenDirectPurchase: {
    identity: { required: true, targets: ['identityId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true },
  },
  tokenClaim: {
    identity: { required: true, targets: ['identityId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true },
  },
  tokenEmergencyAction: {
    identity: { required: true, targets: ['identityId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true },
  },
  masternodeVote: {
    identity: { required: true, targets: ['masternodeProTxHash'] },
    privateKey: { required: true, targets: ['votingKeyWif'] },
  },
  // Platform Address transitions
  addressTransfer: {
    identity: { required: false },
    privateKey: { required: true, targets: ['privateKeyWif'] },
  },
  addressTopUpIdentity: {
    identity: { required: false },
    privateKey: { required: true, targets: ['privateKeyWif'] },
  },
  addressWithdraw: {
    identity: { required: false },
    privateKey: { required: true, targets: ['privateKeyWif'] },
  },
  addressTransferFromIdentity: {
    identity: { required: true, targets: ['identityId'] },
    privateKey: { required: true, targets: ['privateKeyWif'] },
  },
  addressFundFromAssetLock: {
    identity: { required: false },
    privateKey: { required: true, targets: ['assetLockPrivateKeyWif'] },
  },
  addressCreateIdentity: {
    identity: { required: false },
    privateKey: { required: true, targets: ['privateKeyWif'] },
  },
};

export const DPNS_AUTH_REQUIREMENTS = {
  dpnsRegisterName: {
    identity: { required: true, targets: ['identityId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: false },
  },
};

export const TYPE_CONFIG = {
  queries: { definitionKey: 'queries', itemsKey: 'queries', allowProof: true },
  transitions: { definitionKey: 'transitions', itemsKey: 'transitions', allowProof: false },
  dpns: { definitionKey: 'dpns', itemsKey: 'operations', allowProof: true },
};

export function filterDefinitions(source, entriesKey, allowSet) {
  const filtered = {};
  for (const [groupKey, group] of Object.entries(source || {})) {
    const items = group?.[entriesKey];
    if (!items) continue;
    const allowed = Object.entries(items).filter(([key, def]) => {
      if (!allowSet.has(key)) return false;
      const inputs = def?.inputs;
      if (!Array.isArray(inputs)) return true;
      return inputs.every(input => SUPPORTED_INPUT_TYPES.has(normalizeType(input.type)));
    });
    if (!allowed.length) continue;
    filtered[groupKey] = {
      ...group,
      [entriesKey]: Object.fromEntries(allowed),
    };
  }
  return filtered;
}
