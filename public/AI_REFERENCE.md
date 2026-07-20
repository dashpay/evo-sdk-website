# Evo SDK - AI Reference

Return types: generated from `@dashevo/evo-sdk@4.0.0` published declarations under `dist/`. See [named return type declarations](TYPE_REFERENCE.md).

## Overview
The Evo SDK is a thin TypeScript wrapper around the Dash Platform WASM runtime. It exposes ergonomic namespaces (identities, documents, contracts, tokens, and more) optimized for automation and AI-assisted workflows.

## Quick Setup
```javascript
import { EvoSDK } from '@dashevo/evo-sdk';

// Create a trusted testnet client and connect
const sdk = EvoSDK.testnetTrusted();
await sdk.connect();

// Optional: customize connection or enable proofs
// const sdk = new EvoSDK({ network: 'testnet', trusted: true, proofs: true });
```

## Authentication
State transitions authenticate with typed objects, not a `privateKeyWif` field on the call:
- Identity writes: fetch/build the payload, select an `IdentityPublicKey`, and sign with `IdentitySigner`.
- Asset-lock writes (identity create/top-up, fund-from-asset-lock): use `AssetLockProof` + `PrivateKey` for the L1 lock; identity create also needs a separate `IdentitySigner` for key proofs.
- Platform address writes: use `PlatformAddressSigner` for address inputs/outputs; identity-funded address ops use `IdentitySigner`.
Keep credentials secure and never embed production keys in source control:
```javascript
import { IdentitySigner, PrivateKey } from '@dashevo/evo-sdk';

const identityId = '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk';
const privateKeyWif = 'L1ExamplePrivateKeyWifGoesHere';
const assetLockPrivateKeyWif = 'cVExampleAssetLockKeyForIdentityFunding';

const signer = new IdentitySigner();
signer.addKeyFromWif(privateKeyWif);
const assetLockPrivateKey = PrivateKey.fromWIF(assetLockPrivateKeyWif);
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

Parameters:
- `Identity ID` (text, required)
  - Example: `5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk`

Returns:

- `Promise<wasm.Identity | undefined>`
  - Type declarations: [`wasm.Identity`](TYPE_REFERENCE.md#type-identity)

Example:
```javascript
const result = await sdk.identities.fetch('5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk');
```

**Get Identity (Unproved)** - `identities.fetchUnproved`
*Fetch an identity without requesting cryptographic proofs.*

Parameters:
- `Identity ID` (text, required)
  - Example: `5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk`

Returns:

- `Promise<wasm.Identity>`
  - Type declarations: [`wasm.Identity`](TYPE_REFERENCE.md#type-identity)

Example:
```javascript
const result = await sdk.identities.fetchUnproved('5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk');
```

**Get Identity Keys** - `identities.getKeys`
*Retrieve public keys for an identity, including support for specific key IDs or purpose searches.*

Parameters:
- `Identity ID` (text, required)
  - Example: `5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk`

- `Key Request Type` (select, required)
  - Options: `all` (All Keys), `specific` (Specific Key IDs), `search` (Search by Purpose Map)

- `Specific Key IDs` (array, optional)
  - Example: `[0,1,2]`

- `Search Purpose Map` (json, optional)
  - Example: `{"0": {"0": "current"}, "1": {"0": "all"}}`

- `Limit` (number, optional)

- `Offset` (number, optional)

Returns:

- `Promise<wasm.IdentityPublicKey[]>`
  - Type declarations: [`wasm.IdentityPublicKey`](TYPE_REFERENCE.md#type-identitypublickey)

Example:
```javascript
return await sdk.identities.getKeys({
    identityId: '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk',
    request: { type: 'all' },
    limit: 10,
    offset: 0
})
```

**Get Contract Keys for Identities** - `identities.contractKeys`
*Fetch contract-specific keys for one or more identities.*

Parameters:
- `Identity IDs` (array, required)
  - Example: `["5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk"]`

- `Contract ID` (text, required)
  - Example: `GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec`

- `Key Purposes` (multiselect, optional)
  - Options: `0` (Authentication (0)), `1` (Encryption (1)), `2` (Decryption (2)), `3` (Transfer (3)), `5` (Voting (5))

Returns:

- `Promise<wasm.IdentityContractKeys[]>`
  - Type declarations: [`wasm.IdentityContractKeys`](TYPE_REFERENCE.md#type-identitycontractkeys)

Example:
```javascript
return await sdk.identities.contractKeys({
    identityIds: ['5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk'],
    contractId: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec'
})
```

**Get Identity Nonce** - `identities.nonce`
*Retrieve the global nonce associated with an identity.*

Parameters:
- `Identity ID` (text, required)
  - Example: `5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk`

Returns:

- `Promise<bigint | undefined>`

Example:
```javascript
const result = await sdk.identities.nonce('5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk');
```

**Get Identity Contract Nonce** - `identities.contractNonce`
*Retrieve the per-contract nonce for an identity.*

Parameters:
- `Identity ID` (text, required)
  - Example: `5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk`

- `Contract ID` (text, required)
  - Example: `GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec`

Returns:

- `Promise<bigint | undefined>`

Example:
```javascript
const result = await sdk.identities.contractNonce('5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk', 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec');
```

**Get Identity Balance** - `identities.balance`
*Fetch the credit balance for an identity.*

Parameters:
- `Identity ID` (text, required)
  - Example: `5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk`

Returns:

- `Promise<bigint | undefined>`

Example:
```javascript
const result = await sdk.identities.balance('5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk');
```

**Get Multiple Identity Balances** - `identities.balances`
*Fetch balances for multiple identities in a single request.*

Parameters:
- `Identity IDs` (array, required)
  - Example: `["5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk"]`

Returns:

- `Promise<Map<string, bigint | undefined>>`

Example:
```javascript
const result = await sdk.identities.balances(['5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk']);
```

**Get Identity Balance & Revision** - `identities.balanceAndRevision`
*Retrieve both the balance and revision number for an identity.*

Parameters:
- `Identity ID` (text, required)
  - Example: `5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk`

Returns:

- `Promise<wasm.IdentityBalanceAndRevision | undefined>`
  - Type declarations: [`wasm.IdentityBalanceAndRevision`](TYPE_REFERENCE.md#type-identitybalanceandrevision)

Example:
```javascript
const result = await sdk.identities.balanceAndRevision('5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk');
```

**Get Identity by Unique Public Key Hash** - `identities.byPublicKeyHash`
*Lookup an identity via its unique public key hash.*

Parameters:
- `Public Key Hash` (text, required)
  - Example: `b7e904ce25ed97594e72f7af0e66f298031c1754`

Returns:

- `Promise<wasm.Identity | undefined>`
  - Type declarations: [`wasm.Identity`](TYPE_REFERENCE.md#type-identity)

Example:
```javascript
const result = await sdk.identities.byPublicKeyHash('b7e904ce25ed97594e72f7af0e66f298031c1754');
```

**Get Identity by Non-Unique Public Key Hash** - `identities.byNonUniquePublicKeyHash`
*Lookup identities that match a non-unique public key hash.*

Parameters:
- `Public Key Hash` (text, required)
  - Example: `518038dc858461bcee90478fd994bba8057b7531`

- `Start After (Key ID)` (text, optional)

Returns:

- `Promise<wasm.Identity[]>`
  - Type declarations: [`wasm.Identity`](TYPE_REFERENCE.md#type-identity)

Example:
```javascript
const result = await sdk.identities.byNonUniquePublicKeyHash('518038dc858461bcee90478fd994bba8057b7531');
```

**Get Identity Token Balances** - `identities.tokenBalances`
*Retrieve balances for a set of token IDs held by an identity.*

Parameters:
- `Identity ID` (text, required)
  - Example: `5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk`

- `Token IDs` (array, required)
  - Example: `["Hqyu8WcRwXCTwbNxdga4CN5gsVEGc67wng4TFzceyLUv"]`

Returns:

- `Promise<Map<string, bigint>>`

Example:
```javascript
const result = await sdk.identities.tokenBalances('5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk', ['Hqyu8WcRwXCTwbNxdga4CN5gsVEGc67wng4TFzceyLUv']);
```

**Get Token Balances for Identities** - `tokens.balances`
*Fetch balances for multiple identities for a single token.*

Parameters:
- `Identity IDs` (array, required)
  - Example: `["5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk"]`

- `Token ID` (text, required)
  - Example: `Hqyu8WcRwXCTwbNxdga4CN5gsVEGc67wng4TFzceyLUv`

Returns:

- `Promise<Map<string, bigint>>`

Example:
```javascript
const result = await sdk.tokens.balances(['5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk'], 'Hqyu8WcRwXCTwbNxdga4CN5gsVEGc67wng4TFzceyLUv');
```

**Get Identity Token Info** - `tokens.identityTokenInfos`
*Retrieve token metadata and balances for an identity.*

Parameters:
- `Identity ID` (text, required)
  - Example: `5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk`

- `Token IDs (optional)` (array, optional)
  - Example: `["Hqyu8WcRwXCTwbNxdga4CN5gsVEGc67wng4TFzceyLUv"]`

Returns:

- `Promise<Map<string, wasm.IdentityTokenInfo>>`
  - Type declarations: [`wasm.IdentityTokenInfo`](TYPE_REFERENCE.md#type-identitytokeninfo)

Example:
```javascript
const result = await sdk.tokens.identityTokenInfos('5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk', ['Hqyu8WcRwXCTwbNxdga4CN5gsVEGc67wng4TFzceyLUv'], { limit: 10, offset: 0 });
```

**Get Token Info for Identities** - `tokens.identitiesTokenInfos`
*Retrieve token metadata for multiple identities for a single token.*

Parameters:
- `Identity IDs` (array, required)
  - Example: `["5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk"]`

- `Token ID` (text, required)
  - Example: `Hqyu8WcRwXCTwbNxdga4CN5gsVEGc67wng4TFzceyLUv`

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

Parameters:
- `Data Contract ID` (text, required)
  - Example: `GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec`

Returns:

- `Promise<wasm.DataContract | undefined>`
  - Type declarations: [`wasm.DataContract`](TYPE_REFERENCE.md#type-datacontract)

Example:
```javascript
const result = await sdk.contracts.fetch('GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec');
```

**Get Data Contract History** - `contracts.getHistory`
*Retrieve the version history for a data contract.*

Parameters:
- `Data Contract ID` (text, required)
  - Example: `HLY575cNazmc5824FxqaEMEBuzFeE4a98GDRNKbyJqCM`

- `Limit` (number, optional)

- `Start Timestamp (ms)` (number, optional)

Returns:

- `Promise<Map<bigint, wasm.DataContract>>`
  - Type declarations: [`wasm.DataContract`](TYPE_REFERENCE.md#type-datacontract)

Example:
```javascript
return await sdk.contracts.getHistory({
    dataContractId: 'HLY575cNazmc5824FxqaEMEBuzFeE4a98GDRNKbyJqCM',
    limit: 10,
    startAtMs: 0
})
```

**Get Data Contracts** - `contracts.getMany`
*Fetch multiple data contracts by their identifiers.*

Parameters:
- `Data Contract IDs` (array, required)
  - Example: `["GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec","ALybvzfcCwMs7sinDwmtumw17NneuW7RgFtFHgjKmF3A"]`

Returns:

- `Promise<Map<string, wasm.DataContract | undefined>>`
  - Type declarations: [`wasm.DataContract`](TYPE_REFERENCE.md#type-datacontract)

Example:
```javascript
return await sdk.contracts.getMany([
    'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
    'ALybvzfcCwMs7sinDwmtumw17NneuW7RgFtFHgjKmF3A'
])
```

#### Document Queries

**Get Documents** - `documents.query`
*Query documents from a data contract using optional filters.*

Parameters:
- `Data Contract ID` (text, required)
  - Example: `GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec`

- `Document Type` (text, required)
  - Example: `domain`

- `Where Clause (JSON)` (json, optional)
  - Example: `[["normalizedParentDomainName", "==", "dash"], ["normalizedLabel", "==", "therea1s11mshaddy5"]]`

- `Order By (JSON)` (json, optional)
  - Example: `[["$createdAt","desc"]]`

- `Limit` (number, optional)

- `Start After` (text, optional)

- `Start At` (text, optional)

Returns:

- `Promise<Map<string, wasm.Document | undefined>>`
  - Type declarations: [`wasm.Document`](TYPE_REFERENCE.md#type-document)

Example:
```javascript
return await sdk.documents.query({
    dataContractId: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
    documentTypeName: 'domain',
    where: [["normalizedParentDomainName", "==", "dash"]],
    orderBy: [["normalizedLabel", "asc"]],
    limit: 10
})
```

**Get Document** - `documents.get`
*Fetch a specific document by ID.*

Parameters:
- `Data Contract ID` (text, required)
  - Example: `GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec`

- `Document Type` (text, required)
  - Example: `domain`

- `Document ID` (text, required)
  - Example: `7NYmEKQsYtniQRUmxwdPGeVcirMoPh5ZPyAKz8BWFy3r`

Returns:

- `Promise<wasm.Document | undefined>`
  - Type declarations: [`wasm.Document`](TYPE_REFERENCE.md#type-document)

Example:
```javascript
return await sdk.documents.get(
    'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
    'domain',
    '7NYmEKQsYtniQRUmxwdPGeVcirMoPh5ZPyAKz8BWFy3r'
)
```

#### DPNS Queries

**Get Primary Username** - `dpns.username`
*Fetch the primary DPNS username for an identity.*

Parameters:
- `Identity ID` (text, required)
  - Example: `5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk`

Returns:

- `Promise<string | undefined>`

Example:
```javascript
const result = await sdk.dpns.username('5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk');
```

**List Usernames for Identity** - `dpns.usernames`
*Fetch all DPNS usernames owned by an identity.*

Parameters:
- `Identity ID` (text, required)
  - Example: `5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk`

- `Limit` (number, optional)

Returns:

- `Promise<string[]>`

Example:
```javascript
const result = await sdk.dpns.usernames({ identityId: '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk', limit: 10 });
```

**Get Username by Name** - `dpns.getUsernameByName`
*Fetch DPNS username details by full name.*

Parameters:
- `Username` (text, required)
  - Example: `alice.dash`

Returns:

- `Promise<wasm.DpnsUsernameInfo | undefined>`
  - Type declarations: [`wasm.DpnsUsernameInfo`](TYPE_REFERENCE.md#type-dpnsusernameinfo)

Example:
```javascript
const result = await sdk.dpns.getUsernameByName('alice.dash');
```

**Resolve DPNS Name** - `dpns.resolveName`
*Resolve a DPNS name to its identity information.*

Parameters:
- `DPNS Name` (text, required)
  - Example: `alice.dash`

Returns:

- `Promise<string | undefined>`

Example:
```javascript
const result = await sdk.dpns.resolveName('alice.dash');
```

**Check DPNS Availability** - `dpns.isNameAvailable`
*Check if a DPNS label is available for registration.*

Parameters:
- `Label (Username)` (text, required)
  - Example: `alice`

Returns:

- `Promise<boolean>`

Example:
```javascript
const result = await sdk.dpns.isNameAvailable('alice');
```

**Convert to Homograph Safe** - `dpns.convertToHomographSafe`
*Convert a label to its homograph-safe representation.*

Parameters:
- `Label` (text, required)
  - Example: `ąlice`

Returns:

- `Promise<string>`

Example:
```javascript
const result = sdk.dpns.convertToHomographSafe('ąlice');
```

**Validate Username** - `dpns.isValidUsername`
*Validate whether a label conforms to DPNS username rules.*

Parameters:
- `Label` (text, required)
  - Example: `alice`

Returns:

- `Promise<boolean>`

Example:
```javascript
const result = sdk.dpns.isValidUsername('alice');
```

**Is Contested Username** - `dpns.isContestedUsername`
*Check if a label is currently part of a contested DPNS registration.*

Parameters:
- `Label` (text, required)
  - Example: `alice`

Returns:

- `Promise<boolean>`

Example:
```javascript
const result = sdk.dpns.isContestedUsername('alice');
```

#### Voting & Contested Resources

**Get Contested Resources** - `group.contestedResources`
*List contested resources for a document type and index.*

Parameters:
- `Document Type` (text, required)
  - Example: `domain`

- `Data Contract ID` (text, required)
  - Example: `GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec`

- `Index Name` (text, required)

- `Start Index Values` (json, optional)
  - Example: `["dash","alice"]`

- `End Index Values` (json, optional)

- `Start At Value` (text, optional)

- `Limit` (number, optional)

- `Order Ascending` (checkbox, optional)

Returns:

- `Promise<any[]>`

Example:
```javascript
return await sdk.group.contestedResources({
    dataContractId: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
    documentTypeName: 'domain',
    indexName: 'parentNameAndLabel',
    startAtValue: null,
    limit: 10,
    orderAscending: true
})
```

**Get Contested Resource Vote State** - `voting.contestedResourceVoteState`
*Retrieve vote tallies for a contested resource.*

Parameters:
- `Data Contract ID` (text, required)
  - Example: `GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec`

- `Document Type` (text, required)
  - Example: `domain`

- `Index Name` (text, required)

- `Index Values` (array, required)
  - Example: `["dash","alice"]`

- `Result Type` (text, required)
  - Example: `documents`

- `Include Locked & Abstaining Tallies` (checkbox, optional)

- `Start At Contender ID` (text, optional)

- `Include Start Contender` (checkbox, optional)

- `Count` (number, optional)

- `Order Ascending` (checkbox, optional)

Returns:

- `Promise<wasm.ContestedResourceVoteState>`
  - Type declarations: [`wasm.ContestedResourceVoteState`](TYPE_REFERENCE.md#type-contestedresourcevotestate)

Example:
```javascript
return await sdk.voting.contestedResourceVoteState({
    dataContractId: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
    documentTypeName: 'domain',
    indexName: 'parentNameAndLabel',
    indexValues: ['dash', 'alice'],
    resultType: 'documents',
    limit: 10,
    orderAscending: true
})
```

**Get Voters for Identity** - `group.contestedResourceVotersForIdentity`
*List voters that voted for a specific identity in a contested resource.*

Parameters:
- `Data Contract ID` (text, required)
  - Example: `GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec`

- `Document Type` (text, required)
  - Example: `domain`

- `Index Name` (text, required)

- `Index Values` (array, required)
  - Example: `["dash","alice"]`

- `Contestant Identity ID` (text, required)
  - Example: `5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk`

- `Start At Voter ID` (text, optional)

- `Include Start Voter` (checkbox, optional)

- `Limit` (number, optional)

- `Order Ascending` (checkbox, optional)

Returns:

- `Promise<wasm.Identifier[]>`
  - Type declarations: [`wasm.Identifier`](TYPE_REFERENCE.md#type-identifier)

Example:
```javascript
return await sdk.group.contestedResourceVotersForIdentity({
    dataContractId: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
    documentTypeName: 'domain',
    indexName: 'parentNameAndLabel',
    indexValues: ['dash', 'alice'],
    contestantId: '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk',
    limit: 10,
    orderAscending: true
})
```

**Get Identity Votes** - `voting.contestedResourceIdentityVotes`
*Fetch contested resource votes submitted by a particular identity.*

Parameters:
- `Identity ID` (text, required)
  - Example: `5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk`

- `Limit` (number, optional)

- `Start At Vote ID` (text, optional)

- `Include Start Vote` (checkbox, optional)

- `Order Ascending` (checkbox, optional)

Returns:

- `Promise<Map<string, wasm.ResourceVote>>`
  - Type declarations: [`wasm.ResourceVote`](TYPE_REFERENCE.md#type-resourcevote)

Example:
```javascript
return await sdk.voting.contestedResourceIdentityVotes({
    identityId: '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk',
    limit: 10,
    orderAscending: true
})
```

**Get Vote Polls by End Date** - `voting.votePollsByEndDate`
*Fetch vote polls filtered by end time using millisecond timestamps.*

Parameters:
- `Start Time (ms)` (number, optional)

- `Include Start Time` (checkbox, optional)

- `End Time (ms)` (number, optional)

- `Include End Time` (checkbox, optional)

- `Limit` (number, optional)

- `Offset` (number, optional)

- `Order Ascending` (checkbox, optional)

Returns:

- `Promise<wasm.VotePollsByEndDateEntry[]>`
  - Type declarations: [`wasm.VotePollsByEndDateEntry`](TYPE_REFERENCE.md#type-votepollsbyenddateentry)

Example:
```javascript
return await sdk.voting.votePollsByEndDate({
    startTimeMs: null,
    endTimeMs: null,
    limit: 10,
    orderAscending: true,
})
```

#### Protocol & Version

**Get Protocol Version Upgrade State** - `protocol.versionUpgradeState`
*Retrieve protocol upgrade vote tallies.*

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

Parameters:
- `Start ProTxHash` (text, optional)
  - Example: `143dcd6a6b7684fde01e88a10e5d65de9a29244c5ecd586d14a342657025f113`

- `Count` (number, optional)

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

Parameters:
- `Start Epoch` (number, optional)

- `Count` (number, optional)

- `Ascending Order` (checkbox, optional)

Returns:

- `Promise<Map<number, wasm.ExtendedEpochInfo | undefined>>`
  - Type declarations: [`wasm.ExtendedEpochInfo`](TYPE_REFERENCE.md#type-extendedepochinfo)

Example:
```javascript
return await sdk.epoch.epochsInfo({
    startEpoch: 8635,
    count: 5,
    ascending: true
})
```

**Get Current Epoch** - `epoch.current`
*Fetch the current platform epoch.*

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

Parameters:
- `Start Epoch` (number, optional)

- `Count` (number, optional)

- `Ascending Order` (checkbox, optional)

Returns:

- `Promise<Map<number, wasm.FinalizedEpochInfo | undefined>>`
  - Type declarations: [`wasm.FinalizedEpochInfo`](TYPE_REFERENCE.md#type-finalizedepochinfo)

Example:
```javascript
return await sdk.epoch.finalizedInfos({
    startEpoch: 8635,
    count: 5,
    ascending: true
})
```

**Get Epoch Blocks by Evonode IDs** - `epoch.evonodesProposedBlocksByIds`
*Fetch proposed blocks for specific evonode ProTx hashes.*

Parameters:
- `Epoch` (number, required)

- `Evonode ProTx Hashes` (array, required)
  - Example: `["143dcd6a6b7684fde01e88a10e5d65de9a29244c5ecd586d14a342657025f113"]`

Returns:

- `Promise<Map<string, bigint>>`

Example:
```javascript
return await sdk.epoch.evonodesProposedBlocksByIds(
    8635,
    ['143dcd6a6b7684fde01e88a10e5d65de9a29244c5ecd586d14a342657025f113']
)
```

**Get Epoch Blocks by Range** - `epoch.evonodesProposedBlocksByRange`
*Fetch proposed blocks in range order.*

Parameters:
- `Epoch` (number, required)

- `Limit` (number, optional)

- `Start After (ProTxHash)` (text, optional)
  - Example: `143dcd6a6b7684fde01e88a10e5d65de9a29244c5ecd586d14a342657025f113`

- `Order Ascending` (checkbox, optional)

Returns:

- `Promise<Map<string, bigint>>`

Example:
```javascript
return await sdk.epoch.evonodesProposedBlocksByRange({
    epoch: 8635,
    limit: 5,
    orderAscending: true
})
```

#### Token Queries

**Calculate Token ID** - `tokens.calculateId`
*Calculate a token ID from a contract ID and token position. This is a utility method that does not require network connection.*

Parameters:
- `Contract ID` (text, required)
  - Example: `ALybvzfcCwMs7sinDwmtumw17NneuW7RgFtFHgjKmF3A`

- `Token Position` (number, required)
  - Example: `0`

Returns:

- `Promise<string>`

Example:
```javascript
const result = await sdk.tokens.calculateId('ALybvzfcCwMs7sinDwmtumw17NneuW7RgFtFHgjKmF3A', 0);
```

**Get Token Statuses** - `tokens.statuses`
*Retrieve status information for one or more tokens.*

Parameters:
- `Token IDs` (array, required)
  - Example: `["Hqyu8WcRwXCTwbNxdga4CN5gsVEGc67wng4TFzceyLUv"]`

Returns:

- `Promise<Map<string, wasm.TokenStatus>>`
  - Type declarations: [`wasm.TokenStatus`](TYPE_REFERENCE.md#type-tokenstatus)

Example:
```javascript
return await sdk.tokens.statuses([
    'Hqyu8WcRwXCTwbNxdga4CN5gsVEGc67wng4TFzceyLUv',
    'H7FRpZJqZK933r9CzZMsCuf1BM34NT5P2wSJyjDkprqy'
])
```

**Get Direct Purchase Prices** - `tokens.directPurchasePrices`
*Fetch direct purchase prices for tokens.*

Parameters:
- `Token IDs` (array, required)
  - Example: `["Hqyu8WcRwXCTwbNxdga4CN5gsVEGc67wng4TFzceyLUv"]`

Returns:

- `Promise<Map<string, wasm.TokenPriceInfo>>`
  - Type declarations: [`wasm.TokenPriceInfo`](TYPE_REFERENCE.md#type-tokenpriceinfo)

Example:
```javascript
return await sdk.tokens.directPurchasePrices([
    'Hqyu8WcRwXCTwbNxdga4CN5gsVEGc67wng4TFzceyLUv'
])
```

**Get Token Contract Info** - `tokens.contractInfo`
*Retrieve metadata for a token contract.*

Parameters:
- `Token Contract ID` (text, required)
  - Example: `ALybvzfcCwMs7sinDwmtumw17NneuW7RgFtFHgjKmF3A`

Returns:

- `Promise<wasm.TokenContractInfo | undefined>`
  - Type declarations: [`wasm.TokenContractInfo`](TYPE_REFERENCE.md#type-tokencontractinfo)

Example:
```javascript
const result = await sdk.tokens.contractInfo('ALybvzfcCwMs7sinDwmtumw17NneuW7RgFtFHgjKmF3A');
```

**Get Token Distribution Last Claim** - `tokens.perpetualDistributionLastClaim`
*Fetch the last perpetual distribution claim for an identity and token.*

Parameters:
- `Identity ID` (text, required)
  - Example: `5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk`

- `Token ID` (text, required)
  - Example: `Hqyu8WcRwXCTwbNxdga4CN5gsVEGc67wng4TFzceyLUv`

Returns:

- `Promise<wasm.RewardDistributionMoment | undefined>`
  - Type declarations: [`wasm.RewardDistributionMoment`](TYPE_REFERENCE.md#type-rewarddistributionmoment)

Example:
```javascript
return await sdk.tokens.perpetualDistributionLastClaim(
    '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk',
    'Hqyu8WcRwXCTwbNxdga4CN5gsVEGc67wng4TFzceyLUv'
)
```

**Get Token Total Supply** - `tokens.totalSupply`
*Fetch the total supply for a token.*

Parameters:
- `Token ID` (text, required)
  - Example: `Hqyu8WcRwXCTwbNxdga4CN5gsVEGc67wng4TFzceyLUv`

Returns:

- `Promise<wasm.TokenTotalSupply | undefined>`
  - Type declarations: [`wasm.TokenTotalSupply`](TYPE_REFERENCE.md#type-tokentotalsupply)

Example:
```javascript
const result = await sdk.tokens.totalSupply('Hqyu8WcRwXCTwbNxdga4CN5gsVEGc67wng4TFzceyLUv');
```

**Get Token Price by Contract** - `tokens.priceByContract`
*Retrieve the price details for a token indexed by contract position.*

Parameters:
- `Token Contract ID` (text, required)
  - Example: `ALybvzfcCwMs7sinDwmtumw17NneuW7RgFtFHgjKmF3A`

- `Token Position` (number, required)
  - Example: `0`

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

Parameters:
- `Group Contract ID` (text, required)
  - Example: `49PJEnNx7ReCitzkLdkDNr4s6RScGsnNexcdSZJ1ph5N`

- `Group Position` (number, required)
  - Example: `0`

Returns:

- `Promise<wasm.Group | undefined>`
  - Type declarations: [`wasm.Group`](TYPE_REFERENCE.md#type-group)

Example:
```javascript
const result = await sdk.group.info('49PJEnNx7ReCitzkLdkDNr4s6RScGsnNexcdSZJ1ph5N', 0);
```

**List Group Infos** - `group.infos`
*List group information entries for a contract.*

Parameters:
- `Group Contract ID` (text, required)
  - Example: `49PJEnNx7ReCitzkLdkDNr4s6RScGsnNexcdSZJ1ph5N`

- `Start At Info` (text, optional)

- `Count` (number, optional)

Returns:

- `Promise<Map<number, wasm.Group | undefined>>`
  - Type declarations: [`wasm.Group`](TYPE_REFERENCE.md#type-group)

Example:
```javascript
const result = await sdk.group.infos({ dataContractId: '49PJEnNx7ReCitzkLdkDNr4s6RScGsnNexcdSZJ1ph5N', startAt: null, limit: 10 });
```

**Get Group Members** - `group.members`
*Retrieve member entries for a group.*

Parameters:
- `Group Contract ID` (text, required)
  - Example: `49PJEnNx7ReCitzkLdkDNr4s6RScGsnNexcdSZJ1ph5N`

- `Group Position` (number, required)
  - Example: `0`

- `Member Identity IDs` (array, optional)

- `Start At Member Info` (text, optional)

- `Limit` (number, optional)

Returns:

- `Promise<Map<string, bigint>>`

Example:
```javascript
const result = await sdk.group.members({ dataContractId: '49PJEnNx7ReCitzkLdkDNr4s6RScGsnNexcdSZJ1ph5N', groupContractPosition: 0, limit: 10 });
```

**Get Group Actions** - `group.actions`
*Fetch actions associated with a group.*

Parameters:
- `Group Contract ID` (text, required)
  - Example: `49PJEnNx7ReCitzkLdkDNr4s6RScGsnNexcdSZJ1ph5N`

- `Group Position` (number, required)
  - Example: `0`

- `Action Status` (select, required)
  - Options: `PENDING`, `ACTIVE`, `EXECUTED`, `CANCELLED`

- `Start At Action Info` (text, optional)

- `Count` (number, optional)

Returns:

- `Promise<Map<string, wasm.GroupAction | undefined>>`
  - Type declarations: [`wasm.GroupAction`](TYPE_REFERENCE.md#type-groupaction)

Example:
```javascript
const result = await sdk.group.actions({ dataContractId: '49PJEnNx7ReCitzkLdkDNr4s6RScGsnNexcdSZJ1ph5N', groupContractPosition: 0, status: 'ACTIVE', limit: 10 });
```

**Get Group Action Signers** - `group.actionSigners`
*List signers for a specific group action.*

Parameters:
- `Group Contract ID` (text, required)
  - Example: `49PJEnNx7ReCitzkLdkDNr4s6RScGsnNexcdSZJ1ph5N`

- `Group Position` (number, required)
  - Example: `0`

- `Action Status` (select, required)
  - Options: `PENDING`, `ACTIVE`, `EXECUTED`, `CANCELLED`

- `Action ID` (text, required)

Returns:

- `Promise<Map<string, bigint>>`

Example:
```javascript
const result = await sdk.group.actionSigners({ dataContractId: '49PJEnNx7ReCitzkLdkDNr4s6RScGsnNexcdSZJ1ph5N', groupContractPosition: 0, status: 'ACTIVE', actionId: '6XJzL6Qb8Zhwxt4HFwh8NAn7q1u4dwdoUf8EmgzDudFZ' });
```

**Get Identity Groups** - `group.identityGroups`
*Fetch group memberships for an identity.*

Parameters:
- `Identity ID` (text, required)
  - Example: `5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk`

- `Member Data Contracts` (array, optional)

- `Owner Data Contracts` (array, optional)

- `Moderator Data Contracts` (array, optional)

Returns:

- `Promise<wasm.IdentityGroupInfo[]>`
  - Type declarations: [`wasm.IdentityGroupInfo`](TYPE_REFERENCE.md#type-identitygroupinfo)

Example:
```javascript
const result = await sdk.group.identityGroups({ identityId: '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk' });
```

**Get Groups Data Contracts** - `group.groupsDataContracts`
*Fetch group configuration documents for the supplied data contracts.*

Parameters:
- `Data Contract IDs` (array, required)
  - Example: `["GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec"]`

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

Parameters:
- `Specialized Balance ID` (text, required)
  - Example: `AzaU7zqCT7X1kxh8yWxkT9PxAgNqWDu4Gz13emwcRyAT`

Returns:

- `Promise<wasm.PrefundedSpecializedBalance>`
  - Type declarations: [`wasm.PrefundedSpecializedBalance`](TYPE_REFERENCE.md#type-prefundedspecializedbalance)

Example:
```javascript
const result = await sdk.system.prefundedSpecializedBalance('AzaU7zqCT7X1kxh8yWxkT9PxAgNqWDu4Gz13emwcRyAT');
```

**Get Total Credits in Platform** - `system.totalCreditsInPlatform`
*Fetch the total credit balance stored in the platform.*

No parameters required.

Returns:

- `Promise<bigint>`

Example:
```javascript
const result = await sdk.system.totalCreditsInPlatform();
```

**Get Path Elements** - `system.pathElements`
*Access items in the GroveDB state tree by specifying a path and keys.*

Parameters:
- `Path Segments` (array, required)
  - Example: `["32"]`

- `Keys` (array, required)
  - Example: `["5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk"]`

Returns:

- `Promise<wasm.PathElement[]>`
  - Type declarations: [`wasm.PathElement`](TYPE_REFERENCE.md#type-pathelement)

Example:
```javascript
const result = await sdk.system.pathElements(['96'], ['5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk']);
```

**Wait for State Transition Result** - `stateTransitions.waitForStateTransitionResult`
*Wait for a state transition to be processed and return the result.*

Parameters:
- `State Transition Hash` (text, required)
  - Example: `0000000000000000000000000000000000000000000000000000000000000000`

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

Parameters:
- `Platform Address` (text, required)
  - Example: `tdash1krt0z5hrcaphyuraxmk2h2ff8nyv5fmncsgf7evf`

Returns:

- `Promise<wasm.PlatformAddressInfo | undefined>`
  - Type declarations: [`wasm.PlatformAddressInfo`](TYPE_REFERENCE.md#type-platformaddressinfo)

Example:
```javascript
const result = await sdk.addresses.get('tdash1krt0z5hrcaphyuraxmk2h2ff8nyv5fmncsgf7evf');
```

**Get Multiple Platform Addresses** - `addresses.getMany`
*Fetch information about multiple Platform addresses.*

Parameters:
- `Platform Addresses` (array, required)
  - Example: `["tdash1krt0z5hrcaphyuraxmk2h2ff8nyv5fmncsgf7evf"]`

Returns:

- `Promise<Map<string, wasm.PlatformAddressInfo | undefined>>`
  - Type declarations: [`wasm.PlatformAddressInfo`](TYPE_REFERENCE.md#type-platformaddressinfo)

Example:
```javascript
const result = await sdk.addresses.getMany(['tdash1krt0z5hrcaphyuraxmk2h2ff8nyv5fmncsgf7evf']);
```

## State Transition Operations

### Pattern
State transitions take a typed options object. Typical identity-signed writes look like:
```javascript
const identity = await sdk.identities.fetch(identityId);
const signer = new IdentitySigner();
signer.addKeyFromWif(privateKeyWif);
const identityKey = identity.getPublicKeyById(keyId);

const result = await sdk.<namespace>.<transition>({
  /* payload fields: identity / document / dataContract / ... */
  identityKey, // when required by the method
  signer,
});
```
Asset-lock methods take `assetLockProof` + `assetLockPrivateKey` instead of (or in addition to) an `IdentitySigner`. See each operation example below.

### Available State Transitions
#### Identity Transitions

**Identity Create** - `identities.create`
*Create a new identity with initial credits*

Parameters:
- `Identity` (Identity, required)
  - Identity object with public keys attached (new Identity(...) + addPublicKey / IdentityPublicKeyInCreation).

- `Asset Lock Proof` (AssetLockProof, required)
  - AssetLockProof from Core (AssetLockProof.fromHex / createInstantAssetLockProof / createChainAssetLockProof).

- `Asset Lock Private Key` (PrivateKey, required)
  - PrivateKey controlling the asset-lock output (PrivateKey.fromWIF). Separate from the IdentitySigner.

- `Identity Signer` (IdentitySigner, required)
  - IdentitySigner holding private keys that prove ownership of the identity public keys being registered.

Returns:

- `Promise<void>`

Example:
```javascript
import {
  AssetLockProof,
  Identity,
  IdentityPublicKeyInCreation,
  IdentitySigner,
  KeyType,
  PrivateKey,
  Purpose,
  SecurityLevel,
} from '@dashevo/evo-sdk';

// Asset-lock proof and the separate private key controlling its Core output.
const assetLockProof = AssetLockProof.fromHex('a9147d3b...(hex-encoded)');

const assetLockPrivateKey = PrivateKey.fromWIF('cVExampleAssetLockKeyForIdentityFunding');

// Identity key registered on Platform and held by IdentitySigner for key proofs.
const identityPrivateKey = PrivateKey.fromWIF('L1ExamplePrivateKeyWifGoesHere');
const identity = new Identity(assetLockProof.createIdentityId());
const masterKey = new IdentityPublicKeyInCreation({
  keyId: 0,
  purpose: Purpose.AUTHENTICATION,
  securityLevel: SecurityLevel.MASTER,
  keyType: KeyType.ECDSA_SECP256K1,
  data: identityPrivateKey.getPublicKey().toBytes(),
}).toIdentityPublicKey();
identity.addPublicKey(masterKey);

const signer = new IdentitySigner();
signer.addKey(identityPrivateKey);

await sdk.identities.create({
  identity,
  assetLockProof,
  assetLockPrivateKey,
  signer,
});
```

**Identity Top Up** - `identities.topUp`
*Add credits to an existing identity*

Parameters:
- `Identity` (Identity, required)
  - Fetched Identity object to top up (sdk.identities.fetch).

- `Asset Lock Proof` (AssetLockProof, required)
  - AssetLockProof from Core funding the top-up.

- `Asset Lock Private Key` (PrivateKey, required)
  - PrivateKey for the asset-lock output. Top-up does not use IdentitySigner.

Returns:

- `Promise<bigint>`

Example:
```javascript
import { AssetLockProof, PrivateKey } from '@dashevo/evo-sdk';

const identity = await sdk.identities.fetch('5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk');
const assetLockProof = AssetLockProof.fromHex('a9147d3b...(hex-encoded)');
// Asset-lock signing only — top-up does not use IdentitySigner.
const assetLockPrivateKey = PrivateKey.fromWIF('cVExampleAssetLockKeyForIdentityFunding');

const newBalance = await sdk.identities.topUp({
  identity,
  assetLockProof,
  assetLockPrivateKey,
});
```

**Identity Update** - `identities.update`
*Update identity keys (add or disable)*

Parameters (payload fields):
- `Keys to Add (JSON array)` (textarea, optional)
  - Example: `[{"keyType":"ECDSA_HASH160","purpose":"AUTHENTICATION","data":"base64_key_data"}]`

- `Key IDs to Disable (comma-separated)` (text, optional)
  - Example: `2,3,5`

Returns:

- `Promise<void>`

Example:
```javascript
import { IdentitySigner } from '@dashevo/evo-sdk';

const identity = await sdk.identities.fetch('5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk');

const signer = new IdentitySigner();
// Master key is required to add/disable identity keys.
signer.addKeyFromWif('L1ExamplePrivateKeyWifGoesHere');

await sdk.identities.update({
  identity,
  addPublicKeys: undefined, // optional IdentityPublicKeyInCreation[]
  disablePublicKeys: [2],   // optional key ids to disable
  signer,
});
```

**Identity Credit Transfer** - `identities.creditTransfer`
*Transfer credits between identities*

Parameters (payload fields):
- `Recipient Identity ID` (text, required)

- `Amount (credits)` (number, required)

Returns:

- `Promise<wasm.IdentityCreditTransferResult>`
  - Type declarations: [`wasm.IdentityCreditTransferResult`](TYPE_REFERENCE.md#type-identitycredittransferresult)

Example:
```javascript
import { IdentitySigner } from '@dashevo/evo-sdk';

const identity = await sdk.identities.fetch('5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk');

const signer = new IdentitySigner();
signer.addKeyFromWif('L1ExamplePrivateKeyWifGoesHere');

// Optional: pass signingKey when you need a specific transfer/auth key.
const signingKey = identity.getPublicKeyById(3) // TRANSFER key when present
  || identity.publicKeys.find(k => k.purpose === 'AUTHENTICATION');

await sdk.identities.creditTransfer({
  identity,
  recipientId: 'H72iEt2zG4MEyoh3ZzCEMkYbDWqx1GvK1xHmpM8qH1yL',
  amount: 1000000n,
  signer,
  signingKey,
});
```

**Identity Credit Withdrawal** - `identities.creditWithdrawal`
*Withdraw credits from identity to Dash address*

Parameters (payload fields):
- `Dash Address` (text, required)

- `Amount (credits)` (number, required)

- `Core Fee Per Byte (optional)` (number, optional)

Returns:

- `Promise<bigint>`

Example:
```javascript
import { IdentitySigner } from '@dashevo/evo-sdk';

const identity = await sdk.identities.fetch('5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk');

const signer = new IdentitySigner();
signer.addKeyFromWif('L1ExamplePrivateKeyWifGoesHere');

const signingKey = identity.getPublicKeyById(3)
  || identity.publicKeys.find(k => k.purpose === 'AUTHENTICATION');

const remainingBalance = await sdk.identities.creditWithdrawal({
  identity,
  amount: 1000000n,
  toAddress: 'yT8DDY5NkX4Zt44Fy8QjmCekheJQH4EMkv',
  coreFeePerByte: 1,
  signer,
  signingKey,
});
```

#### Data Contract Transitions

**Data Contract Create** - `contracts.publish`
*Create a new data contract*

Parameters (payload fields):
- `Can Be Deleted` (checkbox, optional)

- `Read Only` (checkbox, optional)

- `Keeps History` (checkbox, optional)

- `Documents Keep History (Default)` (checkbox, optional)

- `Documents Mutable (Default)` (checkbox, optional)

- `Documents Can Be Deleted (Default)` (checkbox, optional)

- `Requires Identity Encryption Key (optional)` (text, optional)

- `Requires Identity Decryption Key (optional)` (text, optional)

- `Document Schemas JSON` (json, required)
  - Example: `{
  "note": {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "maxLength": 100,
        "position": 0
      }
    },
    "required": ["message"],
    "additionalProperties": false
  }
}`

- `Groups (optional)` (json, optional)
  - Example: `{}`

- `Tokens (optional)` (json, optional)
  - Example: `{}`

- `Keywords (comma separated, optional)` (text, optional)

- `Description (optional)` (text, optional)

Returns:

- `Promise<wasm.DataContract>`
  - Type declarations: [`wasm.DataContract`](TYPE_REFERENCE.md#type-datacontract)

Example:
```javascript
import { DataContract, IdentitySigner } from '@dashevo/evo-sdk';

