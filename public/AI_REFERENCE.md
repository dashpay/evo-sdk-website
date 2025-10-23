# Evo SDK - AI Reference

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
Most state transitions require an identity identifier and a signing key in Wallet Import Format (WIF). Keep credentials secure and never embed production keys in source control:
```javascript
const identityId = '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk';
const privateKeyWif = 'L1ExamplePrivateKeyWifGoesHere';
const assetLockPrivateKeyWif = 'cVExampleAssetLockKeyForIdentityFunding';
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

Example:
```javascript
const result = await sdk.identities.fetch('5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk');
```

**Get Identity (Unproved)** - `identities.fetchUnproved`
*Fetch an identity without requesting cryptographic proofs.*

Parameters:
- `Identity ID` (text, required)
  - Example: `5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk`

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

Example:
```javascript
const result = await sdk.identities.getKeys({
    identityId: '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk',
    keyRequestType: 'all',
    limit: 10,
    offset: 0
});
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

Example:
```javascript
const result = await sdk.identities.contractKeys({
    identityIds: ['5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk'],
    contractId: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec'
});
```

**Get Identity Nonce** - `identities.nonce`
*Retrieve the global nonce associated with an identity.*

Parameters:
- `Identity ID` (text, required)
  - Example: `5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk`

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

Example:
```javascript
const result = await sdk.identities.contractNonce('5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk', 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec');
```

**Get Identity Balance** - `identities.balance`
*Fetch the credit balance for an identity.*

Parameters:
- `Identity ID` (text, required)
  - Example: `5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk`

Example:
```javascript
const result = await sdk.identities.balance('5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk');
```

**Get Multiple Identity Balances** - `identities.balances`
*Fetch balances for multiple identities in a single request.*

Parameters:
- `Identity IDs` (array, required)
  - Example: `["5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk"]`

Example:
```javascript
const result = await sdk.identities.balances(['5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk']);
```

**Get Identity Balance & Revision** - `identities.balanceAndRevision`
*Retrieve both the balance and revision number for an identity.*

Parameters:
- `Identity ID` (text, required)
  - Example: `5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk`

Example:
```javascript
const result = await sdk.identities.balanceAndRevision('5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk');
```

**Get Identity by Unique Public Key Hash** - `identities.byPublicKeyHash`
*Lookup an identity via its unique public key hash.*

Parameters:
- `Public Key Hash` (text, required)
  - Example: `b7e904ce25ed97594e72f7af0e66f298031c1754`

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

Example:
```javascript
const result = await sdk.identities.byNonUniquePublicKeyHash('518038dc858461bcee90478fd994bba8057b7531', { startAfter: null });
```

**Get Identity Token Balances** - `identities.tokenBalances`
*Retrieve balances for a set of token IDs held by an identity.*

Parameters:
- `Identity ID` (text, required)
  - Example: `5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk`

- `Token IDs` (array, required)
  - Example: `["Hqyu8WcRwXCTwbNxdga4CN5gsVEGc67wng4TFzceyLUv"]`

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

- `Limit` (number, optional)

- `Offset` (number, optional)

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

Example:
```javascript
const result = await sdk.contracts.getHistory({
    contractId: 'HLY575cNazmc5824FxqaEMEBuzFeE4a98GDRNKbyJqCM',
    limit: 10,
    startAtMs: '0'
});
```

**Get Data Contracts** - `contracts.getMany`
*Fetch multiple data contracts by their identifiers.*

Parameters:
- `Data Contract IDs` (array, required)
  - Example: `["GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec","ALybvzfcCwMs7sinDwmtumw17NneuW7RgFtFHgjKmF3A"]`

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

