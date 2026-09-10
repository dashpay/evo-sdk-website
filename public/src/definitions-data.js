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
  'getDocuments', 'getDocument', 'getDocumentCount', 'getDocumentSum', 'getDocumentAverage', 'getDocumentHistory',
  // Epoch
  'getEpochsInfo', 'getCurrentEpoch', 'getFinalizedEpochInfos', 'getEvonodesProposedEpochBlocksByIds', 'getEvonodesProposedEpochBlocksByRange',
  // Voting & Contested Resources
  'getContestedResources', 'getContestedResourceVotersForIdentity', 'getContestedResourceVoteState',
  'getContestedResourceIdentityVotes', 'getVotePollsByEndDate',
  // Protocol
  'getProtocolVersionUpgradeState', 'getProtocolVersionUpgradeVoteStatus',
  // Tokens
  'getTokenStatuses', 'getTokenDirectPurchasePrices', 'getTokenContractInfo', 'getTokenPerpetualDistributionLastClaim',
  'getTokenTotalSupply', 'getTokenBalancesForIdentity', 'getTokenPriceByContract',
  // Shielded
  'getShieldedPoolState', 'getShieldedEncryptedNotes', 'getShieldedAnchors', 'getShieldedMostRecentAnchor', 'getShieldedNullifiers',
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

const WALLET_LANGUAGE_OPTIONS = [
  { value: '', label: 'Default (English)' },
  { value: 'en', label: 'English (en)' },
  { value: 'zh-cn', label: 'Chinese, Simplified (zh-cn)' },
  { value: 'zh-tw', label: 'Chinese, Traditional (zh-tw)' },
  { value: 'cs', label: 'Czech (cs)' },
  { value: 'fr', label: 'French (fr)' },
  { value: 'it', label: 'Italian (it)' },
  { value: 'ja', label: 'Japanese (ja)' },
  { value: 'ko', label: 'Korean (ko)' },
  { value: 'pt', label: 'Portuguese (pt)' },
  { value: 'es', label: 'Spanish (es)' },
];

const WALLET_SAFETY_HELP = 'Generated key material is for testing only — never use it to store real funds.';

// Wallet helpers run locally in the wasm runtime and never contact the
// platform; network-dependent operations read the site's network selector.
// Keep these in sync with the queries.wallet entries in api-definitions.json
// (the docs/catalog source), mirroring the DPNS two-source arrangement.
export const WALLET_CATEGORY_DEFINITIONS = {
  keyGeneration: {
    label: 'Key Generation & Utilities',
    operations: {
      walletGenerateMnemonic: {
        label: 'Generate Mnemonic',
        description: `Generate a random BIP39 mnemonic seed phrase. ${WALLET_SAFETY_HELP}`,
        inputs: [
          { name: 'wordCount', label: 'Word Count', type: 'select', value: '12', options: [
            { value: '12', label: '12 words' },
            { value: '15', label: '15 words' },
            { value: '18', label: '18 words' },
            { value: '21', label: '21 words' },
            { value: '24', label: '24 words' },
          ] },
          { name: 'languageCode', label: 'Language', type: 'select', options: WALLET_LANGUAGE_OPTIONS },
        ],
      },
      walletValidateMnemonic: {
        label: 'Validate Mnemonic',
        description: 'Check whether a BIP39 mnemonic seed phrase is valid. Select the matching language for non-English wordlists; the default check does not detect every language.',
        inputs: [
          { name: 'mnemonic', label: 'Mnemonic Seed Phrase', type: 'password', required: true },
          { name: 'languageCode', label: 'Language', type: 'select', options: WALLET_LANGUAGE_OPTIONS },
        ],
      },
      walletMnemonicToSeed: {
        label: 'Mnemonic to Seed',
        description: 'Derive the 64-byte BIP39 seed (hex-encoded) from a mnemonic seed phrase and optional passphrase.',
        inputs: [
          { name: 'mnemonic', label: 'Mnemonic Seed Phrase', type: 'password', required: true },
          // BIP39 passphrase whitespace is significant — it changes the seed.
          { name: 'passphrase', label: 'Passphrase (optional)', type: 'password', preserveWhitespace: true, help: 'Whitespace is significant and changes the derived seed; the passphrase is used exactly as entered.' },
        ],
      },
      walletGenerateKeyPair: {
        label: 'Generate Key Pair',
        description: `Generate a random private key with its public key and address for the selected network. ${WALLET_SAFETY_HELP}`,
        inputs: [],
      },
      walletGenerateKeyPairs: {
        label: 'Generate Key Pairs',
        description: `Generate multiple random key pairs at once for the selected network. ${WALLET_SAFETY_HELP}`,
        inputs: [
          { name: 'count', label: 'Count', type: 'number', required: true, min: 1, max: 100, value: 1 },
        ],
      },
      walletKeyPairFromWif: {
        label: 'Key Pair from WIF',
        description: 'Import a private key from WIF and show its public key and address.',
        inputs: [
          { name: 'privateKeyWif', label: 'Private Key (WIF)', type: 'password', required: true, help: 'The WIF version prefix determines the network; the network selector does not affect this operation.' },
        ],
      },
      walletKeyPairFromHex: {
        label: 'Key Pair from Hex',
        description: 'Import a raw 32-byte private key (64 hex characters) and show its WIF, public key, and address for the selected network.',
        inputs: [
          { name: 'privateKeyHex', label: 'Private Key (hex)', type: 'password', required: true },
        ],
      },
      walletPubkeyToAddress: {
        label: 'Public Key to Address',
        description: 'Convert a compressed public key (hex) to a Dash address for the selected network.',
        inputs: [
          { name: 'pubkeyHex', label: 'Public Key (hex)', type: 'text', required: true, placeholder: '0378d430274f8c5ec1321338151e9f27f4c676a008bdf8638d07c0b6be9ab35c71' },
        ],
      },
      walletValidateAddress: {
        label: 'Validate Address',
        description: 'Check whether a Dash address is valid for the selected network.',
        inputs: [
          { name: 'address', label: 'Address', type: 'text', required: true, placeholder: 'yXSSUfQ8AFeWVionamYzedYSf3PANMazbw' },
        ],
      },
      walletSignMessage: {
        label: 'Sign Message',
        description: 'Sign an arbitrary message with a private key (WIF) using deterministic ECDSA. The message is signed exactly as entered, including whitespace.',
        inputs: [
          { name: 'message', label: 'Message', type: 'textarea', required: true, preserveWhitespace: true },
          { name: 'privateKeyWif', label: 'Private Key (WIF)', type: 'password', required: true },
        ],
      },
    },
  },
};