const ownerId = '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk';

const signer = new IdentitySigner();
signer.addKeyFromWif('L1ExamplePrivateKeyWifGoesHere');

const keys = await sdk.identities.getKeys({
  identityId: ownerId,
  request: { type: 'all' },
});
// Contract publish requires a CRITICAL authentication key.
const identityKey = keys.find(
  k => k.purpose === 'AUTHENTICATION' && k.securityLevel === 'CRITICAL',
);

const identityNonce = (await sdk.identities.nonce(ownerId)) ?? 0n;
const dataContract = new DataContract({
  ownerId,
  identityNonce: identityNonce + 1n,
  schemas: {
    note: {
      type: 'object',
      properties: {
        message: { type: 'string', maxLength: 200, position: 0 },
      },
      required: ['message'],
      additionalProperties: false,
    },
  },
});

const published = await sdk.contracts.publish({
  dataContract,
  identityKey,
  signer,
});
```

**Data Contract Update** - `contracts.update`
*Add document types, groups, or tokens to an existing data contract*

Parameters (payload fields):
- `Data Contract ID` (text, required)

- `New Document Schemas to Add (optional)` (json, optional)
  - Example: `{
  "newType": {
    "type": "object",
    "properties": {
      "field": {
        "type": "string",
        "maxLength": 100,
        "position": 0
      }
    },
    "required": ["field"],
    "additionalProperties": false
  }
}`

- `New Groups to Add (optional)` (json, optional)
  - Example: `{}`

- `New Tokens to Add (optional)` (json, optional)
  - Example: `{}`

Returns:

- `Promise<void>`

Example:
```javascript
import { IdentitySigner } from '@dashevo/evo-sdk';