Example:
```javascript
const result = await sdk.documents.query({
    contractId: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
    type: 'domain',
    where: JSON.stringify([["normalizedParentDomainName", "==", "dash"]]),
    orderBy: JSON.stringify([["normalizedLabel", "asc"]]),
    limit: 10
});
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

Parameters:
- `Identity ID` (text, required)
  - Example: `5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk`

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

Example:
```javascript
const result = await sdk.dpns.usernames('5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk', { limit: 10 });
```

**Get Username by Name** - `dpns.getUsernameByName`
*Fetch DPNS username details by full name.*

Parameters:
- `Username` (text, required)
  - Example: `alice.dash`

Example:
```javascript
const result = await sdk.dpns.getUsernameByName('alice.dash');
```

**Resolve DPNS Name** - `dpns.resolveName`
*Resolve a DPNS name to its identity information.*

Parameters:
- `DPNS Name` (text, required)
  - Example: `alice.dash`

Example:
```javascript
const result = await sdk.dpns.resolveName('alice.dash');
```

**Check DPNS Availability** - `dpns.isNameAvailable`
*Check if a DPNS label is available for registration.*

Parameters:
- `Label (Username)` (text, required)
  - Example: `alice`

Example:
```javascript
const result = await sdk.dpns.isNameAvailable('alice');
```

**Convert to Homograph Safe** - `dpns.convertToHomographSafe`
*Convert a label to its homograph-safe representation.*

Parameters:
- `Label` (text, required)
  - Example: `ąlice`

Example:
```javascript
const result = sdk.dpns.convertToHomographSafe('ąlice');
```

**Validate Username** - `dpns.isValidUsername`
*Validate whether a label conforms to DPNS username rules.*

Parameters:
- `Label` (text, required)
  - Example: `alice`

Example:
```javascript
const result = sdk.dpns.isValidUsername('alice');
```

**Is Contested Username** - `dpns.isContestedUsername`
*Check if a label is currently part of a contested DPNS registration.*

Parameters:
- `Label` (text, required)
  - Example: `alice`

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

- `Start At Value` (text, optional)

- `Limit` (number, optional)

- `Order Ascending` (checkbox, optional)

Example:
```javascript
const result = await sdk.group.contestedResources({
    contractId: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
    documentTypeName: 'domain',
    indexName: 'parentNameAndLabel',
    startAtValue: null,
    limit: 10,
    orderAscending: true
});
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

- `Start At Identifier Info` (text, optional)

- `Count` (number, optional)

- `Order Ascending` (checkbox, optional)

