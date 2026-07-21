# Evo SDK - AI Reference

Return types: generated from `@dashevo/evo-sdk@4.0.0` published declarations under `dist/`. See [named return type declarations](TYPE_REFERENCE.md).

## Overview
The Evo SDK is a thin TypeScript wrapper around the Dash Platform WASM runtime. It exposes ergonomic namespaces (identities, documents, contracts, tokens, and more) optimized for automation and AI-assisted workflows.

## Quick Setup
```javascript
import { EvoSDK, IdentitySigner } from '@dashevo/evo-sdk';

// Create a trusted testnet client and connect
const sdk = EvoSDK.testnetTrusted();
await sdk.connect();

// Optional: customize connection or enable proofs
// const sdk = new EvoSDK({ network: 'testnet', trusted: true, proofs: true });
```

## Authentication
Evo SDK v4 state transitions accept typed payload objects and signer objects. Fetch the identity, select the public key that matches your private key, and keep production keys out of source control:
```javascript
const identityId = '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk';
const privateKeyWif = 'L1ExamplePrivateKeyWifGoesHere';
const keyId = 2;

const identity = await sdk.identities.fetch(identityId);
if (!identity) throw new Error('Identity not found');
const identityKey = identity.getPublicKeyById(keyId);
if (!identityKey) throw new Error('Identity key not found');

const signer = new IdentitySigner();
signer.addKeyFromWif(privateKeyWif);
```

## Query Operations

### Pattern
All queries follow this pattern:
```javascript
const result = await sdk.<namespace>.<method>(params);
```

### Available Queries
#### Identity Queries

**Get Identity** - `identities.fetch`
*Fetch an identity by its identifier.*

Signature: `fetch(identityId: wasm.IdentifierLike): Promise<wasm.Identity | undefined>`

Parameters:
- `identityId`: `wasm.IdentifierLike` (required)
  - Type declarations: [`wasm.IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)

Returns:

- `Promise<wasm.Identity | undefined>`
  - Type declarations: [`wasm.Identity`](TYPE_REFERENCE.md#type-identity)

Example:
```javascript
const result = await sdk.identities.fetch('5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk');
```

**Get Identity (Unproved)** - `identities.fetchUnproved`
*Fetch an identity without requesting cryptographic proofs.*

Signature: `fetchUnproved(identityId: wasm.IdentifierLike): Promise<wasm.Identity>`

Parameters:
- `identityId`: `wasm.IdentifierLike` (required)
  - Type declarations: [`wasm.IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)

Returns:

- `Promise<wasm.Identity>`
  - Type declarations: [`wasm.Identity`](TYPE_REFERENCE.md#type-identity)

Example:
```javascript
const result = await sdk.identities.fetchUnproved('5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk');
```

**Get Identity Keys** - `identities.getKeys`
*Retrieve public keys for an identity, including support for specific key IDs or purpose searches.*

Signature: `getKeys(query: wasm.IdentityKeysQuery): Promise<wasm.IdentityPublicKey[]>`

Parameters:
- `query`: `wasm.IdentityKeysQuery` (required)
  - Type declarations: [`wasm.IdentityKeysQuery`](TYPE_REFERENCE.md#type-identitykeysquery)
  - `identityId`: `IdentifierLike` (required)
    - Identity identifier.
  - Type declarations: [`IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)
  - `request`: `IdentityKeysRequest` (required)
    - Requested key selection strategy.
  - Type declarations: [`IdentityKeysRequest`](TYPE_REFERENCE.md#type-identitykeysrequest)
  - `limit`: `number` (optional)
    - Maximum number of keys to return after applying request filters.
  - `offset`: `number` (optional)
    - Number of keys to skip from the beginning of the result set.

Returns:

- `Promise<wasm.IdentityPublicKey[]>`
  - Type declarations: [`wasm.IdentityPublicKey`](TYPE_REFERENCE.md#type-identitypublickey)

Example:
```javascript
const result = await sdk.identities.getKeys({
    identityId: '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk',
    request: { type: 'all' },
    limit: 10,
    offset: 0
});
```

**Get Contract Keys for Identities** - `identities.contractKeys`
*Fetch contract-specific keys for one or more identities.*

**Disabled:** Requires fix for upstream issue: https://github.com/dashpay/platform/issues/3028

Signature: `contractKeys(query: wasm.IdentitiesContractKeysQuery): Promise<wasm.IdentityContractKeys[]>`

Parameters:
- `query`: `wasm.IdentitiesContractKeysQuery` (required)
  - Type declarations: [`wasm.IdentitiesContractKeysQuery`](TYPE_REFERENCE.md#type-identitiescontractkeysquery)
  - `identityIds`: `Array<IdentifierLike>` (required)
    - Identity identifiers to fetch keys for.
  - Type declarations: [`IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)
  - `contractId`: `IdentifierLike` (required)
    - Data contract identifier (reserved for future filtering).
  - Type declarations: [`IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)
  - `purposes`: `number[]` (optional)
    - Optional list of purposes to include.

Returns:

- `Promise<wasm.IdentityContractKeys[]>`
  - Type declarations: [`wasm.IdentityContractKeys`](TYPE_REFERENCE.md#type-identitycontractkeys)

Example:
```javascript
const result = await sdk.identities.contractKeys({
    identityIds: ['5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk'],
    contractId: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec'
});
```

**Get Identity Nonce** - `identities.nonce`
*Retrieve the global nonce associated with an identity.*

Signature: `nonce(identityId: wasm.IdentifierLike): Promise<bigint | undefined>`

Parameters:
- `identityId`: `wasm.IdentifierLike` (required)
  - Type declarations: [`wasm.IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)

Returns:

- `Promise<bigint | undefined>`

Example:
```javascript
const result = await sdk.identities.nonce('5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk');
```

**Get Identity Contract Nonce** - `identities.contractNonce`
*Retrieve the per-contract nonce for an identity.*

Signature: `contractNonce(identityId: wasm.IdentifierLike, contractId: wasm.IdentifierLike): Promise<bigint | undefined>`

Parameters:
- `identityId`: `wasm.IdentifierLike` (required)
  - Type declarations: [`wasm.IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)

- `contractId`: `wasm.IdentifierLike` (required)
  - Type declarations: [`wasm.IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)

Returns:

- `Promise<bigint | undefined>`

Example:
```javascript
const result = await sdk.identities.contractNonce('5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk', 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec');
```

**Get Identity Balance** - `identities.balance`
*Fetch the credit balance for an identity.*

Signature: `balance(identityId: wasm.IdentifierLike): Promise<bigint | undefined>`

Parameters:
- `identityId`: `wasm.IdentifierLike` (required)
  - Type declarations: [`wasm.IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)

Returns:

- `Promise<bigint | undefined>`

Example:
```javascript
const result = await sdk.identities.balance('5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk');
```

**Get Multiple Identity Balances** - `identities.balances`
*Fetch balances for multiple identities in a single request.*

Signature: `balances(identityIds: wasm.IdentifierLikeArray): Promise<Map<string, bigint | undefined>>`

Parameters:
- `identityIds`: `wasm.IdentifierLikeArray` (required)
  - Type declarations: [`wasm.IdentifierLikeArray`](TYPE_REFERENCE.md#type-identifierlikearray)

Returns:

- `Promise<Map<string, bigint | undefined>>`

Example:
```javascript
const result = await sdk.identities.balances(['5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk']);
```

**Get Identity Balance & Revision** - `identities.balanceAndRevision`
*Retrieve both the balance and revision number for an identity.*

Signature: `balanceAndRevision(identityId: wasm.IdentifierLike): Promise<wasm.IdentityBalanceAndRevision | undefined>`

Parameters:
- `identityId`: `wasm.IdentifierLike` (required)
  - Type declarations: [`wasm.IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)

Returns:

- `Promise<wasm.IdentityBalanceAndRevision | undefined>`
  - Type declarations: [`wasm.IdentityBalanceAndRevision`](TYPE_REFERENCE.md#type-identitybalanceandrevision)

Example:
```javascript
const result = await sdk.identities.balanceAndRevision('5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk');
```

**Get Identity by Unique Public Key Hash** - `identities.byPublicKeyHash`
*Lookup an identity via its unique public key hash.*

Signature: `byPublicKeyHash(publicKeyHash: wasm.PublicKeyHashLike): Promise<wasm.Identity | undefined>`

Parameters:
- `publicKeyHash`: `wasm.PublicKeyHashLike` (required)
  - Type declarations: [`wasm.PublicKeyHashLike`](TYPE_REFERENCE.md#type-publickeyhashlike)

Returns:

- `Promise<wasm.Identity | undefined>`
  - Type declarations: [`wasm.Identity`](TYPE_REFERENCE.md#type-identity)

Example:
```javascript
const result = await sdk.identities.byPublicKeyHash('b7e904ce25ed97594e72f7af0e66f298031c1754');
```

**Get Identity by Non-Unique Public Key Hash** - `identities.byNonUniquePublicKeyHash`
*Lookup identities that match a non-unique public key hash.*

Signature: `byNonUniquePublicKeyHash(publicKeyHash: wasm.PublicKeyHashLike, startAfter?: wasm.IdentifierLike): Promise<wasm.Identity[]>`

Parameters:
- `publicKeyHash`: `wasm.PublicKeyHashLike` (required)
  - Type declarations: [`wasm.PublicKeyHashLike`](TYPE_REFERENCE.md#type-publickeyhashlike)

- `startAfter`: `wasm.IdentifierLike` (optional)
  - Type declarations: [`wasm.IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)

Returns:

- `Promise<wasm.Identity[]>`
  - Type declarations: [`wasm.Identity`](TYPE_REFERENCE.md#type-identity)

Example:
```javascript
const result = await sdk.identities.byNonUniquePublicKeyHash('518038dc858461bcee90478fd994bba8057b7531');
```

**Get Identity Token Balances** - `identities.tokenBalances`
*Retrieve balances for a set of token IDs held by an identity.*

Signature: `tokenBalances(identityId: wasm.IdentifierLike, tokenIds: wasm.IdentifierLikeArray): Promise<Map<string, bigint>>`

Parameters:
- `identityId`: `wasm.IdentifierLike` (required)
  - Type declarations: [`wasm.IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)

- `tokenIds`: `wasm.IdentifierLikeArray` (required)
  - Type declarations: [`wasm.IdentifierLikeArray`](TYPE_REFERENCE.md#type-identifierlikearray)

Returns:

- `Promise<Map<string, bigint>>`

Example:
```javascript
const result = await sdk.identities.tokenBalances('5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk', ['Hqyu8WcRwXCTwbNxdga4CN5gsVEGc67wng4TFzceyLUv']);
```

**Get Token Balances for Identities** - `tokens.balances`
*Fetch balances for multiple identities for a single token.*

Signature: `balances(identityIds: wasm.IdentifierLikeArray, tokenId: wasm.IdentifierLike): Promise<Map<string, bigint>>`

Parameters:
- `identityIds`: `wasm.IdentifierLikeArray` (required)
  - Type declarations: [`wasm.IdentifierLikeArray`](TYPE_REFERENCE.md#type-identifierlikearray)

- `tokenId`: `wasm.IdentifierLike` (required)
  - Type declarations: [`wasm.IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)

Returns:

- `Promise<Map<string, bigint>>`

Example:
```javascript
const result = await sdk.tokens.balances(['5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk'], 'Hqyu8WcRwXCTwbNxdga4CN5gsVEGc67wng4TFzceyLUv');
```

**Get Identity Token Info** - `tokens.identityTokenInfos`
*Retrieve token metadata and balances for an identity.*

Signature: `identityTokenInfos(identityId: wasm.IdentifierLike, tokenIds: wasm.IdentifierLikeArray): Promise<Map<string, wasm.IdentityTokenInfo>>`

Parameters:
- `identityId`: `wasm.IdentifierLike` (required)
  - Type declarations: [`wasm.IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)

- `tokenIds`: `wasm.IdentifierLikeArray` (required)
  - Type declarations: [`wasm.IdentifierLikeArray`](TYPE_REFERENCE.md#type-identifierlikearray)

Returns:

- `Promise<Map<string, wasm.IdentityTokenInfo>>`
  - Type declarations: [`wasm.IdentityTokenInfo`](TYPE_REFERENCE.md#type-identitytokeninfo)

Example:
```javascript
const result = await sdk.tokens.identityTokenInfos('5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk', ['Hqyu8WcRwXCTwbNxdga4CN5gsVEGc67wng4TFzceyLUv'], { limit: 10, offset: 0 });
```

**Get Token Info for Identities** - `tokens.identitiesTokenInfos`
*Retrieve token metadata for multiple identities for a single token.*

Signature: `identitiesTokenInfos(identityIds: wasm.IdentifierLikeArray, tokenId: wasm.IdentifierLike): Promise<Map<string, wasm.IdentityTokenInfo>>`

Parameters:
- `identityIds`: `wasm.IdentifierLikeArray` (required)
  - Type declarations: [`wasm.IdentifierLikeArray`](TYPE_REFERENCE.md#type-identifierlikearray)

- `tokenId`: `wasm.IdentifierLike` (required)
  - Type declarations: [`wasm.IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)

Returns:

- `Promise<Map<string, wasm.IdentityTokenInfo>>`
  - Type declarations: [`wasm.IdentityTokenInfo`](TYPE_REFERENCE.md#type-identitytokeninfo)

Example:
```javascript
const result = await sdk.tokens.identitiesTokenInfos(['5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk'], 'Hqyu8WcRwXCTwbNxdga4CN5gsVEGc67wng4TFzceyLUv');
```

#### Data Contract Queries

**Get Data Contract** - `contracts.fetch`
*Fetch a data contract by its identifier.*

Signature: `fetch(contractId: wasm.IdentifierLike): Promise<wasm.DataContract | undefined>`

Parameters:
- `contractId`: `wasm.IdentifierLike` (required)
  - Type declarations: [`wasm.IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)

Returns:

- `Promise<wasm.DataContract | undefined>`
  - Type declarations: [`wasm.DataContract`](TYPE_REFERENCE.md#type-datacontract)

Example:
```javascript
const result = await sdk.contracts.fetch('GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec');
```

**Get Data Contract History** - `contracts.getHistory`
*Retrieve the version history for a data contract.*

Signature: `getHistory(query: wasm.DataContractHistoryQuery): Promise<Map<bigint, wasm.DataContract>>`

Parameters:
- `query`: `wasm.DataContractHistoryQuery` (required)
  - Type declarations: [`wasm.DataContractHistoryQuery`](TYPE_REFERENCE.md#type-datacontracthistoryquery)
  - `dataContractId`: `IdentifierLike` (required)
    - Data contract identifier.
  - Type declarations: [`IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)
  - `limit`: `number` (optional)
    - Maximum number of entries to return.
  - `startAtMs`: `number` (optional)
    - Millisecond timestamp (inclusive) to start from.

Returns:

- `Promise<Map<bigint, wasm.DataContract>>`
  - Type declarations: [`wasm.DataContract`](TYPE_REFERENCE.md#type-datacontract)

Example:
```javascript
const result = await sdk.contracts.getHistory({
    dataContractId: 'HLY575cNazmc5824FxqaEMEBuzFeE4a98GDRNKbyJqCM',
    limit: 10,
    startAtMs: 0
});
```

**Get Data Contracts** - `contracts.getMany`
*Fetch multiple data contracts by their identifiers.*

Signature: `getMany(contractIds: wasm.IdentifierLikeArray): Promise<Map<string, wasm.DataContract | undefined>>`

Parameters:
- `contractIds`: `wasm.IdentifierLikeArray` (required)
  - Type declarations: [`wasm.IdentifierLikeArray`](TYPE_REFERENCE.md#type-identifierlikearray)

Returns:

- `Promise<Map<string, wasm.DataContract | undefined>>`
  - Type declarations: [`wasm.DataContract`](TYPE_REFERENCE.md#type-datacontract)

Example:
```javascript
const result = await sdk.contracts.getMany([
    'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
    'ALybvzfcCwMs7sinDwmtumw17NneuW7RgFtFHgjKmF3A'
]);
```

#### Document Queries

**Get Documents** - `documents.query`
*Query documents from a data contract using optional filters.*

Signature: `query(query: wasm.DocumentsQuery): Promise<Map<string, wasm.Document | undefined>>`

Parameters:
- `query`: `wasm.DocumentsQuery` (required)
  - Type declarations: [`wasm.DocumentsQuery`](TYPE_REFERENCE.md#type-documentsquery)
  - `dataContractId`: `IdentifierLike` (required)
    - Data contract identifier.
  - Type declarations: [`IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)
  - `documentTypeName`: `string` (required)
    - Document type name.
  - `where`: `DocumentWhereClause[]` (optional)
    - Optional filter clauses expressed as [field, operator, value].
  - Type declarations: [`DocumentWhereClause`](TYPE_REFERENCE.md#type-documentwhereclause)
  - `orderBy`: `DocumentOrderByClause[]` (optional)
    - Optional sorting clauses expressed as [field, direction].
  - Type declarations: [`DocumentOrderByClause`](TYPE_REFERENCE.md#type-documentorderbyclause)
  - `limit`: `number` (optional)
    - Maximum number of documents to return.
  - `startAfter`: `IdentifierLike` (optional)
    - Exclusive document ID to resume from.
  - Type declarations: [`IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)
  - `startAt`: `IdentifierLike` (optional)
    - Inclusive document ID to start from.
  - Type declarations: [`IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)
  - `groupBy`: `string[]` (optional)
    - Count-query knob: SQL-shaped `GROUP BY` field list. Mirrors
the v1 wire's `group_by: repeated string` directly. Ignored
by the regular document-fetch path.

- `[]` or omitted → aggregate count (a single row).
- `["<in_field>"]` where `<in_field>` matches an `In`
  constraint → per-`In`-value entries (PerInValue).
- `["<range_field>"]` where `<range_field>` matches a range
  constraint → per-distinct-value entries within the range
  (RangeDistinct).
- `["<in_field>", "<range_field>"]` for compound `In + range`
  queries → compound distinct entries.

Entry direction comes from the first `orderBy` clause's
direction (which also drives walk order on the materialize +
prove path); set `orderBy: [["<range_field>", "asc"|"desc"]]`
alongside `groupBy: ["<range_field>"]` to control sort.

Returns:

- `Promise<Map<string, wasm.Document | undefined>>`
  - Type declarations: [`wasm.Document`](TYPE_REFERENCE.md#type-document)

Example:
```javascript
const result = await sdk.documents.query({
    dataContractId: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
    documentTypeName: 'domain',
    where: [["normalizedParentDomainName", "==", "dash"]],
    orderBy: [["normalizedLabel", "asc"]],
    limit: 10
});
```

**Get Document** - `documents.get`
*Fetch a specific document by ID.*

Signature: `get(contractId: wasm.IdentifierLike, type: string, documentId: wasm.IdentifierLike): Promise<wasm.Document | undefined>`

Parameters:
- `contractId`: `wasm.IdentifierLike` (required)
  - Type declarations: [`wasm.IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)

- `type`: `string` (required)

- `documentId`: `wasm.IdentifierLike` (required)
  - Type declarations: [`wasm.IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)

Returns:

- `Promise<wasm.Document | undefined>`
  - Type declarations: [`wasm.Document`](TYPE_REFERENCE.md#type-document)

Example:
```javascript
const result = await sdk.documents.get(
    'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
    'domain',
    '7NYmEKQsYtniQRUmxwdPGeVcirMoPh5ZPyAKz8BWFy3r'
);
```

#### DPNS Queries

**Get Primary Username** - `dpns.username`
*Fetch the primary DPNS username for an identity.*

Signature: `username(identityId: wasm.IdentifierLike): Promise<string | undefined>`

Parameters:
- `identityId`: `wasm.IdentifierLike` (required)
  - Type declarations: [`wasm.IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)

Returns:

- `Promise<string | undefined>`

Example:
```javascript
const result = await sdk.dpns.username('5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk');
```

**List Usernames for Identity** - `dpns.usernames`
*Fetch all DPNS usernames owned by an identity.*

Signature: `usernames(query: wasm.DpnsUsernamesQuery): Promise<string[]>`

Parameters:
- `query`: `wasm.DpnsUsernamesQuery` (required)
  - Type declarations: [`wasm.DpnsUsernamesQuery`](TYPE_REFERENCE.md#type-dpnsusernamesquery)
  - `identityId`: `IdentifierLike` (required)
    - Identity to fetch usernames for.
  - Type declarations: [`IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)
  - `limit`: `number` (optional)
    - Maximum number of usernames to return. Use 0 for default.

Returns:

- `Promise<string[]>`

Example:
```javascript
const result = await sdk.dpns.usernames({ identityId: '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk', limit: 10 });
```

**Get Username by Name** - `dpns.getUsernameByName`
*Fetch DPNS username details by full name.*

Signature: `getUsernameByName(username: string): Promise<wasm.DpnsUsernameInfo | undefined>`

Parameters:
- `username`: `string` (required)

Returns:

- `Promise<wasm.DpnsUsernameInfo | undefined>`
  - Type declarations: [`wasm.DpnsUsernameInfo`](TYPE_REFERENCE.md#type-dpnsusernameinfo)

Example:
```javascript
const result = await sdk.dpns.getUsernameByName('alice.dash');
```

**Resolve DPNS Name** - `dpns.resolveName`
*Resolve a DPNS name to its identity information.*

Signature: `resolveName(name: string): Promise<string | undefined>`

Parameters:
- `name`: `string` (required)

Returns:

- `Promise<string | undefined>`

Example:
```javascript
const result = await sdk.dpns.resolveName('alice.dash');
```

**Check DPNS Availability** - `dpns.isNameAvailable`
*Check if a DPNS label is available for registration.*

Signature: `isNameAvailable(label: string): Promise<boolean>`

Parameters:
- `label`: `string` (required)

Returns:

- `Promise<boolean>`

Example:
```javascript
const result = await sdk.dpns.isNameAvailable('alice');
```

**Convert to Homograph Safe** - `dpns.convertToHomographSafe`
*Convert a label to its homograph-safe representation.*

Signature: `convertToHomographSafe(input: string): Promise<string>`

Parameters:
- `input`: `string` (required)

Returns:

- `Promise<string>`

Example:
```javascript
const result = await sdk.dpns.convertToHomographSafe('ąlice');
```

**Validate Username** - `dpns.isValidUsername`
*Validate whether a label conforms to DPNS username rules.*

Signature: `isValidUsername(label: string): Promise<boolean>`

Parameters:
- `label`: `string` (required)

Returns:

- `Promise<boolean>`

Example:
```javascript
const result = sdk.dpns.isValidUsername('alice');
```

**Is Contested Username** - `dpns.isContestedUsername`
*Check if a label is currently part of a contested DPNS registration.*

Signature: `isContestedUsername(label: string): Promise<boolean>`

Parameters:
- `label`: `string` (required)

Returns:

- `Promise<boolean>`

Example:
```javascript
const result = sdk.dpns.isContestedUsername('alice');
```

#### Voting & Contested Resources

**Get Contested Resources** - `group.contestedResources`
*List contested resources for a document type and index.*

Signature: `contestedResources(query: wasm.VotePollsByDocumentTypeQuery): Promise<any[]>`

Parameters:
- `query`: `wasm.VotePollsByDocumentTypeQuery` (required)
  - Type declarations: [`wasm.VotePollsByDocumentTypeQuery`](TYPE_REFERENCE.md#type-votepollsbydocumenttypequery)
  - `dataContractId`: `IdentifierLike` (required)
    - Data contract identifier.
  - Type declarations: [`IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)
  - `documentTypeName`: `string` (required)
    - Document type to query.
  - `indexName`: `string` (required)
    - Index name to query.
  - `startIndexValues`: `unknown[]` (optional)
    - Optional lower bound for index range, commonly an array of composite values.
  - `endIndexValues`: `unknown[]` (optional)
    - Optional upper bound for index range, commonly an array of composite values.
  - `startAtValue`: `unknown` (optional)
    - Cursor value to resume iteration from.
Provide a JS value matching the index schema (e.g., string, number, array).
  - `startAtValueIncluded`: `boolean` (optional)
    - Whether to include `startAtValue` in the result set.
  - `limit`: `number` (optional)
    - Maximum number of records to return.
  - `orderAscending`: `boolean` (optional)
    - Sort order. When omitted, the query defaults to ascending order.

Returns:

- `Promise<any[]>`

Example:
```javascript
const result = await sdk.group.contestedResources({
    dataContractId: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
    documentTypeName: 'domain',
    indexName: 'parentNameAndLabel',
    startAtValue: null,
    limit: 10,
    orderAscending: true
});
```

**Get Contested Resource Vote State** - `voting.contestedResourceVoteState`
*Retrieve vote tallies for a contested resource.*

Signature: `contestedResourceVoteState(query: wasm.ContestedResourceVoteStateQuery): Promise<wasm.ContestedResourceVoteState>`

Parameters:
- `query`: `wasm.ContestedResourceVoteStateQuery` (required)
  - Type declarations: [`wasm.ContestedResourceVoteStateQuery`](TYPE_REFERENCE.md#type-contestedresourcevotestatequery)
  - `dataContractId`: `IdentifierLike` (required)
    - Data contract identifier.
  - Type declarations: [`IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)
  - `documentTypeName`: `string` (required)
    - Contested document type name.
  - `indexName`: `string` (required)
    - Index name to query.
  - `indexValues`: `unknown[]` (optional)
    - Optional index values used as query parameters.
  - `resultType`: `'documents' | 'voteTally' | 'documentsAndVoteTally'` (optional)
    - Result projection type.
  - `limit`: `number` (optional)
    - Maximum number of records to return.
  - `startAtContenderId`: `IdentifierLike` (optional)
    - Contender identifier to resume from (exclusive by default).
  - Type declarations: [`IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)
  - `startAtIncluded`: `boolean` (optional)
    - Include the start contender when true.
  - `includeLockedAndAbstaining`: `boolean` (optional)
    - Include locked and abstaining tallies when true.

Returns:

- `Promise<wasm.ContestedResourceVoteState>`
  - Type declarations: [`wasm.ContestedResourceVoteState`](TYPE_REFERENCE.md#type-contestedresourcevotestate)

Example:
```javascript
const result = await sdk.voting.contestedResourceVoteState({
    dataContractId: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
    documentTypeName: 'domain',
    indexName: 'parentNameAndLabel',
    indexValues: ['dash', 'alice'],
    resultType: 'documents',
    limit: 10,
    orderAscending: true
});
```

**Get Voters for Identity** - `group.contestedResourceVotersForIdentity`
*List voters that voted for a specific identity in a contested resource.*

Signature: `contestedResourceVotersForIdentity(query: wasm.ContestedResourceVotersForIdentityQuery): Promise<wasm.Identifier[]>`

Parameters:
- `query`: `wasm.ContestedResourceVotersForIdentityQuery` (required)
  - Type declarations: [`wasm.ContestedResourceVotersForIdentityQuery`](TYPE_REFERENCE.md#type-contestedresourcevotersforidentityquery)
  - `dataContractId`: `IdentifierLike` (required)
    - Data contract identifier.
  - Type declarations: [`IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)
  - `documentTypeName`: `string` (required)
    - Contested document type name.
  - `indexName`: `string` (required)
    - Index name used to locate the contested resource.
  - `indexValues`: `unknown[]` (optional)
    - Optional index values used as query arguments.
  - `contestantId`: `IdentifierLike` (required)
    - Contested identity identifier.
  - Type declarations: [`IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)
  - `limit`: `number` (optional)
    - Maximum number of voters to return.
  - `startAtVoterId`: `IdentifierLike` (optional)
    - Voter identifier to resume from (exclusive by default).
  - Type declarations: [`IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)
  - `startAtIncluded`: `boolean` (optional)
    - Include the `startAtVoterId` when true.
  - `orderAscending`: `boolean` (optional)
    - Sort order. When omitted, defaults to ascending.

Returns:

- `Promise<wasm.Identifier[]>`
  - Type declarations: [`wasm.Identifier`](TYPE_REFERENCE.md#type-identifier)

Example:
```javascript
const result = await sdk.group.contestedResourceVotersForIdentity({
    dataContractId: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
    documentTypeName: 'domain',
    indexName: 'parentNameAndLabel',
    indexValues: ['dash', 'alice'],
    contestantId: '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk',
    limit: 10,
    orderAscending: true
});
```

**Get Identity Votes** - `voting.contestedResourceIdentityVotes`
*Fetch contested resource votes submitted by a particular identity.*

Signature: `contestedResourceIdentityVotes(query: wasm.ContestedResourceIdentityVotesQuery): Promise<Map<string, wasm.ResourceVote>>`

Parameters:
- `query`: `wasm.ContestedResourceIdentityVotesQuery` (required)
  - Type declarations: [`wasm.ContestedResourceIdentityVotesQuery`](TYPE_REFERENCE.md#type-contestedresourceidentityvotesquery)
  - `identityId`: `IdentifierLike` (required)
    - Identity identifier.
  - Type declarations: [`IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)
  - `limit`: `number` (optional)
    - Maximum number of votes to return.
  - `startAtVoteId`: `IdentifierLike` (optional)
    - Vote identifier to resume from (exclusive by default).
  - Type declarations: [`IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)
  - `startAtIncluded`: `boolean` (optional)
    - Include the `startAtVoteId` when true.
  - `orderAscending`: `boolean` (optional)
    - Sort order. When omitted, defaults to ascending.

Returns:

- `Promise<Map<string, wasm.ResourceVote>>`
  - Type declarations: [`wasm.ResourceVote`](TYPE_REFERENCE.md#type-resourcevote)

Example:
```javascript
const result = await sdk.voting.contestedResourceIdentityVotes({
    identityId: '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk',
    limit: 10,
    orderAscending: true
});
```

**Get Vote Polls by End Date** - `voting.votePollsByEndDate`
*Fetch vote polls filtered by end time using millisecond timestamps.*

Signature: `votePollsByEndDate(query?: wasm.VotePollsByEndDateQuery): Promise<wasm.VotePollsByEndDateEntry[]>`

Parameters:
- `query`: `wasm.VotePollsByEndDateQuery` (optional)
  - Type declarations: [`wasm.VotePollsByEndDateQuery`](TYPE_REFERENCE.md#type-votepollsbyenddatequery)
  - `startTimeMs`: `number` (optional)
    - Starting timestamp (milliseconds) to filter polls.
  - `startTimeIncluded`: `boolean` (optional)
    - Include the `startTimeMs` boundary when true.
  - `endTimeMs`: `number` (optional)
    - Ending timestamp (milliseconds) to filter polls.
  - `endTimeIncluded`: `boolean` (optional)
    - Include the `endTimeMs` boundary when true.
  - `limit`: `number` (optional)
    - Maximum number of buckets to return.
  - `offset`: `number` (optional)
    - Offset into the paginated result set.
  - `orderAscending`: `boolean` (optional)
    - Sort order for timestamps; ascending by default.

Returns:

- `Promise<wasm.VotePollsByEndDateEntry[]>`
  - Type declarations: [`wasm.VotePollsByEndDateEntry`](TYPE_REFERENCE.md#type-votepollsbyenddateentry)

Example:
```javascript
const result = await sdk.voting.votePollsByEndDate({
    startTimeMs: null,
    endTimeMs: null,
    limit: 10,
    orderAscending: true,
});
```

#### Protocol & Version

**Get Protocol Version Upgrade State** - `protocol.versionUpgradeState`
*Retrieve protocol upgrade vote tallies.*

Signature: `versionUpgradeState(): Promise<wasm.ProtocolVersionUpgradeState>`

No parameters required.

Returns:

- `Promise<wasm.ProtocolVersionUpgradeState>`
  - Type declarations: [`wasm.ProtocolVersionUpgradeState`](TYPE_REFERENCE.md#type-protocolversionupgradestate)

Example:
```javascript
const result = await sdk.protocol.versionUpgradeState();
```

**Get Protocol Version Vote Status** - `protocol.versionUpgradeVoteStatus`
*Fetch voting status for masternodes on protocol upgrades.*

Signature: `versionUpgradeVoteStatus(startProTxHash: wasm.ProTxHashLike | undefined, count: number): Promise<Map<string, wasm.ProtocolVersionUpgradeVoteStatus>>`

Parameters:
- `startProTxHash`: `wasm.ProTxHashLike | undefined` (required)
  - Type declarations: [`wasm.ProTxHashLike`](TYPE_REFERENCE.md#type-protxhashlike)

- `count`: `number` (required)

Returns:

- `Promise<Map<string, wasm.ProtocolVersionUpgradeVoteStatus>>`
  - Type declarations: [`wasm.ProtocolVersionUpgradeVoteStatus`](TYPE_REFERENCE.md#type-protocolversionupgradevotestatus)

Example:
```javascript
const result = await sdk.protocol.versionUpgradeVoteStatus('143dcd6a6b7684fde01e88a10e5d65de9a29244c5ecd586d14a342657025f113', 10);
```

#### Epoch & Block Queries

**Get Epochs Info** - `epoch.epochsInfo`
*Retrieve summary information for one or more epochs.*

Signature: `epochsInfo(query?: EpochsQuery): Promise<Map<number, wasm.ExtendedEpochInfo | undefined>>`

Parameters:
- `query`: `EpochsQuery` (optional)
  - Type declarations: [`EpochsQuery`](TYPE_REFERENCE.md#type-epochsquery)
  - `startEpoch`: `number` (optional)
    - Starting epoch index.
  - `count`: `number` (optional)
    - Maximum number of epochs to return.
  - `ascending`: `boolean` (optional)
    - Sort order for returned epochs.

Returns:

- `Promise<Map<number, wasm.ExtendedEpochInfo | undefined>>`
  - Type declarations: [`wasm.ExtendedEpochInfo`](TYPE_REFERENCE.md#type-extendedepochinfo)

Example:
```javascript
const result = await sdk.epoch.epochsInfo({
    startEpoch: 8635,
    count: 5,
    ascending: true
});
```

**Get Current Epoch** - `epoch.current`
*Fetch the current platform epoch.*

Signature: `current(): Promise<wasm.ExtendedEpochInfo>`

No parameters required.

Returns:

- `Promise<wasm.ExtendedEpochInfo>`
  - Type declarations: [`wasm.ExtendedEpochInfo`](TYPE_REFERENCE.md#type-extendedepochinfo)

Example:
```javascript
const result = await sdk.epoch.current();
```

**Get Finalized Epoch Infos** - `epoch.finalizedInfos`
*Retrieve finalized epoch information for a range.*

Signature: `finalizedInfos(query: FinalizedEpochsQuery): Promise<Map<number, wasm.FinalizedEpochInfo | undefined>>`

Parameters:
- `query`: `FinalizedEpochsQuery` (required)
  - Type declarations: [`FinalizedEpochsQuery`](TYPE_REFERENCE.md#type-finalizedepochsquery)
  - `startEpoch`: `number` (required)
    - Starting epoch index (required).
  - `count`: `number` (optional)
    - Maximum number of epochs to return.
  - `ascending`: `boolean` (optional)
    - Sort order for returned epochs.

Returns:

- `Promise<Map<number, wasm.FinalizedEpochInfo | undefined>>`
  - Type declarations: [`wasm.FinalizedEpochInfo`](TYPE_REFERENCE.md#type-finalizedepochinfo)

Example:
```javascript
const result = await sdk.epoch.finalizedInfos({
    startEpoch: 8635,
    count: 5,
    ascending: true
});
```

**Get Epoch Blocks by Evonode IDs** - `epoch.evonodesProposedBlocksByIds`
*Fetch proposed blocks for specific evonode ProTx hashes.*

Signature: `evonodesProposedBlocksByIds(epoch: number, ids: wasm.ProTxHashLikeArray): Promise<Map<string, bigint>>`

Parameters:
- `epoch`: `number` (required)

- `ids`: `wasm.ProTxHashLikeArray` (required)
  - Type declarations: [`wasm.ProTxHashLikeArray`](TYPE_REFERENCE.md#type-protxhashlikearray)

Returns:

- `Promise<Map<string, bigint>>`

Example:
```javascript
const result = await sdk.epoch.evonodesProposedBlocksByIds(
    8635,
    ['143dcd6a6b7684fde01e88a10e5d65de9a29244c5ecd586d14a342657025f113']
);
```

**Get Epoch Blocks by Range** - `epoch.evonodesProposedBlocksByRange`
*Fetch proposed blocks in range order.*

Signature: `evonodesProposedBlocksByRange(query: EvonodeProposedBlocksRangeQuery): Promise<Map<string, bigint>>`

Parameters:
- `query`: `EvonodeProposedBlocksRangeQuery` (required)
  - Type declarations: [`EvonodeProposedBlocksRangeQuery`](TYPE_REFERENCE.md#type-evonodeproposedblocksrangequery)
  - `epoch`: `number` (required)
    - Epoch index to query.
  - `limit`: `number` (optional)
    - Maximum number of items to return.
  - `startAfter`: `ProTxHashLike` (optional)
    - ProTxHash to resume from (exclusive by default).
  - Type declarations: [`ProTxHashLike`](TYPE_REFERENCE.md#type-protxhashlike)

Returns:

- `Promise<Map<string, bigint>>`

Example:
```javascript
const result = await sdk.epoch.evonodesProposedBlocksByRange({
    epoch: 8635,
    limit: 5
});
```

#### Token Queries

**Calculate Token ID** - `tokens.calculateId`
*Calculate a token ID from a contract ID and token position. This is a utility method that does not require network connection.*

Signature: `calculateId(contractId: wasm.IdentifierLike, tokenPosition: number): Promise<string>`

Parameters:
- `contractId`: `wasm.IdentifierLike` (required)
  - Type declarations: [`wasm.IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)

- `tokenPosition`: `number` (required)

Returns:

- `Promise<string>`

Example:
```javascript
const result = await sdk.tokens.calculateId('ALybvzfcCwMs7sinDwmtumw17NneuW7RgFtFHgjKmF3A', 0);
```

**Get Token Statuses** - `tokens.statuses`
*Retrieve status information for one or more tokens.*

Signature: `statuses(tokenIds: wasm.IdentifierLikeArray): Promise<Map<string, wasm.TokenStatus>>`

Parameters:
- `tokenIds`: `wasm.IdentifierLikeArray` (required)
  - Type declarations: [`wasm.IdentifierLikeArray`](TYPE_REFERENCE.md#type-identifierlikearray)

Returns:

- `Promise<Map<string, wasm.TokenStatus>>`
  - Type declarations: [`wasm.TokenStatus`](TYPE_REFERENCE.md#type-tokenstatus)

Example:
```javascript
const result = await sdk.tokens.statuses([
    'Hqyu8WcRwXCTwbNxdga4CN5gsVEGc67wng4TFzceyLUv',
    'H7FRpZJqZK933r9CzZMsCuf1BM34NT5P2wSJyjDkprqy'
]);
```

**Get Direct Purchase Prices** - `tokens.directPurchasePrices`
*Fetch direct purchase prices for tokens.*

Signature: `directPurchasePrices(tokenIds: wasm.IdentifierLikeArray): Promise<Map<string, wasm.TokenPriceInfo>>`

Parameters:
- `tokenIds`: `wasm.IdentifierLikeArray` (required)
  - Type declarations: [`wasm.IdentifierLikeArray`](TYPE_REFERENCE.md#type-identifierlikearray)

Returns:

- `Promise<Map<string, wasm.TokenPriceInfo>>`
  - Type declarations: [`wasm.TokenPriceInfo`](TYPE_REFERENCE.md#type-tokenpriceinfo)

Example:
```javascript
const result = await sdk.tokens.directPurchasePrices([
    'Hqyu8WcRwXCTwbNxdga4CN5gsVEGc67wng4TFzceyLUv'
]);
```

**Get Token Contract Info** - `tokens.contractInfo`
*Retrieve metadata for a token contract.*

Signature: `contractInfo(tokenId: wasm.IdentifierLike): Promise<wasm.TokenContractInfo | undefined>`

Parameters:
- `tokenId`: `wasm.IdentifierLike` (required)
  - Type declarations: [`wasm.IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)

Returns:

- `Promise<wasm.TokenContractInfo | undefined>`
  - Type declarations: [`wasm.TokenContractInfo`](TYPE_REFERENCE.md#type-tokencontractinfo)

Example:
```javascript
const result = await sdk.tokens.contractInfo('ALybvzfcCwMs7sinDwmtumw17NneuW7RgFtFHgjKmF3A');
```

**Get Token Distribution Last Claim** - `tokens.perpetualDistributionLastClaim`
*Fetch the last perpetual distribution claim for an identity and token.*

Signature: `perpetualDistributionLastClaim(identityId: wasm.IdentifierLike, tokenId: wasm.IdentifierLike): Promise<wasm.RewardDistributionMoment | undefined>`

Parameters:
- `identityId`: `wasm.IdentifierLike` (required)
  - Type declarations: [`wasm.IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)

- `tokenId`: `wasm.IdentifierLike` (required)
  - Type declarations: [`wasm.IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)

Returns:

- `Promise<wasm.RewardDistributionMoment | undefined>`
  - Type declarations: [`wasm.RewardDistributionMoment`](TYPE_REFERENCE.md#type-rewarddistributionmoment)

Example:
```javascript
const result = await sdk.tokens.perpetualDistributionLastClaim(
    '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk',
    'Hqyu8WcRwXCTwbNxdga4CN5gsVEGc67wng4TFzceyLUv'
);
```

**Get Token Total Supply** - `tokens.totalSupply`
*Fetch the total supply for a token.*

Signature: `totalSupply(tokenId: wasm.IdentifierLike): Promise<wasm.TokenTotalSupply | undefined>`

Parameters:
- `tokenId`: `wasm.IdentifierLike` (required)
  - Type declarations: [`wasm.IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)

Returns:

- `Promise<wasm.TokenTotalSupply | undefined>`
  - Type declarations: [`wasm.TokenTotalSupply`](TYPE_REFERENCE.md#type-tokentotalsupply)

Example:
```javascript
const result = await sdk.tokens.totalSupply('Hqyu8WcRwXCTwbNxdga4CN5gsVEGc67wng4TFzceyLUv');
```

**Get Token Price by Contract** - `tokens.priceByContract`
*Retrieve the price details for a token indexed by contract position.*

Signature: `priceByContract(contractId: wasm.IdentifierLike, tokenPosition: number): Promise<wasm.TokenPriceInfo>`

Parameters:
- `contractId`: `wasm.IdentifierLike` (required)
  - Type declarations: [`wasm.IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)

- `tokenPosition`: `number` (required)

Returns:

- `Promise<wasm.TokenPriceInfo>`
  - Type declarations: [`wasm.TokenPriceInfo`](TYPE_REFERENCE.md#type-tokenpriceinfo)

Example:
```javascript
const result = await sdk.tokens.priceByContract('ALybvzfcCwMs7sinDwmtumw17NneuW7RgFtFHgjKmF3A', 0);
```

#### Group Queries

**Get Group Info** - `group.info`
*Fetch metadata for a specific group contract position.*

Signature: `info(contractId: wasm.IdentifierLike, groupContractPosition: number): Promise<wasm.Group | undefined>`

Parameters:
- `contractId`: `wasm.IdentifierLike` (required)
  - Type declarations: [`wasm.IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)

- `groupContractPosition`: `number` (required)

Returns:

- `Promise<wasm.Group | undefined>`
  - Type declarations: [`wasm.Group`](TYPE_REFERENCE.md#type-group)

Example:
```javascript
const result = await sdk.group.info('49PJEnNx7ReCitzkLdkDNr4s6RScGsnNexcdSZJ1ph5N', 0);
```

**List Group Infos** - `group.infos`
*List group information entries for a contract.*

Signature: `infos(query: wasm.GroupInfosQuery): Promise<Map<number, wasm.Group | undefined>>`

Parameters:
- `query`: `wasm.GroupInfosQuery` (required)
  - Type declarations: [`wasm.GroupInfosQuery`](TYPE_REFERENCE.md#type-groupinfosquery)
  - `dataContractId`: `IdentifierLike` (required)
    - Data contract identifier.
  - Type declarations: [`IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)
  - `startAt`: `GroupInfosStartAt` (optional)
    - Cursor describing where to resume from.
  - Type declarations: [`GroupInfosStartAt`](TYPE_REFERENCE.md#type-groupinfosstartat)
  - `limit`: `number` (optional)
    - Maximum number of groups to return.

Returns:

- `Promise<Map<number, wasm.Group | undefined>>`
  - Type declarations: [`wasm.Group`](TYPE_REFERENCE.md#type-group)

Example:
```javascript
const result = await sdk.group.infos({ dataContractId: '49PJEnNx7ReCitzkLdkDNr4s6RScGsnNexcdSZJ1ph5N', startAt: null, limit: 10 });
```

**Get Group Members** - `group.members`
*Retrieve member entries for a group.*

Signature: `members(query: wasm.GroupMembersQuery): Promise<Map<string, bigint>>`

Parameters:
- `query`: `wasm.GroupMembersQuery` (required)
  - Type declarations: [`wasm.GroupMembersQuery`](TYPE_REFERENCE.md#type-groupmembersquery)
  - `dataContractId`: `IdentifierLike` (required)
    - Data contract identifier.
  - Type declarations: [`IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)
  - `groupContractPosition`: `number` (required)
    - Group position inside the contract.
  - `memberIds`: `Array<Identifier | Uint8Array | string>` (optional)
    - Optional list of member IDs to retrieve. When provided, pagination options are ignored.
  - Type declarations: [`Identifier`](TYPE_REFERENCE.md#type-identifier)
  - `startAtMemberId`: `IdentifierLike` (optional)
    - Member identifier to resume from.
  - Type declarations: [`IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)
  - `limit`: `number` (optional)
    - Maximum number of members to return when not requesting specific IDs.

Returns:

- `Promise<Map<string, bigint>>`

Example:
```javascript
const result = await sdk.group.members({ dataContractId: '49PJEnNx7ReCitzkLdkDNr4s6RScGsnNexcdSZJ1ph5N', groupContractPosition: 0, limit: 10 });
```

**Get Group Actions** - `group.actions`
*Fetch actions associated with a group.*

Signature: `actions(query: wasm.GroupActionsQuery): Promise<Map<string, wasm.GroupAction | undefined>>`

Parameters:
- `query`: `wasm.GroupActionsQuery` (required)
  - Type declarations: [`wasm.GroupActionsQuery`](TYPE_REFERENCE.md#type-groupactionsquery)
  - `dataContractId`: `IdentifierLike` (required)
    - Data contract identifier.
  - Type declarations: [`IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)
  - `groupContractPosition`: `number` (required)
    - Position of the group within the contract.
  - `status`: `GroupActionStatusFilter` (required)
    - Filter actions by status.
  - Type declarations: [`GroupActionStatusFilter`](TYPE_REFERENCE.md#type-groupactionstatusfilter)
  - `startAt`: `GroupActionsStartAt` (optional)
    - Cursor describing where to resume from.
  - Type declarations: [`GroupActionsStartAt`](TYPE_REFERENCE.md#type-groupactionsstartat)
  - `limit`: `number` (optional)
    - Maximum number of actions to return.

Returns:

- `Promise<Map<string, wasm.GroupAction | undefined>>`
  - Type declarations: [`wasm.GroupAction`](TYPE_REFERENCE.md#type-groupaction)

Example:
```javascript
const result = await sdk.group.actions({ dataContractId: '49PJEnNx7ReCitzkLdkDNr4s6RScGsnNexcdSZJ1ph5N', groupContractPosition: 0, status: 'ACTIVE', limit: 10 });
```

**Get Group Action Signers** - `group.actionSigners`
*List signers for a specific group action.*

Signature: `actionSigners(query: wasm.GroupActionSignersQuery): Promise<Map<string, bigint>>`

Parameters:
- `query`: `wasm.GroupActionSignersQuery` (required)
  - Type declarations: [`wasm.GroupActionSignersQuery`](TYPE_REFERENCE.md#type-groupactionsignersquery)
  - `dataContractId`: `IdentifierLike` (required)
    - Data contract identifier.
  - Type declarations: [`IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)
  - `groupContractPosition`: `number` (required)
    - Position of the group within the contract.
  - `status`: `GroupActionStatusFilter` (required)
    - Action status filter.
  - Type declarations: [`GroupActionStatusFilter`](TYPE_REFERENCE.md#type-groupactionstatusfilter)
  - `actionId`: `IdentifierLike` (required)
    - Group action identifier.
  - Type declarations: [`IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)

Returns:

- `Promise<Map<string, bigint>>`

Example:
```javascript
const result = await sdk.group.actionSigners({ dataContractId: '49PJEnNx7ReCitzkLdkDNr4s6RScGsnNexcdSZJ1ph5N', groupContractPosition: 0, status: 'ACTIVE', actionId: '6XJzL6Qb8Zhwxt4HFwh8NAn7q1u4dwdoUf8EmgzDudFZ' });
```

**Get Identity Groups** - `group.identityGroups`
*Fetch group memberships for an identity.*

Signature: `identityGroups(query: wasm.IdentityGroupsQuery): Promise<wasm.IdentityGroupInfo[]>`

Parameters:
- `query`: `wasm.IdentityGroupsQuery` (required)
  - Type declarations: [`wasm.IdentityGroupsQuery`](TYPE_REFERENCE.md#type-identitygroupsquery)
  - `identityId`: `IdentifierLike` (required)
    - Identity identifier.
  - Type declarations: [`IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)
  - `memberDataContracts`: `Array<Identifier | Uint8Array | string>` (optional)
    - Data contracts where the identity participates as a member.
  - Type declarations: [`Identifier`](TYPE_REFERENCE.md#type-identifier)
  - `ownerDataContracts`: `Array<Identifier | Uint8Array | string>` (optional)
    - Data contracts where the identity participates as an owner.
(Currently not implemented server-side.)
  - Type declarations: [`Identifier`](TYPE_REFERENCE.md#type-identifier)
  - `moderatorDataContracts`: `Array<Identifier | Uint8Array | string>` (optional)
    - Data contracts where the identity participates as a moderator.
(Currently not implemented server-side.)
  - Type declarations: [`Identifier`](TYPE_REFERENCE.md#type-identifier)

Returns:

- `Promise<wasm.IdentityGroupInfo[]>`
  - Type declarations: [`wasm.IdentityGroupInfo`](TYPE_REFERENCE.md#type-identitygroupinfo)

Example:
```javascript
const result = await sdk.group.identityGroups({ identityId: '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk' });
```

**Get Groups Data Contracts** - `group.groupsDataContracts`
*Fetch group configuration documents for the supplied data contracts.*

Signature: `groupsDataContracts(dataContractIds: wasm.IdentifierLikeArray): Promise<Map<string, Map<number, wasm.Group | undefined>>>`

Parameters:
- `dataContractIds`: `wasm.IdentifierLikeArray` (required)
  - Type declarations: [`wasm.IdentifierLikeArray`](TYPE_REFERENCE.md#type-identifierlikearray)

Returns:

- `Promise<Map<string, Map<number, wasm.Group | undefined>>>`
  - Type declarations: [`wasm.Group`](TYPE_REFERENCE.md#type-group)

Example:
```javascript
const result = await sdk.group.groupsDataContracts(['GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec']);
```

#### System & Utility

**Get Platform Status** - `system.status`
*Retrieve basic platform status information.*

Signature: `status(): Promise<wasm.StatusResponse>`

No parameters required.

Returns:

- `Promise<wasm.StatusResponse>`
  - Type declarations: [`wasm.StatusResponse`](TYPE_REFERENCE.md#type-statusresponse)

Example:
```javascript
const result = await sdk.system.status();
```

**Get Current Quorums Info** - `system.currentQuorumsInfo`
*Fetch details about currently active quorums.*

Signature: `currentQuorumsInfo(): Promise<wasm.CurrentQuorumsInfo>`

No parameters required.

Returns:

- `Promise<wasm.CurrentQuorumsInfo>`
  - Type declarations: [`wasm.CurrentQuorumsInfo`](TYPE_REFERENCE.md#type-currentquorumsinfo)

Example:
```javascript
const result = await sdk.system.currentQuorumsInfo();
```

**Get Prefunded Specialized Balance** - `system.prefundedSpecializedBalance`
*Retrieve a prefunded specialized balance entry.*

Signature: `prefundedSpecializedBalance(identityId: wasm.IdentifierLike): Promise<wasm.PrefundedSpecializedBalance>`

Parameters:
- `identityId`: `wasm.IdentifierLike` (required)
  - Type declarations: [`wasm.IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)

Returns:

- `Promise<wasm.PrefundedSpecializedBalance>`
  - Type declarations: [`wasm.PrefundedSpecializedBalance`](TYPE_REFERENCE.md#type-prefundedspecializedbalance)

Example:
```javascript
const result = await sdk.system.prefundedSpecializedBalance('AzaU7zqCT7X1kxh8yWxkT9PxAgNqWDu4Gz13emwcRyAT');
```

**Get Total Credits in Platform** - `system.totalCreditsInPlatform`
*Fetch the total credit balance stored in the platform.*

Signature: `totalCreditsInPlatform(): Promise<bigint>`

No parameters required.

Returns:

- `Promise<bigint>`

Example:
```javascript
const result = await sdk.system.totalCreditsInPlatform();
```

**Get Path Elements** - `system.pathElements`
*Access items in the GroveDB state tree by specifying a path and keys.*

Signature: `pathElements(path: wasm.GrovePathSegment[], keys: wasm.GrovePathSegment[]): Promise<wasm.PathElement[]>`

Parameters:
- `path`: `wasm.GrovePathSegment[]` (required)
  - Type declarations: [`wasm.GrovePathSegment`](TYPE_REFERENCE.md#type-grovepathsegment)

- `keys`: `wasm.GrovePathSegment[]` (required)
  - Type declarations: [`wasm.GrovePathSegment`](TYPE_REFERENCE.md#type-grovepathsegment)

Returns:

- `Promise<wasm.PathElement[]>`
  - Type declarations: [`wasm.PathElement`](TYPE_REFERENCE.md#type-pathelement)

Example:
```javascript
const result = await sdk.system.pathElements(['96'], ['5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk']);
```

**Wait for State Transition Result** - `stateTransitions.waitForStateTransitionResult`
*Wait for a state transition to be processed and return the result.*

Signature: `waitForStateTransitionResult(stateTransitionHash: string): Promise<wasm.StateTransitionResult>`

Parameters:
- `stateTransitionHash`: `string` (required)

Returns:

- `Promise<wasm.StateTransitionResult>`
  - Type declarations: [`wasm.StateTransitionResult`](TYPE_REFERENCE.md#type-statetransitionresult)

Example:
```javascript
const result = await sdk.stateTransitions.waitForStateTransitionResult('0000000000000000000000000000000000000000000000000000000000000000');
```

#### Platform Address Queries

**Get Platform Address** - `addresses.get`
*Fetch information about a Platform address including its nonce and balance.*

Signature: `get(address: wasm.PlatformAddressLike): Promise<wasm.PlatformAddressInfo | undefined>`

Parameters:
- `address`: `wasm.PlatformAddressLike` (required)
  - - The platform address to query (PlatformAddress, Uint8Array, or bech32m string)
  - Type declarations: [`wasm.PlatformAddressLike`](TYPE_REFERENCE.md#type-platformaddresslike)

Returns:

- `Promise<wasm.PlatformAddressInfo | undefined>`
  - Type declarations: [`wasm.PlatformAddressInfo`](TYPE_REFERENCE.md#type-platformaddressinfo)

Example:
```javascript
const result = await sdk.addresses.get('tdash1krt0z5hrcaphyuraxmk2h2ff8nyv5fmncsgf7evf');
```

**Get Multiple Platform Addresses** - `addresses.getMany`
*Fetch information about multiple Platform addresses.*

Signature: `getMany(addresses: wasm.PlatformAddressLikeArray): Promise<Map<string, wasm.PlatformAddressInfo | undefined>>`

Parameters:
- `addresses`: `wasm.PlatformAddressLikeArray` (required)
  - - Array of platform addresses to query
  - Type declarations: [`wasm.PlatformAddressLikeArray`](TYPE_REFERENCE.md#type-platformaddresslikearray)

Returns:

- `Promise<Map<string, wasm.PlatformAddressInfo | undefined>>`
  - Type declarations: [`wasm.PlatformAddressInfo`](TYPE_REFERENCE.md#type-platformaddressinfo)

Example:
```javascript
const result = await sdk.addresses.getMany(['tdash1krt0z5hrcaphyuraxmk2h2ff8nyv5fmncsgf7evf']);
```

## State Transition Operations

### Pattern
State transition signatures and option objects below are generated from the installed SDK declarations. Example variables such as identities, keys, signers, and contracts are prerequisites prepared by the caller:
```javascript
const result = await sdk.<namespace>.<transition>(options);
```

### Available State Transitions
#### Identity Transitions

**Identity Create** - `identities.create`
*Create a new identity with initial credits*

Signature: `create(options: wasm.IdentityCreateOptions): Promise<void>`

Parameters:
- `options`: `wasm.IdentityCreateOptions` (required)
  - Type declarations: [`wasm.IdentityCreateOptions`](TYPE_REFERENCE.md#type-identitycreateoptions)
  - `identity`: `Identity` (required)
    - The identity to create (with public keys set up).
Use Identity.create() to build the identity structure first.
  - Type declarations: [`Identity`](TYPE_REFERENCE.md#type-identity)
  - `assetLockProof`: `AssetLockProof` (required)
    - Asset lock proof from the Core chain.
Use AssetLockProof.createInstantAssetLockProof() or AssetLockProof.createChainAssetLockProof().
  - Type declarations: [`AssetLockProof`](TYPE_REFERENCE.md#type-assetlockproof)
  - `assetLockPrivateKey`: `PrivateKey` (required)
    - Private key for signing the asset lock proof.
This is the private key that controls the asset lock output.
  - Type declarations: [`PrivateKey`](TYPE_REFERENCE.md#type-privatekey)
  - `signer`: `IdentitySigner` (required)
    - Signer containing private keys for the identity's public keys.
Use IdentitySigner to add keys for signing identity key proofs.
  - Type declarations: [`IdentitySigner`](TYPE_REFERENCE.md#type-identitysigner)
  - `settings`: `PutSettings` (optional)
    - Optional settings for the broadcast operation.
Includes retries, timeouts, userFeeIncrease, etc.
  - Type declarations: [`PutSettings`](TYPE_REFERENCE.md#type-putsettings)

Returns:

- `Promise<void>`

Example:
```javascript
import { AssetLockProof, IdentitySigner, PrivateKey } from '@dashevo/evo-sdk';

// Build `identity` with its public keys before submitting the transition.
const assetLockProof = AssetLockProof.fromHex(assetLockProofHex);
const assetLockPrivateKey = PrivateKey.fromWIF(assetLockPrivateKeyWif);
const signer = new IdentitySigner();
identityPrivateKeyWifs.forEach((wif) => signer.addKeyFromWif(wif));

const result = await sdk.identities.create({ identity, assetLockProof, assetLockPrivateKey, signer });
```

**Identity Top Up** - `identities.topUp`
*Add credits to an existing identity*

Signature: `topUp(options: wasm.IdentityTopUpOptions): Promise<bigint>`

Parameters:
- `options`: `wasm.IdentityTopUpOptions` (required)
  - Type declarations: [`wasm.IdentityTopUpOptions`](TYPE_REFERENCE.md#type-identitytopupoptions)
  - `identity`: `Identity` (required)
    - The identity to top up.
  - Type declarations: [`Identity`](TYPE_REFERENCE.md#type-identity)
  - `assetLockProof`: `AssetLockProof` (required)
    - Asset lock proof from the Core chain.
Use AssetLockProof.createInstantAssetLockProof() or AssetLockProof.createChainAssetLockProof().
  - Type declarations: [`AssetLockProof`](TYPE_REFERENCE.md#type-assetlockproof)
  - `assetLockPrivateKey`: `PrivateKey` (required)
    - Private key for signing the asset lock proof.
This is the private key that controls the asset lock output.
  - Type declarations: [`PrivateKey`](TYPE_REFERENCE.md#type-privatekey)
  - `settings`: `PutSettings` (optional)
    - Optional settings for the broadcast operation.
Includes retries, timeouts, userFeeIncrease, etc.
  - Type declarations: [`PutSettings`](TYPE_REFERENCE.md#type-putsettings)

Returns:

- `Promise<bigint>`

Example:
```javascript
import { AssetLockProof, PrivateKey } from '@dashevo/evo-sdk';

const identity = await sdk.identities.fetch(identityId);
if (!identity) throw new Error('Identity not found');
const assetLockProof = AssetLockProof.fromHex(assetLockProofHex);
const assetLockPrivateKey = PrivateKey.fromWIF(assetLockPrivateKeyWif);

const result = await sdk.identities.topUp({ identity, assetLockProof, assetLockPrivateKey });
```

**Identity Update** - `identities.update`
*Update identity keys (add or disable)*

Signature: `update(options: wasm.IdentityUpdateOptions): Promise<void>`

Parameters:
- `options`: `wasm.IdentityUpdateOptions` (required)
  - Type declarations: [`wasm.IdentityUpdateOptions`](TYPE_REFERENCE.md#type-identityupdateoptions)
  - `identity`: `Identity` (required)
    - The identity to update.
  - Type declarations: [`Identity`](TYPE_REFERENCE.md#type-identity)
  - `addPublicKeys`: `IdentityPublicKeyInCreation[]` (optional)
    - Array of public keys to add to the identity.
Use IdentityPublicKeyInCreation to create new keys.
  - Type declarations: [`IdentityPublicKeyInCreation`](TYPE_REFERENCE.md#type-identitypublickeyincreation)
  - `disablePublicKeys`: `number[]` (optional)
    - Array of key IDs to disable.
Cannot disable master, critical auth, or transfer keys.
  - `signer`: `IdentitySigner` (required)
    - Signer containing the private key for the identity's master key.
Use IdentitySigner to add the master key before calling.
  - Type declarations: [`IdentitySigner`](TYPE_REFERENCE.md#type-identitysigner)
  - `settings`: `PutSettings` (optional)
    - Optional settings for the broadcast operation.
Includes retries, timeouts, userFeeIncrease, etc.
  - Type declarations: [`PutSettings`](TYPE_REFERENCE.md#type-putsettings)

Returns:

- `Promise<void>`

Example:
```javascript
const result = await sdk.identities.update({ identity, addPublicKeys, disablePublicKeys, signer });
```

**Identity Credit Transfer** - `identities.creditTransfer`
*Transfer credits between identities*

Signature: `creditTransfer(options: wasm.IdentityCreditTransferOptions): Promise<wasm.IdentityCreditTransferResult>`

Parameters:
- `options`: `wasm.IdentityCreditTransferOptions` (required)
  - Type declarations: [`wasm.IdentityCreditTransferOptions`](TYPE_REFERENCE.md#type-identitycredittransferoptions)
  - `identity`: `Identity` (required)
    - The sender identity.
  - Type declarations: [`Identity`](TYPE_REFERENCE.md#type-identity)
  - `recipientId`: `IdentifierLike` (required)
    - The identity ID of the recipient.
  - Type declarations: [`IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)
  - `amount`: `bigint` (required)
    - The amount of credits to transfer.
  - `signer`: `IdentitySigner` (required)
    - Signer containing the private key for the sender's transfer key.
Use IdentitySigner to add the transfer key before calling.
  - Type declarations: [`IdentitySigner`](TYPE_REFERENCE.md#type-identitysigner)
  - `signingKey`: `IdentityPublicKey` (optional)
    - Optional identity public key to use for signing.
If not provided, auto-selects an available transfer key.
  - Type declarations: [`IdentityPublicKey`](TYPE_REFERENCE.md#type-identitypublickey)
  - `settings`: `PutSettings` (optional)
    - Optional settings for the broadcast operation.
Includes retries, timeouts, userFeeIncrease, etc.
  - Type declarations: [`PutSettings`](TYPE_REFERENCE.md#type-putsettings)

Returns:

- `Promise<wasm.IdentityCreditTransferResult>`
  - Type declarations: [`wasm.IdentityCreditTransferResult`](TYPE_REFERENCE.md#type-identitycredittransferresult)

Example:
```javascript
const result = await sdk.identities.creditTransfer({ identity, recipientId, amount: BigInt(amount), signer, signingKey: identityKey });
```

**Identity Credit Withdrawal** - `identities.creditWithdrawal`
*Withdraw credits from identity to Dash address*

Signature: `creditWithdrawal(options: wasm.IdentityCreditWithdrawalOptions): Promise<bigint>`

Parameters:
- `options`: `wasm.IdentityCreditWithdrawalOptions` (required)
  - Type declarations: [`wasm.IdentityCreditWithdrawalOptions`](TYPE_REFERENCE.md#type-identitycreditwithdrawaloptions)
  - `identity`: `Identity` (required)
    - The identity to withdraw from.
  - Type declarations: [`Identity`](TYPE_REFERENCE.md#type-identity)
  - `amount`: `bigint` (required)
    - The amount of credits to withdraw.
  - `toAddress`: `string` (optional)
    - Optional Dash address to send the withdrawn credits to.
  - `coreFeePerByte`: `number` (optional)
    - Core (L1) fee per byte for the withdrawal transaction.
This determines the mining fee for the Core blockchain transaction.
  - `signer`: `IdentitySigner` (required)
    - Signer containing the private key for the identity's transfer/owner key.
Use IdentitySigner to add the key before calling.
  - Type declarations: [`IdentitySigner`](TYPE_REFERENCE.md#type-identitysigner)
  - `signingKey`: `IdentityPublicKey` (optional)
    - Optional identity public key to use for signing.
If not provided, auto-selects a matching transfer or owner key.
  - Type declarations: [`IdentityPublicKey`](TYPE_REFERENCE.md#type-identitypublickey)
  - `settings`: `PutSettings` (optional)
    - Optional settings for the broadcast operation.
Includes retries, timeouts, userFeeIncrease, etc.
  - Type declarations: [`PutSettings`](TYPE_REFERENCE.md#type-putsettings)

Returns:

- `Promise<bigint>`

Example:
```javascript
const result = await sdk.identities.creditWithdrawal({ identity, amount: BigInt(amount), toAddress, coreFeePerByte, signer, signingKey: identityKey });
```

#### Data Contract Transitions

**Data Contract Create** - `contracts.publish`
*Create a new data contract*

Signature: `publish(options: wasm.ContractPublishOptions): Promise<wasm.DataContract>`

Parameters:
- `options`: `wasm.ContractPublishOptions` (required)
  - Type declarations: [`wasm.ContractPublishOptions`](TYPE_REFERENCE.md#type-contractpublishoptions)
  - `dataContract`: `DataContract` (required)
    - The data contract to create.
Use `new DataContract(...)` or `DataContract.fromJSON(...)` to construct it.
  - Type declarations: [`DataContract`](TYPE_REFERENCE.md#type-datacontract)
  - `identityKey`: `IdentityPublicKey` (required)
    - The identity public key to use for signing the transition.
Get this from the owner identity's public keys.
  - Type declarations: [`IdentityPublicKey`](TYPE_REFERENCE.md#type-identitypublickey)
  - `signer`: `IdentitySigner` (required)
    - Signer containing the private key that corresponds to the identity key.
Use IdentitySigner to add the private key before calling.
  - Type declarations: [`IdentitySigner`](TYPE_REFERENCE.md#type-identitysigner)
  - `settings`: `PutSettings` (optional)
    - Optional settings for the broadcast operation.
Includes retries, timeouts, userFeeIncrease, etc.
  - Type declarations: [`PutSettings`](TYPE_REFERENCE.md#type-putsettings)

Returns:

- `Promise<wasm.DataContract>`
  - Type declarations: [`wasm.DataContract`](TYPE_REFERENCE.md#type-datacontract)

Example:
```javascript
const result = await sdk.contracts.publish({ dataContract, identityKey, signer });
```

**Data Contract Update** - `contracts.update`
*Add document types, groups, or tokens to an existing data contract*

Signature: `update(options: wasm.ContractUpdateOptions): Promise<void>`

Parameters:
- `options`: `wasm.ContractUpdateOptions` (required)
  - Type declarations: [`wasm.ContractUpdateOptions`](TYPE_REFERENCE.md#type-contractupdateoptions)
  - `dataContract`: `DataContract` (required)
    - The updated data contract.
Use the existing contract and modify it, or create a new one with
`DataContract.fromJSON(...)`. Version must be incremented.
  - Type declarations: [`DataContract`](TYPE_REFERENCE.md#type-datacontract)
  - `identityKey`: `IdentityPublicKey` (required)
    - The identity public key to use for signing the transition.
Get this from the owner identity's public keys.
  - Type declarations: [`IdentityPublicKey`](TYPE_REFERENCE.md#type-identitypublickey)
  - `signer`: `IdentitySigner` (required)
    - Signer containing the private key that corresponds to the identity key.
Use IdentitySigner to add the private key before calling.
  - Type declarations: [`IdentitySigner`](TYPE_REFERENCE.md#type-identitysigner)
  - `settings`: `PutSettings` (optional)
    - Optional settings for the broadcast operation.
Includes retries, timeouts, userFeeIncrease, etc.
  - Type declarations: [`PutSettings`](TYPE_REFERENCE.md#type-putsettings)

Returns:

- `Promise<void>`

Example:
```javascript
const result = await sdk.contracts.update({ dataContract, identityKey, signer });
```

#### Document Transitions

**Document Create** - `documents.create`
*Create a new document*

Signature: `create(options: wasm.DocumentCreateOptions): Promise<void>`

Parameters:
- `options`: `wasm.DocumentCreateOptions` (required)
  - Type declarations: [`wasm.DocumentCreateOptions`](TYPE_REFERENCE.md#type-documentcreateoptions)
  - `document`: `Document` (required)
    - The document to create.
Use `new Document(...)` or `Document.fromJSON(...)` to construct it.
Must include dataContractId, documentTypeName, ownerId, and entropy.
  - Type declarations: [`Document`](TYPE_REFERENCE.md#type-document)
  - `identityKey`: `IdentityPublicKey` (required)
    - The identity public key to use for signing the transition.
Get this from the owner identity's public keys.
  - Type declarations: [`IdentityPublicKey`](TYPE_REFERENCE.md#type-identitypublickey)
  - `signer`: `IdentitySigner` (required)
    - Signer containing the private key that corresponds to the identity key.
Use IdentitySigner to add the private key before calling.
  - Type declarations: [`IdentitySigner`](TYPE_REFERENCE.md#type-identitysigner)
  - `tokenPaymentInfo`: `DocumentTokenPaymentInfo` (optional)
    - Optional token payment agreement for document types with tokenCost.create.
  - Type declarations: [`DocumentTokenPaymentInfo`](TYPE_REFERENCE.md#type-documenttokenpaymentinfo)
  - `settings`: `PutSettings` (optional)
    - Optional settings for the broadcast operation.
Includes retries, timeouts, userFeeIncrease, etc.
  - Type declarations: [`PutSettings`](TYPE_REFERENCE.md#type-putsettings)

Returns:

- `Promise<void>`

Example:
```javascript
const result = await sdk.documents.create({ document, identityKey, signer });
```

**Document Replace** - `documents.replace`
*Replace an existing document*

Signature: `replace(options: wasm.DocumentReplaceOptions): Promise<void>`

Parameters:
- `options`: `wasm.DocumentReplaceOptions` (required)
  - Type declarations: [`wasm.DocumentReplaceOptions`](TYPE_REFERENCE.md#type-documentreplaceoptions)
  - `document`: `Document` (required)
    - The document with updated data.
Must have the same ID as the existing document.
Revision should be set to current revision + 1.
  - Type declarations: [`Document`](TYPE_REFERENCE.md#type-document)
  - `identityKey`: `IdentityPublicKey` (required)
    - The identity public key to use for signing the transition.
Get this from the owner identity's public keys.
  - Type declarations: [`IdentityPublicKey`](TYPE_REFERENCE.md#type-identitypublickey)
  - `signer`: `IdentitySigner` (required)
    - Signer containing the private key that corresponds to the identity key.
Use IdentitySigner to add the private key before calling.
  - Type declarations: [`IdentitySigner`](TYPE_REFERENCE.md#type-identitysigner)
  - `tokenPaymentInfo`: `DocumentTokenPaymentInfo` (optional)
    - Optional token payment agreement for document types with tokenCost.replace.
  - Type declarations: [`DocumentTokenPaymentInfo`](TYPE_REFERENCE.md#type-documenttokenpaymentinfo)
  - `settings`: `PutSettings` (optional)
    - Optional settings for the broadcast operation.
Includes retries, timeouts, userFeeIncrease, etc.
  - Type declarations: [`PutSettings`](TYPE_REFERENCE.md#type-putsettings)

Returns:

- `Promise<void>`

Example:
```javascript
const result = await sdk.documents.replace({ document, identityKey, signer });
```

**Document Delete** - `documents.delete`
*Delete an existing document*

Signature: `delete(options: wasm.DocumentDeleteOptions): Promise<void>`

Parameters:
- `options`: `wasm.DocumentDeleteOptions` (required)
  - Type declarations: [`wasm.DocumentDeleteOptions`](TYPE_REFERENCE.md#type-documentdeleteoptions)
  - `document`: `Document | { id: IdentifierLike; ownerId: IdentifierLike; dataContractId: IdentifierLike; documentTypeName: string; }` (required)
    - The document to delete - either a Document instance or an object with identifiers.
  - Type declarations: [`Document`](TYPE_REFERENCE.md#type-document), [`IdentifierLike`](TYPE_REFERENCE.md#type-identifierlike)
  - `identityKey`: `IdentityPublicKey` (required)
    - The identity public key to use for signing the transition.
Get this from the owner identity's public keys.
  - Type declarations: [`IdentityPublicKey`](TYPE_REFERENCE.md#type-identitypublickey)
  - `signer`: `IdentitySigner` (required)
    - Signer containing the private key that corresponds to the identity key.
Use IdentitySigner to add the private key before calling.
  - Type declarations: [`IdentitySigner`](TYPE_REFERENCE.md#type-identitysigner)
  - `tokenPaymentInfo`: `DocumentTokenPaymentInfo` (optional)
    - Optional token payment agreement for document types with tokenCost.delete.
  - Type declarations: [`DocumentTokenPaymentInfo`](TYPE_REFERENCE.md#type-documenttokenpaymentinfo)
  - `settings`: `PutSettings` (optional)
    - Optional settings for the broadcast operation.
Includes retries, timeouts, userFeeIncrease, etc.
  - Type declarations: [`PutSettings`](TYPE_REFERENCE.md#type-putsettings)

Returns:

- `Promise<void>`

Example:
```javascript
const result = await sdk.documents.delete({ document, identityKey, signer });
```

**Document Transfer** - `documents.transfer`
*Transfer document ownership*

Signature: `transfer(options: wasm.DocumentTransferOptions): Promise<void>`

Parameters:
- `options`: `wasm.DocumentTransferOptions` (required)
  - Type declarations: [`wasm.DocumentTransferOptions`](TYPE_REFERENCE.md#type-documenttransferoptions)
  - `document`: `Document` (required)
    - The document to transfer.
Must include id, ownerId, dataContractId, documentTypeName, and revision.
  - Type declarations: [`Document`](TYPE_REFERENCE.md#type-document)
  - `recipientId`: `Identifier` (required)
    - The new owner's identity ID.
  - Type declarations: [`Identifier`](TYPE_REFERENCE.md#type-identifier)
  - `identityKey`: `IdentityPublicKey` (required)
    - The identity public key to use for signing the transition.
Get this from the owner identity's public keys.
  - Type declarations: [`IdentityPublicKey`](TYPE_REFERENCE.md#type-identitypublickey)
  - `signer`: `IdentitySigner` (required)
    - Signer containing the private key that corresponds to the identity key.
Use IdentitySigner to add the private key before calling.
  - Type declarations: [`IdentitySigner`](TYPE_REFERENCE.md#type-identitysigner)
  - `tokenPaymentInfo`: `DocumentTokenPaymentInfo` (optional)
    - Optional token payment agreement for document types with tokenCost.transfer.
  - Type declarations: [`DocumentTokenPaymentInfo`](TYPE_REFERENCE.md#type-documenttokenpaymentinfo)
  - `settings`: `PutSettings` (optional)
    - Optional settings for the broadcast operation.
Includes retries, timeouts, userFeeIncrease, etc.
  - Type declarations: [`PutSettings`](TYPE_REFERENCE.md#type-putsettings)

Returns:

- `Promise<void>`

Example:
```javascript
const result = await sdk.documents.transfer({ document, recipientId, identityKey, signer });
```

**Document Purchase** - `documents.purchase`
*Purchase a document*

Signature: `purchase(options: wasm.DocumentPurchaseOptions): Promise<void>`

Parameters:
- `options`: `wasm.DocumentPurchaseOptions` (required)
  - Type declarations: [`wasm.DocumentPurchaseOptions`](TYPE_REFERENCE.md#type-documentpurchaseoptions)
  - `document`: `Document` (required)
    - The document to purchase.
Must include id, ownerId, dataContractId, documentTypeName, and revision.
  - Type declarations: [`Document`](TYPE_REFERENCE.md#type-document)
  - `buyerId`: `Identifier` (required)
    - The buyer's identity ID.
  - Type declarations: [`Identifier`](TYPE_REFERENCE.md#type-identifier)
  - `price`: `bigint` (required)
    - The purchase price in credits.
Must match the document's listed price.
  - `identityKey`: `IdentityPublicKey` (required)
    - The public key to use for signing the transition.
Get this from the buyer identity's public keys.
  - Type declarations: [`IdentityPublicKey`](TYPE_REFERENCE.md#type-identitypublickey)
  - `signer`: `IdentitySigner` (required)
    - Signer containing the private key that corresponds to the identity key.
Use IdentitySigner to add the private key before calling.
  - Type declarations: [`IdentitySigner`](TYPE_REFERENCE.md#type-identitysigner)
  - `tokenPaymentInfo`: `DocumentTokenPaymentInfo` (optional)
    - Optional token payment agreement for document types with tokenCost.purchase.
  - Type declarations: [`DocumentTokenPaymentInfo`](TYPE_REFERENCE.md#type-documenttokenpaymentinfo)
  - `settings`: `PutSettings` (optional)
    - Optional settings for the broadcast operation.
Includes retries, timeouts, userFeeIncrease, etc.
  - Type declarations: [`PutSettings`](TYPE_REFERENCE.md#type-putsettings)

Returns:

- `Promise<void>`

Example:
```javascript
const result = await sdk.documents.purchase({ document, buyerId, price: BigInt(price), identityKey, signer });
```

**Document Set Price** - `documents.setPrice`
*Set or update document price*

Signature: `setPrice(options: wasm.DocumentSetPriceOptions): Promise<void>`

Parameters:
- `options`: `wasm.DocumentSetPriceOptions` (required)
  - Type declarations: [`wasm.DocumentSetPriceOptions`](TYPE_REFERENCE.md#type-documentsetpriceoptions)
  - `document`: `Document` (required)
    - The document to set a price on.
Must include id, ownerId, dataContractId, documentTypeName, and revision.
  - Type declarations: [`Document`](TYPE_REFERENCE.md#type-document)
  - `price`: `bigint` (required)
    - The price in credits.
Set to 0 to remove the price and make the document not for sale.
  - `identityKey`: `IdentityPublicKey` (required)
    - The identity public key to use for signing the transition.
Get this from the owner identity's public keys.
  - Type declarations: [`IdentityPublicKey`](TYPE_REFERENCE.md#type-identitypublickey)
  - `signer`: `IdentitySigner` (required)
    - Signer containing the private key that corresponds to the identity key.
Use IdentitySigner to add the private key before calling.
  - Type declarations: [`IdentitySigner`](TYPE_REFERENCE.md#type-identitysigner)
  - `tokenPaymentInfo`: `DocumentTokenPaymentInfo` (optional)
    - Optional token payment agreement for document types with tokenCost.update_price.
  - Type declarations: [`DocumentTokenPaymentInfo`](TYPE_REFERENCE.md#type-documenttokenpaymentinfo)
  - `settings`: `PutSettings` (optional)
    - Optional settings for the broadcast operation.
Includes retries, timeouts, userFeeIncrease, etc.
  - Type declarations: [`PutSettings`](TYPE_REFERENCE.md#type-putsettings)

Returns:

- `Promise<void>`

Example:
```javascript
const result = await sdk.documents.setPrice({ document, price: BigInt(price), identityKey, signer });
```

**DPNS Register Name** - `dpns.registerName`
*Register a new DPNS username*

Signature: `registerName(options: wasm.DpnsRegisterNameOptions): Promise<wasm.RegisterDpnsNameResult>`

Parameters:
- `options`: `wasm.DpnsRegisterNameOptions` (required)
  - Type declarations: [`wasm.DpnsRegisterNameOptions`](TYPE_REFERENCE.md#type-dpnsregisternameoptions)
  - `label`: `string` (required)
    - The username label to register (without the .dash suffix).
Must be a valid DPNS username (3-63 characters, alphanumeric and hyphens).
  - `identity`: `Identity` (required)
    - The identity that will own the username.
Fetch the identity first using `getIdentity()`.
  - Type declarations: [`Identity`](TYPE_REFERENCE.md#type-identity)
  - `identityKey`: `IdentityPublicKey` (required)
    - The identity public key to use for signing the transition.
Get this from the identity's public keys.
  - Type declarations: [`IdentityPublicKey`](TYPE_REFERENCE.md#type-identitypublickey)
  - `signer`: `IdentitySigner` (required)
    - Signer containing the private key that corresponds to the identity key.
Use IdentitySigner to add the private key before calling.
  - Type declarations: [`IdentitySigner`](TYPE_REFERENCE.md#type-identitysigner)
  - `preorderCallback`: `(preorderDocument: Document) => void` (optional)
    - Optional callback called after the preorder document is submitted.
Receives the preorder Document object.
  - Type declarations: [`Document`](TYPE_REFERENCE.md#type-document)

Returns:

- `Promise<wasm.RegisterDpnsNameResult>`
  - Type declarations: [`wasm.RegisterDpnsNameResult`](TYPE_REFERENCE.md#type-registerdpnsnameresult)

Example:
```javascript
const result = await sdk.dpns.registerName({ label, identity, identityKey, signer, preorderCallback });
```

#### Token Transitions

**Token Burn** - `tokens.burn`
*Burn tokens*

Signature: `burn(options: wasm.TokenBurnOptions): Promise<wasm.TokenBurnResult>`

Parameters:
- `options`: `wasm.TokenBurnOptions` (required)
  - Type declarations: [`wasm.TokenBurnOptions`](TYPE_REFERENCE.md#type-tokenburnoptions)
  - `dataContractId`: `Identifier` (required)
    - The ID of the data contract containing the token.
  - Type declarations: [`Identifier`](TYPE_REFERENCE.md#type-identifier)
  - `tokenPosition`: `number` (required)
    - The position of the token in the contract (0-indexed).
  - `amount`: `bigint` (required)
    - The amount of tokens to burn.
  - `identityId`: `Identifier` (required)
    - The identity ID of the token holder burning tokens.
  - Type declarations: [`Identifier`](TYPE_REFERENCE.md#type-identifier)
  - `publicNote`: `string` (optional)
    - Optional public note for the burn operation.
  - `identityKey`: `IdentityPublicKey` (required)
    - The identity public key to use for signing the transition.
  - Type declarations: [`IdentityPublicKey`](TYPE_REFERENCE.md#type-identitypublickey)
  - `signer`: `IdentitySigner` (required)
    - Signer containing the private key that corresponds to the identity key.
Use IdentitySigner to add the private key before calling.
  - Type declarations: [`IdentitySigner`](TYPE_REFERENCE.md#type-identitysigner)
  - `groupInfo`: `GroupStateTransitionInfoStatus` (optional)
    - Optional group action info for group-managed token burning.
Use GroupStateTransitionInfoStatus.proposer() to propose a new group action,
or GroupStateTransitionInfoStatus.otherSigner() to vote on an existing action.
  - Type declarations: [`GroupStateTransitionInfoStatus`](TYPE_REFERENCE.md#type-groupstatetransitioninfostatus)
  - `settings`: `PutSettings` (optional)
    - Optional settings for the broadcast operation.
Includes retries, timeouts, userFeeIncrease, etc.
  - Type declarations: [`PutSettings`](TYPE_REFERENCE.md#type-putsettings)

Returns:

- `Promise<wasm.TokenBurnResult>`
  - Type declarations: [`wasm.TokenBurnResult`](TYPE_REFERENCE.md#type-tokenburnresult)

Example:
```javascript
const result = await sdk.tokens.burn({ dataContractId, tokenPosition, amount: BigInt(amount), identityId, publicNote, identityKey, signer });
```

**Token Mint** - `tokens.mint`
*Mint new tokens*

Signature: `mint(options: wasm.TokenMintOptions): Promise<wasm.TokenMintResult>`

Parameters:
- `options`: `wasm.TokenMintOptions` (required)
  - Type declarations: [`wasm.TokenMintOptions`](TYPE_REFERENCE.md#type-tokenmintoptions)
  - `dataContractId`: `Identifier` (required)
    - The ID of the data contract containing the token.
  - Type declarations: [`Identifier`](TYPE_REFERENCE.md#type-identifier)
  - `tokenPosition`: `number` (required)
    - The position of the token in the contract (0-indexed).
  - `amount`: `bigint` (required)
    - The amount of tokens to mint.
  - `identityId`: `Identifier` (required)
    - The identity ID of the minter.
  - Type declarations: [`Identifier`](TYPE_REFERENCE.md#type-identifier)
  - `recipientId`: `Identifier` (optional)
    - Optional recipient identity ID.
If not provided, mints to the minter's identity.
  - Type declarations: [`Identifier`](TYPE_REFERENCE.md#type-identifier)
  - `publicNote`: `string` (optional)
    - Optional public note for the mint operation.
  - `identityKey`: `IdentityPublicKey` (required)
    - The identity public key to use for signing the transition.
Get this from the minter identity's public keys.
  - Type declarations: [`IdentityPublicKey`](TYPE_REFERENCE.md#type-identitypublickey)
  - `signer`: `IdentitySigner` (required)
    - Signer containing the private key that corresponds to the identity key.
Use IdentitySigner to add the private key before calling.
  - Type declarations: [`IdentitySigner`](TYPE_REFERENCE.md#type-identitysigner)
  - `groupInfo`: `GroupStateTransitionInfoStatus` (optional)
    - Optional group action info for group-managed token minting.
Use GroupStateTransitionInfoStatus.proposer() to propose a new group action,
or GroupStateTransitionInfoStatus.otherSigner() to vote on an existing action.
  - Type declarations: [`GroupStateTransitionInfoStatus`](TYPE_REFERENCE.md#type-groupstatetransitioninfostatus)
  - `settings`: `PutSettings` (optional)
    - Optional settings for the broadcast operation.
Includes retries, timeouts, userFeeIncrease, etc.
  - Type declarations: [`PutSettings`](TYPE_REFERENCE.md#type-putsettings)

Returns:

- `Promise<wasm.TokenMintResult>`
  - Type declarations: [`wasm.TokenMintResult`](TYPE_REFERENCE.md#type-tokenmintresult)

Example:
```javascript
const result = await sdk.tokens.mint({ dataContractId, tokenPosition, amount: BigInt(amount), identityId, recipientId, publicNote, identityKey, signer });
```

**Token Claim** - `tokens.claim`
*Claim tokens from a distribution*

Signature: `claim(options: wasm.TokenClaimOptions): Promise<wasm.TokenClaimResult>`

Parameters:
- `options`: `wasm.TokenClaimOptions` (required)
  - Type declarations: [`wasm.TokenClaimOptions`](TYPE_REFERENCE.md#type-tokenclaimoptions)
  - `dataContractId`: `Identifier` (required)
    - The ID of the data contract containing the token.
  - Type declarations: [`Identifier`](TYPE_REFERENCE.md#type-identifier)
  - `tokenPosition`: `number` (required)
    - The position of the token in the contract (0-indexed).
  - `identityId`: `Identifier` (required)
    - The identity ID claiming the tokens.
  - Type declarations: [`Identifier`](TYPE_REFERENCE.md#type-identifier)
  - `distributionType`: `"preProgrammed" | "perpetual"` (required)
    - The type of distribution to claim from: "preProgrammed" or "perpetual".
  - `publicNote`: `string` (optional)
    - Optional public note for the claim operation.
  - `identityKey`: `IdentityPublicKey` (required)
    - The identity public key to use for signing the transition.
  - Type declarations: [`IdentityPublicKey`](TYPE_REFERENCE.md#type-identitypublickey)
  - `signer`: `IdentitySigner` (required)
    - Signer containing the private key that corresponds to the identity key.
Use IdentitySigner to add the private key before calling.
  - Type declarations: [`IdentitySigner`](TYPE_REFERENCE.md#type-identitysigner)
  - `settings`: `PutSettings` (optional)
    - Optional settings for the broadcast operation.
Includes retries, timeouts, userFeeIncrease, etc.
  - Type declarations: [`PutSettings`](TYPE_REFERENCE.md#type-putsettings)

Returns:

- `Promise<wasm.TokenClaimResult>`
  - Type declarations: [`wasm.TokenClaimResult`](TYPE_REFERENCE.md#type-tokenclaimresult)

Example:
```javascript
const result = await sdk.tokens.claim({ dataContractId, tokenPosition, distributionType, identityId, publicNote, identityKey, signer });
```

**Token Set Price** - `tokens.setPrice`
*Set or update the price for direct token purchases*

Signature: `setPrice(options: wasm.TokenSetPriceOptions): Promise<wasm.TokenSetPriceResult>`

Parameters:
- `options`: `wasm.TokenSetPriceOptions` (required)
  - Type declarations: [`wasm.TokenSetPriceOptions`](TYPE_REFERENCE.md#type-tokensetpriceoptions)
  - `dataContractId`: `Identifier` (required)
    - The ID of the data contract containing the token.
  - Type declarations: [`Identifier`](TYPE_REFERENCE.md#type-identifier)
  - `tokenPosition`: `number` (required)
    - The position of the token in the contract (0-indexed).
  - `authorityId`: `Identifier` (required)
    - The identity ID of the token authority setting the price.
  - Type declarations: [`Identifier`](TYPE_REFERENCE.md#type-identifier)
  - `price`: `bigint | null` (required)
    - The price in credits for one token.
Set to null to disable direct purchases.
  - `publicNote`: `string` (optional)
    - Optional public note for the price change.
  - `identityKey`: `IdentityPublicKey` (required)
    - The identity public key to use for signing the transition.
  - Type declarations: [`IdentityPublicKey`](TYPE_REFERENCE.md#type-identitypublickey)
  - `signer`: `IdentitySigner` (required)
    - Signer containing the private key for the authority's authentication key.
Use IdentitySigner to add the authentication key before calling.
  - Type declarations: [`IdentitySigner`](TYPE_REFERENCE.md#type-identitysigner)
  - `groupInfo`: `GroupStateTransitionInfoStatus` (optional)
    - Optional group action info for group-managed price changes.
Use GroupStateTransitionInfoStatus.proposer() to propose a new group action,
or GroupStateTransitionInfoStatus.otherSigner() to vote on an existing action.
  - Type declarations: [`GroupStateTransitionInfoStatus`](TYPE_REFERENCE.md#type-groupstatetransitioninfostatus)
  - `settings`: `PutSettings` (optional)
    - Optional settings for the broadcast operation.
Includes retries, timeouts, userFeeIncrease, etc.
  - Type declarations: [`PutSettings`](TYPE_REFERENCE.md#type-putsettings)

Returns:

- `Promise<wasm.TokenSetPriceResult>`
  - Type declarations: [`wasm.TokenSetPriceResult`](TYPE_REFERENCE.md#type-tokensetpriceresult)

Example:
```javascript
const result = await sdk.tokens.setPrice({ dataContractId, tokenPosition, authorityId, price: BigInt(price), publicNote, identityKey, signer });
```

**Token Direct Purchase** - `tokens.directPurchase`
*Purchase tokens directly at the configured price*

Signature: `directPurchase(options: wasm.TokenDirectPurchaseOptions): Promise<wasm.TokenDirectPurchaseResult>`

Parameters:
- `options`: `wasm.TokenDirectPurchaseOptions` (required)
  - Type declarations: [`wasm.TokenDirectPurchaseOptions`](TYPE_REFERENCE.md#type-tokendirectpurchaseoptions)
  - `dataContractId`: `Identifier` (required)
    - The ID of the data contract containing the token.
  - Type declarations: [`Identifier`](TYPE_REFERENCE.md#type-identifier)
  - `tokenPosition`: `number` (required)
    - The position of the token in the contract (0-indexed).
  - `buyerId`: `Identifier` (required)
    - The identity ID purchasing the tokens.
  - Type declarations: [`Identifier`](TYPE_REFERENCE.md#type-identifier)
  - `amount`: `bigint` (required)
    - The amount of tokens to purchase.
  - `maxTotalCost`: `bigint` (required)
    - The maximum total credits the buyer is willing to pay.
The actual cost may be less if the token price is lower.
  - `identityKey`: `IdentityPublicKey` (required)
    - The identity public key to use for signing the transition.
  - Type declarations: [`IdentityPublicKey`](TYPE_REFERENCE.md#type-identitypublickey)
  - `signer`: `IdentitySigner` (required)
    - Signer containing the private key for the buyer's authentication key.
Use IdentitySigner to add the authentication key before calling.
  - Type declarations: [`IdentitySigner`](TYPE_REFERENCE.md#type-identitysigner)
  - `settings`: `PutSettings` (optional)
    - Optional settings for the broadcast operation.
Includes retries, timeouts, userFeeIncrease, etc.
  - Type declarations: [`PutSettings`](TYPE_REFERENCE.md#type-putsettings)

Returns:

- `Promise<wasm.TokenDirectPurchaseResult>`
  - Type declarations: [`wasm.TokenDirectPurchaseResult`](TYPE_REFERENCE.md#type-tokendirectpurchaseresult)

Example:
```javascript
const result = await sdk.tokens.directPurchase({ dataContractId, tokenPosition, buyerId, amount: BigInt(amount), maxTotalCost: BigInt(maxTotalCost), identityKey, signer });
```

**Token Emergency Action** - `tokens.emergencyAction`
*Perform an emergency action on a token*

Signature: `emergencyAction(options: wasm.TokenEmergencyActionOptions): Promise<wasm.TokenEmergencyActionResult>`

Parameters:
- `options`: `wasm.TokenEmergencyActionOptions` (required)
  - Type declarations: [`wasm.TokenEmergencyActionOptions`](TYPE_REFERENCE.md#type-tokenemergencyactionoptions)
  - `dataContractId`: `Identifier` (required)
    - The ID of the data contract containing the token.
  - Type declarations: [`Identifier`](TYPE_REFERENCE.md#type-identifier)
  - `tokenPosition`: `number` (required)
    - The position of the token in the contract (0-indexed).
  - `authorityId`: `Identifier` (required)
    - The identity ID of the token authority performing the action.
  - Type declarations: [`Identifier`](TYPE_REFERENCE.md#type-identifier)
  - `action`: `"pause" | "resume"` (required)
    - The emergency action to perform: "pause" or "resume".
  - `publicNote`: `string` (optional)
    - Optional public note for the emergency action.
  - `identityKey`: `IdentityPublicKey` (required)
    - The identity public key to use for signing the transition.
  - Type declarations: [`IdentityPublicKey`](TYPE_REFERENCE.md#type-identitypublickey)
  - `signer`: `IdentitySigner` (required)
    - Signer containing the private key for the authority's authentication key.
Use IdentitySigner to add the authentication key before calling.
  - Type declarations: [`IdentitySigner`](TYPE_REFERENCE.md#type-identitysigner)
  - `groupInfo`: `GroupStateTransitionInfoStatus` (optional)
    - Optional group action info for group-managed emergency actions.
Use GroupStateTransitionInfoStatus.proposer() to propose a new group action,
or GroupStateTransitionInfoStatus.otherSigner() to vote on an existing action.
  - Type declarations: [`GroupStateTransitionInfoStatus`](TYPE_REFERENCE.md#type-groupstatetransitioninfostatus)
  - `settings`: `PutSettings` (optional)
    - Optional settings for the broadcast operation.
Includes retries, timeouts, userFeeIncrease, etc.
  - Type declarations: [`PutSettings`](TYPE_REFERENCE.md#type-putsettings)

Returns:

- `Promise<wasm.TokenEmergencyActionResult>`
  - Type declarations: [`wasm.TokenEmergencyActionResult`](TYPE_REFERENCE.md#type-tokenemergencyactionresult)

Example:
```javascript
const result = await sdk.tokens.emergencyAction({ dataContractId, tokenPosition, authorityId, action, publicNote, identityKey, signer });
```

**Token Transfer** - `tokens.transfer`
*Transfer tokens between identities*

Signature: `transfer(options: wasm.TokenTransferOptions): Promise<wasm.TokenTransferResult>`

Parameters:
- `options`: `wasm.TokenTransferOptions` (required)
  - Type declarations: [`wasm.TokenTransferOptions`](TYPE_REFERENCE.md#type-tokentransferoptions)
  - `dataContractId`: `Identifier` (required)
    - The ID of the data contract containing the token.
  - Type declarations: [`Identifier`](TYPE_REFERENCE.md#type-identifier)
  - `tokenPosition`: `number` (required)
    - The position of the token in the contract (0-indexed).
  - `amount`: `bigint` (required)
    - The amount of tokens to transfer.
  - `senderId`: `Identifier` (required)
    - The sender's identity ID.
  - Type declarations: [`Identifier`](TYPE_REFERENCE.md#type-identifier)
  - `recipientId`: `Identifier` (required)
    - The recipient's identity ID.
  - Type declarations: [`Identifier`](TYPE_REFERENCE.md#type-identifier)
  - `publicNote`: `string` (optional)
    - Optional public note for the transfer.
  - `identityKey`: `IdentityPublicKey` (required)
    - The identity public key to use for signing the transition.
  - Type declarations: [`IdentityPublicKey`](TYPE_REFERENCE.md#type-identitypublickey)
  - `signer`: `IdentitySigner` (required)
    - Signer containing the private key for the sender's authentication key.
Use IdentitySigner to add the authentication key before calling.
  - Type declarations: [`IdentitySigner`](TYPE_REFERENCE.md#type-identitysigner)
  - `settings`: `PutSettings` (optional)
    - Optional settings for the broadcast operation.
Includes retries, timeouts, userFeeIncrease, etc.
  - Type declarations: [`PutSettings`](TYPE_REFERENCE.md#type-putsettings)

Returns:

- `Promise<wasm.TokenTransferResult>`
  - Type declarations: [`wasm.TokenTransferResult`](TYPE_REFERENCE.md#type-tokentransferresult)

Example:
```javascript
const result = await sdk.tokens.transfer({ dataContractId, tokenPosition, amount: BigInt(amount), senderId, recipientId, publicNote, identityKey, signer });
```

**Token Freeze** - `tokens.freeze`
*Freeze tokens for a specific identity*

Signature: `freeze(options: wasm.TokenFreezeOptions): Promise<wasm.TokenFreezeResult>`

Parameters:
- `options`: `wasm.TokenFreezeOptions` (required)
  - Type declarations: [`wasm.TokenFreezeOptions`](TYPE_REFERENCE.md#type-tokenfreezeoptions)
  - `dataContractId`: `Identifier` (required)
    - The ID of the data contract containing the token.
  - Type declarations: [`Identifier`](TYPE_REFERENCE.md#type-identifier)
  - `tokenPosition`: `number` (required)
    - The position of the token in the contract (0-indexed).
  - `authorityId`: `Identifier` (required)
    - The identity ID of the token authority performing the freeze.
  - Type declarations: [`Identifier`](TYPE_REFERENCE.md#type-identifier)
  - `frozenIdentityId`: `Identifier` (required)
    - The identity ID to freeze.
  - Type declarations: [`Identifier`](TYPE_REFERENCE.md#type-identifier)
  - `publicNote`: `string` (optional)
    - Optional public note for the freeze operation.
  - `identityKey`: `IdentityPublicKey` (required)
    - The identity public key to use for signing the transition.
  - Type declarations: [`IdentityPublicKey`](TYPE_REFERENCE.md#type-identitypublickey)
  - `signer`: `IdentitySigner` (required)
    - Signer containing the private key for the authority's authentication key.
Use IdentitySigner to add the authentication key before calling.
  - Type declarations: [`IdentitySigner`](TYPE_REFERENCE.md#type-identitysigner)
  - `groupInfo`: `GroupStateTransitionInfoStatus` (optional)
    - Optional group action info for group-managed token freezing.
Use GroupStateTransitionInfoStatus.proposer() to propose a new group action,
or GroupStateTransitionInfoStatus.otherSigner() to vote on an existing action.
  - Type declarations: [`GroupStateTransitionInfoStatus`](TYPE_REFERENCE.md#type-groupstatetransitioninfostatus)
  - `settings`: `PutSettings` (optional)
    - Optional settings for the broadcast operation.
Includes retries, timeouts, userFeeIncrease, etc.
  - Type declarations: [`PutSettings`](TYPE_REFERENCE.md#type-putsettings)

Returns:

- `Promise<wasm.TokenFreezeResult>`
  - Type declarations: [`wasm.TokenFreezeResult`](TYPE_REFERENCE.md#type-tokenfreezeresult)

Example:
```javascript
const result = await sdk.tokens.freeze({ dataContractId, tokenPosition, authorityId, frozenIdentityId, publicNote, identityKey, signer });
```

**Token Unfreeze** - `tokens.unfreeze`
*Unfreeze tokens for a specific identity*

Signature: `unfreeze(options: wasm.TokenUnfreezeOptions): Promise<wasm.TokenUnfreezeResult>`

Parameters:
- `options`: `wasm.TokenUnfreezeOptions` (required)
  - Type declarations: [`wasm.TokenUnfreezeOptions`](TYPE_REFERENCE.md#type-tokenunfreezeoptions)
  - `dataContractId`: `Identifier` (required)
    - The ID of the data contract containing the token.
  - Type declarations: [`Identifier`](TYPE_REFERENCE.md#type-identifier)
  - `tokenPosition`: `number` (required)
    - The position of the token in the contract (0-indexed).
  - `authorityId`: `Identifier` (required)
    - The identity ID of the token authority performing the unfreeze.
  - Type declarations: [`Identifier`](TYPE_REFERENCE.md#type-identifier)
  - `frozenIdentityId`: `Identifier` (required)
    - The identity ID to unfreeze.
  - Type declarations: [`Identifier`](TYPE_REFERENCE.md#type-identifier)
  - `publicNote`: `string` (optional)
    - Optional public note for the unfreeze operation.
  - `identityKey`: `IdentityPublicKey` (required)
    - The identity public key to use for signing the transition.
  - Type declarations: [`IdentityPublicKey`](TYPE_REFERENCE.md#type-identitypublickey)
  - `signer`: `IdentitySigner` (required)
    - Signer containing the private key for the authority's authentication key.
Use IdentitySigner to add the authentication key before calling.
  - Type declarations: [`IdentitySigner`](TYPE_REFERENCE.md#type-identitysigner)
  - `groupInfo`: `GroupStateTransitionInfoStatus` (optional)
    - Optional group action info for group-managed token unfreezing.
Use GroupStateTransitionInfoStatus.proposer() to propose a new group action,
or GroupStateTransitionInfoStatus.otherSigner() to vote on an existing action.
  - Type declarations: [`GroupStateTransitionInfoStatus`](TYPE_REFERENCE.md#type-groupstatetransitioninfostatus)
  - `settings`: `PutSettings` (optional)
    - Optional settings for the broadcast operation.
Includes retries, timeouts, userFeeIncrease, etc.
  - Type declarations: [`PutSettings`](TYPE_REFERENCE.md#type-putsettings)

Returns:

- `Promise<wasm.TokenUnfreezeResult>`
  - Type declarations: [`wasm.TokenUnfreezeResult`](TYPE_REFERENCE.md#type-tokenunfreezeresult)

Example:
```javascript
const result = await sdk.tokens.unfreeze({ dataContractId, tokenPosition, authorityId, frozenIdentityId, publicNote, identityKey, signer });
```

**Token Destroy Frozen** - `tokens.destroyFrozen`
*Destroy frozen tokens*

Signature: `destroyFrozen(options: wasm.TokenDestroyFrozenOptions): Promise<wasm.TokenDestroyFrozenResult>`

Parameters:
- `options`: `wasm.TokenDestroyFrozenOptions` (required)
  - Type declarations: [`wasm.TokenDestroyFrozenOptions`](TYPE_REFERENCE.md#type-tokendestroyfrozenoptions)
  - `dataContractId`: `Identifier` (required)
    - The ID of the data contract containing the token.
  - Type declarations: [`Identifier`](TYPE_REFERENCE.md#type-identifier)
  - `tokenPosition`: `number` (required)
    - The position of the token in the contract (0-indexed).
  - `authorityId`: `Identifier` (required)
    - The identity ID of the token authority performing the destruction.
  - Type declarations: [`Identifier`](TYPE_REFERENCE.md#type-identifier)
  - `frozenIdentityId`: `Identifier` (required)
    - The frozen identity ID whose tokens will be destroyed.
  - Type declarations: [`Identifier`](TYPE_REFERENCE.md#type-identifier)
  - `publicNote`: `string` (optional)
    - Optional public note for the destruction operation.
  - `identityKey`: `IdentityPublicKey` (required)
    - The identity public key to use for signing the transition.
  - Type declarations: [`IdentityPublicKey`](TYPE_REFERENCE.md#type-identitypublickey)
  - `signer`: `IdentitySigner` (required)
    - Signer containing the private key for the authority's authentication key.
Use IdentitySigner to add the authentication key before calling.
  - Type declarations: [`IdentitySigner`](TYPE_REFERENCE.md#type-identitysigner)
  - `groupInfo`: `GroupStateTransitionInfoStatus` (optional)
    - Optional group action info for group-managed token destruction.
Use GroupStateTransitionInfoStatus.proposer() to propose a new group action,
or GroupStateTransitionInfoStatus.otherSigner() to vote on an existing action.
  - Type declarations: [`GroupStateTransitionInfoStatus`](TYPE_REFERENCE.md#type-groupstatetransitioninfostatus)
  - `settings`: `PutSettings` (optional)
    - Optional settings for the broadcast operation.
Includes retries, timeouts, userFeeIncrease, etc.
  - Type declarations: [`PutSettings`](TYPE_REFERENCE.md#type-putsettings)

Returns:

- `Promise<wasm.TokenDestroyFrozenResult>`
  - Type declarations: [`wasm.TokenDestroyFrozenResult`](TYPE_REFERENCE.md#type-tokendestroyfrozenresult)

Example:
```javascript
const result = await sdk.tokens.destroyFrozen({ dataContractId, tokenPosition, authorityId, frozenIdentityId, publicNote, identityKey, signer });
```

#### Voting Transitions

**DPNS Username** - `voting.masternodeVote`
*Cast a vote for a contested DPNS username*

Signature: `masternodeVote(options: wasm.MasternodeVoteOptions): Promise<void>`

Parameters:
- `options`: `wasm.MasternodeVoteOptions` (required)
  - Type declarations: [`wasm.MasternodeVoteOptions`](TYPE_REFERENCE.md#type-masternodevoteoptions)
  - `masternodeProTxHash`: `Identifier` (required)
    - The ProTxHash of the masternode.
  - Type declarations: [`Identifier`](TYPE_REFERENCE.md#type-identifier)
  - `votePoll`: `VotePoll` (required)
    - The vote poll to vote on.
Use VotePoll.createContestedDocumentResourceVotePoll() to create.
  - Type declarations: [`VotePoll`](TYPE_REFERENCE.md#type-votepoll)
  - `voteChoice`: `ResourceVoteChoice` (required)
    - The vote choice.
Use ResourceVoteChoice.towardsIdentity(), ResourceVoteChoice.abstain(), or ResourceVoteChoice.lock().
  - Type declarations: [`ResourceVoteChoice`](TYPE_REFERENCE.md#type-resourcevotechoice)
  - `votingKey`: `IdentityPublicKey` (required)
    - The masternode's voting public key.
This should be the voting key associated with the masternode.
  - Type declarations: [`IdentityPublicKey`](TYPE_REFERENCE.md#type-identitypublickey)
  - `signer`: `IdentitySigner` (required)
    - Signer containing the private key for the masternode's voting key.
Use IdentitySigner to add the voting key before calling.
  - Type declarations: [`IdentitySigner`](TYPE_REFERENCE.md#type-identitysigner)
  - `settings`: `PutSettings` (optional)
    - Optional settings for the broadcast operation.
Includes retries, timeouts, userFeeIncrease, etc.
  - Type declarations: [`PutSettings`](TYPE_REFERENCE.md#type-putsettings)

Returns:

- `Promise<void>`

Example:
```javascript
const result = await sdk.voting.masternodeVote({ masternodeProTxHash, votePoll, voteChoice, votingKey, signer });
```

**Contested Resource** - `voting.masternodeVote`
*Cast a vote for contested resources as a masternode*

Signature: `masternodeVote(options: wasm.MasternodeVoteOptions): Promise<void>`

Parameters:
- `options`: `wasm.MasternodeVoteOptions` (required)
  - Type declarations: [`wasm.MasternodeVoteOptions`](TYPE_REFERENCE.md#type-masternodevoteoptions)
  - `masternodeProTxHash`: `Identifier` (required)
    - The ProTxHash of the masternode.
  - Type declarations: [`Identifier`](TYPE_REFERENCE.md#type-identifier)
  - `votePoll`: `VotePoll` (required)
    - The vote poll to vote on.
Use VotePoll.createContestedDocumentResourceVotePoll() to create.
  - Type declarations: [`VotePoll`](TYPE_REFERENCE.md#type-votepoll)
  - `voteChoice`: `ResourceVoteChoice` (required)
    - The vote choice.
Use ResourceVoteChoice.towardsIdentity(), ResourceVoteChoice.abstain(), or ResourceVoteChoice.lock().
  - Type declarations: [`ResourceVoteChoice`](TYPE_REFERENCE.md#type-resourcevotechoice)
  - `votingKey`: `IdentityPublicKey` (required)
    - The masternode's voting public key.
This should be the voting key associated with the masternode.
  - Type declarations: [`IdentityPublicKey`](TYPE_REFERENCE.md#type-identitypublickey)
  - `signer`: `IdentitySigner` (required)
    - Signer containing the private key for the masternode's voting key.
Use IdentitySigner to add the voting key before calling.
  - Type declarations: [`IdentitySigner`](TYPE_REFERENCE.md#type-identitysigner)
  - `settings`: `PutSettings` (optional)
    - Optional settings for the broadcast operation.
Includes retries, timeouts, userFeeIncrease, etc.
  - Type declarations: [`PutSettings`](TYPE_REFERENCE.md#type-putsettings)

Returns:

- `Promise<void>`

Example:
```javascript
const result = await sdk.voting.masternodeVote({ masternodeProTxHash, votePoll, voteChoice, votingKey, signer });
```

#### Platform Address Transitions

**Address Transfer** - `addresses.transfer`
*Transfer credits between Platform addresses*

**Disabled:** Platform addresses not fully implemented in SDK

Signature: `transfer(options: wasm.AddressFundsTransferOptions): Promise<Map<string, wasm.PlatformAddressInfo>>`

Parameters:
- `options`: `wasm.AddressFundsTransferOptions` (required)
  - - Transfer options including inputs, outputs, and signer
  - Type declarations: [`wasm.AddressFundsTransferOptions`](TYPE_REFERENCE.md#type-addressfundstransferoptions)
  - `inputs`: `PlatformAddressInput[]` (required)
    - Array of input addresses with amounts to spend.
Use PlatformAddressInput for typed inputs (nonces fetched automatically).
  - Type declarations: [`PlatformAddressInput`](TYPE_REFERENCE.md#type-platformaddressinput)
  - `outputs`: `PlatformAddressOutput[]` (required)
    - Array of output addresses with amounts to receive.
Use PlatformAddressOutput for typed outputs.
  - Type declarations: [`PlatformAddressOutput`](TYPE_REFERENCE.md#type-platformaddressoutput)
  - `signer`: `PlatformAddressSigner` (required)
    - Signer containing private keys for all input addresses.
Use PlatformAddressSigner to add keys before calling transfer.
  - Type declarations: [`PlatformAddressSigner`](TYPE_REFERENCE.md#type-platformaddresssigner)
  - `feeStrategy`: `FeeStrategyStep[]` (optional)
    - Fee strategy defining how transaction fees are paid.
Array of FeeStrategyStep, each specifying to deduct from an input or reduce an output.
  - Type declarations: [`FeeStrategyStep`](TYPE_REFERENCE.md#type-feestrategystep)
  - `settings`: `PutSettings` (optional)
    - Optional settings for the broadcast operation.
Includes retries, timeouts, userFeeIncrease, etc.
  - Type declarations: [`PutSettings`](TYPE_REFERENCE.md#type-putsettings)

Returns:

- `Promise<Map<string, wasm.PlatformAddressInfo>>`
  - Type declarations: [`wasm.PlatformAddressInfo`](TYPE_REFERENCE.md#type-platformaddressinfo)

Example:
```javascript
const result = await sdk.addresses.transfer({ inputs, outputs, signer });
```

**Top Up Identity from Address** - `addresses.topUpIdentity`
*Top up an identity using Platform address credits*

**Disabled:** Platform addresses not fully implemented in SDK

Signature: `topUpIdentity(options: wasm.IdentityTopUpFromAddressesOptions): Promise<wasm.IdentityTopUpFromAddressesResult>`

Parameters:
- `options`: `wasm.IdentityTopUpFromAddressesOptions` (required)
  - - Top up options including identity ID, inputs, and signer
  - Type declarations: [`wasm.IdentityTopUpFromAddressesOptions`](TYPE_REFERENCE.md#type-identitytopupfromaddressesoptions)
  - `identity`: `Identity` (required)
    - The identity to top up.
  - Type declarations: [`Identity`](TYPE_REFERENCE.md#type-identity)
  - `inputs`: `PlatformAddressInput[]` (required)
    - Array of input addresses with amounts to use for top up.
Use PlatformAddressInput for typed inputs (nonces fetched automatically).
  - Type declarations: [`PlatformAddressInput`](TYPE_REFERENCE.md#type-platformaddressinput)
  - `signer`: `PlatformAddressSigner` (required)
    - Signer containing private keys for all input addresses.
Use PlatformAddressSigner to add keys before calling top up.
  - Type declarations: [`PlatformAddressSigner`](TYPE_REFERENCE.md#type-platformaddresssigner)
  - `settings`: `PutSettings` (optional)
    - Optional settings for the broadcast operation.
Includes retries, timeouts, userFeeIncrease, etc.
  - Type declarations: [`PutSettings`](TYPE_REFERENCE.md#type-putsettings)

Returns:

- `Promise<wasm.IdentityTopUpFromAddressesResult>`
  - Type declarations: [`wasm.IdentityTopUpFromAddressesResult`](TYPE_REFERENCE.md#type-identitytopupfromaddressesresult)

Example:
```javascript
const result = await sdk.addresses.topUpIdentity({ identity, inputs, signer });
```

**Withdraw to Core** - `addresses.withdraw`
*Withdraw Platform address credits to Dash Core*

**Disabled:** Platform addresses not fully implemented in SDK

Signature: `withdraw(options: wasm.AddressFundsWithdrawOptions): Promise<Map<string, wasm.PlatformAddressInfo>>`

Parameters:
- `options`: `wasm.AddressFundsWithdrawOptions` (required)
  - - Withdrawal options including inputs, output script, pooling, and signer
  - Type declarations: [`wasm.AddressFundsWithdrawOptions`](TYPE_REFERENCE.md#type-addressfundswithdrawoptions)
  - `inputs`: `PlatformAddressInput[]` (required)
    - Array of input addresses with amounts to withdraw.
Use PlatformAddressInput for typed inputs (nonces fetched automatically).
  - Type declarations: [`PlatformAddressInput`](TYPE_REFERENCE.md#type-platformaddressinput)
  - `changeOutput`: `PlatformAddressOutput` (optional)
    - Optional change output address and amount.
If provided, specifies where to send any change from the withdrawal.
  - Type declarations: [`PlatformAddressOutput`](TYPE_REFERENCE.md#type-platformaddressoutput)
  - `feeStrategy`: `FeeStrategyStep[]` (optional)
    - Fee strategy defining how transaction fees are paid.
Array of FeeStrategyStep, each specifying to deduct from an input or reduce an output.
  - Type declarations: [`FeeStrategyStep`](TYPE_REFERENCE.md#type-feestrategystep)
  - `coreFeePerByte`: `number` (required)
    - Core (L1) fee per byte for the withdrawal transaction.
This determines the mining fee for the Core blockchain transaction.
  - `pooling`: `Pooling` (required)
    - Pooling strategy for the withdrawal.
- Pooling.Never: Create individual withdrawal transaction
- Pooling.IfAvailable: Join pool if available, otherwise individual
- Pooling.Standard: Wait to join pool (may take longer)
  - Type declarations: [`Pooling`](TYPE_REFERENCE.md#type-pooling)
  - `outputScript`: `CoreScript` (required)
    - Core output script specifying the L1 destination address.
Use CoreScript.newP2PKH() or CoreScript.newP2SH() to create.
  - Type declarations: [`CoreScript`](TYPE_REFERENCE.md#type-corescript)
  - `signer`: `PlatformAddressSigner` (required)
    - Signer containing private keys for all input addresses.
Use PlatformAddressSigner to add keys before calling withdraw.
  - Type declarations: [`PlatformAddressSigner`](TYPE_REFERENCE.md#type-platformaddresssigner)
  - `settings`: `PutSettings` (optional)
    - Optional settings for the broadcast operation.
Includes retries, timeouts, userFeeIncrease, etc.
  - Type declarations: [`PutSettings`](TYPE_REFERENCE.md#type-putsettings)

Returns:

- `Promise<Map<string, wasm.PlatformAddressInfo>>`
  - Type declarations: [`wasm.PlatformAddressInfo`](TYPE_REFERENCE.md#type-platformaddressinfo)

Example:
```javascript
const result = await sdk.addresses.withdraw({ inputs, coreFeePerByte, pooling, outputScript, signer });
```

**Transfer from Identity to Address** - `addresses.transferFromIdentity`
*Transfer credits from an identity to Platform addresses*

**Disabled:** Platform addresses not fully implemented in SDK

Signature: `transferFromIdentity(options: wasm.IdentityTransferToAddressesOptions): Promise<wasm.IdentityTransferToAddressesResult>`

Parameters:
- `options`: `wasm.IdentityTransferToAddressesOptions` (required)
  - - Transfer options including identity ID, outputs, and signer
  - Type declarations: [`wasm.IdentityTransferToAddressesOptions`](TYPE_REFERENCE.md#type-identitytransfertoaddressesoptions)
  - `identity`: `Identity` (required)
    - The identity to transfer credits from.
  - Type declarations: [`Identity`](TYPE_REFERENCE.md#type-identity)
  - `outputs`: `PlatformAddressOutput[]` (required)
    - Array of output addresses with amounts to receive.
Use PlatformAddressOutput for typed outputs.
  - Type declarations: [`PlatformAddressOutput`](TYPE_REFERENCE.md#type-platformaddressoutput)
  - `signer`: `IdentitySigner` (required)
    - Signer containing the private key(s) for signing with identity transfer key(s).
Use IdentitySigner to add keys before calling transfer.
  - Type declarations: [`IdentitySigner`](TYPE_REFERENCE.md#type-identitysigner)
  - `signingTransferKeyId`: `number` (optional)
    - Optional key ID to use for signing.
If not specified, will auto-select a matching transfer key.
  - `settings`: `PutSettings` (optional)
    - Optional settings for the broadcast operation.
Includes retries, timeouts, userFeeIncrease, etc.
  - Type declarations: [`PutSettings`](TYPE_REFERENCE.md#type-putsettings)

Returns:

- `Promise<wasm.IdentityTransferToAddressesResult>`
  - Type declarations: [`wasm.IdentityTransferToAddressesResult`](TYPE_REFERENCE.md#type-identitytransfertoaddressesresult)

Example:
```javascript
const result = await sdk.addresses.transferFromIdentity({ identity, outputs, signer });
```

**Fund Address from Asset Lock** - `addresses.fundFromAssetLock`
*Fund Platform addresses from an asset lock*

**Disabled:** Platform addresses not fully implemented in SDK

Signature: `fundFromAssetLock(options: wasm.AddressFundingFromAssetLockOptions): Promise<Map<string, wasm.PlatformAddressInfo>>`

Parameters:
- `options`: `wasm.AddressFundingFromAssetLockOptions` (required)
  - - Funding options including asset lock proof, outputs, and signer
  - Type declarations: [`wasm.AddressFundingFromAssetLockOptions`](TYPE_REFERENCE.md#type-addressfundingfromassetlockoptions)
  - `assetLockProof`: `AssetLockProof` (required)
    - Asset lock proof from the Core chain.
Use AssetLockProof.createInstantAssetLockProof() or AssetLockProof.createChainAssetLockProof().
  - Type declarations: [`AssetLockProof`](TYPE_REFERENCE.md#type-assetlockproof)
  - `assetLockPrivateKey`: `PrivateKey` (required)
    - Private key for signing the asset lock proof.
This is the private key that controls the asset lock output.
  - Type declarations: [`PrivateKey`](TYPE_REFERENCE.md#type-privatekey)
  - `outputs`: `PlatformAddressOutput[]` (required)
    - Array of output addresses with amounts to fund.
Use PlatformAddressOutput for typed outputs.
  - Type declarations: [`PlatformAddressOutput`](TYPE_REFERENCE.md#type-platformaddressoutput)
  - `signer`: `PlatformAddressSigner` (required)
    - Signer containing private keys for all output addresses.
Use PlatformAddressSigner to add keys before calling fund.
  - Type declarations: [`PlatformAddressSigner`](TYPE_REFERENCE.md#type-platformaddresssigner)
  - `feeStrategy`: `FeeStrategyStep[]` (optional)
    - Fee strategy defining how transaction fees are paid.
Array of FeeStrategyStep, each specifying to deduct from an input or reduce an output.
  - Type declarations: [`FeeStrategyStep`](TYPE_REFERENCE.md#type-feestrategystep)
  - `settings`: `PutSettings` (optional)
    - Optional settings for the broadcast operation.
Includes retries, timeouts, userFeeIncrease, etc.
  - Type declarations: [`PutSettings`](TYPE_REFERENCE.md#type-putsettings)

Returns:

- `Promise<Map<string, wasm.PlatformAddressInfo>>`
  - Type declarations: [`wasm.PlatformAddressInfo`](TYPE_REFERENCE.md#type-platformaddressinfo)

Example:
```javascript
const result = await sdk.addresses.fundFromAssetLock({ assetLockProof, assetLockPrivateKey, outputs, signer });
```

**Create Identity from Address** - `addresses.createIdentity`
*Create a new identity funded from Platform addresses*

**Disabled:** Platform addresses not fully implemented in SDK

Signature: `createIdentity(options: wasm.IdentityCreateFromAddressesOptions): Promise<wasm.IdentityCreateFromAddressesResult>`

Parameters:
- `options`: `wasm.IdentityCreateFromAddressesOptions` (required)
  - - Creation options including identity, inputs, and signers
  - Type declarations: [`wasm.IdentityCreateFromAddressesOptions`](TYPE_REFERENCE.md#type-identitycreatefromaddressesoptions)
  - `identity`: `Identity` (required)
    - The identity to create (with public keys set up).
Use Identity.create() to build the identity structure first.
  - Type declarations: [`Identity`](TYPE_REFERENCE.md#type-identity)
  - `inputs`: `PlatformAddressInput[]` (required)
    - Array of input addresses with amounts to use for funding.
Use PlatformAddressInput for typed inputs (nonces fetched automatically).
  - Type declarations: [`PlatformAddressInput`](TYPE_REFERENCE.md#type-platformaddressinput)
  - `changeOutput`: `PlatformAddressOutput` (optional)
    - Optional change output address and amount.
If provided, remaining credits will be sent to this address.
  - Type declarations: [`PlatformAddressOutput`](TYPE_REFERENCE.md#type-platformaddressoutput)
  - `identitySigner`: `IdentitySigner` (required)
    - Signer containing private keys for the identity's public keys.
Use IdentitySigner to add keys for signing identity key proofs.
  - Type declarations: [`IdentitySigner`](TYPE_REFERENCE.md#type-identitysigner)
  - `addressSigner`: `PlatformAddressSigner` (required)
    - Signer containing private keys for all input addresses.
Use PlatformAddressSigner to add keys for signing address inputs.
  - Type declarations: [`PlatformAddressSigner`](TYPE_REFERENCE.md#type-platformaddresssigner)
  - `settings`: `PutSettings` (optional)
    - Optional settings for the broadcast operation.
Includes retries, timeouts, userFeeIncrease, etc.
  - Type declarations: [`PutSettings`](TYPE_REFERENCE.md#type-putsettings)

Returns:

- `Promise<wasm.IdentityCreateFromAddressesResult>`
  - Type declarations: [`wasm.IdentityCreateFromAddressesResult`](TYPE_REFERENCE.md#type-identitycreatefromaddressesresult)

Example:
```javascript
const result = await sdk.addresses.createIdentity({ identity, inputs, identitySigner, addressSigner });
```

## Common Patterns

### Error Handling
```javascript
try {
    const identity = await sdk.identities.fetch('5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk');
    console.log(identity);
} catch (error) {
    console.error('Query failed:', error);
}
```

### Working with Proofs
```javascript
const sdk = new EvoSDK({ network: 'testnet', trusted: true, proofs: true });
await sdk.connect();

const identityWithProof = await sdk.identities.fetchWithProof('5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk');
```

### Document Queries with Where/OrderBy
```javascript
const whereClause = JSON.stringify([
    ["normalizedParentDomainName", "==", "dash"],
    ["normalizedLabel", "startsWith", "alice"]
]);

const orderBy = JSON.stringify([
    ["normalizedLabel", "asc"]
]);

const documents = await sdk.documents.query({
    contractId: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
    type: "domain",
    where: whereClause,
    orderBy,
    limit: 10
});
```

### Batch Operations
```javascript
const identityIds = [
    '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk',
    'H72iEt2zG4MEyoh3ZzCEMkYbDWqx1GvK1xHmpM8qH1yL'
];

const balances = await sdk.identities.balances(identityIds);
```

## Important Notes

1. **Network configuration**: Use `EvoSDK.testnetTrusted()` for a ready-to-use testnet client. When mainnet is available, switch to `EvoSDK.mainnetTrusted()` or instantiate `new EvoSDK({ network: "mainnet" })`.
2. **Identity format**: Identity identifiers are Base58-encoded strings. Signing keys are provided as WIF strings.
3. **Credits**: All platform fees are charged in credits (1000 credits = 1 satoshi equivalent). Ensure identities maintain sufficient balance.
4. **Nonces**: Evo SDK facades manage nonces automatically when you submit transitions. Use `sdk.identities.nonce(...)` for manual workflows.
5. **Proofs**: Pass `proofs: true` when constructing `EvoSDK` to validate GroveDB proofs and prefer `*WithProof` helpers.

## Troubleshooting

- **Connection errors**: Verify `await sdk.connect()` completes and that your network/trusted options match the target platform.
- **Invalid parameters**: Check that required fields are present and types align with the documented parameter metadata.
- **Authentication failures**: Confirm private keys are correct, funded, and permitted to sign the requested transition.
- **Query errors**: Ensure contract IDs, document types, and field names exist on the network you are querying.