const ownerId = '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk';
const contractId = 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec';
const dataContract = await sdk.contracts.fetch(contractId);
dataContract.version = (dataContract.version || 1) + 1;
// Optionally merge additional document type schemas before update:
// dataContract.setSchemas(mergedSchemas, undefined, false, sdk.version());

const signer = new IdentitySigner();
signer.addKeyFromWif('L1ExamplePrivateKeyWifGoesHere');

const keys = await sdk.identities.getKeys({
  identityId: ownerId,
  request: { type: 'all' },
});
const identityKey = keys.find(
  k => k.purpose === 'AUTHENTICATION' && k.securityLevel === 'CRITICAL',
);

await sdk.contracts.update({ dataContract, identityKey, signer });
```

#### Document Transitions

**Document Create** - `documents.create`
*Create a new document*

Parameters (payload fields):
- `Data Contract ID` (text, required)

- `Document Type` (text, required)

- `Fetch Schema` (button, optional)

- `Document Fields` (dynamic, optional)

Returns:

- `Promise<void>`

Example:
```javascript
import { Document, IdentitySigner } from '@dashevo/evo-sdk';

const ownerId = '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk';

const signer = new IdentitySigner();
signer.addKeyFromWif('L1ExamplePrivateKeyWifGoesHere');

const keys = await sdk.identities.getKeys({
  identityId: ownerId,
  request: { type: 'all' },
});
const identityKey = keys.find(
  k => k.purpose === 'AUTHENTICATION' && ['CRITICAL', 'HIGH', 'MEDIUM'].includes(k.securityLevel),
);