Example:
```javascript
const result = await sdk.voting.contestedResourceVoteState({
    contractId: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
    documentTypeName: 'domain',
    indexName: 'parentNameAndLabel',
    indexValues: ['dash', 'alice'],
    resultType: 'documents',
    count: 10,
    orderAscending: true
});
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

- `Start At Voter Info` (text, optional)

- `Start At Identifier Info (Proof)` (text, optional)

- `Limit` (number, optional)

- `Count (Proof)` (number, optional)

- `Order Ascending` (checkbox, optional)

Example:
```javascript
const result = await sdk.group.contestedResourceVotersForIdentity({
    contractId: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
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

Parameters:
- `Identity ID` (text, required)
  - Example: `5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk`

- `Limit` (number, optional)

- `Start At Vote Poll Info` (text, optional)

- `Offset (Proof)` (number, optional)

- `Order Ascending` (checkbox, optional)

Example:
```javascript
const result = await sdk.voting.contestedResourceIdentityVotes(
    '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk',
    { limit: 10, orderAscending: true }
);
```

**Get Vote Polls by End Date** - `voting.votePollsByEndDate`
*Fetch vote polls filtered by end time. Use JSON time info for standard responses or millisecond timestamps with proof.*

Parameters:
- `Start Time Info (JSON)` (json, optional)

- `End Time Info (JSON)` (json, optional)

- `Start Time (ms)` (number, optional)

- `End Time (ms)` (number, optional)

- `Limit` (number, optional)

- `Offset (Proof)` (number, optional)

- `Order Ascending` (checkbox, optional)

Example:
```javascript
const result = await sdk.voting.votePollsByEndDate({
    startTimeInfo: null,
    endTimeInfo: null,
    limit: 10,
    orderAscending: true,
});
```

#### Protocol & Version

**Get Protocol Version Upgrade State** - `protocol.versionUpgradeState`
*Retrieve protocol upgrade vote tallies.*

No parameters required.

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

Example:
```javascript
const result = await sdk.protocol.versionUpgradeVoteStatus({
    startProTxHash: '143dcd6a6b7684fde01e88a10e5d65de9a29244c5ecd586d14a342657025f113',
    count: 10
});
```

#### Epoch & Block Queries

**Get Epochs Info** - `epoch.epochsInfo`
*Retrieve summary information for one or more epochs.*

Parameters:
- `Start Epoch` (number, optional)

- `Count` (number, optional)

- `Ascending Order` (checkbox, optional)

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

No parameters required.

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

Parameters:
- `Epoch` (number, required)

- `Evonode ProTx Hashes` (array, required)
  - Example: `["143dcd6a6b7684fde01e88a10e5d65de9a29244c5ecd586d14a342657025f113"]`

Example:
```javascript
const result = await sdk.epoch.evonodesProposedBlocksByIds(
    8635,
    ['143dcd6a6b7684fde01e88a10e5d65de9a29244c5ecd586d14a342657025f113']
);
```

**Get Epoch Blocks by Range** - `epoch.evonodesProposedBlocksByRange`
*Fetch proposed blocks in range order.*

Parameters:
- `Epoch` (number, required)

- `Limit` (number, optional)

- `Start After (ProTxHash)` (text, optional)
  - Example: `143dcd6a6b7684fde01e88a10e5d65de9a29244c5ecd586d14a342657025f113`

- `Order Ascending` (checkbox, optional)

Example:
```javascript
const result = await sdk.epoch.evonodesProposedBlocksByRange(8635, {
    limit: 5,
    orderAscending: true
});
```

#### Token Queries

**Get Token Statuses** - `tokens.statuses`
*Retrieve status information for one or more tokens.*

Parameters:
- `Token IDs` (array, required)
  - Example: `["Hqyu8WcRwXCTwbNxdga4CN5gsVEGc67wng4TFzceyLUv"]`

Example:
```javascript
const result = await sdk.tokens.statuses([
    'Hqyu8WcRwXCTwbNxdga4CN5gsVEGc67wng4TFzceyLUv',
    'H7FRpZJqZK933r9CzZMsCuf1BM34NT5P2wSJyjDkprqy'
]);
```

**Get Direct Purchase Prices** - `tokens.directPurchasePrices`
*Fetch direct purchase prices for tokens.*

Parameters:
- `Token IDs` (array, required)
  - Example: `["Hqyu8WcRwXCTwbNxdga4CN5gsVEGc67wng4TFzceyLUv"]`

Example:
```javascript
const result = await sdk.tokens.directPurchasePrices([
    'Hqyu8WcRwXCTwbNxdga4CN5gsVEGc67wng4TFzceyLUv'
]);
```

**Get Token Contract Info** - `tokens.contractInfo`
*Retrieve metadata for a token contract.*

Parameters:
- `Token Contract ID` (text, required)
  - Example: `ALybvzfcCwMs7sinDwmtumw17NneuW7RgFtFHgjKmF3A`

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

Example:
```javascript
const result = await sdk.tokens.perpetualDistributionLastClaim(
    '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk',
    'Hqyu8WcRwXCTwbNxdga4CN5gsVEGc67wng4TFzceyLUv'
);
```

**Get Token Total Supply** - `tokens.totalSupply`
*Fetch the total supply for a token.*

Parameters:
- `Token ID` (text, required)
  - Example: `Hqyu8WcRwXCTwbNxdga4CN5gsVEGc67wng4TFzceyLUv`

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

Example:
```javascript
const result = await sdk.group.infos('49PJEnNx7ReCitzkLdkDNr4s6RScGsnNexcdSZJ1ph5N', null, 10);
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

Example:
```javascript
const result = await sdk.group.members('49PJEnNx7ReCitzkLdkDNr4s6RScGsnNexcdSZJ1ph5N', 0, { limit: 10 });
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

Example:
```javascript
const result = await sdk.group.actions('49PJEnNx7ReCitzkLdkDNr4s6RScGsnNexcdSZJ1ph5N', 0, 'ACTIVE', { count: 10 });
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

Example:
```javascript
const result = await sdk.group.actionSigners('49PJEnNx7ReCitzkLdkDNr4s6RScGsnNexcdSZJ1ph5N', 0, 'ACTIVE', '6XJzL6Qb8Zhwxt4HFwh8NAn7q1u4dwdoUf8EmgzDudFZ');
```

**Get Identity Groups** - `group.identityGroups`
*Fetch group memberships for an identity.*

Parameters:
- `Identity ID` (text, required)
  - Example: `5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk`

- `Member Data Contracts` (array, optional)

- `Owner Data Contracts` (array, optional)

- `Moderator Data Contracts` (array, optional)

Example:
```javascript
const result = await sdk.group.identityGroups('5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk', {});
```

**Get Groups Data Contracts** - `group.groupsDataContracts`
*Fetch group configuration documents for the supplied data contracts.*

Parameters:
- `Data Contract IDs` (array, required)
  - Example: `["GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec"]`

Example:
```javascript
const result = await sdk.group.groupsDataContracts(['GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec']);
```

#### System & Utility

**Get Platform Status** - `system.status`
*Retrieve basic platform status information.*

No parameters required.

Example:
```javascript
const result = await sdk.system.status();
```

**Get Current Quorums Info** - `system.currentQuorumsInfo`
*Fetch details about currently active quorums.*

No parameters required.

Example:
```javascript
const result = await sdk.system.currentQuorumsInfo();
```

**Get Prefunded Specialized Balance** - `system.prefundedSpecializedBalance`
*Retrieve a prefunded specialized balance entry.*

Parameters:
- `Specialized Balance ID` (text, required)
  - Example: `AzaU7zqCT7X1kxh8yWxkT9PxAgNqWDu4Gz13emwcRyAT`

Example:
```javascript
const result = await sdk.system.prefundedSpecializedBalance('AzaU7zqCT7X1kxh8yWxkT9PxAgNqWDu4Gz13emwcRyAT');
```

**Get Total Credits in Platform** - `system.totalCreditsInPlatform`
*Fetch the total credit balance stored in the platform.*

No parameters required.

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

Example:
```javascript
const result = await sdk.system.pathElements(['96'], ['5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk']);
```

**Wait for State Transition Result** - `system.waitForStateTransitionResult`
*Wait for a state transition to be processed and return the result.*

Parameters:
- `State Transition Hash` (text, required)
  - Example: `0000000000000000000000000000000000000000000000000000000000000000`

Example:
```javascript
const result = await sdk.system.waitForStateTransitionResult('0000000000000000000000000000000000000000000000000000000000000000');
```

## State Transition Operations

### Pattern
All state transitions require authentication and are invoked with namespace methods:
```javascript
const result = await sdk.<namespace>.<transition>({ ...params, privateKeyWif });
```

### Available State Transitions
#### Identity Transitions

**Identity Create** - `identities.create`
*Create a new identity with initial credits*

Parameters:
- `Asset Lock Proof` (string, required)
  - Hex-encoded JSON asset lock proof

- `Asset Lock Proof Private Key` (string, required)
  - WIF format private key

- `Public Keys` (string, required)
  - JSON array of public keys. Key requirements: ECDSA_SECP256K1 requires privateKeyHex or privateKeyWif for signing, BLS12_381 requires privateKeyHex for signing, ECDSA_HASH160 requires either the data field (base64-encoded 20-byte public key hash) or privateKeyHex (produces empty signatures).

Example:
```javascript
// Asset lock proof is a hex-encoded JSON object
const assetLockProof = "a9147d3b... (hex-encoded)";
const assetLockProofPrivateKey = "XFfpaSbZq52HPy3WWwe1dXsZMiU1bQn8vQd34HNXkSZThevBWRn1"; // WIF format

// Public keys array with proper key types
const publicKeys = JSON.stringify([
  {
    id: 0,
    type: 0, // ECDSA_SECP256K1 = 0, BLS12_381 = 1, ECDSA_HASH160 = 2, BIP13_SCRIPT_HASH = 3
    purpose: 0, // AUTHENTICATION = 0, ENCRYPTION = 1, DECRYPTION = 2, TRANSFER = 3, WITHDRAW = 4, VOTING = 5, OWNER = 6
    securityLevel: 0, // MASTER = 0, CRITICAL = 1, HIGH = 2, MEDIUM = 3
    data: "A5GzYHPIolbHkFrp5l+s9IvF2lWMuuuSu3oWZB8vWHNJ", // Base64-encoded public key
    readOnly: false,
    privateKeyWif: "XBrZJKcW4ajWVNAU6yP87WQog6CjFnpbqyAKgNTZRqmhYvPgMNV2" // Required for ECDSA_SECP256K1 signing
  },
  {
    id: 1,
    type: 0, // ECDSA_SECP256K1
    purpose: 0, // AUTHENTICATION
    securityLevel: 2, // HIGH
    data: "AnotherBase64EncodedPublicKeyHere", // Base64-encoded public key
    readOnly: false,
    privateKeyWif: "XAnotherPrivateKeyInWIFFormat" // Required for signing
  },
  {
    id: 2,
    type: 2, // ECDSA_HASH160
    purpose: 0, // AUTHENTICATION
    securityLevel: 2, // HIGH
    data: "ripemd160hash20bytes1234", // Base64-encoded 20-byte RIPEMD160 hash
    readOnly: false
    // ECDSA_HASH160 keys produce empty signatures (privateKey not required/used for signing)
  }
]);

const result = await sdk.identities.create({ assetLockProof, assetLockProofPrivateKey, publicKeys });
```

**Identity Top Up** - `identities.topup`
*Add credits to an existing identity*

Parameters:
- `Identity ID` (string, required)
  - Base58 format identity ID

- `Asset Lock Proof` (string, required)
  - Hex-encoded JSON asset lock proof

- `Asset Lock Proof Private Key` (string, required)
  - WIF format private key

Example:
```javascript
const identityId = "5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk"; // base58
const assetLockProof = "a9147d3b... (hex-encoded)";
const assetLockProofPrivateKey = "XFfpaSbZq52HPy3WWve1dXsZMiU1bQn8vQd34HNXkSZThevBWRn1"; // WIF format

const result = await sdk.identities.topup({ identityId, assetLockProof, assetLockProofPrivateKey });
```

**Identity Update** - `identities.update`
*Update identity keys (add or disable)*

Parameters (payload fields):
- `Keys to Add (JSON array)` (textarea, optional)
  - Example: `[{"keyType":"ECDSA_HASH160","purpose":"AUTHENTICATION","data":"base64_key_data"}]`

- `Key IDs to Disable (comma-separated)` (text, optional)
  - Example: `2,3,5`

Example:
```javascript
const result = await sdk.identities.update({ identityId, addPublicKeys, disablePublicKeyIds, privateKeyWif });
```

**Identity Credit Transfer** - `identities.creditTransfer`
*Transfer credits between identities*

Parameters (payload fields):
- `Recipient Identity ID` (text, required)

- `Amount (credits)` (number, required)

Example:
```javascript
const result = await sdk.identities.creditTransfer({ senderId, recipientId, amount, privateKeyWif, keyId });
```

**Identity Credit Withdrawal** - `identities.creditWithdrawal`
*Withdraw credits from identity to Dash address*

Parameters (payload fields):
- `Dash Address` (text, required)

- `Amount (credits)` (number, required)

- `Core Fee Per Byte (optional)` (number, optional)

Example:
```javascript
const result = await sdk.identities.creditWithdrawal({ identityId, toAddress, amount, coreFeePerByte, privateKeyWif, keyId });
```

#### Data Contract Transitions

**Data Contract Create** - `contracts.create`
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

Example:
```javascript
const result = await sdk.contracts.create({ ownerId, definition, privateKeyWif, keyId });
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

Example:
```javascript
const result = await sdk.contracts.update({ contractId, ownerId, updates, privateKeyWif, keyId });
```

#### Document Transitions

**Document Create** - `documents.create`
*Create a new document*

Parameters (payload fields):
- `Data Contract ID` (text, required)

- `Document Type` (text, required)

- `Fetch Schema` (button, optional)

- `Document Fields` (dynamic, optional)

Example:
```javascript
const result = await sdk.documents.create({ contractId, type: documentType, ownerId, data, entropyHex, privateKeyWif });
```

**Document Replace** - `documents.replace`
*Replace an existing document*

Parameters (payload fields):
- `Data Contract ID` (text, required)

- `Document Type` (text, required)

- `Document ID` (text, required)

- `Load Document` (button, optional)

- `Document Fields` (dynamic, optional)

Example:
```javascript
const result = await sdk.documents.replace({ contractId, type: documentType, documentId, ownerId, data, revision, privateKeyWif });
```

**Document Delete** - `documents.delete`
*Delete an existing document*

Parameters (payload fields):
- `Data Contract ID` (text, required)

- `Document Type` (text, required)

- `Document ID` (text, required)

Example:
```javascript
const result = await sdk.documents.delete({ contractId, type: documentType, documentId, ownerId, privateKeyWif });
```

**Document Transfer** - `documents.transfer`
*Transfer document ownership*

Parameters (payload fields):
- `Data Contract ID` (text, required)

- `Document Type` (text, required)

- `Document ID` (text, required)

- `Recipient Identity ID` (text, required)

Example:
```javascript
const result = await sdk.documents.transfer({ contractId, type: documentType, documentId, ownerId, recipientId, privateKeyWif });
```

**Document Purchase** - `documents.purchase`
*Purchase a document*

Parameters (payload fields):
- `Data Contract ID` (text, required)

- `Document Type` (text, required)

- `Document ID` (text, required)

- `Price (credits)` (number, required)

Example:
```javascript
const result = await sdk.documents.purchase({ contractId, type: documentType, documentId, buyerId, price, privateKeyWif });
```

**Document Set Price** - `documents.setPrice`
*Set or update document price*

Parameters (payload fields):
- `Data Contract ID` (text, required)

- `Document Type` (text, required)

- `Document ID` (text, required)

- `Price (credits, 0 to remove)` (number, required)

Example:
```javascript
const result = await sdk.documents.setPrice({ contractId, type: documentType, documentId, ownerId, price, privateKeyWif });
```

**DPNS Register Name** - `dpns.registerName`
*Register a new DPNS username*

Parameters (payload fields):
- `Username` (text, required)
  - Example: `Enter username (e.g., alice)`

Example:
```javascript
const result = await sdk.dpns.registerName({ label, identityId, publicKeyId, privateKeyWif, onPreorder });
```

#### Token Transitions

**Token Burn** - `tokens.burn`
*Burn tokens*

Parameters (payload fields):
- `Data Contract ID` (text, required)

- `Token Contract Position` (number, required)

- `Amount to Burn` (text, required)

- `Public Note` (text, optional)

Example:
```javascript
const result = await sdk.tokens.burn({ contractId, tokenPosition, amount, identityId, privateKeyWif, publicNote });
```

**Token Mint** - `tokens.mint`
*Mint new tokens*

Parameters (payload fields):
- `Data Contract ID` (text, required)

- `Token Contract Position` (number, required)

- `Amount to Mint` (text, required)

- `Issue To Identity ID` (text, optional)

- `Public Note` (text, optional)

Example:
```javascript
const result = await sdk.tokens.mint({ contractId, tokenPosition, amount, identityId, privateKeyWif, recipientId, publicNote });
```

**Token Claim** - `tokens.claim`
*Claim tokens from a distribution*

Parameters (payload fields):
- `Data Contract ID` (text, required)

- `Token Contract Position` (number, required)

- `Distribution Type` (select, required)
  - Options: `perpetual` (Perpetual), `preprogrammed` (Pre-programmed)

- `Public Note` (text, optional)

Example:
```javascript
const result = await sdk.tokens.claim({ contractId, tokenPosition, distributionType, identityId, privateKeyWif, publicNote });
```

**Token Set Price** - `tokens.setPriceForDirectPurchase`
*Set or update the price for direct token purchases*

Parameters (payload fields):
- `Data Contract ID` (text, required)

- `Token Contract Position` (number, required)

- `Price Type` (select, required)
  - Options: `single` (Single Price), `tiered` (Tiered Pricing)

- `Price Data (single price or JSON map)` (text, optional)
  - Example: `Leave empty to remove pricing`

- `Public Note` (text, optional)

Example:
```javascript
const result = await sdk.tokens.setPriceForDirectPurchase({ contractId, tokenPosition, identityId, priceType, priceData, privateKeyWif, publicNote });
```

**Token Direct Purchase** - `tokens.directPurchase`
*Purchase tokens directly at the configured price*

Parameters (payload fields):
- `Data Contract ID` (text, required)

- `Token Contract Position` (number, required)

- `Amount to Purchase` (text, required)

- `Total Agreed Price (in credits) - Optional, fetches from pricing schedule if not provided` (text, optional)

Example:
```javascript
const result = await sdk.tokens.directPurchase({ contractId, tokenPosition, amount, identityId, totalAgreedPrice, privateKeyWif });
```

**Token Config Update** - `tokens.configUpdate`
*Update token configuration settings*

Parameters (payload fields):
- `Data Contract ID` (text, required)

- `Token Contract Position` (number, required)

- `Config Item Type` (select, required)
  - Options: `conventions` (Conventions), `max_supply` (Max Supply), `perpetual_distribution` (Perpetual Distribution), `new_tokens_destination_identity` (New Tokens Destination Identity), `minting_allow_choosing_destination` (Minting Allow Choosing Destination), `manual_minting` (Manual Minting), `manual_burning` (Manual Burning), `conventions_control_group` (Conventions Control Group), `conventions_admin_group` (Conventions Admin Group), `max_supply_control_group` (Max Supply Control Group), `max_supply_admin_group` (Max Supply Admin Group)

- `Config Value (JSON or specific value)` (text, required)

- `Public Note` (text, optional)

Example:
```javascript
const result = await sdk.tokens.configUpdate({ contractId, tokenPosition, configItemType, configValue, identityId, privateKeyWif, publicNote });
```

**Token Transfer** - `tokens.transfer`
*Transfer tokens between identities*

Parameters (payload fields):
- `Data Contract ID` (text, required)

- `Token Contract Position` (number, required)

- `Amount to Transfer` (text, required)

- `Recipient Identity ID` (text, required)

- `Public Note` (text, optional)

Example:
```javascript
const result = await sdk.tokens.transfer({ contractId, tokenPosition, amount, senderId, recipientId, privateKeyWif, publicNote });
```

**Token Freeze** - `tokens.freeze`
*Freeze tokens for a specific identity*

Parameters (payload fields):
- `Data Contract ID` (text, required)

- `Token Contract Position` (number, required)

- `Identity ID to Freeze` (text, required)

- `Public Note` (text, optional)

Example:
```javascript
const result = await sdk.tokens.freeze({ contractId, tokenPosition, identityToFreeze, freezerId, privateKeyWif, publicNote });
```

**Token Unfreeze** - `tokens.unfreeze`
*Unfreeze tokens for a specific identity*

Parameters (payload fields):
- `Data Contract ID` (text, required)

- `Token Contract Position` (number, required)

- `Identity ID to Unfreeze` (text, required)

- `Public Note` (text, optional)

Example:
```javascript
const result = await sdk.tokens.unfreeze({ contractId, tokenPosition, identityToUnfreeze, unfreezerId, privateKeyWif, publicNote });
```

**Token Destroy Frozen** - `tokens.destroyFrozen`
*Destroy frozen tokens*

Parameters (payload fields):
- `Data Contract ID` (text, required)

- `Token Contract Position` (number, required)

- `Identity ID whose frozen tokens to destroy` (text, required)

- `Public Note` (text, optional)

Example:
```javascript
const result = await sdk.tokens.destroyFrozen({ contractId, tokenPosition, identityId: frozenIdentityId, destroyerId, privateKeyWif, publicNote });
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

Example:
```javascript
const result = await sdk.voting.masternodeVote({ masternodeProTxHash, contractId, documentTypeName, indexName, indexValues, voteChoice, votingKeyWif });
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

Example:
```javascript
const result = await sdk.voting.masternodeVote({ masternodeProTxHash, contractId, documentTypeName, indexName, indexValues, voteChoice, votingKeyWif });
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
