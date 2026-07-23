import {
  AssetLockProof,
  CoreScript,
  Identifier,
  Identity,
  IdentityPublicKeyInCreation,
  IdentitySigner,
  KeyType,
  PlatformAddress,
  PlatformAddressSigner,
  PoolingWasm,
  PrivateKey,
  Purpose,
  SecurityLevel,
} from '../sdk-types.js';

const ADDRESS_FIELDS = [
  { name: 'senderAddress', group: 'PlatformAddressInput', produces: 'inputs' },
  { name: 'recipientAddress', group: 'PlatformAddressOutput', produces: 'outputs' },
  { name: 'amount', group: 'PlatformAddressOutput', produces: 'outputs[].amount' },
  { name: 'identityId', group: 'Identity', produces: 'identity' },
  { name: 'toAddress', group: 'CoreScript', produces: 'outputScript' },
];

function required(value, label) {
  if (value === undefined || value === null || value === '') throw new Error(`${label} is required`);
  return value;
}

function positiveAmount(value) {
  const amount = BigInt(required(value, 'Amount'));
  if (amount <= 0n) throw new Error('Amount must be greater than zero');
  return amount;
}

function addressText(address) {
  return address?.toHex?.() || address?.toString?.() || String(address);
}

function addressKey(address) {
  return address?.toHex?.() || addressText(address);
}

function serializeInfo(info) {
  if (!info) return undefined;
  return {
    address: addressText(info.address),
    balance: info.balance?.toString(),
    nonce: info.nonce?.toString(),
  };
}

function serializeAddressInfos(result) {
  const entries = result instanceof Map ? [...result.entries()] : [...(result?.addressInfos?.entries?.() || [])];
  return Object.fromEntries(entries.map(([address, info]) => [addressText(address), serializeInfo(info)]));
}

function outputOptions(address, amount) {
  return { address, amount };
}

function platformSigner(privateKeyWif) {
  const signer = new PlatformAddressSigner();
  const address = signer.addKey(PrivateKey.fromWIF(required(privateKeyWif, 'Platform Address private key')));
  return { signer, address };
}

async function spendingInput(values, sdk) {
  const { signer, address } = platformSigner(values.addressPrivateKeyWif);
  if (values.senderAddress && addressKey(address) !== (() => {
    try {
      return PlatformAddress.fromBech32m(values.senderAddress).toHex();
    } catch {
      throw new Error('Sender Platform Address is invalid');
    }
  })()) {
    throw new Error('Sender Platform Address does not match the supplied private key');
  }
  const info = await sdk.addresses.get(address);
  if (!info) throw new Error('Sender Platform Address is not funded');
  const amount = positiveAmount(values.amount);
  if (info.balance !== undefined && BigInt(info.balance) < amount) throw new Error('Sender Platform Address has insufficient balance');
  return {
    signer,
    address,
    info,
    amount,
    input: { address: values.senderAddress, amount },
  };
}

async function withNonceRetry(prepared, sdk, method) {
  try {
    return await sdk.addresses[method](prepared.options);
  } catch (error) {
    if (!prepared.rebuild || !/nonce|revision/i.test(String(error?.message || error))) throw error;
    prepared.options = await prepared.rebuild();
    return sdk.addresses[method](prepared.options);
  }
}

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

async function sha256(bytes) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
}

async function coreScript(address) {
  const text = required(address, 'Dash Core address');
  let value = 0n;
  for (const character of text) {
    const digit = ALPHABET.indexOf(character);
    if (digit < 0) throw new Error('Dash Core address is invalid');
    value = value * 58n + BigInt(digit);
  }
  const decoded = [];
  while (value > 0n) {
    decoded.unshift(Number(value & 255n));
    value >>= 8n;
  }
  for (const character of text) {
    if (character !== '1') break;
    decoded.unshift(0);
  }
  const bytes = Uint8Array.from(decoded);
  if (bytes.length !== 25) throw new Error('Dash Core address is invalid');
  const payload = bytes.slice(0, 21);
  const checksum = (await sha256(await sha256(payload))).slice(0, 4);
  if (!checksum.every((byte, index) => byte === bytes[21 + index])) throw new Error('Dash Core address checksum is invalid');
  const hash = payload.slice(1);
  if ([0x4c, 0x8c].includes(payload[0])) return CoreScript.fromP2PKH(hash);
  if ([0x10, 0x13].includes(payload[0])) return CoreScript.fromP2SH(hash);
  throw new Error('Unsupported Dash Core address version');
}

function renderAddressSigner(variable = 'signer') {
  return [
    "import { PlatformAddressSigner, PrivateKey } from '@dashevo/evo-sdk';",
    `const ${variable} = new PlatformAddressSigner();`,
    `const senderAddress = ${variable}.addKey(PrivateKey.fromWIF(addressPrivateKeyWif));`,
    'const addressInfo = await sdk.addresses.get(senderAddress);',
    "if (!addressInfo) throw new Error('Platform Address is not funded');",
    'const input = { address: senderAddress.toBech32m(network), amount: BigInt(amount) };',
  ];
}