const document = new Document({
  dataContractId: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
  documentTypeName: 'domain',
  ownerId,
  properties: { /* fields required by the document type schema */ },
});

await sdk.documents.create({ document, identityKey, signer });
```

**Document Replace** - `documents.replace`
*Replace an existing document*

Parameters (payload fields):
- `Data Contract ID` (text, required)

- `Document Type` (text, required)

- `Document ID` (text, required)

- `Load Document` (button, optional)

- `Document Fields` (dynamic, optional)

Returns:

- `Promise<void>`

Example:
```javascript
import { Document, IdentitySigner } from '@dashevo/evo-sdk';

const ownerId = '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk';

const signer = new IdentitySigner();
signer.addKeyFromWif('L1ExamplePrivateKeyWifGoesHere');

const keys = await sdk.identities.getKeys({
  identityId: ownerId,
  request: { type: 'all' },
});
const identityKey = keys.find(
  k => k.purpose === 'AUTHENTICATION' && ['CRITICAL', 'HIGH', 'MEDIUM'].includes(k.securityLevel),
);

// Fetch current document, then rebuild/replace with revision + 1.
const current = await sdk.documents.get('GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec', 'domain', '7NYmEKQsYtniQRUmxwdPGeVcirMoPh5ZPyAKz8BWFy3r');
const document = new Document({
  dataContractId: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
  documentTypeName: 'domain',
  ownerId,
  id: '7NYmEKQsYtniQRUmxwdPGeVcirMoPh5ZPyAKz8BWFy3r',
  revision: BigInt(current.revision) + 1n,
  properties: { /* updated properties */ },
});