export const PROOF_CAPABLE = new Set([
  // Identity
  'getIdentity', 'getIdentityKeys', 'getIdentitiesContractKeys', 'getIdentityNonce', 'getIdentityContractNonce',
  'getIdentityBalance', 'getIdentitiesBalances', 'getIdentityBalanceAndRevision', 'getIdentityByPublicKeyHash',
  'getIdentityByNonUniquePublicKeyHash', 'getIdentityTokenBalances', 'getIdentitiesTokenBalances', 'getIdentityTokenInfos',
  'getIdentitiesTokenInfos',
  // Data Contracts & Documents
  'getDataContract', 'getDataContractHistory', 'getDataContracts', 'getDocuments', 'getDocument',
  'getDocumentCount', 'getDocumentSum', 'getDocumentAverage', 'getDocumentHistory',
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
  'getIdentitiesTokenBalances', 'getIdentityTokenBalances', 'getTokenBalancesForIdentity',
  // Shielded
  'getShieldedPoolState', 'getShieldedEncryptedNotes', 'getShieldedAnchors', 'getShieldedMostRecentAnchor', 'getShieldedNullifiers',
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
    privateKey: { required: true, targets: ['addressPrivateKeyWif'] },
  },
  addressTopUpIdentity: {
    identity: { required: false },
    privateKey: { required: true, targets: ['addressPrivateKeyWif'] },
  },
  addressWithdraw: {
    identity: { required: false },
    privateKey: { required: true, targets: ['addressPrivateKeyWif'] },
  },
  addressTransferFromIdentity: {
    identity: { required: true, targets: ['identityId'] },
    privateKey: { required: true, targets: ['privateKeyWif'] },
  },
  addressFundFromAssetLock: {
    identity: { required: false },
    assetLockProof: { required: true, target: 'assetLockProof' },
    privateKey: { required: true, targets: ['assetLockPrivateKeyWif'] },
  },
  addressCreateIdentity: {
    identity: { required: false },
    privateKey: { required: true, targets: ['addressPrivateKeyWif'] },
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
  wallet: { definitionKey: 'wallet', itemsKey: 'operations', allowProof: false },
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