export const addressTransitionOperations = {
  addressTransfer: {
    sdkMethod: 'addresses.transfer', fields: ADDRESS_FIELDS,
    async prepare(values, sdk) {
      const recipientAddress = required(values.recipientAddress, 'Recipient Platform Address');
      let recipient;
      try {
        recipient = PlatformAddress.fromBech32m(recipientAddress);
      } catch {
        throw new Error('Recipient Platform Address is invalid');
      }
      const build = async () => {
        const input = await spendingInput(values, sdk);
        if (addressKey(input.address) === addressKey(recipient)) {
          throw new Error('Sender and recipient Platform Addresses must be different');
        }
        const output = outputOptions(recipientAddress, input.amount);
        return { inputs: [input.input], outputs: [output], signer: input.signer };
      };
      return { options: await build(), rebuild: build };
    },
    async execute(prepared, sdk) {
      const result = await withNonceRetry(prepared, sdk, 'transfer');
      return { status: 'success', addressInfos: serializeAddressInfos(result), message: 'Platform Address transfer completed' };
    },
    renderCode() { return [...renderAddressSigner(), "const output = { address: recipientAddress, amount: BigInt(amount) };", 'await sdk.addresses.transfer({ inputs: [input], outputs: [output], signer });'].join('\n'); },
  },
  addressTopUpIdentity: {
    sdkMethod: 'addresses.topUpIdentity', fields: ADDRESS_FIELDS,
    async prepare(values, sdk) {
      const identityId = required(values.identityId, 'Identity ID');
      const identity = await sdk.identities.fetch(identityId);
      if (!identity) throw new Error(`Identity not found: ${identityId}`);
      const build = async () => {
        const input = await spendingInput(values, sdk);
        return { identity, inputs: [input.input], signer: input.signer };
      };
      return { options: await build(), rebuild: build };
    },
    async execute(prepared, sdk) {
      const result = await withNonceRetry(prepared, sdk, 'topUpIdentity');
      return { status: 'success', newBalance: result.newBalance?.toString(), addressInfos: serializeAddressInfos(result), message: 'Identity topped up from Platform Address' };
    },
    renderCode() { return ["const identity = await sdk.identities.fetch(identityId);", "if (!identity) throw new Error('Identity not found');", ...renderAddressSigner(), 'await sdk.addresses.topUpIdentity({ identity, inputs: [input], signer });'].join('\n'); },
  },
  addressWithdraw: {
    sdkMethod: 'addresses.withdraw', fields: ADDRESS_FIELDS,
    async prepare(values, sdk) {
      const outputScript = await coreScript(values.toAddress);
      const build = async () => {
        const input = await spendingInput(values, sdk);
        return { inputs: [input.input], coreFeePerByte: values.coreFeePerByte === '' || values.coreFeePerByte == null ? undefined : Number(values.coreFeePerByte), pooling: PoolingWasm.Never, outputScript, signer: input.signer };
      };
      return { options: await build(), rebuild: build };
    },
    async execute(prepared, sdk) {
      const result = await withNonceRetry(prepared, sdk, 'withdraw');
      return { status: 'success', addressInfos: serializeAddressInfos(result), message: 'Platform Address withdrawal submitted' };
    },
    renderCode() { return [...renderAddressSigner(), 'const outputScript = CoreScript.fromP2PKH(coreAddressHash);', 'await sdk.addresses.withdraw({ inputs: [input], coreFeePerByte, pooling: PoolingWasm.Never, outputScript, signer });'].join('\n'); },
  },
  addressTransferFromIdentity: {
    sdkMethod: 'addresses.transferFromIdentity', fields: ADDRESS_FIELDS,
    async prepare(values, sdk) {
      const identityId = required(values.identityId, 'Identity ID');
      const identity = await sdk.identities.fetch(identityId);
      if (!identity) throw new Error(`Identity not found: ${identityId}`);
      const signer = new IdentitySigner();
      signer.addKeyFromWif(required(values.privateKeyWif, 'Identity private key'));
      const amount = positiveAmount(values.amount);
      const output = outputOptions(required(values.recipientAddress, 'Recipient Platform Address'), amount);
      return { options: { identity, outputs: [output], signer }, context: { amount } };
    },
    async execute(prepared, sdk) {
      const result = await sdk.addresses.transferFromIdentity(prepared.options);
      return { status: 'success', newBalance: result.newBalance?.toString(), addressInfos: serializeAddressInfos(result), message: `Transferred ${prepared.context.amount} credits from identity` };
    },
    renderCode() { return ["import { IdentitySigner } from '@dashevo/evo-sdk';", 'const identity = await sdk.identities.fetch(identityId);', "if (!identity) throw new Error('Identity not found');", 'const outputs = [{ address: recipientAddress, amount: BigInt(amount) }];', 'const signer = new IdentitySigner();', 'signer.addKeyFromWif(privateKeyWif);', 'await sdk.addresses.transferFromIdentity({ identity, outputs, signer });'].join('\n'); },
  },
  addressFundFromAssetLock: {
    sdkMethod: 'addresses.fundFromAssetLock', fields: ADDRESS_FIELDS,
    async prepare(values) {
      const { signer, address } = platformSigner(values.addressPrivateKeyWif);
      if (values.recipientAddress) {
        let recipient;
        try {
          recipient = PlatformAddress.fromBech32m(values.recipientAddress);
        } catch {
          throw new Error('Recipient Platform Address is invalid');
        }
        if (addressKey(recipient) !== addressKey(address)) throw new Error('Recipient Platform Address does not match the supplied private key');
      }
      const output = outputOptions(required(values.recipientAddress, 'Recipient Platform Address'), positiveAmount(values.amount));
      return { options: { assetLockProof: AssetLockProof.fromHex(required(values.assetLockProof, 'Asset Lock Proof')), assetLockPrivateKey: PrivateKey.fromWIF(required(values.assetLockPrivateKeyWif, 'Asset Lock private key')), outputs: [output], signer } };
    },
    async execute(prepared, sdk) {
      const result = await sdk.addresses.fundFromAssetLock(prepared.options);
      return { status: 'success', addressInfos: serializeAddressInfos(result), message: 'Platform Address funded from asset lock' };
    },
    renderCode() { return ["import { AssetLockProof, PlatformAddressSigner, PrivateKey } from '@dashevo/evo-sdk';", 'const assetLockProof = AssetLockProof.fromHex(assetLockProofHex);', 'const assetLockPrivateKey = PrivateKey.fromWIF(assetLockPrivateKeyWif);', 'const signer = new PlatformAddressSigner();', 'signer.addKey(PrivateKey.fromWIF(addressPrivateKeyWif));', 'const outputs = [{ address: recipientAddress, amount: BigInt(amount) }];', 'await sdk.addresses.fundFromAssetLock({ assetLockProof, assetLockPrivateKey, outputs, signer });'].join('\n'); },
  },
  addressCreateIdentity: {
    sdkMethod: 'addresses.createIdentity', fields: ADDRESS_FIELDS,
    async prepare(values, sdk) {
      const input = await spendingInput(values, sdk);
      const identityPrivateKey = PrivateKey.fromWIF(required(values.identityPrivateKeyWif, 'Identity private key'));
      const identity = new Identity(Identifier.fromBytes(crypto.getRandomValues(new Uint8Array(32))));
      identity.addPublicKey(new IdentityPublicKeyInCreation({ keyId: 0, purpose: Purpose.AUTHENTICATION, securityLevel: SecurityLevel.MASTER, keyType: KeyType.ECDSA_SECP256K1, data: identityPrivateKey.getPublicKey().toBytes() }).toIdentityPublicKey());
      const identitySigner = new IdentitySigner();
      identitySigner.addKey(identityPrivateKey);
      return { options: { identity, inputs: [input.input], identitySigner, addressSigner: input.signer }, context: { identityId: identity.id?.toString() } };
    },
    async execute(prepared, sdk) {
      const result = await sdk.addresses.createIdentity(prepared.options);
      return { status: 'success', identityId: result.identity?.id?.toString() || prepared.context.identityId, addressInfos: serializeAddressInfos(result), message: 'Identity created from Platform Address' };
    },
    renderCode() { return ["import { Identifier, Identity, IdentityPublicKeyInCreation, IdentitySigner, KeyType, PlatformAddressSigner, PrivateKey, Purpose, SecurityLevel } from '@dashevo/evo-sdk';", 'const identityPrivateKey = PrivateKey.fromWIF(identityPrivateKeyWif);', 'const identity = new Identity(Identifier.fromBytes(crypto.getRandomValues(new Uint8Array(32))));', 'const identityPublicKey = new IdentityPublicKeyInCreation({ keyId: 0, purpose: Purpose.AUTHENTICATION, securityLevel: SecurityLevel.MASTER, keyType: KeyType.ECDSA_SECP256K1, data: identityPrivateKey.getPublicKey().toBytes() }).toIdentityPublicKey();', 'identity.addPublicKey(identityPublicKey);', 'const addressSigner = new PlatformAddressSigner();', 'const derivedAddress = addressSigner.addKey(PrivateKey.fromWIF(addressPrivateKeyWif));', 'const inputs = [{ address: derivedAddress.toBech32m(network), amount: BigInt(amount) }];', 'const identitySigner = new IdentitySigner();', 'identitySigner.addKey(identityPrivateKey);', 'await sdk.addresses.createIdentity({ identity, inputs, identitySigner, addressSigner });'].join('\n'); },
  },
};