await sdk.documents.replace({ document, identityKey, signer });
```

**Document Delete** - `documents.delete`
*Delete an existing document*

Parameters (payload fields):
- `Data Contract ID` (text, required)

- `Document Type` (text, required)

- `Document ID` (text, required)

Returns:

- `Promise<void>`

Example:
```javascript
import { IdentitySigner } from '@dashevo/evo-sdk';

const ownerId = '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk';

const signer = new IdentitySigner();
signer.addKeyFromWif('L1ExamplePrivateKeyWifGoesHere');

const keys = await sdk.identities.getKeys({
  identityId: ownerId,
  request: { type: 'all' },
});
const identityKey = keys.find(
  k => k.purpose === 'AUTHENTICATION' && ['CRITICAL', 'HIGH', 'MEDIUM'].includes(k.securityLevel),
);

await sdk.documents.delete({
  document: {
    id: '7NYmEKQsYtniQRUmxwdPGeVcirMoPh5ZPyAKz8BWFy3r',
    ownerId,
    dataContractId: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
    documentTypeName: 'domain',
  },
  identityKey,
  signer,
});
```

**Document Transfer** - `documents.transfer`
*Transfer document ownership*

Parameters (payload fields):
- `Data Contract ID` (text, required)

- `Document Type` (text, required)

- `Document ID` (text, required)

- `Recipient Identity ID` (text, required)

Returns:

- `Promise<void>`

Example:
```javascript
import { IdentitySigner } from '@dashevo/evo-sdk';

const ownerId = '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk';

const signer = new IdentitySigner();
signer.addKeyFromWif('L1ExamplePrivateKeyWifGoesHere');

const keys = await sdk.identities.getKeys({
  identityId: ownerId,
  request: { type: 'all' },
});
const identityKey = keys.find(
  k => k.purpose === 'AUTHENTICATION' && ['CRITICAL', 'HIGH', 'MEDIUM'].includes(k.securityLevel),
);

const document = await sdk.documents.get('GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec', 'domain', '7NYmEKQsYtniQRUmxwdPGeVcirMoPh5ZPyAKz8BWFy3r');
document.revision = BigInt(document.revision) + 1n;

await sdk.documents.transfer({
  document,
  recipientId: 'H72iEt2zG4MEyoh3ZzCEMkYbDWqx1GvK1xHmpM8qH1yL',
  identityKey,
  signer,
});
```

**Document Purchase** - `documents.purchase`
*Purchase a document*

Parameters (payload fields):
- `Data Contract ID` (text, required)

- `Document Type` (text, required)

- `Document ID` (text, required)

- `Price (credits)` (number, required)

Returns:

- `Promise<void>`

Example:
```javascript
import { IdentitySigner } from '@dashevo/evo-sdk';

const buyerId = '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk';

const signer = new IdentitySigner();
signer.addKeyFromWif('L1ExamplePrivateKeyWifGoesHere');

const keys = await sdk.identities.getKeys({
  identityId: buyerId,
  request: { type: 'all' },
});
const identityKey = keys.find(
  k => k.purpose === 'AUTHENTICATION' && ['CRITICAL', 'HIGH', 'MEDIUM'].includes(k.securityLevel),
);

const document = await sdk.documents.get('GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec', 'domain', '7NYmEKQsYtniQRUmxwdPGeVcirMoPh5ZPyAKz8BWFy3r');
document.revision = BigInt(document.revision) + 1n;

await sdk.documents.purchase({
  document,
  buyerId,
  price: 1000n,
  identityKey,
  signer,
});
```

**Document Set Price** - `documents.setPrice`
*Set or update document price*

Parameters (payload fields):
- `Data Contract ID` (text, required)

- `Document Type` (text, required)

- `Document ID` (text, required)

- `Price (credits, 0 to remove)` (number, required)

Returns:

- `Promise<void>`

Example:
```javascript
import { IdentitySigner } from '@dashevo/evo-sdk';

const ownerId = '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk';

const signer = new IdentitySigner();
signer.addKeyFromWif('L1ExamplePrivateKeyWifGoesHere');

const keys = await sdk.identities.getKeys({
  identityId: ownerId,
  request: { type: 'all' },
});
const identityKey = keys.find(
  k => k.purpose === 'AUTHENTICATION' && ['CRITICAL', 'HIGH', 'MEDIUM'].includes(k.securityLevel),
);

const document = await sdk.documents.get('GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec', 'domain', '7NYmEKQsYtniQRUmxwdPGeVcirMoPh5ZPyAKz8BWFy3r');
document.revision = BigInt(document.revision) + 1n;

await sdk.documents.setPrice({
  document,
  price: 1000n,
  identityKey,
  signer,
});
```

**DPNS Register Name** - `dpns.registerName`
*Register a new DPNS username*

Parameters (payload fields):
- `Username` (text, required)
  - Example: `Enter username (e.g., alice)`

Returns:

- `Promise<wasm.RegisterDpnsNameResult>`
  - Type declarations: [`wasm.RegisterDpnsNameResult`](TYPE_REFERENCE.md#type-registerdpnsnameresult)

Example:
```javascript
import { IdentitySigner } from '@dashevo/evo-sdk';

const identityId = '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk';
const identity = await sdk.identities.fetch(identityId);

const signer = new IdentitySigner();
signer.addKeyFromWif('L1ExamplePrivateKeyWifGoesHere');

// HIGH authentication key is typically used for DPNS registration.
const identityKey = identity.getPublicKeyById(1)
  || identity.publicKeys.find(
    k => k.purpose === 'AUTHENTICATION' && k.securityLevel === 'HIGH',
  );

const result = await sdk.dpns.registerName({
  label: 'alice',
  identity,
  identityKey,
  signer,
  preorderCallback: (preorderDocument) => {
    console.log('preorder submitted', preorderDocument.id?.toString?.());
  },
});
```

#### Token Transitions

**Token Burn** - `tokens.burn`
*Burn tokens*

Parameters (payload fields):
- `Data Contract ID` (text, required)

- `Token Contract Position` (number, required)

- `Amount to Burn` (text, required)

- `Public Note` (text, optional)

Returns:

- `Promise<wasm.TokenBurnResult>`
  - Type declarations: [`wasm.TokenBurnResult`](TYPE_REFERENCE.md#type-tokenburnresult)

Example:
```javascript
import { IdentitySigner } from '@dashevo/evo-sdk';

const identityId = '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk';

const signer = new IdentitySigner();
signer.addKeyFromWif('L1ExamplePrivateKeyWifGoesHere');
const keys = await sdk.identities.getKeys({ identityId, request: { type: 'all' } });
const identityKey = keys.find(
  k => k.purpose === 'AUTHENTICATION' && ['CRITICAL', 'HIGH', 'MEDIUM'].includes(k.securityLevel),
);

const result = await sdk.tokens.burn({
  dataContractId: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
  tokenPosition: 0,
  amount: 10n,
  identityId,
  publicNote: 'burn',
  identityKey,
  signer,
});
```

**Token Mint** - `tokens.mint`
*Mint new tokens*

Parameters (payload fields):
- `Data Contract ID` (text, required)

- `Token Contract Position` (number, required)

- `Amount to Mint` (text, required)

- `Issue To Identity ID` (text, optional)

- `Public Note` (text, optional)

Returns:

- `Promise<wasm.TokenMintResult>`
  - Type declarations: [`wasm.TokenMintResult`](TYPE_REFERENCE.md#type-tokenmintresult)

Example:
```javascript
import { IdentitySigner } from '@dashevo/evo-sdk';

const identityId = '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk';

const signer = new IdentitySigner();
signer.addKeyFromWif('L1ExamplePrivateKeyWifGoesHere');
const keys = await sdk.identities.getKeys({ identityId, request: { type: 'all' } });
const identityKey = keys.find(
  k => k.purpose === 'AUTHENTICATION' && ['CRITICAL', 'HIGH', 'MEDIUM'].includes(k.securityLevel),
);

const result = await sdk.tokens.mint({
  dataContractId: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
  tokenPosition: 0,
  amount: 100n,
  identityId,
  recipientId: identityId,
  publicNote: 'mint',
  identityKey,
  signer,
});
```

**Token Claim** - `tokens.claim`
*Claim tokens from a distribution*

Parameters (payload fields):
- `Data Contract ID` (text, required)

- `Token Contract Position` (number, required)

- `Distribution Type` (select, required)
  - Options: `perpetual` (Perpetual), `preprogrammed` (Pre-programmed)

- `Public Note` (text, optional)

Returns:

- `Promise<wasm.TokenClaimResult>`
  - Type declarations: [`wasm.TokenClaimResult`](TYPE_REFERENCE.md#type-tokenclaimresult)

Example:
```javascript
import { IdentitySigner } from '@dashevo/evo-sdk';

const identityId = '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk';

const signer = new IdentitySigner();
signer.addKeyFromWif('L1ExamplePrivateKeyWifGoesHere');
const keys = await sdk.identities.getKeys({ identityId, request: { type: 'all' } });
const identityKey = keys.find(
  k => k.purpose === 'AUTHENTICATION' && ['CRITICAL', 'HIGH', 'MEDIUM'].includes(k.securityLevel),
);

const result = await sdk.tokens.claim({
  dataContractId: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
  tokenPosition: 0,
  identityId,
  distributionType: 'perpetual', // or 'preProgrammed'
  publicNote: 'claim',
  identityKey,
  signer,
});
```

**Token Set Price** - `tokens.setPrice`
*Set or update the price for direct token purchases*

Parameters (payload fields):
- `Data Contract ID` (text, required)

- `Token Contract Position` (number, required)

- `Price Type` (select, required)
  - Options: `single` (Single Price), `tiered` (Tiered Pricing)

- `Price Data (single price or JSON map)` (text, optional)
  - Example: `Leave empty to remove pricing`

- `Public Note` (text, optional)

Returns:

- `Promise<wasm.TokenSetPriceResult>`
  - Type declarations: [`wasm.TokenSetPriceResult`](TYPE_REFERENCE.md#type-tokensetpriceresult)

Example:
```javascript
import { IdentitySigner } from '@dashevo/evo-sdk';

const authorityId = '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk';

const signer = new IdentitySigner();
signer.addKeyFromWif('L1ExamplePrivateKeyWifGoesHere');
const keys = await sdk.identities.getKeys({ identityId: authorityId, request: { type: 'all' } });
const identityKey = keys.find(
  k => k.purpose === 'AUTHENTICATION' && ['CRITICAL', 'HIGH', 'MEDIUM'].includes(k.securityLevel),
);

await sdk.tokens.setPrice({
  dataContractId: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
  tokenPosition: 0,
  authorityId,
  price: 1000n, // or null to clear
  publicNote: 'set price',
  identityKey,
  signer,
});
```

**Token Direct Purchase** - `tokens.directPurchase`
*Purchase tokens directly at the configured price*

Parameters (payload fields):
- `Data Contract ID` (text, required)

- `Token Contract Position` (number, required)

- `Amount to Purchase` (text, required)

- `Total Agreed Price (in credits) - Optional, fetches from pricing schedule if not provided` (text, optional)

Returns:

- `Promise<wasm.TokenDirectPurchaseResult>`
  - Type declarations: [`wasm.TokenDirectPurchaseResult`](TYPE_REFERENCE.md#type-tokendirectpurchaseresult)

Example:
```javascript
import { IdentitySigner } from '@dashevo/evo-sdk';

const buyerId = '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk';

const signer = new IdentitySigner();
signer.addKeyFromWif('L1ExamplePrivateKeyWifGoesHere');
const keys = await sdk.identities.getKeys({ identityId: buyerId, request: { type: 'all' } });
const identityKey = keys.find(
  k => k.purpose === 'AUTHENTICATION' && ['CRITICAL', 'HIGH', 'MEDIUM'].includes(k.securityLevel),
);

const result = await sdk.tokens.directPurchase({
  dataContractId: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
  tokenPosition: 0,
  buyerId,
  amount: 10n,
  maxTotalCost: 10000n,
  identityKey,
  signer,
});
```

**Token Emergency Action** - `tokens.emergencyAction`
*Perform an emergency action on a token*

Parameters (payload fields):
- `Data Contract ID` (text, required)

- `Token Contract Position` (number, required)

- `Action Type` (select, required)
  - Options: `pause` (Pause), `resume` (Resume)

- `Public Note` (text, optional)

Returns:

- `Promise<wasm.TokenEmergencyActionResult>`
  - Type declarations: [`wasm.TokenEmergencyActionResult`](TYPE_REFERENCE.md#type-tokenemergencyactionresult)

Example:
```javascript
import { IdentitySigner } from '@dashevo/evo-sdk';

const authorityId = '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk';

const signer = new IdentitySigner();
signer.addKeyFromWif('L1ExamplePrivateKeyWifGoesHere');
const keys = await sdk.identities.getKeys({ identityId: authorityId, request: { type: 'all' } });
const identityKey = keys.find(
  k => k.purpose === 'AUTHENTICATION' && ['CRITICAL', 'HIGH', 'MEDIUM'].includes(k.securityLevel),
);

await sdk.tokens.emergencyAction({
  dataContractId: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
  tokenPosition: 0,
  authorityId,
  action: 'pause', // or 'resume'
  publicNote: 'pause trading',
  identityKey,
  signer,
});
```

**Token Transfer** - `tokens.transfer`
*Transfer tokens between identities*

Parameters (payload fields):
- `Data Contract ID` (text, required)

- `Token Contract Position` (number, required)

- `Amount to Transfer` (text, required)

- `Recipient Identity ID` (text, required)

- `Public Note` (text, optional)

Returns:

- `Promise<wasm.TokenTransferResult>`
  - Type declarations: [`wasm.TokenTransferResult`](TYPE_REFERENCE.md#type-tokentransferresult)

Example:
```javascript
import { IdentitySigner } from '@dashevo/evo-sdk';

const senderId = '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk';

const signer = new IdentitySigner();
signer.addKeyFromWif('L1ExamplePrivateKeyWifGoesHere');
const keys = await sdk.identities.getKeys({ identityId: senderId, request: { type: 'all' } });
const identityKey = keys.find(
  k => k.purpose === 'AUTHENTICATION' && ['CRITICAL', 'HIGH', 'MEDIUM'].includes(k.securityLevel),
);

const result = await sdk.tokens.transfer({
  dataContractId: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
  tokenPosition: 0,
  amount: 5n,
  senderId,
  recipientId: 'H72iEt2zG4MEyoh3ZzCEMkYbDWqx1GvK1xHmpM8qH1yL',
  publicNote: 'transfer',
  identityKey,
  signer,
});
```

**Token Freeze** - `tokens.freeze`
*Freeze tokens for a specific identity*

Parameters (payload fields):
- `Data Contract ID` (text, required)

- `Token Contract Position` (number, required)

- `Identity ID to Freeze` (text, required)

- `Public Note` (text, optional)

Returns:

- `Promise<wasm.TokenFreezeResult>`
  - Type declarations: [`wasm.TokenFreezeResult`](TYPE_REFERENCE.md#type-tokenfreezeresult)

Example:
```javascript
import { IdentitySigner } from '@dashevo/evo-sdk';

const authorityId = '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk';

const signer = new IdentitySigner();
signer.addKeyFromWif('L1ExamplePrivateKeyWifGoesHere');
const keys = await sdk.identities.getKeys({ identityId: authorityId, request: { type: 'all' } });
const identityKey = keys.find(
  k => k.purpose === 'AUTHENTICATION' && ['CRITICAL', 'HIGH', 'MEDIUM'].includes(k.securityLevel),
);

await sdk.tokens.freeze({
  dataContractId: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
  tokenPosition: 0,
  authorityId,
  frozenIdentityId: 'H72iEt2zG4MEyoh3ZzCEMkYbDWqx1GvK1xHmpM8qH1yL',
  publicNote: 'freeze',
  identityKey,
  signer,
});
```

**Token Unfreeze** - `tokens.unfreeze`
*Unfreeze tokens for a specific identity*

Parameters (payload fields):
- `Data Contract ID` (text, required)

- `Token Contract Position` (number, required)

- `Identity ID to Unfreeze` (text, required)

- `Public Note` (text, optional)

Returns:

- `Promise<wasm.TokenUnfreezeResult>`
  - Type declarations: [`wasm.TokenUnfreezeResult`](TYPE_REFERENCE.md#type-tokenunfreezeresult)

Example:
```javascript
import { IdentitySigner } from '@dashevo/evo-sdk';

const authorityId = '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk';

const signer = new IdentitySigner();
signer.addKeyFromWif('L1ExamplePrivateKeyWifGoesHere');
const keys = await sdk.identities.getKeys({ identityId: authorityId, request: { type: 'all' } });
const identityKey = keys.find(
  k => k.purpose === 'AUTHENTICATION' && ['CRITICAL', 'HIGH', 'MEDIUM'].includes(k.securityLevel),
);

await sdk.tokens.unfreeze({
  dataContractId: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
  tokenPosition: 0,
  authorityId,
  frozenIdentityId: 'H72iEt2zG4MEyoh3ZzCEMkYbDWqx1GvK1xHmpM8qH1yL',
  publicNote: 'unfreeze',
  identityKey,
  signer,
});
```

**Token Destroy Frozen** - `tokens.destroyFrozen`
*Destroy frozen tokens*

Parameters (payload fields):
- `Data Contract ID` (text, required)

- `Token Contract Position` (number, required)

- `Identity ID whose frozen tokens to destroy` (text, required)

- `Public Note` (text, optional)

Returns:

- `Promise<wasm.TokenDestroyFrozenResult>`
  - Type declarations: [`wasm.TokenDestroyFrozenResult`](TYPE_REFERENCE.md#type-tokendestroyfrozenresult)

Example:
```javascript
import { IdentitySigner } from '@dashevo/evo-sdk';

const authorityId = '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk';

const signer = new IdentitySigner();
signer.addKeyFromWif('L1ExamplePrivateKeyWifGoesHere');
const keys = await sdk.identities.getKeys({ identityId: authorityId, request: { type: 'all' } });
const identityKey = keys.find(
  k => k.purpose === 'AUTHENTICATION' && ['CRITICAL', 'HIGH', 'MEDIUM'].includes(k.securityLevel),
);

await sdk.tokens.destroyFrozen({
  dataContractId: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
  tokenPosition: 0,
  authorityId,
  frozenIdentityId: 'H72iEt2zG4MEyoh3ZzCEMkYbDWqx1GvK1xHmpM8qH1yL',
  publicNote: 'destroy',
  identityKey,
  signer,
});
```

#### Voting Transitions

**DPNS Username** - `voting.masternodeVote`
*Cast a vote for a contested DPNS username*

Parameters (payload fields):
- `Contested Username` (text, required)
  - Example: `Enter the contested username (e.g., 'myusername')`

- `Vote Choice` (select, required)
  - Options: `abstain` (Abstain), `lock` (Lock (Give to no one)), `towardsIdentity` (Vote for Identity)

- `Target Identity ID (if voting for identity)` (text, optional)
  - Example: `Identity ID to vote for`

Returns:

- `Promise<void>`

Example:
```javascript
import { IdentitySigner, ResourceVoteChoice, VotePoll } from '@dashevo/evo-sdk';

const masternodeProTxHash = '143dcd6a6b7684fde01e88a10e5d65de9a29244c5ecd586d14a342657025f113';

const signer = new IdentitySigner();
signer.addKeyFromWif('L1ExampleVotingKeyWifGoesHere');

// Voting key must match the masternode voting public key on the identity.
const votingIdentity = await sdk.identities.fetch(masternodeProTxHash);
const votingKey = votingIdentity.publicKeys.find(k => k.purpose === 'VOTING')
  || votingIdentity.getPublicKeyById(0);

const votePoll = new VotePoll({
  contractId: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
  documentTypeName: 'domain',
  indexName: 'parentNameAndLabel',
  indexValues: ['dash', 'alice'],
});

await sdk.voting.masternodeVote({
  masternodeProTxHash,
  votePoll,
  voteChoice: ResourceVoteChoice.TowardsIdentity('5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk'),
  votingKey,
  signer,
});
```

**Contested Resource** - `voting.masternodeVote`
*Cast a vote for contested resources as a masternode*

Parameters (payload fields):
- `Data Contract ID` (text, required)
  - Example: `Contract ID containing the contested resource`

- `Get Contested Resources` (button, optional)

- `Contested Resources` (dynamic, optional)

- `Vote Choice` (select, required)
  - Options: `abstain` (Abstain), `lock` (Lock (Give to no one)), `towardsIdentity` (Vote for Identity)

- `Target Identity ID (if voting for identity)` (text, optional)
  - Example: `Identity ID to vote for`

Returns:

- `Promise<void>`

Example:
```javascript
import { IdentitySigner, ResourceVoteChoice, VotePoll } from '@dashevo/evo-sdk';

const masternodeProTxHash = '143dcd6a6b7684fde01e88a10e5d65de9a29244c5ecd586d14a342657025f113';

const signer = new IdentitySigner();
signer.addKeyFromWif('L1ExampleVotingKeyWifGoesHere');

const votingIdentity = await sdk.identities.fetch(masternodeProTxHash);
const votingKey = votingIdentity.publicKeys.find(k => k.purpose === 'VOTING')
  || votingIdentity.getPublicKeyById(0);

const votePoll = new VotePoll({
  contractId: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
  documentTypeName: 'domain',
  indexName: 'parentNameAndLabel',
  indexValues: ['dash', 'alice'],
});

await sdk.voting.masternodeVote({
  masternodeProTxHash,
  votePoll,
  voteChoice: ResourceVoteChoice.TowardsIdentity('5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk'),
  votingKey,
  signer,
});
```

#### Platform Address Transitions

**Address Transfer** - `addresses.transfer`
*Transfer credits between Platform addresses*

Parameters:
- `Inputs` (array, required)
  - Array of {address, nonce, amount (credits)} objects for sender addresses

- `Outputs` (array, required)
  - Array of {address, amount (credits)} objects for recipient addresses

- `Signer` (object, required)
  - PlatformAddressSigner instance

Returns:

- `Promise<Map<string, wasm.PlatformAddressInfo>>`
  - Type declarations: [`wasm.PlatformAddressInfo`](TYPE_REFERENCE.md#type-platformaddressinfo)

Example:
```javascript
import {
  PlatformAddressInput,
  PlatformAddressOutput,
  PlatformAddressSigner,
  PrivateKey,
} from '@dashevo/evo-sdk';

const privateKey = PrivateKey.fromWIF('cPrivateKeyWif...');
const signer = new PlatformAddressSigner();
const senderAddr = signer.addKey(privateKey); // derives P2PKH platform address

const input = new PlatformAddressInput(senderAddr, 0, 100000n);
const output = new PlatformAddressOutput(
  /* recipient PlatformAddress or bech32m */ 'tdash1krt0z5hrcaphyuraxmk2h2ff8nyv5fmncsgf7evf',
  90000n,
);

const result = await sdk.addresses.transfer({
  inputs: [input],
  outputs: [output],
  signer,
});
```

**Top Up Identity from Address** - `addresses.topUpIdentity`
*Top up an identity using Platform address credits*

Parameters:
- `Identity` (Identity, required)
  - Fetched Identity object to top up (sdk.identities.fetch).

- `Inputs` (array, required)
  - Array of PlatformAddressInput (or {address, nonce, amount (credits)}) objects

- `Signer` (PlatformAddressSigner, required)
  - PlatformAddressSigner containing keys for the input addresses

Returns:

- `Promise<wasm.IdentityTopUpFromAddressesResult>`
  - Type declarations: [`wasm.IdentityTopUpFromAddressesResult`](TYPE_REFERENCE.md#type-identitytopupfromaddressesresult)

Example:
```javascript
import { PlatformAddressInput, PlatformAddressSigner, PrivateKey } from '@dashevo/evo-sdk';

const identity = await sdk.identities.fetch('5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk');
const privateKey = PrivateKey.fromWIF('cPrivateKeyWif...');
const signer = new PlatformAddressSigner();
const sourceAddr = signer.addKey(privateKey);
const input = new PlatformAddressInput(sourceAddr, 0, 50000n);

const result = await sdk.addresses.topUpIdentity({
  identity,
  inputs: [input],
  signer,
});
```

**Withdraw to Core** - `addresses.withdraw`
*Withdraw Platform address credits to Dash Core*

Parameters:
- `Inputs` (array, required)
  - Array of PlatformAddressInput (or {address, nonce, amount (credits)}) objects

- `Core Fee Per Byte` (number, required)
  - Core (L1) mining fee per byte for the withdrawal transaction

- `Pooling` (Pooling, required)
  - Pooling strategy (PoolingWasm.Never / IfAvailable / Standard)

- `Output Script` (CoreScript, required)
  - Core L1 destination script (CoreScript.fromP2PKH / fromP2SH)

- `Signer` (PlatformAddressSigner, required)
  - PlatformAddressSigner containing keys for the input addresses

Returns:

- `Promise<Map<string, wasm.PlatformAddressInfo>>`
  - Type declarations: [`wasm.PlatformAddressInfo`](TYPE_REFERENCE.md#type-platformaddressinfo)

Example:
```javascript
import {
  CoreScript,
  PlatformAddressInput,
  PlatformAddressSigner,
  PoolingWasm,
  PrivateKey,
} from '@dashevo/evo-sdk';

const privateKey = PrivateKey.fromWIF('cPrivateKeyWif...');
const signer = new PlatformAddressSigner();
const platformAddr = signer.addKey(privateKey);
const input = new PlatformAddressInput(platformAddr, 0, 100000n);

// 20-byte pubkey hash for the Core L1 P2PKH destination.
const corePubkeyHash = new Uint8Array(20);
const outputScript = CoreScript.fromP2PKH(corePubkeyHash);

const result = await sdk.addresses.withdraw({
  inputs: [input],
  coreFeePerByte: 1,
  pooling: PoolingWasm.Standard,
  outputScript,
  signer,
});
```

**Transfer from Identity to Address** - `addresses.transferFromIdentity`
*Transfer credits from an identity to Platform addresses*

Parameters:
- `Identity` (Identity, required)
  - Fetched Identity object to transfer from (sdk.identities.fetch).

- `Outputs` (array, required)
  - Array of PlatformAddressOutput (or {address, amount (credits)}) objects for recipient addresses

- `Signer` (IdentitySigner, required)
  - IdentitySigner with the identity transfer key

Returns:

- `Promise<wasm.IdentityTransferToAddressesResult>`
  - Type declarations: [`wasm.IdentityTransferToAddressesResult`](TYPE_REFERENCE.md#type-identitytransfertoaddressesresult)

Example:
```javascript
import { IdentitySigner, PlatformAddressOutput } from '@dashevo/evo-sdk';

// Uses IdentitySigner (identity transfer key), not PlatformAddressSigner.
const identity = await sdk.identities.fetch('5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk');

const signer = new IdentitySigner();
signer.addKeyFromWif('L1ExamplePrivateKeyWifGoesHere');

const output = new PlatformAddressOutput('tdash1krt0z5hrcaphyuraxmk2h2ff8nyv5fmncsgf7evf', 100000n);
const result = await sdk.addresses.transferFromIdentity({
  identity,
  outputs: [output],
  signer,
});
```

**Fund Address from Asset Lock** - `addresses.fundFromAssetLock`
*Fund Platform addresses from an asset lock*

Parameters:
- `Asset Lock Proof` (AssetLockProof, required)
  - AssetLockProof from Core (AssetLockProof.fromHex / createInstantAssetLockProof / createChainAssetLockProof).

- `Asset Lock Private Key` (PrivateKey, required)
  - PrivateKey controlling the asset-lock output (PrivateKey.fromWIF).

- `Outputs` (array, required)
  - Array of PlatformAddressOutput (or {address, amount (credits)}) objects

- `Signer` (PlatformAddressSigner, required)
  - PlatformAddressSigner containing keys for the funded output addresses

Returns:

- `Promise<Map<string, wasm.PlatformAddressInfo>>`
  - Type declarations: [`wasm.PlatformAddressInfo`](TYPE_REFERENCE.md#type-platformaddressinfo)

Example:
```javascript
import {
  AssetLockProof,
  PlatformAddressOutput,
  PlatformAddressSigner,
  PrivateKey,
} from '@dashevo/evo-sdk';

// Asset-lock key signs the L1 funding proof; address signer controls outputs.
const assetLockPrivateKey = PrivateKey.fromWIF('cAssetLockPrivateKeyWif...');
const addressPrivateKey = PrivateKey.fromWIF('cAddressPrivateKeyWif...');
const assetLockProof = AssetLockProof.fromHex('a9147d3b...(hex-encoded)');

const signer = new PlatformAddressSigner();
const platformAddr = signer.addKey(addressPrivateKey);
const output = new PlatformAddressOutput(platformAddr, 100000n);

const result = await sdk.addresses.fundFromAssetLock({
  assetLockProof,
  assetLockPrivateKey,
  outputs: [output],
  signer,
});
```

**Create Identity from Address** - `addresses.createIdentity`
*Create a new identity funded from Platform addresses*

Parameters:
- `Identity` (object, required)
  - Identity object with public keys

- `Inputs` (array, required)
  - Array of {address, nonce, amount (credits)} objects

- `Identity Signer` (object, required)
  - IdentitySigner for signing identity keys

- `Address Signer` (object, required)
  - PlatformAddressSigner instance

Returns:

- `Promise<wasm.IdentityCreateFromAddressesResult>`
  - Type declarations: [`wasm.IdentityCreateFromAddressesResult`](TYPE_REFERENCE.md#type-identitycreatefromaddressesresult)

Example:
```javascript
import {
  Identity,
  IdentityPublicKeyInCreation,
  IdentitySigner,
  KeyType,
  PlatformAddressInput,
  PlatformAddressSigner,
  PrivateKey,
  Purpose,
  SecurityLevel,
} from '@dashevo/evo-sdk';

const addressPrivateKey = PrivateKey.fromWIF('cAddressPrivateKeyWif...');
const identityPrivateKey = PrivateKey.fromWIF('cIdentityKeyWif...');

const identity = new Identity(/* 32-byte id */ new Uint8Array(32));
identity.addPublicKey(
  new IdentityPublicKeyInCreation({
    keyId: 0,
    purpose: Purpose.AUTHENTICATION,
    securityLevel: SecurityLevel.MASTER,
    keyType: KeyType.ECDSA_SECP256K1,
    data: identityPrivateKey.getPublicKey().toBytes(),
  }).toIdentityPublicKey(),
);

const addressSigner = new PlatformAddressSigner();
const sourceAddr = addressSigner.addKey(addressPrivateKey);
const identitySigner = new IdentitySigner();
identitySigner.addKey(identityPrivateKey);
const input = new PlatformAddressInput(sourceAddr, 0, 50_000_000_000n);

const result = await sdk.addresses.createIdentity({
  identity,
  inputs: [input],
  identitySigner,
  addressSigner,
});
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
