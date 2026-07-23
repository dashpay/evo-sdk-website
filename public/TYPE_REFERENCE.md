# Evo SDK Type Reference

Generated from `@dashevo/evo-sdk@4.0.0` published TypeScript declarations under `dist/`.

Named types reachable from documented method inputs and outputs are included recursively.

<a id="type-addressfundingfromassetlockoptions"></a>
## `AddressFundingFromAssetLockOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface AddressFundingFromAssetLockOptions {
    /**
     * Asset lock proof from the Core chain.
     * Use AssetLockProof.createInstantAssetLockProof() or AssetLockProof.createChainAssetLockProof().
     */
    assetLockProof: AssetLockProof;

    /**
     * Private key for signing the asset lock proof.
     * This is the private key that controls the asset lock output.
     */
    assetLockPrivateKey: PrivateKey;

    /**
     * Array of output addresses with amounts to fund.
     * Use PlatformAddressOutput for typed outputs.
     */
    outputs: PlatformAddressOutput[];

    /**
     * Signer containing private keys for all output addresses.
     * Use PlatformAddressSigner to add keys before calling fund.
     */
    signer: PlatformAddressSigner;

    /**
     * Fee strategy defining how transaction fees are paid.
     * Array of FeeStrategyStep, each specifying to deduct from an input or reduce an output.
     * @default [FeeStrategyStep.deductFromInput(0)]
     */
    feeStrategy?: FeeStrategyStep[];

    /**
     * Optional settings for the broadcast operation.
     * Includes retries, timeouts, userFeeIncrease, etc.
     */
    settings?: PutSettings;
}
```

<a id="type-addressfundstransferoptions"></a>
## `AddressFundsTransferOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface AddressFundsTransferOptions {
    /**
     * Array of input addresses with amounts to spend.
     * Use PlatformAddressInput for typed inputs (nonces fetched automatically).
     */
    inputs: PlatformAddressInput[];

    /**
     * Array of output addresses with amounts to receive.
     * Use PlatformAddressOutput for typed outputs.
     */
    outputs: PlatformAddressOutput[];

    /**
     * Signer containing private keys for all input addresses.
     * Use PlatformAddressSigner to add keys before calling transfer.
     */
    signer: PlatformAddressSigner;

    /**
     * Fee strategy defining how transaction fees are paid.
     * Array of FeeStrategyStep, each specifying to deduct from an input or reduce an output.
     * @default [FeeStrategyStep.deductFromInput(0)]
     */
    feeStrategy?: FeeStrategyStep[];

    /**
     * Optional settings for the broadcast operation.
     * Includes retries, timeouts, userFeeIncrease, etc.
     */
    settings?: PutSettings;
}
```

<a id="type-addressfundswithdrawoptions"></a>
## `AddressFundsWithdrawOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface AddressFundsWithdrawOptions {
    /**
     * Array of input addresses with amounts to withdraw.
     * Use PlatformAddressInput for typed inputs (nonces fetched automatically).
     */
    inputs: PlatformAddressInput[];

    /**
     * Optional change output address and amount.
     * If provided, specifies where to send any change from the withdrawal.
     */
    changeOutput?: PlatformAddressOutput;

    /**
     * Fee strategy defining how transaction fees are paid.
     * Array of FeeStrategyStep, each specifying to deduct from an input or reduce an output.
     * @default [FeeStrategyStep.deductFromInput(0)]
     */
    feeStrategy?: FeeStrategyStep[];

    /**
     * Core (L1) fee per byte for the withdrawal transaction.
     * This determines the mining fee for the Core blockchain transaction.
     */
    coreFeePerByte: number;

    /**
     * Pooling strategy for the withdrawal.
     * - Pooling.Never: Create individual withdrawal transaction
     * - Pooling.IfAvailable: Join pool if available, otherwise individual
     * - Pooling.Standard: Wait to join pool (may take longer)
     */
    pooling: Pooling;

    /**
     * Core output script specifying the L1 destination address.
     * Use CoreScript.newP2PKH() or CoreScript.newP2SH() to create.
     */
    outputScript: CoreScript;

    /**
     * Signer containing private keys for all input addresses.
     * Use PlatformAddressSigner to add keys before calling withdraw.
     */
    signer: PlatformAddressSigner;

    /**
     * Optional settings for the broadcast operation.
     * Includes retries, timeouts, userFeeIncrease, etc.
     */
    settings?: PutSettings;
}
```

<a id="type-assetlockproof"></a>
## `AssetLockProof`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class AssetLockProof {
    free(): void;
    [Symbol.dispose](): void;
    constructor(assetLockProof: ChainAssetLockProof | InstantAssetLockProof);
    static createChainAssetLockProof(coreChainLockedHeight: number, outPoint: OutPoint): AssetLockProof;
    createIdentityId(): Identifier;
    static createInstantAssetLockProof(instantLock: Uint8Array, transaction: Uint8Array, outputIndex: number): AssetLockProof;
    static fromBytes(bytes: Uint8Array): AssetLockProof;
    static fromHex(assetLockProof: string): AssetLockProof;
    static fromJSON(js: AssetLockProofJSON): AssetLockProof;
    static fromObject(obj: AssetLockProofObject): AssetLockProof;
    toBytes(): Uint8Array;
    toHex(): string;
    toJSON(): AssetLockProofJSON;
    toObject(): AssetLockProofObject;
    readonly chainLockProof: ChainAssetLockProof;
    readonly instantLockProof: InstantAssetLockProof;
    /**
     * Returns the lock type as a lowercase wire-shape string ("instant" or
     * "chain") — matching the `type` discriminator emitted by `toObject()` /
     * `toJSON()`.
     */
    readonly lockType: string;
    readonly outPoint: OutPoint | undefined;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-contestedresourceidentityvotesquery"></a>
## `ContestedResourceIdentityVotesQuery`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface ContestedResourceIdentityVotesQuery {
    /**
     * Identity identifier.
     */
    identityId: IdentifierLike

    /**
     * Maximum number of votes to return.
     * @default undefined (no explicit limit)
     */
    limit?: number;

    /**
     * Vote identifier to resume from (exclusive by default).
     * @default undefined
     */
    startAtVoteId?: IdentifierLike

    /**
     * Include the `startAtVoteId` when true.
     * @default true
     */
    startAtIncluded?: boolean;

    /**
     * Sort order. When omitted, defaults to ascending.
     * @default true
     */
    orderAscending?: boolean;
}
```

<a id="type-contestedresourcevotestate"></a>
## `ContestedResourceVoteState`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class ContestedResourceVoteState {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    get abstainVoteTally(): number | undefined;
    set abstainVoteTally(value: number | null | undefined);
    contenders: Array<any>;
    get lockVoteTally(): number | undefined;
    set lockVoteTally(value: number | null | undefined);
    get winner(): ContestedResourceVoteWinner | undefined;
    set winner(value: ContestedResourceVoteWinner | null | undefined);
}
```

<a id="type-contestedresourcevotestatequery"></a>
## `ContestedResourceVoteStateQuery`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface ContestedResourceVoteStateQuery {
    /**
     * Data contract identifier.
     */
    dataContractId: IdentifierLike

    /**
     * Contested document type name.
     */
    documentTypeName: string;

    /**
     * Index name to query.
     */
    indexName: string;

    /**
     * Optional index values used as query parameters.
     * @default undefined
     */
    indexValues?: unknown[];

    /**
     * Result projection type.
     * @default 'documentsAndVoteTally'
     */
    resultType?: 'documents' | 'voteTally' | 'documentsAndVoteTally';

    /**
     * Maximum number of records to return.
     * @default undefined (no explicit limit)
     */
    limit?: number;

    /**
     * Contender identifier to resume from (exclusive by default).
     * @default undefined
     */
    startAtContenderId?: IdentifierLike

    /**
     * Include the start contender when true.
     * @default true
     */
    startAtIncluded?: boolean;

    /**
     * Include locked and abstaining tallies when true.
     * @default false
     */
    includeLockedAndAbstaining?: boolean;
}
```

<a id="type-contestedresourcevotersforidentityquery"></a>
## `ContestedResourceVotersForIdentityQuery`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface ContestedResourceVotersForIdentityQuery {
    /**
     * Data contract identifier.
     */
    dataContractId: IdentifierLike

    /**
     * Contested document type name.
     */
    documentTypeName: string;

    /**
     * Index name used to locate the contested resource.
     */
    indexName: string;

    /**
     * Optional index values used as query arguments.
     * @default undefined
     */
    indexValues?: unknown[];

    /**
     * Contested identity identifier.
     */
    contestantId: IdentifierLike

    /**
     * Maximum number of voters to return.
     * @default undefined (no explicit limit)
     */
    limit?: number;

    /**
     * Voter identifier to resume from (exclusive by default).
     * @default undefined
     */
    startAtVoterId?: IdentifierLike

    /**
     * Include the `startAtVoterId` when true.
     * @default true
     */
    startAtIncluded?: boolean;

    /**
     * Sort order. When omitted, defaults to ascending.
     * @default true
     */
    orderAscending?: boolean;
}
```

<a id="type-contractpublishoptions"></a>
## `ContractPublishOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface ContractPublishOptions {
    /**
     * The data contract to create.
     * Use `new DataContract(...)` or `DataContract.fromJSON(...)` to construct it.
     */
    dataContract: DataContract;

    /**
     * The identity public key to use for signing the transition.
     * Get this from the owner identity's public keys.
     */
    identityKey: IdentityPublicKey;

    /**
     * Signer containing the private key that corresponds to the identity key.
     * Use IdentitySigner to add the private key before calling.
     */
    signer: IdentitySigner;

    /**
     * Optional settings for the broadcast operation.
     * Includes retries, timeouts, userFeeIncrease, etc.
     */
    settings?: PutSettings;
}
```

<a id="type-contractupdateoptions"></a>
## `ContractUpdateOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface ContractUpdateOptions {
    /**
     * The updated data contract.
     * Use the existing contract and modify it, or create a new one with
     * `DataContract.fromJSON(...)`. Version must be incremented.
     */
    dataContract: DataContract;

    /**
     * The identity public key to use for signing the transition.
     * Get this from the owner identity's public keys.
     */
    identityKey: IdentityPublicKey;

    /**
     * Signer containing the private key that corresponds to the identity key.
     * Use IdentitySigner to add the private key before calling.
     */
    signer: IdentitySigner;

    /**
     * Optional settings for the broadcast operation.
     * Includes retries, timeouts, userFeeIncrease, etc.
     */
    settings?: PutSettings;
}
```

<a id="type-corescript"></a>
## `CoreScript`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class CoreScript {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromBytes(bytes: Uint8Array): CoreScript;
    static fromP2PKH(keyHash: Uint8Array): CoreScript;
    static fromP2SH(scriptHash: Uint8Array): CoreScript;
    toASMString(): string;
    toAddress(network: NetworkLike): string;
    toBase64(): string;
    toBytes(): Uint8Array;
    toHex(): string;
    toString(): string;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-currentquorumsinfo"></a>
## `CurrentQuorumsInfo`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class CurrentQuorumsInfo {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromJSON(js: object): CurrentQuorumsInfo;
    static fromObject(obj: object): CurrentQuorumsInfo;
    toJSON(): any;
    toObject(): any;
    readonly height: bigint;
    readonly quorums: Array<any>;
}
```

<a id="type-datacontract"></a>
## `DataContract`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class DataContract {
    free(): void;
    [Symbol.dispose](): void;
    constructor(options: DataContractOptions);
    static fromBase64(base64: string, full_validation: boolean, platform_version: PlatformVersionLike): DataContract;
    static fromBytes(bytes: Uint8Array, full_validation: boolean, platform_version: PlatformVersionLike): DataContract;
    static fromHex(hex: string, full_validation: boolean, platform_version: PlatformVersionLike): DataContract;
    static fromJSON(value: DataContractJSON, full_validation: boolean, platform_version: PlatformVersionLike): DataContract;
    static fromObject(value: DataContractObject, full_validation: boolean, platform_version: PlatformVersionLike): DataContract;
    static generateId(owner_id: IdentifierLike, identity_nonce: bigint): Identifier;
    setConfig(config: DataContractConfig, platformVersion: PlatformVersionLike): void;
    setSchemas(schemas: Record<string, object>, definitions: object | null | undefined, full_validation: boolean, platform_version: PlatformVersionLike): void;
    toBase64(platformVersion: PlatformVersionLike): string;
    toBytes(platformVersion: PlatformVersionLike): Uint8Array;
    toHex(platformVersion: PlatformVersionLike): string;
    toJSON(platform_version: PlatformVersionLike): DataContractJSON;
    toObject(platformVersion: PlatformVersionLike): DataContractObject;
    readonly config: DataContractConfig;
    groups: Record<number, Group>;
    get id(): Identifier;
    set id(value: IdentifierLike);
    get ownerId(): Identifier;
    set ownerId(value: IdentifierLike);
    readonly schemas: Record<string, object>;
    get tokens(): object;
    set tokens(value: Record<number, TokenConfiguration>);
    version: number;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-datacontracthistoryquery"></a>
## `DataContractHistoryQuery`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface DataContractHistoryQuery {
    /**
     * Data contract identifier.
     */
    dataContractId: IdentifierLike

    /**
     * Maximum number of entries to return.
     * @default undefined
     */
    limit?: number;

    /**
     * Millisecond timestamp (inclusive) to start from.
     * @default 0
     */
    startAtMs?: number;
}
```

<a id="type-document"></a>
## `Document`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class Document {
    free(): void;
    [Symbol.dispose](): void;
    constructor(options: DocumentOptions);
    static fromBase64(base64: string, dataContract: DataContract, typeName: string, platformVersion: PlatformVersionLike): Document;
    static fromBytes(bytes: Uint8Array, dataContract: DataContract, typeName: string, platformVersion: PlatformVersionLike): Document;
    static fromHex(hex: string, dataContract: DataContract, typeName: string, platformVersion: PlatformVersionLike): Document;
    /**
     * Create a Document from a JSON object.
     * JSON format has identifiers as base58 strings.
     */
    static fromJSON(value: DocumentJSON, platform_version: PlatformVersionLike): Document;
    /**
     * Create a Document from a JS object.
     */
    static fromObject(value: DocumentObject, platform_version: PlatformVersionLike): Document;
    static generateId(documentTypeName: string, ownerId: IdentifierLike, dataContractId: IdentifierLike, entropy?: Uint8Array | null): Uint8Array;
    toBase64(data_contract: DataContract, platform_version: PlatformVersionLike): string;
    toBytes(data_contract: DataContract, platform_version: PlatformVersionLike): Uint8Array;
    toHex(data_contract: DataContract, platform_version: PlatformVersionLike): string;
    /**
     * Convert to a JSON-compatible JS object with binary fields as strings.
     */
    toJSON(platform_version: PlatformVersionLike): DocumentJSON;
    /**
     * Convert to a JS object with binary fields as Uint8Array.
     */
    toObject(): DocumentObject;
    get createdAt(): bigint | undefined;
    set createdAt(value: bigint | null | undefined);
    get createdAtBlockHeight(): bigint | undefined;
    set createdAtBlockHeight(value: bigint | null | undefined);
    get createdAtCoreBlockHeight(): number | undefined;
    set createdAtCoreBlockHeight(value: number | null | undefined);
    get dataContractId(): Identifier;
    set dataContractId(value: IdentifierLike);
    documentTypeName: string;
    get entropy(): Uint8Array | undefined;
    set entropy(value: Uint8Array | null | undefined);
    get id(): Identifier;
    set id(value: IdentifierLike);
    get ownerId(): Identifier;
    set ownerId(value: IdentifierLike);
    properties: Record<string, unknown>;
    get revision(): bigint | undefined;
    set revision(value: bigint | null | undefined);
    get transferredAt(): bigint | undefined;
    set transferredAt(value: bigint | null | undefined);
    get transferredAtBlockHeight(): bigint | undefined;
    set transferredAtBlockHeight(value: bigint | null | undefined);
    get transferredAtCoreBlockHeight(): number | undefined;
    set transferredAtCoreBlockHeight(value: number | null | undefined);
    get updatedAt(): bigint | undefined;
    set updatedAt(value: bigint | null | undefined);
    get updatedAtBlockHeight(): bigint | undefined;
    set updatedAtBlockHeight(value: bigint | null | undefined);
    get updatedAtCoreBlockHeight(): number | undefined;
    set updatedAtCoreBlockHeight(value: number | null | undefined);
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-documentcreateoptions"></a>
## `DocumentCreateOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface DocumentCreateOptions {
    /**
     * The document to create.
     * Use `new Document(...)` or `Document.fromJSON(...)` to construct it.
     * Must include dataContractId, documentTypeName, ownerId, and entropy.
     */
    document: Document;

    /**
     * The identity public key to use for signing the transition.
     * Get this from the owner identity's public keys.
     */
    identityKey: IdentityPublicKey;

    /**
     * Signer containing the private key that corresponds to the identity key.
     * Use IdentitySigner to add the private key before calling.
     */
    signer: IdentitySigner;

    /**
     * Optional token payment agreement for document types with tokenCost.create.
     */
    tokenPaymentInfo?: DocumentTokenPaymentInfo;

    /**
     * Optional settings for the broadcast operation.
     * Includes retries, timeouts, userFeeIncrease, etc.
     */
    settings?: PutSettings;
}
```

<a id="type-documentdeleteoptions"></a>
## `DocumentDeleteOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface DocumentDeleteOptions {
    /**
     * The document to delete - either a Document instance or an object with identifiers.
     *
     * @example
     * // Using a Document instance
     * { document: myDocument, ... }
     *
     * // Using individual fields
     * { document: { id: "...", ownerId: "...", dataContractId: "...", documentTypeName: "note" }, ... }
     */
    document: Document | {
        id: IdentifierLike;
        ownerId: IdentifierLike;
        dataContractId: IdentifierLike;
        documentTypeName: string;
    };

    /**
     * The identity public key to use for signing the transition.
     * Get this from the owner identity's public keys.
     */
    identityKey: IdentityPublicKey;

    /**
     * Signer containing the private key that corresponds to the identity key.
     * Use IdentitySigner to add the private key before calling.
     */
    signer: IdentitySigner;

    /**
     * Optional token payment agreement for document types with tokenCost.delete.
     */
    tokenPaymentInfo?: DocumentTokenPaymentInfo;

    /**
     * Optional settings for the broadcast operation.
     * Includes retries, timeouts, userFeeIncrease, etc.
     */
    settings?: PutSettings;
}
```

<a id="type-documentorderbyclause"></a>
## `DocumentOrderByClause`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type DocumentOrderByClause = [string, 'asc' | 'desc'];
```

<a id="type-documentpurchaseoptions"></a>
## `DocumentPurchaseOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface DocumentPurchaseOptions {
    /**
     * The document to purchase.
     * Must include id, ownerId, dataContractId, documentTypeName, and revision.
     */
    document: Document;

    /**
     * The buyer's identity ID.
     */
    buyerId: Identifier;

    /**
     * The purchase price in credits.
     * Must match the document's listed price.
     */
    price: bigint;

    /**
     * The public key to use for signing the transition.
     * Get this from the buyer identity's public keys.
     */
    identityKey: IdentityPublicKey;

    /**
     * Signer containing the private key that corresponds to the identity key.
     * Use IdentitySigner to add the private key before calling.
     */
    signer: IdentitySigner;

    /**
     * Optional token payment agreement for document types with tokenCost.purchase.
     */
    tokenPaymentInfo?: DocumentTokenPaymentInfo;

    /**
     * Optional settings for the broadcast operation.
     * Includes retries, timeouts, userFeeIncrease, etc.
     */
    settings?: PutSettings;
}
```

<a id="type-documentreplaceoptions"></a>
## `DocumentReplaceOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface DocumentReplaceOptions {
    /**
     * The document with updated data.
     * Must have the same ID as the existing document.
     * Revision should be set to current revision + 1.
     */
    document: Document;

    /**
     * The identity public key to use for signing the transition.
     * Get this from the owner identity's public keys.
     */
    identityKey: IdentityPublicKey;

    /**
     * Signer containing the private key that corresponds to the identity key.
     * Use IdentitySigner to add the private key before calling.
     */
    signer: IdentitySigner;

    /**
     * Optional token payment agreement for document types with tokenCost.replace.
     */
    tokenPaymentInfo?: DocumentTokenPaymentInfo;

    /**
     * Optional settings for the broadcast operation.
     * Includes retries, timeouts, userFeeIncrease, etc.
     */
    settings?: PutSettings;
}
```

<a id="type-documentsetpriceoptions"></a>
## `DocumentSetPriceOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface DocumentSetPriceOptions {
    /**
     * The document to set a price on.
     * Must include id, ownerId, dataContractId, documentTypeName, and revision.
     */
    document: Document;

    /**
     * The price in credits.
     * Set to 0 to remove the price and make the document not for sale.
     */
    price: bigint;

    /**
     * The identity public key to use for signing the transition.
     * Get this from the owner identity's public keys.
     */
    identityKey: IdentityPublicKey;

    /**
     * Signer containing the private key that corresponds to the identity key.
     * Use IdentitySigner to add the private key before calling.
     */
    signer: IdentitySigner;

    /**
     * Optional token payment agreement for document types with tokenCost.update_price.
     */
    tokenPaymentInfo?: DocumentTokenPaymentInfo;

    /**
     * Optional settings for the broadcast operation.
     * Includes retries, timeouts, userFeeIncrease, etc.
     */
    settings?: PutSettings;
}
```

<a id="type-documenttokenpaymentinfo"></a>
## `DocumentTokenPaymentInfo`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface DocumentTokenPaymentInfo {
    /**
     * Optional external token contract ID.
     * If omitted, the token is expected to come from the current document contract.
     */
    paymentTokenContractId?: IdentifierLike;

    /**
     * Token position within the token contract.
     */
    tokenContractPosition: number;

    /**
     * Optional minimum token amount the payer agrees to spend.
     */
    minimumTokenCost?: bigint;

    /**
     * Optional maximum token amount the payer agrees to spend.
     */
    maximumTokenCost?: bigint;

    /**
     * Which party covers gas fees for the document action.
     */
    gasFeesPaidBy?: GasFeesPaidByLike;
}
```

<a id="type-documenttransferoptions"></a>
## `DocumentTransferOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface DocumentTransferOptions {
    /**
     * The document to transfer.
     * Must include id, ownerId, dataContractId, documentTypeName, and revision.
     */
    document: Document;

    /**
     * The new owner's identity ID.
     */
    recipientId: Identifier;

    /**
     * The identity public key to use for signing the transition.
     * Get this from the owner identity's public keys.
     */
    identityKey: IdentityPublicKey;

    /**
     * Signer containing the private key that corresponds to the identity key.
     * Use IdentitySigner to add the private key before calling.
     */
    signer: IdentitySigner;

    /**
     * Optional token payment agreement for document types with tokenCost.transfer.
     */
    tokenPaymentInfo?: DocumentTokenPaymentInfo;

    /**
     * Optional settings for the broadcast operation.
     * Includes retries, timeouts, userFeeIncrease, etc.
     */
    settings?: PutSettings;
}
```

<a id="type-documentwhereclause"></a>
## `DocumentWhereClause`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type DocumentWhereClause = [string, DocumentWhereOperator, unknown];
```

<a id="type-documentsquery"></a>
## `DocumentsQuery`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface DocumentsQuery {
    /**
     * Data contract identifier.
     */
    dataContractId: IdentifierLike

    /**
     * Document type name.
     */
    documentTypeName: string;

    /**
     * Optional filter clauses expressed as [field, operator, value].
     * @default []
     */
    where?: DocumentWhereClause[];

    /**
     * Optional sorting clauses expressed as [field, direction].
     * @default []
     */
    orderBy?: DocumentOrderByClause[];

    /**
     * Maximum number of documents to return.
     * @default 100
     */
    limit?: number;

    /**
     * Exclusive document ID to resume from.
     * @default undefined
     */
    startAfter?: IdentifierLike

    /**
     * Inclusive document ID to start from.
     * @default undefined
     */
    startAt?: IdentifierLike

    /**
     * Count-query knob: SQL-shaped `GROUP BY` field list. Mirrors
     * the v1 wire's `group_by: repeated string` directly. Ignored
     * by the regular document-fetch path.
     *
     * - `[]` or omitted → aggregate count (a single row).
     * - `["<in_field>"]` where `<in_field>` matches an `In`
     *   constraint → per-`In`-value entries (PerInValue).
     * - `["<range_field>"]` where `<range_field>` matches a range
     *   constraint → per-distinct-value entries within the range
     *   (RangeDistinct).
     * - `["<in_field>", "<range_field>"]` for compound `In + range`
     *   queries → compound distinct entries.
     *
     * Entry direction comes from the first `orderBy` clause's
     * direction (which also drives walk order on the materialize +
     * prove path); set `orderBy: [["<range_field>", "asc"|"desc"]]`
     * alongside `groupBy: ["<range_field>"]` to control sort.
     * @default []
     */
    groupBy?: string[];
}
```

<a id="type-dpnsregisternameoptions"></a>
## `DpnsRegisterNameOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface DpnsRegisterNameOptions {
    /**
     * The username label to register (without the .dash suffix).
     * Must be a valid DPNS username (3-63 characters, alphanumeric and hyphens).
     */
    label: string;

    /**
     * The identity that will own the username.
     * Fetch the identity first using `getIdentity()`.
     */
    identity: Identity;

    /**
     * The identity public key to use for signing the transition.
     * Get this from the identity's public keys.
     */
    identityKey: IdentityPublicKey;

    /**
     * Signer containing the private key that corresponds to the identity key.
     * Use IdentitySigner to add the private key before calling.
     */
    signer: IdentitySigner;

    /**
     * Optional callback called after the preorder document is submitted.
     * Receives the preorder Document object.
     */
    preorderCallback?: (preorderDocument: Document) => void;
}
```

<a id="type-dpnsusernameinfo"></a>
## `DpnsUsernameInfo`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class DpnsUsernameInfo {
    free(): void;
    [Symbol.dispose](): void;
    constructor(username: string, identity_id: Identifier, document_id: Identifier);
    static fromJSON(js: object): DpnsUsernameInfo;
    static fromObject(obj: object): DpnsUsernameInfo;
    toJSON(): any;
    toObject(): any;
    documentId: Identifier;
    identityId: Identifier;
    username: string;
}
```

<a id="type-dpnsusernamesquery"></a>
## `DpnsUsernamesQuery`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface DpnsUsernamesQuery {
    /**
     * Identity to fetch usernames for.
     */
    identityId: IdentifierLike;

    /**
     * Maximum number of usernames to return. Use 0 for default.
     * @default 10
     */
    limit?: number;
}
```

<a id="type-epochsquery"></a>
## `EpochsQuery`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface EpochsQuery {
    /**
     * Starting epoch index.
     * @default undefined (uses platform default)
     */
    startEpoch?: number;

    /**
     * Maximum number of epochs to return.
     * @default undefined
     */
    count?: number;

    /**
     * Sort order for returned epochs.
     * @default true
     */
    ascending?: boolean;
}
```

<a id="type-evonodeproposedblocksrangequery"></a>
## `EvonodeProposedBlocksRangeQuery`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface EvonodeProposedBlocksRangeQuery {
    /**
     * Epoch index to query.
     */
    epoch: number;

    /**
     * Maximum number of items to return.
     * @default undefined
     */
    limit?: number;

    /**
     * ProTxHash to resume from (exclusive by default).
     * @default undefined
     */
    startAfter?: ProTxHashLike;
}
```

<a id="type-extendedepochinfo"></a>
## `ExtendedEpochInfo`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class ExtendedEpochInfo {
    free(): void;
    [Symbol.dispose](): void;
    constructor(options: ExtendedEpochInfoOptions);
    static fromJSON(js: ExtendedEpochInfoJSON): ExtendedEpochInfo;
    static fromObject(obj: ExtendedEpochInfoObject): ExtendedEpochInfo;
    toJSON(): ExtendedEpochInfoJSON;
    toObject(): ExtendedEpochInfoObject;
    readonly feeMultiplier: number;
    feeMultiplierPermille: bigint;
    firstBlockHeight: bigint;
    firstBlockTime: bigint;
    firstCoreBlockHeight: number;
    index: number;
    protocolVersion: number;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-feestrategystep"></a>
## `FeeStrategyStep`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class FeeStrategyStep {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Creates a step that deducts the fee from the input at the given index.
     *
     * The input must have remaining balance after its contribution to outputs.
     *
     * @param index - The index of the input address to deduct fee from
     */
    static deductFromInput(index: number): FeeStrategyStep;
    /**
     * Creates a step that reduces the output at the given index by the fee amount.
     *
     * The output amount will be reduced to cover the fee.
     *
     * @param index - The index of the output address to reduce
     */
    static reduceOutput(index: number): FeeStrategyStep;
    /**
     * Returns the index associated with this step.
     */
    readonly index: number;
    /**
     * Returns true if this step deducts from an input.
     */
    readonly isDeductFromInput: boolean;
    /**
     * Returns true if this step reduces an output.
     */
    readonly isReduceOutput: boolean;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-finalizedepochinfo"></a>
## `FinalizedEpochInfo`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class FinalizedEpochInfo {
    free(): void;
    [Symbol.dispose](): void;
    constructor(options: FinalizedEpochInfoOptions);
    static fromJSON(js: FinalizedEpochInfoJSON): FinalizedEpochInfo;
    static fromObject(obj: FinalizedEpochInfoObject): FinalizedEpochInfo;
    toJSON(): FinalizedEpochInfoJSON;
    toObject(): FinalizedEpochInfoObject;
    blockProposers: BlockProposersMap;
    coreBlockRewards: bigint;
    readonly feeMultiplier: number;
    feeMultiplierPermille: bigint;
    firstBlockHeight: bigint;
    firstBlockTime: bigint;
    firstCoreBlockHeight: number;
    nextEpochStartCoreBlockHeight: number;
    protocolVersion: number;
    totalBlocksInEpoch: bigint;
    totalCreatedStorageFees: bigint;
    totalDistributedStorageFees: bigint;
    totalProcessingFees: bigint;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-finalizedepochsquery"></a>
## `FinalizedEpochsQuery`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface FinalizedEpochsQuery {
    /**
     * Starting epoch index (required).
     */
    startEpoch: number;

    /**
     * Maximum number of epochs to return.
     * @default 100
     */
    count?: number;

    /**
     * Sort order for returned epochs.
     * @default true
     */
    ascending?: boolean;
}
```

<a id="type-group"></a>
## `Group`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class Group {
    free(): void;
    [Symbol.dispose](): void;
    constructor(members: GroupMembersMap, requiredPower: number);
    static fromJSON(object: GroupJSON): Group;
    static fromObject(value: GroupObject): Group;
    setMemberRequiredPower(member: IdentifierLike, memberRequiredPower: number): void;
    toJSON(): GroupJSON;
    toObject(): GroupObject;
    members: GroupMembersMap;
    requiredPower: number;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-groupaction"></a>
## `GroupAction`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class GroupAction {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromJSON(js: GroupActionJSON): GroupAction;
    static fromObject(obj: GroupActionObject): GroupAction;
    toJSON(): GroupActionJSON;
    toObject(): GroupActionObject;
    readonly contractId: Identifier;
    readonly event: GroupActionEvent;
    readonly proposerId: Identifier;
    static readonly __struct: string;
    readonly tokenContractPosition: number;
    readonly __type: string;
}
```

<a id="type-groupactionsignersquery"></a>
## `GroupActionSignersQuery`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface GroupActionSignersQuery {
    /**
     * Data contract identifier.
     */
    dataContractId: IdentifierLike

    /**
     * Position of the group within the contract.
     */
    groupContractPosition: number;

    /**
     * Action status filter.
     */
    status: GroupActionStatusFilter;

    /**
     * Group action identifier.
     */
    actionId: IdentifierLike
}
```

<a id="type-groupactionstatusfilter"></a>
## `GroupActionStatusFilter`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type GroupActionStatusFilter = 'ACTIVE' | 'CLOSED';
```

<a id="type-groupactionsquery"></a>
## `GroupActionsQuery`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface GroupActionsQuery {
    /**
     * Data contract identifier.
     */
    dataContractId: IdentifierLike

    /**
     * Position of the group within the contract.
     */
    groupContractPosition: number;

    /**
     * Filter actions by status.
     */
    status: GroupActionStatusFilter;

    /**
     * Cursor describing where to resume from.
     * @default undefined
     */
    startAt?: GroupActionsStartAt;

    /**
     * Maximum number of actions to return.
     * @default undefined
     */
    limit?: number;
}
```

<a id="type-groupactionsstartat"></a>
## `GroupActionsStartAt`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface GroupActionsStartAt {
    /**
     * Group action identifier.
     */
    actionId: IdentifierLike

    /**
     * Include the `actionId` entry in the result set.
     * @default false
     */
    included?: boolean;
}
```

<a id="type-groupinfosquery"></a>
## `GroupInfosQuery`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface GroupInfosQuery {
    /**
     * Data contract identifier.
     */
    dataContractId: IdentifierLike

    /**
     * Cursor describing where to resume from.
     * @default undefined
     */
    startAt?: GroupInfosStartAt;

    /**
     * Maximum number of groups to return.
     * @default undefined
     */
    limit?: number;
}
```

<a id="type-groupinfosstartat"></a>
## `GroupInfosStartAt`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface GroupInfosStartAt {
    /**
     * Group contract position.
     */
    position: number;

    /**
     * Include the entry at `position`.
     * @default false
     */
    included?: boolean;
}
```

<a id="type-groupmembersquery"></a>
## `GroupMembersQuery`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface GroupMembersQuery {
    /**
     * Data contract identifier.
     */
    dataContractId: IdentifierLike

    /**
     * Group position inside the contract.
     */
    groupContractPosition: number;

    /**
     * Optional list of member IDs to retrieve. When provided, pagination options are ignored.
     * @default undefined
     */
    memberIds?: Array<Identifier | Uint8Array | string>;

    /**
     * Member identifier to resume from.
     * @default undefined
     */
    startAtMemberId?: IdentifierLike

    /**
     * Maximum number of members to return when not requesting specific IDs.
     * @default undefined
     */
    limit?: number;
}
```

<a id="type-groupstatetransitioninfostatus"></a>
## `GroupStateTransitionInfoStatus`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class GroupStateTransitionInfoStatus {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Create a new other signer status for voting on an existing group action.
     *
     * Use this when the identity is signing/voting on an action proposed by someone else.
     *
     * @param groupContractPosition - The position of the group in the contract
     * @param actionId - The ID of the action being voted on
     * @returns GroupStateTransitionInfoStatus for an other signer
     */
    static otherSigner(groupContractPosition: number, actionId: IdentifierLike): GroupStateTransitionInfoStatus;
    /**
     * Create a new proposer status for initiating a group action.
     *
     * Use this when the identity is proposing a new group action.
     *
     * @param groupContractPosition - The position of the group in the contract
     * @returns GroupStateTransitionInfoStatus for a proposer
     */
    static proposer(groupContractPosition: number): GroupStateTransitionInfoStatus;
    /**
     * Convert to GroupStateTransitionInfo.
     */
    toInfo(): GroupStateTransitionInfo;
    /**
     * Get the action ID (only available for other signer status).
     * Returns null for proposer status.
     */
    readonly actionId: Identifier | undefined;
    /**
     * Get the group contract position.
     */
    readonly groupContractPosition: number;
    /**
     * Check if this is a proposer status.
     */
    readonly isProposer: boolean;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-grovepathsegment"></a>
## `GrovePathSegment`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type GrovePathSegment = string | Uint8Array;
```

<a id="type-identifier"></a>
## `Identifier`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class Identifier {
    free(): void;
    [Symbol.dispose](): void;
    constructor(identifier: IdentifierLike);
    static fromBase58(base58: string): Identifier;
    static fromBase64(base64: string): Identifier;
    static fromBytes(bytes: Uint8Array): Identifier;
    static fromHex(hex: string): Identifier;
    toBase58(): string;
    toBase64(): string;
    toBytes(): Uint8Array;
    toHex(): string;
    /**
     * Returns the identifier as a Base58 string for JSON serialization.
     * This method is called automatically when the object is serialized to JSON.
     */
    toJSON(): string;
    /**
     * Returns the identifier as a Base58 string.
     * This is the default string representation for JavaScript.
     */
    toString(): string;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-identifierlike"></a>
## `IdentifierLike`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type IdentifierLike = Identifier | Uint8Array | string;
```

<a id="type-identifierlikearray"></a>
## `IdentifierLikeArray`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type IdentifierLikeArray = Array<IdentifierLike>;
```

<a id="type-identitiescontractkeysquery"></a>
## `IdentitiesContractKeysQuery`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface IdentitiesContractKeysQuery {
    /**
     * Identity identifiers to fetch keys for.
     */
    identityIds: Array<IdentifierLike>;

    /**
     * Data contract identifier (reserved for future filtering).
     */
    contractId: IdentifierLike;

    /**
     * Optional list of purposes to include.
     * @default undefined
     */
    purposes?: number[];
}
```

<a id="type-identity"></a>
## `Identity`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class Identity {
    free(): void;
    [Symbol.dispose](): void;
    addPublicKey(publicKey: IdentityPublicKey): void;
    constructor(id: IdentifierLike);
    static fromBase64(base64: string): Identity;
    static fromBytes(bytes: Uint8Array): Identity;
    static fromHex(hex: string): Identity;
    static fromJSON(value: IdentityJSON): Identity;
    static fromObject(value: IdentityObject, platform_version: PlatformVersionLike): Identity;
    getPublicKeyById(keyId: number): IdentityPublicKey | undefined;
    toBase64(): string;
    toBytes(): Uint8Array;
    toHex(): string;
    toJSON(): IdentityJSON;
    toObject(): IdentityObject;
    balance: bigint;
    get id(): Identifier;
    set id(value: IdentifierLike);
    readonly publicKeys: IdentityPublicKey[];
    revision: bigint;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-identitybalanceandrevision"></a>
## `IdentityBalanceAndRevision`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class IdentityBalanceAndRevision {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromJSON(js: object): IdentityBalanceAndRevision;
    static fromObject(obj: object): IdentityBalanceAndRevision;
    toJSON(): any;
    toObject(): any;
    readonly balance: bigint;
    readonly revision: bigint;
}
```

<a id="type-identitycontractkeys"></a>
## `IdentityContractKeys`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class IdentityContractKeys {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    identityId: Identifier;
    keys: IdentityPublicKey[];
}
```

<a id="type-identitycreatefromaddressesoptions"></a>
## `IdentityCreateFromAddressesOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface IdentityCreateFromAddressesOptions {
    /**
     * The identity to create (with public keys set up).
     * Use Identity.create() to build the identity structure first.
     */
    identity: Identity;

    /**
     * Array of input addresses with amounts to use for funding.
     * Use PlatformAddressInput for typed inputs (nonces fetched automatically).
     */
    inputs: PlatformAddressInput[];

    /**
     * Optional change output address and amount.
     * If provided, remaining credits will be sent to this address.
     */
    changeOutput?: PlatformAddressOutput;

    /**
     * Signer containing private keys for the identity's public keys.
     * Use IdentitySigner to add keys for signing identity key proofs.
     */
    identitySigner: IdentitySigner;

    /**
     * Signer containing private keys for all input addresses.
     * Use PlatformAddressSigner to add keys for signing address inputs.
     */
    addressSigner: PlatformAddressSigner;

    /**
     * Optional settings for the broadcast operation.
     * Includes retries, timeouts, userFeeIncrease, etc.
     */
    settings?: PutSettings;
}
```

<a id="type-identitycreatefromaddressesresult"></a>
## `IdentityCreateFromAddressesResult`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class IdentityCreateFromAddressesResult {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Map of addresses to their updated info after the identity creation.
     */
    readonly addressInfos: Map<any, any>;
    /**
     * The newly created identity.
     */
    readonly identity: Identity;
}
```

<a id="type-identitycreateoptions"></a>
## `IdentityCreateOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface IdentityCreateOptions {
    /**
     * The identity to create (with public keys set up).
     * Use Identity.create() to build the identity structure first.
     */
    identity: Identity;

    /**
     * Asset lock proof from the Core chain.
     * Use AssetLockProof.createInstantAssetLockProof() or AssetLockProof.createChainAssetLockProof().
     */
    assetLockProof: AssetLockProof;

    /**
     * Private key for signing the asset lock proof.
     * This is the private key that controls the asset lock output.
     */
    assetLockPrivateKey: PrivateKey;

    /**
     * Signer containing private keys for the identity's public keys.
     * Use IdentitySigner to add keys for signing identity key proofs.
     */
    signer: IdentitySigner;

    /**
     * Optional settings for the broadcast operation.
     * Includes retries, timeouts, userFeeIncrease, etc.
     */
    settings?: PutSettings;
}
```

<a id="type-identitycredittransferoptions"></a>
## `IdentityCreditTransferOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface IdentityCreditTransferOptions {
    /**
     * The sender identity.
     */
    identity: Identity;

    /**
     * The identity ID of the recipient.
     */
    recipientId: IdentifierLike;

    /**
     * The amount of credits to transfer.
     */
    amount: bigint;

    /**
     * Signer containing the private key for the sender's transfer key.
     * Use IdentitySigner to add the transfer key before calling.
     */
    signer: IdentitySigner;

    /**
     * Optional identity public key to use for signing.
     * If not provided, auto-selects an available transfer key.
     */
    signingKey?: IdentityPublicKey;

    /**
     * Optional settings for the broadcast operation.
     * Includes retries, timeouts, userFeeIncrease, etc.
     */
    settings?: PutSettings;
}
```

<a id="type-identitycredittransferresult"></a>
## `IdentityCreditTransferResult`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class IdentityCreditTransferResult {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Balance of the recipient identity after the transfer.
     */
    readonly recipientBalance: bigint;
    /**
     * Balance of the sender identity after the transfer.
     */
    readonly senderBalance: bigint;
}
```

<a id="type-identitycreditwithdrawaloptions"></a>
## `IdentityCreditWithdrawalOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface IdentityCreditWithdrawalOptions {
    /**
     * The identity to withdraw from.
     */
    identity: Identity;

    /**
     * The amount of credits to withdraw.
     */
    amount: bigint;

    /**
     * Optional Dash address to send the withdrawn credits to.
     */
    toAddress?: string;

    /**
     * Core (L1) fee per byte for the withdrawal transaction.
     * This determines the mining fee for the Core blockchain transaction.
     * @default 1
     */
    coreFeePerByte?: number;

    /**
     * Signer containing the private key for the identity's transfer/owner key.
     * Use IdentitySigner to add the key before calling.
     */
    signer: IdentitySigner;

    /**
     * Optional identity public key to use for signing.
     * If not provided, auto-selects a matching transfer or owner key.
     */
    signingKey?: IdentityPublicKey;

    /**
     * Optional settings for the broadcast operation.
     * Includes retries, timeouts, userFeeIncrease, etc.
     */
    settings?: PutSettings;
}
```

<a id="type-identitygroupinfo"></a>
## `IdentityGroupInfo`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class IdentityGroupInfo {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    dataContractId: string;
    groupContractPosition: number;
    role: string;
    readonly power: bigint | undefined;
}
```

<a id="type-identitygroupsquery"></a>
## `IdentityGroupsQuery`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface IdentityGroupsQuery {
    /**
     * Identity identifier.
     */
    identityId: IdentifierLike

    /**
     * Data contracts where the identity participates as a member.
     * @default undefined
     */
    memberDataContracts?: Array<Identifier | Uint8Array | string>;

    /**
     * Data contracts where the identity participates as an owner.
     * (Currently not implemented server-side.)
     * @default undefined
     */
    ownerDataContracts?: Array<Identifier | Uint8Array | string>;

    /**
     * Data contracts where the identity participates as a moderator.
     * (Currently not implemented server-side.)
     * @default undefined
     */
    moderatorDataContracts?: Array<Identifier | Uint8Array | string>;
}
```

<a id="type-identitykeysquery"></a>
## `IdentityKeysQuery`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface IdentityKeysQuery {
    /**
     * Identity identifier.
     */
    identityId: IdentifierLike

    /**
     * Requested key selection strategy.
     */
    request: IdentityKeysRequest;

    /**
     * Maximum number of keys to return after applying request filters.
     * @default undefined (no additional limit)
     */
    limit?: number;

    /**
     * Number of keys to skip from the beginning of the result set.
     * @default undefined
     */
    offset?: number;
}
```

<a id="type-identitykeysrequest"></a>
## `IdentityKeysRequest`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type IdentityKeysRequest =
| {
    /**
     * Fetch all keys associated with the identity.
     */
    type: 'all';
}
| {
    /**
     * Fetch only the provided key identifiers.
     */
    type: 'specific';

    /**
     * Public key identifiers to return.
     */
    specificKeyIds: number[];
}
| {
    /**
     * Search keys by purpose and security level requirements.
     */
    type: 'search';

    /**
     * Purpose → security level selector map.
     */
    purposeMap: IdentityKeysPurposeMap;
};
```

<a id="type-identitypublickey"></a>
## `IdentityPublicKey`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class IdentityPublicKey {
    free(): void;
    [Symbol.dispose](): void;
    base64(): string;
    constructor(options: IdentityPublicKeyOptions);
    static fromBase64(hex: string): IdentityPublicKey;
    static fromBytes(bytes: Uint8Array): IdentityPublicKey;
    static fromHex(hex: string): IdentityPublicKey;
    /**
     * Deserialize from JSON-compatible JS object (human-readable).
     *
     * Uses serde_json conversion which properly handles the tagged enum
     * and deserializes base64 strings to binary data.
     */
    static fromJSON(value: IdentityPublicKeyJSON, platform_version: PlatformVersionLike): IdentityPublicKey;
    /**
     * Deserialize from JS object (non-human-readable).
     *
     * Uses platform_value conversion which properly handles the tagged enum.
     */
    static fromObject(value: IdentityPublicKeyObject, platform_version: PlatformVersionLike): IdentityPublicKey;
    getPublicKeyHash(): string;
    hex(): string;
    toBytes(): Uint8Array;
    /**
     * Serialize to JSON-compatible JS object (human-readable).
     *
     * Uses serde_json conversion which properly handles the tagged enum
     * and serializes binary data as base64 strings.
     */
    toJSON(): IdentityPublicKeyJSON;
    /**
     * Serialize to JS object (non-human-readable).
     *
     * Uses platform_value conversion which properly handles the tagged enum
     * and removes None fields like disabledAt.
     */
    toObject(): IdentityPublicKeyObject;
    validatePrivateKey(private_key_bytes_input: Uint8Array, network: NetworkLike): boolean;
    readonly contractBounds: ContractBounds | undefined;
    data: string;
    get disabledAt(): bigint | undefined;
    set disabledAt(value: any);
    readonly isMaster: boolean;
    isReadOnly: boolean;
    get keyId(): number;
    set keyId(value: any);
    get keyType(): string;
    set keyType(value: KeyTypeLike);
    readonly keyTypeNumber: KeyType;
    get purpose(): string;
    set purpose(value: PurposeLike);
    readonly purposeNumber: Purpose;
    get securityLevel(): string;
    set securityLevel(value: SecurityLevelLike);
    readonly securityLevelNumber: SecurityLevel;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-identitypublickeyincreation"></a>
## `IdentityPublicKeyInCreation`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class IdentityPublicKeyInCreation {
    free(): void;
    [Symbol.dispose](): void;
    constructor(options: IdentityPublicKeyInCreationOptions);
    static fromJSON(js: IdentityPublicKeyInCreationJSON): IdentityPublicKeyInCreation;
    static fromObject(obj: IdentityPublicKeyInCreationObject): IdentityPublicKeyInCreation;
    getHash(): Uint8Array;
    toIdentityPublicKey(): IdentityPublicKey;
    toJSON(): IdentityPublicKeyInCreationJSON;
    toObject(): IdentityPublicKeyInCreationObject;
    get contractBounds(): ContractBounds | undefined;
    set contractBounds(value: ContractBounds | null | undefined);
    data: Uint8Array;
    isReadOnly: boolean;
    get keyId(): number;
    set keyId(value: any);
    get keyType(): string;
    set keyType(value: KeyTypeLike);
    get purpose(): string;
    set purpose(value: PurposeLike);
    get securityLevel(): string;
    set securityLevel(value: SecurityLevelLike);
    signature: Uint8Array;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-identitysigner"></a>
## `IdentitySigner`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class IdentitySigner {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Adds a private key to the signer.
     *
     * The key is stored by public key hash (20 bytes): Hash160(compressed_public_key)
     *
     * @param privateKey - The PrivateKey object
     */
    addKey(privateKey: PrivateKey): void;
    /**
     * Adds a private key from WIF format.
     *
     * @param wif - The private key in WIF format
     */
    addKeyFromWif(wif: string): void;
    /**
     * Creates a new empty IdentitySigner.
     */
    constructor();
    /**
     * Returns the number of keys in this signer.
     */
    readonly keyCount: number;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-identitytokeninfo"></a>
## `IdentityTokenInfo`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class IdentityTokenInfo {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    readonly isFrozen: boolean;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-identitytopupfromaddressesoptions"></a>
## `IdentityTopUpFromAddressesOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface IdentityTopUpFromAddressesOptions {
    /**
     * The identity to top up.
     */
    identity: Identity;

    /**
     * Array of input addresses with amounts to use for top up.
     * Use PlatformAddressInput for typed inputs (nonces fetched automatically).
     */
    inputs: PlatformAddressInput[];

    /**
     * Signer containing private keys for all input addresses.
     * Use PlatformAddressSigner to add keys before calling top up.
     */
    signer: PlatformAddressSigner;

    /**
     * Optional settings for the broadcast operation.
     * Includes retries, timeouts, userFeeIncrease, etc.
     */
    settings?: PutSettings;
}
```

<a id="type-identitytopupfromaddressesresult"></a>
## `IdentityTopUpFromAddressesResult`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class IdentityTopUpFromAddressesResult {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Map of addresses to their updated info after the top up.
     */
    readonly addressInfos: Map<any, any>;
    /**
     * New balance of the identity after top up.
     */
    readonly newBalance: bigint;
}
```

<a id="type-identitytopupoptions"></a>
## `IdentityTopUpOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface IdentityTopUpOptions {
    /**
     * The identity to top up.
     */
    identity: Identity;

    /**
     * Asset lock proof from the Core chain.
     * Use AssetLockProof.createInstantAssetLockProof() or AssetLockProof.createChainAssetLockProof().
     */
    assetLockProof: AssetLockProof;

    /**
     * Private key for signing the asset lock proof.
     * This is the private key that controls the asset lock output.
     */
    assetLockPrivateKey: PrivateKey;

    /**
     * Optional settings for the broadcast operation.
     * Includes retries, timeouts, userFeeIncrease, etc.
     */
    settings?: PutSettings;
}
```

<a id="type-identitytransfertoaddressesoptions"></a>
## `IdentityTransferToAddressesOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface IdentityTransferToAddressesOptions {
    /**
     * The identity to transfer credits from.
     */
    identity: Identity;

    /**
     * Array of output addresses with amounts to receive.
     * Use PlatformAddressOutput for typed outputs.
     */
    outputs: PlatformAddressOutput[];

    /**
     * Signer containing the private key(s) for signing with identity transfer key(s).
     * Use IdentitySigner to add keys before calling transfer.
     */
    signer: IdentitySigner;

    /**
     * Optional key ID to use for signing.
     * If not specified, will auto-select a matching transfer key.
     */
    signingTransferKeyId?: number;

    /**
     * Optional settings for the broadcast operation.
     * Includes retries, timeouts, userFeeIncrease, etc.
     */
    settings?: PutSettings;
}
```

<a id="type-identitytransfertoaddressesresult"></a>
## `IdentityTransferToAddressesResult`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class IdentityTransferToAddressesResult {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Map of addresses to their updated info after the transfer.
     */
    readonly addressInfos: Map<any, any>;
    /**
     * New balance of the identity after transfer.
     */
    readonly newBalance: bigint;
}
```

<a id="type-identityupdateoptions"></a>
## `IdentityUpdateOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface IdentityUpdateOptions {
    /**
     * The identity to update.
     */
    identity: Identity;

    /**
     * Array of public keys to add to the identity.
     * Use IdentityPublicKeyInCreation to create new keys.
     */
    addPublicKeys?: IdentityPublicKeyInCreation[];

    /**
     * Array of key IDs to disable.
     * Cannot disable master, critical auth, or transfer keys.
     */
    disablePublicKeys?: number[];

    /**
     * Signer containing the private key for the identity's master key.
     * Use IdentitySigner to add the master key before calling.
     */
    signer: IdentitySigner;

    /**
     * Optional settings for the broadcast operation.
     * Includes retries, timeouts, userFeeIncrease, etc.
     */
    settings?: PutSettings;
}
```

<a id="type-masternodevoteoptions"></a>
## `MasternodeVoteOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface MasternodeVoteOptions {
    /**
     * The ProTxHash of the masternode.
     */
    masternodeProTxHash: Identifier;

    /**
     * The vote poll to vote on.
     * Use VotePoll.createContestedDocumentResourceVotePoll() to create.
     */
    votePoll: VotePoll;

    /**
     * The vote choice.
     * Use ResourceVoteChoice.towardsIdentity(), ResourceVoteChoice.abstain(), or ResourceVoteChoice.lock().
     */
    voteChoice: ResourceVoteChoice;

    /**
     * The masternode's voting public key.
     * This should be the voting key associated with the masternode.
     */
    votingKey: IdentityPublicKey;

    /**
     * Signer containing the private key for the masternode's voting key.
     * Use IdentitySigner to add the voting key before calling.
     */
    signer: IdentitySigner;

    /**
     * Optional settings for the broadcast operation.
     * Includes retries, timeouts, userFeeIncrease, etc.
     */
    settings?: PutSettings;
}
```

<a id="type-pathelement"></a>
## `PathElement`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class PathElement {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromJSON(js: object): PathElement;
    static fromObject(obj: object): PathElement;
    toJSON(): any;
    toObject(): any;
    get value(): string | undefined;
    set value(value: string | null | undefined);
    readonly elementType: GroveElementType | undefined;
    readonly key: Uint8Array;
    readonly path: Array<any>;
    readonly pathBytes: Uint8Array[];
    readonly referenceTarget: Uint8Array[] | undefined;
    readonly referenceTargetError: string | undefined;
    readonly sum: bigint | undefined;
    readonly valueBytes: Uint8Array | undefined;
}
```

<a id="type-platformaddressinfo"></a>
## `PlatformAddressInfo`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class PlatformAddressInfo {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromJSON(js: object): PlatformAddressInfo;
    static fromObject(obj: object): PlatformAddressInfo;
    toJSON(): any;
    toObject(): any;
    /**
     * Returns the platform address.
     */
    readonly address: PlatformAddress;
    /**
     * Returns the balance stored for the address in credits.
     */
    readonly balance: bigint;
    /**
     * Returns the nonce associated with the address.
     */
    readonly nonce: bigint;
}
```

<a id="type-platformaddressinput"></a>
## `PlatformAddressInput`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class PlatformAddressInput {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Creates a new PlatformAddressInput.
     *
     * @param address - The Platform address (PlatformAddress, Uint8Array, or bech32m string)
     * @param nonce - The current nonce of the address (will be incremented for the transaction)
     * @param amount - The amount of credits to spend from this address
     */
    constructor(address: PlatformAddressLike, nonce: number, amount: bigint);
    /**
     * Returns the Platform address.
     */
    readonly address: PlatformAddress;
    /**
     * Returns the amount.
     */
    readonly amount: bigint;
    /**
     * Returns the nonce.
     */
    readonly nonce: number;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-platformaddresslike"></a>
## `PlatformAddressLike`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type PlatformAddressLike = PlatformAddress | Uint8Array | string;
```

<a id="type-platformaddresslikearray"></a>
## `PlatformAddressLikeArray`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type PlatformAddressLikeArray = Array<PlatformAddressLike>;
```

<a id="type-platformaddressoutput"></a>
## `PlatformAddressOutput`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class PlatformAddressOutput {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Creates a new PlatformAddressOutput with a specific amount.
     *
     * @param address - The Platform address (PlatformAddress, Uint8Array, or bech32m string)
     * @param amount - The amount of credits to send to this address (optional for asset lock funding)
     */
    constructor(address: PlatformAddressLike, amount?: bigint | null);
    /**
     * Returns the Platform address.
     */
    readonly address: PlatformAddress;
    /**
     * Returns the amount, or undefined if not specified.
     */
    readonly amount: bigint | undefined;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-platformaddresssigner"></a>
## `PlatformAddressSigner`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class PlatformAddressSigner {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Adds a private key and derives the Platform address from it.
     *
     * The address is derived as: P2PKH(Hash160(compressed_public_key))
     *
     * @param privateKey - The PrivateKey object
     * @returns The derived Platform address
     */
    addKey(privateKey: PrivateKey): PlatformAddress;
    /**
     * Creates a new empty PlatformAddressSigner.
     */
    constructor();
    /**
     * Returns all private keys as an array of {addressHash: Uint8Array, privateKey: Uint8Array}.
     * This is used internally for cross-package access.
     */
    getPrivateKeysBytes(): Array<any>;
    /**
     * Returns true if this signer has a key for the given address.
     */
    hasKey(address: PlatformAddressLike): boolean;
    /**
     * Returns the number of keys in this signer.
     */
    readonly keyCount: number;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-pooling"></a>
## `Pooling`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export enum PoolingWasm {
    Never = 0,
    IfAvailable = 1,
    Standard = 2,
}
```

<a id="type-prefundedspecializedbalance"></a>
## `PrefundedSpecializedBalance`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class PrefundedSpecializedBalance {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromJSON(js: object): PrefundedSpecializedBalance;
    static fromObject(obj: object): PrefundedSpecializedBalance;
    toJSON(): any;
    toObject(): any;
    readonly balance: bigint;
    readonly identityId: Identifier;
}
```

<a id="type-privatekey"></a>
## `PrivateKey`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class PrivateKey {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromBytes(bytes: Uint8Array, network: NetworkLike): PrivateKey;
    static fromHex(hexKey: string, network: NetworkLike): PrivateKey;
    static fromWIF(wif: string): PrivateKey;
    getPublicKey(): PublicKey;
    getPublicKeyHash(): string;
    toBytes(): Uint8Array;
    toHex(): string;
    toWIF(): string;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-protxhashlike"></a>
## `ProTxHashLike`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type ProTxHashLike = ProTxHash | string | Uint8Array;
```

<a id="type-protxhashlikearray"></a>
## `ProTxHashLikeArray`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type ProTxHashLikeArray = Array<ProTxHashLike>;
```

<a id="type-protocolversionupgradestate"></a>
## `ProtocolVersionUpgradeState`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class ProtocolVersionUpgradeState {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromJSON(js: object): ProtocolVersionUpgradeState;
    static fromObject(obj: object): ProtocolVersionUpgradeState;
    toJSON(): any;
    toObject(): any;
    readonly activationHeight: bigint | undefined;
    readonly currentProtocolVersion: number;
    readonly isThresholdReached: boolean;
    readonly nextProtocolVersion: number | undefined;
    readonly voteCount: number | undefined;
}
```

<a id="type-protocolversionupgradevotestatus"></a>
## `ProtocolVersionUpgradeVoteStatus`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class ProtocolVersionUpgradeVoteStatus {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    readonly proTxHash: ProTxHash;
    readonly version: number;
}
```

<a id="type-publickeyhashlike"></a>
## `PublicKeyHashLike`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type PublicKeyHashLike = string | Uint8Array;
```

<a id="type-putsettings"></a>
## `PutSettings`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface PutSettings {
    /**
     * Number of retries for the request.
     * @default 5
     */
    retries?: number;

    /**
     * Request timeout in milliseconds.
     * @default 10000
     */
    timeoutMs?: number;

    /**
     * Connection timeout in milliseconds.
     */
    connectTimeoutMs?: number;

    /**
     * Whether to ban failed addresses.
     * @default true
     */
    banFailedAddress?: boolean;

    /**
     * Timeout in milliseconds for waiting for the state transition result.
     * Only applies to broadcast and wait operations.
     */
    waitTimeoutMs?: number;

    /**
     * Fee increase multiplier (0-65535) to prioritize transaction processing.
     * Higher values result in higher fees and faster processing.
     * @default 0
     */
    userFeeIncrease?: number;

    /**
     * Time in seconds after which identity nonces are considered stale.
     * Used for nonce management in state transitions.
     */
    identityNonceStaleTimeS?: number;

    /**
     * Options for state transition creation (debugging).
     */
    stateTransitionCreationOptions?: {
        /**
         * Allow signing with any security level (debugging only).
         */
        allowSigningWithAnySecurityLevel?: boolean;
        /**
         * Allow signing with any purpose (debugging only).
         */
        allowSigningWithAnyPurpose?: boolean;
    };
}
```

<a id="type-registerdpnsnameresult"></a>
## `RegisterDpnsNameResult`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class RegisterDpnsNameResult {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromJSON(js: object): RegisterDpnsNameResult;
    static fromObject(obj: object): RegisterDpnsNameResult;
    toJSON(): any;
    toObject(): any;
    domainDocumentId: Identifier;
    fullDomainName: string;
    preorderDocumentId: Identifier;
}
```

<a id="type-resourcevote"></a>
## `ResourceVote`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class ResourceVote {
    free(): void;
    [Symbol.dispose](): void;
    constructor(poll: VotePoll, choice: ResourceVoteChoice);
    static fromJSON(js: ResourceVoteJSON): ResourceVote;
    static fromObject(obj: ResourceVoteObject): ResourceVote;
    toJSON(): ResourceVoteJSON;
    toObject(): ResourceVoteObject;
    choice: ResourceVoteChoice;
    poll: VotePoll;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-resourcevotechoice"></a>
## `ResourceVoteChoice`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class ResourceVoteChoice {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static Abstain(): ResourceVoteChoice;
    static Lock(): ResourceVoteChoice;
    static TowardsIdentity(id: IdentifierLike): ResourceVoteChoice;
    static fromJSON(js: ResourceVoteChoiceJSON): ResourceVoteChoice;
    static fromObject(obj: ResourceVoteChoiceObject): ResourceVoteChoice;
    toJSON(): ResourceVoteChoiceJSON;
    toObject(): ResourceVoteChoiceObject;
    static readonly __struct: string;
    readonly __type: string;
    readonly value: Identifier | undefined;
    readonly voteType: string;
}
```

<a id="type-rewarddistributionmoment"></a>
## `RewardDistributionMoment`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class RewardDistributionMoment {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Returns the block height (only valid when type is "block")
     */
    readonly blockHeight: bigint | undefined;
    /**
     * Returns the epoch index (only valid when type is "epoch")
     */
    readonly epochIndex: number | undefined;
    /**
     * Returns the type: "block", "time", or "epoch"
     */
    readonly type: string;
    /**
     * Returns the timestamp in ms (only valid when type is "time")
     */
    readonly timestampMs: bigint | undefined;
}
```

<a id="type-statetransitionresult"></a>
## `StateTransitionResult`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class StateTransitionResult {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromJSON(js: object): StateTransitionResult;
    static fromObject(obj: object): StateTransitionResult;
    toJSON(): any;
    toObject(): any;
    get error(): string | undefined;
    set error(value: string | null | undefined);
    state_transition_hash: string;
    status: string;
}
```

<a id="type-statusresponse"></a>
## `StatusResponse`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class StatusResponse {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromJSON(js: object): StatusResponse;
    static fromObject(obj: object): StatusResponse;
    toJSON(): any;
    toObject(): any;
    chain: StatusChain;
    network: StatusNetwork;
    node: StatusNode;
    state_sync: StatusStateSync;
    time: StatusTime;
    version: StatusVersion;
}
```

<a id="type-tokenburnoptions"></a>
## `TokenBurnOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface TokenBurnOptions {
    /**
     * The ID of the data contract containing the token.
     */
    dataContractId: Identifier;

    /**
     * The position of the token in the contract (0-indexed).
     */
    tokenPosition: number;

    /**
     * The amount of tokens to burn.
     */
    amount: bigint;

    /**
     * The identity ID of the token holder burning tokens.
     */
    identityId: Identifier;

    /**
     * Optional public note for the burn operation.
     */
    publicNote?: string;

    /**
     * The identity public key to use for signing the transition.
     */
    identityKey: IdentityPublicKey;

    /**
     * Signer containing the private key that corresponds to the identity key.
     * Use IdentitySigner to add the private key before calling.
     */
    signer: IdentitySigner;

    /**
     * Optional group action info for group-managed token burning.
     * Use GroupStateTransitionInfoStatus.proposer() to propose a new group action,
     * or GroupStateTransitionInfoStatus.otherSigner() to vote on an existing action.
     */
    groupInfo?: GroupStateTransitionInfoStatus;

    /**
     * Optional settings for the broadcast operation.
     * Includes retries, timeouts, userFeeIncrease, etc.
     */
    settings?: PutSettings;
}
```

<a id="type-tokenburnresult"></a>
## `TokenBurnResult`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class TokenBurnResult {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromJSON(js: object, platform_version: PlatformVersionLike): TokenBurnResult;
    static fromObject(obj: object, platform_version: PlatformVersionLike): TokenBurnResult;
    toJSON(platform_version: PlatformVersionLike): any;
    toObject(): any;
    /**
     * For HistoricalDocument or GroupActionWithDocument - the document
     */
    get document(): Document | undefined;
    /**
     * For HistoricalDocument or GroupActionWithDocument - the document
     */
    set document(value: Document | null | undefined);
    get groupActionStatus(): string | undefined;
    set groupActionStatus(value: string | null | undefined);
    /**
     * For group actions
     */
    get groupPower(): number | undefined;
    /**
     * For group actions
     */
    set groupPower(value: number | null | undefined);
    /**
     * For TokenBalance result
     */
    get ownerId(): Identifier | undefined;
    /**
     * For TokenBalance result
     */
    set ownerId(value: Identifier | null | undefined);
    /**
     * The remaining token balance after burning.
     */
    readonly remainingBalance: bigint | undefined;
}
```

<a id="type-tokenclaimoptions"></a>
## `TokenClaimOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface TokenClaimOptions {
    /**
     * The ID of the data contract containing the token.
     */
    dataContractId: Identifier;

    /**
     * The position of the token in the contract (0-indexed).
     */
    tokenPosition: number;

    /**
     * The identity ID claiming the tokens.
     */
    identityId: Identifier;

    /**
     * The type of distribution to claim from: "preProgrammed" or "perpetual".
     */
    distributionType: "preProgrammed" | "perpetual";

    /**
     * Optional public note for the claim operation.
     */
    publicNote?: string;

    /**
     * The identity public key to use for signing the transition.
     */
    identityKey: IdentityPublicKey;

    /**
     * Signer containing the private key that corresponds to the identity key.
     * Use IdentitySigner to add the private key before calling.
     */
    signer: IdentitySigner;

    /**
     * Optional settings for the broadcast operation.
     * Includes retries, timeouts, userFeeIncrease, etc.
     */
    settings?: PutSettings;
}
```

<a id="type-tokenclaimresult"></a>
## `TokenClaimResult`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class TokenClaimResult {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromJSON(js: object, platform_version: PlatformVersionLike): TokenClaimResult;
    static fromObject(obj: object, platform_version: PlatformVersionLike): TokenClaimResult;
    toJSON(platform_version: PlatformVersionLike): any;
    toObject(): any;
    /**
     * The document
     */
    get document(): Document | undefined;
    /**
     * The document
     */
    set document(value: Document | null | undefined);
    /**
     * For group actions
     */
    get groupPower(): number | undefined;
    /**
     * For group actions
     */
    set groupPower(value: number | null | undefined);
}
```

<a id="type-tokencontractinfo"></a>
## `TokenContractInfo`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class TokenContractInfo {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromJSON(js: TokenContractInfoJSON): TokenContractInfo;
    static fromObject(obj: TokenContractInfoObject): TokenContractInfo;
    toJSON(): TokenContractInfoJSON;
    toObject(): TokenContractInfoObject;
    readonly contractId: Identifier;
    static readonly __struct: string;
    readonly tokenContractPosition: number;
    readonly __type: string;
}
```

<a id="type-tokendestroyfrozenoptions"></a>
## `TokenDestroyFrozenOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface TokenDestroyFrozenOptions {
    /**
     * The ID of the data contract containing the token.
     */
    dataContractId: Identifier;

    /**
     * The position of the token in the contract (0-indexed).
     */
    tokenPosition: number;

    /**
     * The identity ID of the token authority performing the destruction.
     */
    authorityId: Identifier;

    /**
     * The frozen identity ID whose tokens will be destroyed.
     */
    frozenIdentityId: Identifier;

    /**
     * Optional public note for the destruction operation.
     */
    publicNote?: string;

    /**
     * The identity public key to use for signing the transition.
     */
    identityKey: IdentityPublicKey;

    /**
     * Signer containing the private key for the authority's authentication key.
     * Use IdentitySigner to add the authentication key before calling.
     */
    signer: IdentitySigner;

    /**
     * Optional group action info for group-managed token destruction.
     * Use GroupStateTransitionInfoStatus.proposer() to propose a new group action,
     * or GroupStateTransitionInfoStatus.otherSigner() to vote on an existing action.
     */
    groupInfo?: GroupStateTransitionInfoStatus;

    /**
     * Optional settings for the broadcast operation.
     * Includes retries, timeouts, userFeeIncrease, etc.
     */
    settings?: PutSettings;
}
```

<a id="type-tokendestroyfrozenresult"></a>
## `TokenDestroyFrozenResult`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class TokenDestroyFrozenResult {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromJSON(js: object, platform_version: PlatformVersionLike): TokenDestroyFrozenResult;
    static fromObject(obj: object, platform_version: PlatformVersionLike): TokenDestroyFrozenResult;
    toJSON(platform_version: PlatformVersionLike): any;
    toObject(): any;
    /**
     * For HistoricalDocument or GroupActionWithDocument - the document
     */
    get document(): Document | undefined;
    /**
     * For HistoricalDocument or GroupActionWithDocument - the document
     */
    set document(value: Document | null | undefined);
    /**
     * For group actions
     */
    get groupPower(): number | undefined;
    /**
     * For group actions
     */
    set groupPower(value: number | null | undefined);
}
```

<a id="type-tokendirectpurchaseoptions"></a>
## `TokenDirectPurchaseOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface TokenDirectPurchaseOptions {
    /**
     * The ID of the data contract containing the token.
     */
    dataContractId: Identifier;

    /**
     * The position of the token in the contract (0-indexed).
     */
    tokenPosition: number;

    /**
     * The identity ID purchasing the tokens.
     */
    buyerId: Identifier;

    /**
     * The amount of tokens to purchase.
     */
    amount: bigint;

    /**
     * The maximum total credits the buyer is willing to pay.
     * The actual cost may be less if the token price is lower.
     */
    maxTotalCost: bigint;

    /**
     * The identity public key to use for signing the transition.
     */
    identityKey: IdentityPublicKey;

    /**
     * Signer containing the private key for the buyer's authentication key.
     * Use IdentitySigner to add the authentication key before calling.
     */
    signer: IdentitySigner;

    /**
     * Optional settings for the broadcast operation.
     * Includes retries, timeouts, userFeeIncrease, etc.
     */
    settings?: PutSettings;
}
```

<a id="type-tokendirectpurchaseresult"></a>
## `TokenDirectPurchaseResult`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class TokenDirectPurchaseResult {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromJSON(js: object, platform_version: PlatformVersionLike): TokenDirectPurchaseResult;
    static fromObject(obj: object, platform_version: PlatformVersionLike): TokenDirectPurchaseResult;
    toJSON(platform_version: PlatformVersionLike): any;
    toObject(): any;
    /**
     * For TokenBalance result
     */
    get buyerId(): Identifier | undefined;
    /**
     * For TokenBalance result
     */
    set buyerId(value: Identifier | null | undefined);
    /**
     * For HistoricalDocument or GroupActionWithDocument - the document
     */
    get document(): Document | undefined;
    /**
     * For HistoricalDocument or GroupActionWithDocument - the document
     */
    set document(value: Document | null | undefined);
    /**
     * For group actions
     */
    get groupPower(): number | undefined;
    /**
     * For group actions
     */
    set groupPower(value: number | null | undefined);
    /**
     * The buyer's new balance after purchase.
     */
    readonly newBalance: bigint | undefined;
}
```

<a id="type-tokenemergencyactionoptions"></a>
## `TokenEmergencyActionOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface TokenEmergencyActionOptions {
    /**
     * The ID of the data contract containing the token.
     */
    dataContractId: Identifier;

    /**
     * The position of the token in the contract (0-indexed).
     */
    tokenPosition: number;

    /**
     * The identity ID of the token authority performing the action.
     */
    authorityId: Identifier;

    /**
     * The emergency action to perform: "pause" or "resume".
     */
    action: "pause" | "resume";

    /**
     * Optional public note for the emergency action.
     */
    publicNote?: string;

    /**
     * The identity public key to use for signing the transition.
     */
    identityKey: IdentityPublicKey;

    /**
     * Signer containing the private key for the authority's authentication key.
     * Use IdentitySigner to add the authentication key before calling.
     */
    signer: IdentitySigner;

    /**
     * Optional group action info for group-managed emergency actions.
     * Use GroupStateTransitionInfoStatus.proposer() to propose a new group action,
     * or GroupStateTransitionInfoStatus.otherSigner() to vote on an existing action.
     */
    groupInfo?: GroupStateTransitionInfoStatus;

    /**
     * Optional settings for the broadcast operation.
     * Includes retries, timeouts, userFeeIncrease, etc.
     */
    settings?: PutSettings;
}
```

<a id="type-tokenemergencyactionresult"></a>
## `TokenEmergencyActionResult`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class TokenEmergencyActionResult {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromJSON(js: object, platform_version: PlatformVersionLike): TokenEmergencyActionResult;
    static fromObject(obj: object, platform_version: PlatformVersionLike): TokenEmergencyActionResult;
    toJSON(platform_version: PlatformVersionLike): any;
    toObject(): any;
    /**
     * The document
     */
    get document(): Document | undefined;
    /**
     * The document
     */
    set document(value: Document | null | undefined);
    /**
     * For group actions
     */
    get groupPower(): number | undefined;
    /**
     * For group actions
     */
    set groupPower(value: number | null | undefined);
}
```

<a id="type-tokenfreezeoptions"></a>
## `TokenFreezeOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface TokenFreezeOptions {
    /**
     * The ID of the data contract containing the token.
     */
    dataContractId: Identifier;

    /**
     * The position of the token in the contract (0-indexed).
     */
    tokenPosition: number;

    /**
     * The identity ID of the token authority performing the freeze.
     */
    authorityId: Identifier;

    /**
     * The identity ID to freeze.
     */
    frozenIdentityId: Identifier;

    /**
     * Optional public note for the freeze operation.
     */
    publicNote?: string;

    /**
     * The identity public key to use for signing the transition.
     */
    identityKey: IdentityPublicKey;

    /**
     * Signer containing the private key for the authority's authentication key.
     * Use IdentitySigner to add the authentication key before calling.
     */
    signer: IdentitySigner;

    /**
     * Optional group action info for group-managed token freezing.
     * Use GroupStateTransitionInfoStatus.proposer() to propose a new group action,
     * or GroupStateTransitionInfoStatus.otherSigner() to vote on an existing action.
     */
    groupInfo?: GroupStateTransitionInfoStatus;

    /**
     * Optional settings for the broadcast operation.
     * Includes retries, timeouts, userFeeIncrease, etc.
     */
    settings?: PutSettings;
}
```

<a id="type-tokenfreezeresult"></a>
## `TokenFreezeResult`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class TokenFreezeResult {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromJSON(js: object, platform_version: PlatformVersionLike): TokenFreezeResult;
    static fromObject(obj: object, platform_version: PlatformVersionLike): TokenFreezeResult;
    toJSON(platform_version: PlatformVersionLike): any;
    toObject(): any;
    /**
     * For HistoricalDocument or GroupActionWithDocument - the document
     */
    get document(): Document | undefined;
    /**
     * For HistoricalDocument or GroupActionWithDocument - the document
     */
    set document(value: Document | null | undefined);
    /**
     * For IdentityInfo result
     */
    get frozenIdentityId(): Identifier | undefined;
    /**
     * For IdentityInfo result
     */
    set frozenIdentityId(value: Identifier | null | undefined);
    /**
     * For group actions
     */
    get groupPower(): number | undefined;
    /**
     * For group actions
     */
    set groupPower(value: number | null | undefined);
}
```

<a id="type-tokenmintoptions"></a>
## `TokenMintOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface TokenMintOptions {
    /**
     * The ID of the data contract containing the token.
     */
    dataContractId: Identifier;

    /**
     * The position of the token in the contract (0-indexed).
     */
    tokenPosition: number;

    /**
     * The amount of tokens to mint.
     */
    amount: bigint;

    /**
     * The identity ID of the minter.
     */
    identityId: Identifier;

    /**
     * Optional recipient identity ID.
     * If not provided, mints to the minter's identity.
     */
    recipientId?: Identifier;

    /**
     * Optional public note for the mint operation.
     */
    publicNote?: string;

    /**
     * The identity public key to use for signing the transition.
     * Get this from the minter identity's public keys.
     */
    identityKey: IdentityPublicKey;

    /**
     * Signer containing the private key that corresponds to the identity key.
     * Use IdentitySigner to add the private key before calling.
     */
    signer: IdentitySigner;

    /**
     * Optional group action info for group-managed token minting.
     * Use GroupStateTransitionInfoStatus.proposer() to propose a new group action,
     * or GroupStateTransitionInfoStatus.otherSigner() to vote on an existing action.
     */
    groupInfo?: GroupStateTransitionInfoStatus;

    /**
     * Optional settings for the broadcast operation.
     * Includes retries, timeouts, userFeeIncrease, etc.
     */
    settings?: PutSettings;
}
```

<a id="type-tokenmintresult"></a>
## `TokenMintResult`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class TokenMintResult {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromJSON(js: object, platform_version: PlatformVersionLike): TokenMintResult;
    static fromObject(obj: object, platform_version: PlatformVersionLike): TokenMintResult;
    toJSON(platform_version: PlatformVersionLike): any;
    toObject(): any;
    /**
     * For HistoricalDocument or GroupActionWithDocument - the document
     */
    get document(): Document | undefined;
    /**
     * For HistoricalDocument or GroupActionWithDocument - the document
     */
    set document(value: Document | null | undefined);
    /**
     * For GroupActionWithBalance - action status
     */
    get groupActionStatus(): string | undefined;
    /**
     * For GroupActionWithBalance - action status
     */
    set groupActionStatus(value: string | null | undefined);
    /**
     * For group actions - accumulated group power
     */
    get groupPower(): number | undefined;
    /**
     * For group actions - accumulated group power
     */
    set groupPower(value: number | null | undefined);
    /**
     * For TokenBalance result - recipient identity ID
     */
    get recipientId(): Identifier | undefined;
    /**
     * For TokenBalance result - recipient identity ID
     */
    set recipientId(value: Identifier | null | undefined);
    /**
     * The new token balance after minting.
     */
    readonly newBalance: bigint | undefined;
}
```

<a id="type-tokenpriceinfo"></a>
## `TokenPriceInfo`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class TokenPriceInfo {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromJSON(js: object): TokenPriceInfo;
    static fromObject(obj: object): TokenPriceInfo;
    toJSON(): any;
    toObject(): any;
    basePrice: string;
    currentPrice: string;
    tokenId: Identifier;
}
```

<a id="type-tokensetpriceoptions"></a>
## `TokenSetPriceOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface TokenSetPriceOptions {
    /**
     * The ID of the data contract containing the token.
     */
    dataContractId: Identifier;

    /**
     * The position of the token in the contract (0-indexed).
     */
    tokenPosition: number;

    /**
     * The identity ID of the token authority setting the price.
     */
    authorityId: Identifier;

    /**
     * The price in credits for one token.
     * Set to null to disable direct purchases.
     */
    price: bigint | null;

    /**
     * Optional public note for the price change.
     */
    publicNote?: string;

    /**
     * The identity public key to use for signing the transition.
     */
    identityKey: IdentityPublicKey;

    /**
     * Signer containing the private key for the authority's authentication key.
     * Use IdentitySigner to add the authentication key before calling.
     */
    signer: IdentitySigner;

    /**
     * Optional group action info for group-managed price changes.
     * Use GroupStateTransitionInfoStatus.proposer() to propose a new group action,
     * or GroupStateTransitionInfoStatus.otherSigner() to vote on an existing action.
     */
    groupInfo?: GroupStateTransitionInfoStatus;

    /**
     * Optional settings for the broadcast operation.
     * Includes retries, timeouts, userFeeIncrease, etc.
     */
    settings?: PutSettings;
}
```

<a id="type-tokensetpriceresult"></a>
## `TokenSetPriceResult`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class TokenSetPriceResult {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromJSON(js: object, platform_version: PlatformVersionLike): TokenSetPriceResult;
    static fromObject(obj: object, platform_version: PlatformVersionLike): TokenSetPriceResult;
    toJSON(platform_version: PlatformVersionLike): any;
    toObject(): any;
    /**
     * For HistoricalDocument or GroupActionWithDocument - the document
     */
    get document(): Document | undefined;
    /**
     * For HistoricalDocument or GroupActionWithDocument - the document
     */
    set document(value: Document | null | undefined);
    /**
     * Group action status
     */
    get groupActionStatus(): string | undefined;
    /**
     * Group action status
     */
    set groupActionStatus(value: string | null | undefined);
    /**
     * For group actions
     */
    get groupPower(): number | undefined;
    /**
     * For group actions
     */
    set groupPower(value: number | null | undefined);
    /**
     * For PricingSchedule - the identity that set the price
     */
    get ownerId(): Identifier | undefined;
    /**
     * For PricingSchedule - the identity that set the price
     */
    set ownerId(value: Identifier | null | undefined);
    /**
     * For PricingSchedule or GroupActionWithPricingSchedule - the pricing schedule
     */
    get pricingSchedule(): TokenPricingSchedule | undefined;
    /**
     * For PricingSchedule or GroupActionWithPricingSchedule - the pricing schedule
     */
    set pricingSchedule(value: TokenPricingSchedule | null | undefined);
}
```

<a id="type-tokenstatus"></a>
## `TokenStatus`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class TokenStatus {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    readonly isPaused: boolean;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-tokentotalsupply"></a>
## `TokenTotalSupply`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class TokenTotalSupply {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromJSON(js: object): TokenTotalSupply;
    static fromObject(obj: object): TokenTotalSupply;
    toJSON(): any;
    toObject(): any;
    readonly totalSupply: bigint;
}
```

<a id="type-tokentransferoptions"></a>
## `TokenTransferOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface TokenTransferOptions {
    /**
     * The ID of the data contract containing the token.
     */
    dataContractId: Identifier;

    /**
     * The position of the token in the contract (0-indexed).
     */
    tokenPosition: number;

    /**
     * The amount of tokens to transfer.
     */
    amount: bigint;

    /**
     * The sender's identity ID.
     */
    senderId: Identifier;

    /**
     * The recipient's identity ID.
     */
    recipientId: Identifier;

    /**
     * Optional public note for the transfer.
     */
    publicNote?: string;

    /**
     * The identity public key to use for signing the transition.
     */
    identityKey: IdentityPublicKey;

    /**
     * Signer containing the private key for the sender's authentication key.
     * Use IdentitySigner to add the authentication key before calling.
     */
    signer: IdentitySigner;

    /**
     * Optional settings for the broadcast operation.
     * Includes retries, timeouts, userFeeIncrease, etc.
     */
    settings?: PutSettings;
}
```

<a id="type-tokentransferresult"></a>
## `TokenTransferResult`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class TokenTransferResult {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromJSON(js: object, platform_version: PlatformVersionLike): TokenTransferResult;
    static fromObject(obj: object, platform_version: PlatformVersionLike): TokenTransferResult;
    toJSON(platform_version: PlatformVersionLike): any;
    toObject(): any;
    /**
     * For HistoricalDocument or GroupActionWithDocument - the document
     */
    get document(): Document | undefined;
    /**
     * For HistoricalDocument or GroupActionWithDocument - the document
     */
    set document(value: Document | null | undefined);
    /**
     * For group actions
     */
    get groupPower(): number | undefined;
    /**
     * For group actions
     */
    set groupPower(value: number | null | undefined);
    /**
     * The recipient's new balance after transfer.
     */
    readonly recipientBalance: bigint | undefined;
    /**
     * The sender's new balance after transfer.
     */
    readonly senderBalance: bigint | undefined;
}
```

<a id="type-tokenunfreezeoptions"></a>
## `TokenUnfreezeOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface TokenUnfreezeOptions {
    /**
     * The ID of the data contract containing the token.
     */
    dataContractId: Identifier;

    /**
     * The position of the token in the contract (0-indexed).
     */
    tokenPosition: number;

    /**
     * The identity ID of the token authority performing the unfreeze.
     */
    authorityId: Identifier;

    /**
     * The identity ID to unfreeze.
     */
    frozenIdentityId: Identifier;

    /**
     * Optional public note for the unfreeze operation.
     */
    publicNote?: string;

    /**
     * The identity public key to use for signing the transition.
     */
    identityKey: IdentityPublicKey;

    /**
     * Signer containing the private key for the authority's authentication key.
     * Use IdentitySigner to add the authentication key before calling.
     */
    signer: IdentitySigner;

    /**
     * Optional group action info for group-managed token unfreezing.
     * Use GroupStateTransitionInfoStatus.proposer() to propose a new group action,
     * or GroupStateTransitionInfoStatus.otherSigner() to vote on an existing action.
     */
    groupInfo?: GroupStateTransitionInfoStatus;

    /**
     * Optional settings for the broadcast operation.
     * Includes retries, timeouts, userFeeIncrease, etc.
     */
    settings?: PutSettings;
}
```

<a id="type-tokenunfreezeresult"></a>
## `TokenUnfreezeResult`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class TokenUnfreezeResult {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromJSON(js: object, platform_version: PlatformVersionLike): TokenUnfreezeResult;
    static fromObject(obj: object, platform_version: PlatformVersionLike): TokenUnfreezeResult;
    toJSON(platform_version: PlatformVersionLike): any;
    toObject(): any;
    /**
     * For HistoricalDocument or GroupActionWithDocument - the document
     */
    get document(): Document | undefined;
    /**
     * For HistoricalDocument or GroupActionWithDocument - the document
     */
    set document(value: Document | null | undefined);
    /**
     * For group actions
     */
    get groupPower(): number | undefined;
    /**
     * For group actions
     */
    set groupPower(value: number | null | undefined);
    /**
     * For IdentityInfo result
     */
    get unfrozenIdentityId(): Identifier | undefined;
    /**
     * For IdentityInfo result
     */
    set unfrozenIdentityId(value: Identifier | null | undefined);
}
```

<a id="type-votepoll"></a>
## `VotePoll`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class VotePoll {
    free(): void;
    [Symbol.dispose](): void;
    constructor(options: VotePollOptions);
    static fromJSON(js: VotePollJSON): VotePoll;
    static fromObject(obj: VotePollObject): VotePoll;
    toJSON(): VotePollJSON;
    toObject(): VotePollObject;
    toString(): string;
    get contractId(): Identifier;
    set contractId(value: IdentifierLike);
    documentTypeName: string;
    indexName: string;
    indexValues: Array<any>;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-votepollsbydocumenttypequery"></a>
## `VotePollsByDocumentTypeQuery`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface VotePollsByDocumentTypeQuery {
    /**
     * Data contract identifier.
     */
    dataContractId: IdentifierLike

    /**
     * Document type to query.
     */
    documentTypeName: string;

    /**
     * Index name to query.
     */
    indexName: string;

    /**
     * Optional lower bound for index range, commonly an array of composite values.
     * @default undefined
     */
    startIndexValues?: unknown[];

    /**
     * Optional upper bound for index range, commonly an array of composite values.
     * @default undefined
     */
    endIndexValues?: unknown[];

    /**
     * Cursor value to resume iteration from.
     * Provide a JS value matching the index schema (e.g., string, number, array).
     * @default undefined
     */
    startAtValue?: unknown;

    /**
     * Whether to include `startAtValue` in the result set.
     * @default true
     */
    startAtValueIncluded?: boolean;

    /**
     * Maximum number of records to return.
     * @default undefined (no explicit limit)
     */
    limit?: number;

    /**
     * Sort order. When omitted, the query defaults to ascending order.
     * @default true
     */
    orderAscending?: boolean;
}
```

<a id="type-votepollsbyenddateentry"></a>
## `VotePollsByEndDateEntry`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class VotePollsByEndDateEntry {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    readonly timestampMs: bigint;
    readonly votePolls: Array<any>;
}
```

<a id="type-votepollsbyenddatequery"></a>
## `VotePollsByEndDateQuery`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface VotePollsByEndDateQuery {
    /**
     * Starting timestamp (milliseconds) to filter polls.
     * @default undefined
     */
    startTimeMs?: number;

    /**
     * Include the `startTimeMs` boundary when true.
     * @default true
     */
    startTimeIncluded?: boolean;

    /**
     * Ending timestamp (milliseconds) to filter polls.
     * @default undefined
     */
    endTimeMs?: number;

    /**
     * Include the `endTimeMs` boundary when true.
     * @default true
     */
    endTimeIncluded?: boolean;

    /**
     * Maximum number of buckets to return.
     * @default undefined (no explicit limit)
     */
    limit?: number;

    /**
     * Offset into the paginated result set.
     * @default undefined
     */
    offset?: number;

    /**
     * Sort order for timestamps; ascending by default.
     * @default true
     */
    orderAscending?: boolean;
}
```

<a id="type-assetlockproofjson"></a>
## `AssetLockProofJSON`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type AssetLockProofJSON =
| ({ type: "instant" } & InstantAssetLockProofJSON)
| ({ type: "chain" } & ChainAssetLockProofJSON);
```

<a id="type-assetlockproofobject"></a>
## `AssetLockProofObject`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type AssetLockProofObject =
| ({ type: "instant" } & InstantAssetLockProofObject)
| ({ type: "chain" } & ChainAssetLockProofObject);
```

<a id="type-chainassetlockproof"></a>
## `ChainAssetLockProof`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class ChainAssetLockProof {
    free(): void;
    [Symbol.dispose](): void;
    constructor(coreChainLockedHeight: number, outPoint: OutPoint);
    createIdentityId(): Identifier;
    static fromBytes(bytes: Uint8Array): ChainAssetLockProof;
    static fromJSON(js: ChainAssetLockProofJSON): ChainAssetLockProof;
    static fromObject(obj: ChainAssetLockProofObject): ChainAssetLockProof;
    toBytes(): Uint8Array;
    toJSON(): ChainAssetLockProofJSON;
    toObject(): ChainAssetLockProofObject;
    coreChainLockedHeight: number;
    outPoint: OutPoint;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-instantassetlockproof"></a>
## `InstantAssetLockProof`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class InstantAssetLockProof {
    free(): void;
    [Symbol.dispose](): void;
    constructor(instantLock: Uint8Array, transaction: Uint8Array, outputIndex: number);
    createIdentityId(): Identifier;
    static fromJSON(js: InstantAssetLockProofJSON): InstantAssetLockProof;
    static fromObject(obj: InstantAssetLockProofObject): InstantAssetLockProof;
    toJSON(): InstantAssetLockProofJSON;
    toObject(): InstantAssetLockProofObject;
    instantLock: Uint8Array;
    readonly outPoint: OutPoint | undefined;
    readonly output: Uint8Array | undefined;
    outputIndex: number;
    static readonly __struct: string;
    readonly transaction: Uint8Array;
    readonly __type: string;
}
```

<a id="type-outpoint"></a>
## `OutPoint`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class OutPoint {
    free(): void;
    [Symbol.dispose](): void;
    constructor(txidHex: string, vout: number);
    static fromBase64(base64: string): OutPoint;
    static fromBytes(buffer: Uint8Array): OutPoint;
    static fromHex(hex: string): OutPoint;
    toBase64(): string;
    toBytes(): Uint8Array;
    toHex(): string;
    static readonly __struct: string;
    readonly txid: string;
    readonly __type: string;
    readonly vout: number;
}
```

<a id="type-contestedresourcevotewinner"></a>
## `ContestedResourceVoteWinner`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class ContestedResourceVoteWinner {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    readonly identityId: Identifier | undefined;
    readonly kind: string;
    block: BlockInfo;
    info: ContestedDocumentVotePollWinnerInfo;
}
```

<a id="type-networklike"></a>
## `NetworkLike`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type NetworkLike = Network | "mainnet" | "testnet" | "devnet" | "regtest" | 0 | 1 | 2 | 3;
```

<a id="type-datacontractconfig"></a>
## `DataContractConfig`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface DataContractConfig {
    canBeDeleted: boolean;
    readonly: boolean;
    keepsHistory: boolean;
    documentsKeepHistoryContractDefault: boolean;
    documentsMutableContractDefault: boolean;
    documentsCanBeDeletedContractDefault: boolean;
    requiresIdentityEncryptionBoundedKey?: number;
    requiresIdentityDecryptionBoundedKey?: number;
}
```

<a id="type-datacontractjson"></a>
## `DataContractJSON`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface DataContractJSON {
    $formatVersion: string;
    id: string;
    ownerId: string;
    version: number;
    documentSchemas: Record<string, object>;
    config?: DataContractConfig;
    groups?: Record<number, object>;
    tokens?: Record<number, object>;
    [key: string]: unknown;
}
```

<a id="type-datacontractobject"></a>
## `DataContractObject`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface DataContractObject {
    $formatVersion: string;
    id: Identifier;
    ownerId: Identifier;
    version: number;
    documentSchemas: Record<string, object>;
    config?: DataContractConfig;
    groups?: Record<number, Group>;
    tokens?: Record<number, TokenConfiguration>;
    [key: string]: unknown;
}
```

<a id="type-datacontractoptions"></a>
## `DataContractOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface DataContractOptions {
    ownerId: IdentifierLike;
    identityNonce: bigint;
    schemas: object;
    definitions?: object;
    tokens?: Record<number, TokenConfiguration>;
    fullValidation?: boolean;
    platformVersion?: PlatformVersionLike;
}
```

<a id="type-platformversionlike"></a>
## `PlatformVersionLike`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type PlatformVersionLike = PlatformVersion | number;
```

<a id="type-tokenconfiguration"></a>
## `TokenConfiguration`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class TokenConfiguration {
    free(): void;
    [Symbol.dispose](): void;
    static calculateTokenId(contractId: IdentifierLike, tokenPos: number): Identifier;
    constructor(options: TokenConfigurationOptions);
    baseSupply: bigint;
    conventions: TokenConfigurationConvention;
    conventionsChangeRules: ChangeControlRules;
    get description(): string | undefined;
    set description(value: string | null | undefined);
    destroyFrozenFundsRules: ChangeControlRules;
    distributionRules: TokenDistributionRules;
    emergencyActionRules: ChangeControlRules;
    freezeRules: ChangeControlRules;
    isAllowedTransferToFrozenBalance: boolean;
    isStartedAsPaused: boolean;
    keepsHistory: TokenKeepsHistoryRules;
    get mainControlGroup(): number | undefined;
    set mainControlGroup(value: number | null | undefined);
    mainControlGroupCanBeModified: AuthorizedActionTakers;
    manualBurningRules: ChangeControlRules;
    manualMintingRules: ChangeControlRules;
    marketplaceRules: TokenMarketplaceRules;
    get maxSupply(): bigint | undefined;
    set maxSupply(value: any);
    maxSupplyChangeRules: ChangeControlRules;
    unfreezeRules: ChangeControlRules;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-documentjson"></a>
## `DocumentJSON`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface DocumentJSON {
    $id: string;
    $ownerId: string;
    $revision?: string;
    $createdAt?: string;
    $updatedAt?: string;
    $transferredAt?: string;
    $createdAtBlockHeight?: string;
    $updatedAtBlockHeight?: string;
    $transferredAtBlockHeight?: string;
    $createdAtCoreBlockHeight?: number;
    $updatedAtCoreBlockHeight?: number;
    $transferredAtCoreBlockHeight?: number;
    $dataContractId: string;
    $type: string;
    [key: string]: unknown;
}
```

<a id="type-documentobject"></a>
## `DocumentObject`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface DocumentObject {
    $id: Identifier;
    $ownerId: Identifier;
    $revision?: bigint;
    $createdAt?: bigint;
    $updatedAt?: bigint;
    $transferredAt?: bigint;
    $createdAtBlockHeight?: bigint;
    $updatedAtBlockHeight?: bigint;
    $transferredAtBlockHeight?: bigint;
    $createdAtCoreBlockHeight?: number;
    $updatedAtCoreBlockHeight?: number;
    $transferredAtCoreBlockHeight?: number;
    $dataContractId: Identifier;
    $type: string;
    [key: string]: unknown;
}
```

<a id="type-documentoptions"></a>
## `DocumentOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface DocumentOptions {
    /** Document properties/data */
    properties: Record<string, unknown>;
    /** Document type name from the data contract */
    documentTypeName: string;
    /** Data contract ID this document belongs to */
    dataContractId: IdentifierLike;
    /** Owner identity ID */
    ownerId: IdentifierLike;
    /** Document revision (default: 1n) */
    revision?: bigint;
    /** Document ID (auto-generated if not provided) */
    id?: IdentifierLike;
    /** Entropy bytes (32 bytes, auto-generated if not provided) */
    entropy?: Uint8Array;
}
```

<a id="type-gasfeespaidbylike"></a>
## `GasFeesPaidByLike`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type GasFeesPaidByLike = GasFeesPaidBy | "documentOwner" | "contractOwner" | "preferContractOwner" | 0 | 1 | 2;
```

<a id="type-documentwhereoperator"></a>
## `DocumentWhereOperator`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type DocumentWhereOperator =
| '=='
| '='
| '>'
| '>='
| '<'
| '<='
| 'Between'
| 'between'
| 'BetweenExcludeBounds'
| 'BetweenExcludeLeft'
| 'BetweenExcludeRight'
| 'in'
| 'In'
| 'startsWith'
| 'StartsWith';
```

<a id="type-extendedepochinfojson"></a>
## `ExtendedEpochInfoJSON`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface ExtendedEpochInfoJSON {
    index: number;
    firstBlockTime: number | string;
    firstBlockHeight: number | string;
    firstCoreBlockHeight: number;
    feeMultiplierPermille: number | string;
    protocolVersion: number;
}
```

<a id="type-extendedepochinfoobject"></a>
## `ExtendedEpochInfoObject`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface ExtendedEpochInfoObject {
    index: number;
    firstBlockTime: bigint;
    firstBlockHeight: bigint;
    firstCoreBlockHeight: number;
    feeMultiplierPermille: bigint;
    protocolVersion: number;
}
```

<a id="type-extendedepochinfooptions"></a>
## `ExtendedEpochInfoOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface ExtendedEpochInfoOptions {
    index: number;
    firstBlockTime: bigint;
    firstBlockHeight: bigint;
    firstCoreBlockHeight: number;
    feeMultiplierPermille: bigint;
    protocolVersion: number;
}
```

<a id="type-blockproposersmap"></a>
## `BlockProposersMap`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type BlockProposersMap = Map<string, bigint>;
```

<a id="type-finalizedepochinfojson"></a>
## `FinalizedEpochInfoJSON`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface FinalizedEpochInfoJSON {
    firstBlockTime: number | string;
    firstBlockHeight: number | string;
    totalBlocksInEpoch: number | string;
    firstCoreBlockHeight: number;
    nextEpochStartCoreBlockHeight: number;
    totalProcessingFees: number | string;
    totalDistributedStorageFees: number | string;
    totalCreatedStorageFees: number | string;
    coreBlockRewards: number | string;
    blockProposers: Record<string, number | string>;
    feeMultiplierPermille: number | string;
    protocolVersion: number;
}
```

<a id="type-finalizedepochinfoobject"></a>
## `FinalizedEpochInfoObject`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface FinalizedEpochInfoObject {
    firstBlockTime: bigint;
    firstBlockHeight: bigint;
    totalBlocksInEpoch: bigint;
    firstCoreBlockHeight: number;
    nextEpochStartCoreBlockHeight: number;
    totalProcessingFees: bigint;
    totalDistributedStorageFees: bigint;
    totalCreatedStorageFees: bigint;
    coreBlockRewards: bigint;
    blockProposers: BlockProposersMap;
    feeMultiplierPermille: bigint;
    protocolVersion: number;
}
```

<a id="type-finalizedepochinfooptions"></a>
## `FinalizedEpochInfoOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface FinalizedEpochInfoOptions {
    firstBlockTime: bigint;
    firstBlockHeight: bigint;
    totalBlocksInEpoch: bigint;
    firstCoreBlockHeight: number;
    nextEpochStartCoreBlockHeight: number;
    totalProcessingFees: bigint;
    totalDistributedStorageFees: bigint;
    totalCreatedStorageFees: bigint;
    coreBlockRewards: bigint;
    blockProposers: BlockProposersMap;
    feeMultiplierPermille: bigint;
    protocolVersion: number;
}
```

<a id="type-groupjson"></a>
## `GroupJSON`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface GroupJSON {
    $formatVersion: string;
    members: Record<string, number>;
    requiredPower: number;
}
```

<a id="type-groupmembersmap"></a>
## `GroupMembersMap`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type GroupMembersMap = Map<string, number>;
```

<a id="type-groupobject"></a>
## `GroupObject`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface GroupObject {
    $formatVersion: string;
    members: Record<string, number>;
    requiredPower: number;
}
```

<a id="type-groupactionevent"></a>
## `GroupActionEvent`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class GroupActionEvent {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    eventName(): string;
    static fromJSON(js: GroupActionEventJSON): GroupActionEvent;
    static fromObject(obj: GroupActionEventObject): GroupActionEvent;
    publicNote(): string | undefined;
    toJSON(): GroupActionEventJSON;
    toObject(): GroupActionEventObject;
    tokenEvent(): TokenEvent;
    static readonly __struct: string;
    readonly __type: string;
    readonly variant: GroupActionEventVariant;
}
```

<a id="type-groupactionjson"></a>
## `GroupActionJSON`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface GroupActionJSON {
    $formatVersion: string;
    contractId: string;
    proposerId: string;
    tokenContractPosition: number;
    event: GroupActionEventJSON;
}
```

<a id="type-groupactionobject"></a>
## `GroupActionObject`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface GroupActionObject {
    $formatVersion: string;
    contractId: Uint8Array;
    proposerId: Uint8Array;
    tokenContractPosition: number;
    event: GroupActionEventObject;
}
```

<a id="type-groupstatetransitioninfo"></a>
## `GroupStateTransitionInfo`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class GroupStateTransitionInfo {
    free(): void;
    [Symbol.dispose](): void;
    constructor(options: GroupStateTransitionInfoOptions);
    get actionId(): Identifier;
    set actionId(value: IdentifierLike);
    groupContractPosition: number;
    isActionProposer: boolean;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-identityjson"></a>
## `IdentityJSON`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface IdentityJSON {
    $formatVersion: string;
    id: string;
    publicKeys: IdentityPublicKeyJSON[];
    balance: number | string;
    revision: number | string;
}
```

<a id="type-identityobject"></a>
## `IdentityObject`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface IdentityObject {
    $formatVersion: string;
    id: Identifier;
    publicKeys: IdentityPublicKeyObject[];
    balance: bigint;
    revision: bigint;
}
```

<a id="type-identitykeyspurposemap"></a>
## `IdentityKeysPurposeMap`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type IdentityKeysPurposeMap = {
    [purpose: number]: {
        [securityLevel: number]: IdentityKeysSearchKind;
    };
};
```

<a id="type-contractbounds"></a>
## `ContractBounds`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class ContractBounds {
    free(): void;
    [Symbol.dispose](): void;
    static SingleContract(contractId: IdentifierLike): ContractBounds;
    static SingleContractDocumentType(contractId: IdentifierLike, documentTypeName: string): ContractBounds;
    constructor(contractId: IdentifierLike, documentTypeName?: string | null);
    static fromJSON(js: ContractBoundsJSON): ContractBounds;
    static fromObject(obj: ContractBoundsObject): ContractBounds;
    toJSON(): ContractBoundsJSON;
    toObject(): ContractBoundsObject;
    readonly contractBoundsType: string;
    readonly contractBoundsTypeNumber: number;
    get documentTypeName(): string | undefined;
    set documentTypeName(value: string);
    get identifier(): Identifier;
    set identifier(value: IdentifierLike);
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-identitypublickeyjson"></a>
## `IdentityPublicKeyJSON`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface IdentityPublicKeyJSON {
    $formatVersion: string;
    id: number;
    purpose: number;
    securityLevel: number;
    contractBounds?: ContractBoundsJSON;
    type: number;
    readOnly: boolean;
    data: string;
    disabledAt?: number;
}
```

<a id="type-identitypublickeyobject"></a>
## `IdentityPublicKeyObject`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface IdentityPublicKeyObject {
    $formatVersion: string;
    id: number;
    purpose: number;
    securityLevel: number;
    contractBounds?: ContractBounds;
    type: number;
    readOnly: boolean;
    data: Uint8Array;
    disabledAt?: bigint;
}
```

<a id="type-identitypublickeyoptions"></a>
## `IdentityPublicKeyOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface IdentityPublicKeyOptions {
    keyId: number;
    purpose: PurposeLike;
    securityLevel: SecurityLevelLike;
    keyType: KeyTypeLike;
    isReadOnly?: boolean;
    data: Uint8Array;
    disabledAt?: number;
    contractBounds?: ContractBounds;
}
```

<a id="type-keytype"></a>
## `KeyType`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export enum KeyType {
    ECDSA_SECP256K1 = 0,
    BLS12_381 = 1,
    ECDSA_HASH160 = 2,
    BIP13_SCRIPT_HASH = 3,
    EDDSA_25519_HASH160 = 4,
}
```

<a id="type-keytypelike"></a>
## `KeyTypeLike`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type KeyTypeLike = KeyType | "ecdsa_secp256k1" | "bls12_381" | "ecdsa_hash160" | "bip13_script_hash" | "eddsa_25519_hash160" | 0 | 1 | 2 | 3 | 4;
```

<a id="type-purpose"></a>
## `Purpose`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export enum Purpose {
    AUTHENTICATION = 0,
    ENCRYPTION = 1,
    DECRYPTION = 2,
    TRANSFER = 3,
    SYSTEM = 4,
    VOTING = 5,
    OWNER = 6,
}
```

<a id="type-purposelike"></a>
## `PurposeLike`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type PurposeLike = Purpose | "authentication" | "encryption" | "decryption" | "transfer" | "system" | "voting" | "owner" | 0 | 1 | 2 | 3 | 4 | 5 | 6;
```

<a id="type-securitylevel"></a>
## `SecurityLevel`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export enum SecurityLevel {
    MASTER = 0,
    CRITICAL = 1,
    HIGH = 2,
    MEDIUM = 3,
}
```

<a id="type-securitylevellike"></a>
## `SecurityLevelLike`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type SecurityLevelLike = SecurityLevel | "master" | "critical" | "high" | "medium" | 0 | 1 | 2 | 3;
```

<a id="type-identitypublickeyincreationjson"></a>
## `IdentityPublicKeyInCreationJSON`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface IdentityPublicKeyInCreationJSON {
    keyId: number;
    purpose: string;
    securityLevel: string;
    keyType: string;
    isReadOnly: boolean;
    data: string;
    signature?: string;
    contractBounds?: ContractBoundsJSON;
}
```

<a id="type-identitypublickeyincreationobject"></a>
## `IdentityPublicKeyInCreationObject`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface IdentityPublicKeyInCreationObject {
    keyId: number;
    purpose: Purpose;
    securityLevel: SecurityLevel;
    keyType: KeyType;
    isReadOnly: boolean;
    data: Uint8Array;
    signature?: Uint8Array;
    contractBounds?: ContractBoundsObject;
}
```

<a id="type-identitypublickeyincreationoptions"></a>
## `IdentityPublicKeyInCreationOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface IdentityPublicKeyInCreationOptions {
    keyId: number;
    purpose: PurposeLike;
    securityLevel: SecurityLevelLike;
    keyType: KeyTypeLike;
    isReadOnly?: boolean;
    data: Uint8Array;
    signature?: Uint8Array;
    contractBounds?: ContractBounds;
}
```

<a id="type-groveelementtype"></a>
## `GroveElementType`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type GroveElementType =
| "item"
| "reference"
| "tree"
| "sumItem"
| "sumTree"
| "bigSumTree"
| "countTree"
| "countSumTree"
| "provableCountTree"
| "itemWithSumItem"
| "referenceWithSumItem"
| "provableCountSumTree"
| "provableCountProvableSumTree"
| "provableSumTree"
| "commitmentTree"
| "mmrTree"
| "bulkAppendTree"
| "denseAppendOnlyFixedSizeTree"
| "nonCountedItem"
| "nonCountedReference"
| "nonCountedTree"
| "nonCountedSumItem"
| "nonCountedSumTree"
| "nonCountedBigSumTree"
| "nonCountedCountTree"
| "nonCountedCountSumTree"
| "nonCountedProvableCountTree"
| "nonCountedItemWithSumItem"
| "nonCountedReferenceWithSumItem"
| "nonCountedProvableCountSumTree"
| "nonCountedProvableCountProvableSumTree"
| "nonCountedProvableSumTree"
| "nonCountedCommitmentTree"
| "nonCountedMmrTree"
| "nonCountedBulkAppendTree"
| "nonCountedDenseAppendOnlyFixedSizeTree"
| "notSummedSumTree"
| "notSummedBigSumTree"
| "notSummedCountSumTree"
| "notSummedProvableCountSumTree"
| "notSummedProvableCountProvableSumTree"
| "notSummedProvableSumTree"
| "notCountedOrSummedSumTree"
| "notCountedOrSummedBigSumTree"
| "notCountedOrSummedCountSumTree"
| "notCountedOrSummedProvableCountSumTree"
| "notCountedOrSummedProvableCountProvableSumTree"
| "notCountedOrSummedProvableSumTree";
```

<a id="type-platformaddress"></a>
## `PlatformAddress`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class PlatformAddress {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Creates a new PlatformAddress from various input types.
     *
     * Accepts:
     * - A bech32m string (e.g., "dash1..." or "tdash1...")
     * - A Uint8Array (21 bytes: type byte + 20-byte hash)
     * - An existing PlatformAddress object
     */
    constructor(address: PlatformAddressLike);
    /**
     * Creates a PlatformAddress from a bech32m-encoded string.
     *
     * Accepts addresses with either mainnet ("dash") or testnet ("tdash") HRP.
     */
    static fromBech32m(address: string): PlatformAddress;
    /**
     * Creates a PlatformAddress from raw bytes (21 bytes: type byte + 20-byte hash).
     */
    static fromBytes(bytes: Uint8Array): PlatformAddress;
    /**
     * Creates a PlatformAddress from a hex-encoded string.
     */
    static fromHex(hexString: string): PlatformAddress;
    /**
     * Creates a P2PKH address from a 20-byte public key hash.
     */
    static fromP2pkhHash(hash: Uint8Array): PlatformAddress;
    /**
     * Creates a P2SH address from a 20-byte script hash.
     */
    static fromP2shHash(hash: Uint8Array): PlatformAddress;
    /**
     * Returns the 20-byte hash portion of the address.
     */
    hash(): Uint8Array;
    /**
     * Returns the hash as a hex string.
     */
    hashToHex(): string;
    /**
     * Returns the bech32m-encoded address string for the specified network.
     */
    toBech32m(network: NetworkLike): string;
    /**
     * Returns the raw bytes of the address (21 bytes: type byte + 20-byte hash).
     */
    toBytes(): Uint8Array;
    /**
     * Returns the hex-encoded address bytes.
     */
    toHex(): string;
    /**
     * Returns the address type: "P2PKH" or "P2SH".
     */
    readonly addressType: string;
    /**
     * Returns true if this is a P2PKH address.
     */
    readonly isP2pkh: boolean;
    /**
     * Returns true if this is a P2SH address.
     */
    readonly isP2sh: boolean;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-publickey"></a>
## `PublicKey`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class PublicKey {
    free(): void;
    [Symbol.dispose](): void;
    constructor(compressed: boolean, publicKeyBytes: Uint8Array);
    static fromBytes(bytes: Uint8Array): PublicKey;
    getPublicKeyHash(): string;
    toBytes(): Uint8Array;
    compressed: boolean;
    inner: Uint8Array;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-protxhash"></a>
## `ProTxHash`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class ProTxHash {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-resourcevotejson"></a>
## `ResourceVoteJSON`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface ResourceVoteJSON {
    $formatVersion: string;
    votePoll: VotePollJSON;
    resourceVoteChoice: ResourceVoteChoiceJSON;
}
```

<a id="type-resourcevoteobject"></a>
## `ResourceVoteObject`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface ResourceVoteObject {
    $formatVersion: string;
    votePoll: VotePollObject;
    resourceVoteChoice: ResourceVoteChoiceObject;
}
```

<a id="type-resourcevotechoicejson"></a>
## `ResourceVoteChoiceJSON`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type ResourceVoteChoiceJSON =
| { type: "towardsIdentity"; data: string }
| { type: "abstain" }
| { type: "lock" };
```

<a id="type-resourcevotechoiceobject"></a>
## `ResourceVoteChoiceObject`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type ResourceVoteChoiceObject =
| { type: "towardsIdentity"; data: Uint8Array }
| { type: "abstain" }
| { type: "lock" };
```

<a id="type-statuschain"></a>
## `StatusChain`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class StatusChain {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromJSON(js: object): StatusChain;
    static fromObject(obj: object): StatusChain;
    toJSON(): any;
    toObject(): any;
    get core_chain_locked_height(): number | undefined;
    set core_chain_locked_height(value: number | null | undefined);
    earliest_app_hash: string;
    earliest_block_hash: string;
    earliest_block_height: string;
    isCatchingUp: boolean;
    latest_app_hash: string;
    latest_block_hash: string;
    latest_block_height: string;
    max_peer_block_height: string;
}
```

<a id="type-statusnetwork"></a>
## `StatusNetwork`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class StatusNetwork {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromJSON(js: object): StatusNetwork;
    static fromObject(obj: object): StatusNetwork;
    toJSON(): any;
    toObject(): any;
    chain_id: string;
    isListening: boolean;
    peers_count: number;
}
```

<a id="type-statusnode"></a>
## `StatusNode`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class StatusNode {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromJSON(js: object): StatusNode;
    static fromObject(obj: object): StatusNode;
    toJSON(): any;
    toObject(): any;
    readonly id: string;
    readonly proTxHash: ProTxHash | undefined;
}
```

<a id="type-statusstatesync"></a>
## `StatusStateSync`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class StatusStateSync {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromJSON(js: object): StatusStateSync;
    static fromObject(obj: object): StatusStateSync;
    toJSON(): any;
    toObject(): any;
    backfill_blocks_total: string;
    backfilled_blocks: string;
    chunk_process_avg_time: string;
    remaining_time: string;
    snapshot_chunks_count: string;
    snapshot_height: string;
    total_snapshots: number;
    total_synced_time: string;
}
```

<a id="type-statustime"></a>
## `StatusTime`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class StatusTime {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromJSON(js: object): StatusTime;
    static fromObject(obj: object): StatusTime;
    toJSON(): any;
    toObject(): any;
    get block(): string | undefined;
    set block(value: string | null | undefined);
    get epoch(): number | undefined;
    set epoch(value: number | null | undefined);
    get genesis(): string | undefined;
    set genesis(value: string | null | undefined);
    local: string;
}
```

<a id="type-statusversion"></a>
## `StatusVersion`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class StatusVersion {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromJSON(js: object): StatusVersion;
    static fromObject(obj: object): StatusVersion;
    toJSON(): any;
    toObject(): any;
    protocol: StatusProtocol;
    software: StatusSoftware;
}
```

<a id="type-tokencontractinfojson"></a>
## `TokenContractInfoJSON`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface TokenContractInfoJSON {
    contractId: string;
    tokenContractPosition: number;
}
```

<a id="type-tokencontractinfoobject"></a>
## `TokenContractInfoObject`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface TokenContractInfoObject {
    contractId: Uint8Array;
    tokenContractPosition: number;
}
```

<a id="type-tokenpricingschedule"></a>
## `TokenPricingSchedule`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class TokenPricingSchedule {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static SetPrices(prices: Record<string, bigint>): TokenPricingSchedule;
    static SinglePrice(credits: bigint): TokenPricingSchedule;
    readonly scheduleType: string;
    static readonly __struct: string;
    readonly __type: string;
    readonly value: bigint | Record<string, bigint>;
}
```

<a id="type-votepolljson"></a>
## `VotePollJSON`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface VotePollJSON {
    type: "contestedDocumentResourceVotePoll";
    data: {
        contractId: string;
        documentTypeName: string;
        indexName: string;
        indexValues: any[];
    };
}
```

<a id="type-votepollobject"></a>
## `VotePollObject`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface VotePollObject {
    type: "contestedDocumentResourceVotePoll";
    data: {
        contractId: Uint8Array;
        documentTypeName: string;
        indexName: string;
        indexValues: any[];
    };
}
```

<a id="type-votepolloptions"></a>
## `VotePollOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface VotePollOptions {
    contractId: IdentifierLike;
    documentTypeName: string;
    indexName: string;
    indexValues: any[];
}
```

<a id="type-chainassetlockproofjson"></a>
## `ChainAssetLockProofJSON`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface ChainAssetLockProofJSON {
    coreChainLockedHeight: number;
    outPoint: OutPointJSON;
}
```

<a id="type-instantassetlockproofjson"></a>
## `InstantAssetLockProofJSON`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface InstantAssetLockProofJSON {
    instantLock: string;
    transaction: string;
    outputIndex: number;
}
```

<a id="type-chainassetlockproofobject"></a>
## `ChainAssetLockProofObject`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface ChainAssetLockProofObject {
    coreChainLockedHeight: number;
    outPoint: OutPointObject;
}
```

<a id="type-instantassetlockproofobject"></a>
## `InstantAssetLockProofObject`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface InstantAssetLockProofObject {
    instantLock: Uint8Array;
    transaction: Uint8Array;
    outputIndex: number;
}
```

<a id="type-blockinfo"></a>
## `BlockInfo`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class BlockInfo {
    free(): void;
    [Symbol.dispose](): void;
    constructor(options: BlockInfoOptions);
    static fromJSON(js: BlockInfoJSON): BlockInfo;
    static fromObject(obj: BlockInfoObject): BlockInfo;
    toJSON(): BlockInfoJSON;
    toObject(): BlockInfoObject;
    readonly coreHeight: number;
    readonly epochIndex: number;
    readonly height: bigint;
    static readonly __struct: string;
    readonly timeMs: bigint;
    readonly __type: string;
}
```

<a id="type-contesteddocumentvotepollwinnerinfo"></a>
## `ContestedDocumentVotePollWinnerInfo`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class ContestedDocumentVotePollWinnerInfo {
    free(): void;
    [Symbol.dispose](): void;
    constructor(kind: string, identityId?: Identifier | null);
    static fromJSON(js: ContestedDocumentVotePollWinnerInfoJSON): ContestedDocumentVotePollWinnerInfo;
    static fromObject(obj: ContestedDocumentVotePollWinnerInfoObject): ContestedDocumentVotePollWinnerInfo;
    toJSON(): ContestedDocumentVotePollWinnerInfoJSON;
    toObject(): ContestedDocumentVotePollWinnerInfoObject;
    readonly identityId: Identifier | undefined;
    readonly isLocked: boolean;
    readonly isNoWinner: boolean;
    readonly isWonByIdentity: boolean;
    readonly kind: string;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-network"></a>
## `Network`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export enum Network {
    Mainnet = 0,
    Testnet = 1,
    Devnet = 2,
    Regtest = 3,
}
```

<a id="type-platformversion"></a>
## `PlatformVersion`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class PlatformVersion {
    free(): void;
    [Symbol.dispose](): void;
    static current(): PlatformVersion;
    static first(): PlatformVersion;
    static latest(): PlatformVersion;
    constructor(version: number);
    static readonly __struct: string;
    readonly __type: string;
    readonly version: number;
}
```

<a id="type-authorizedactiontakers"></a>
## `AuthorizedActionTakers`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class AuthorizedActionTakers {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static ContractOwner(): AuthorizedActionTakers;
    static Group(group_contract_position: number): AuthorizedActionTakers;
    static Identity(identity_id: IdentifierLike): AuthorizedActionTakers;
    static MainGroup(): AuthorizedActionTakers;
    static NoOne(): AuthorizedActionTakers;
    static readonly __struct: string;
    readonly takerType: string;
    readonly __type: string;
    readonly value: Identifier | number | undefined;
}
```

<a id="type-changecontrolrules"></a>
## `ChangeControlRules`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class ChangeControlRules {
    free(): void;
    [Symbol.dispose](): void;
    canChangeAdminActionTakers(options: CanChangeAdminActionTakersOptions): boolean;
    constructor(options: ChangeControlRulesOptions);
    adminActionTakers: AuthorizedActionTakers;
    authorizedToMakeChange: AuthorizedActionTakers;
    isChangingAdminActionTakersToNoOneAllowed: boolean;
    isChangingAuthorizedActionTakersToNoOneAllowed: boolean;
    isSelfChangingAdminActionTakersAllowed: boolean;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-tokenconfigurationconvention"></a>
## `TokenConfigurationConvention`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class TokenConfigurationConvention {
    free(): void;
    [Symbol.dispose](): void;
    constructor(localizations: any, decimals: number);
    decimals: number;
    localizations: Record<string, TokenConfigurationLocalization>;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-tokenconfigurationoptions"></a>
## `TokenConfigurationOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface TokenConfigurationOptions {
    conventions: TokenConfigurationConvention;
    conventionsChangeRules: ChangeControlRules;
    baseSupply: bigint;
    maxSupply?: bigint;
    keepsHistory: TokenKeepsHistoryRules;
    isStartedAsPaused?: boolean;
    isAllowedTransferToFrozenBalance?: boolean;
    maxSupplyChangeRules: ChangeControlRules;
    distributionRules: TokenDistributionRules;
    marketplaceRules: TokenMarketplaceRules;
    manualMintingRules: ChangeControlRules;
    manualBurningRules: ChangeControlRules;
    freezeRules: ChangeControlRules;
    unfreezeRules: ChangeControlRules;
    destroyFrozenFundsRules: ChangeControlRules;
    emergencyActionRules: ChangeControlRules;
    mainControlGroup?: number;
    mainControlGroupCanBeModified: AuthorizedActionTakers;
    description?: string;
}
```

<a id="type-tokendistributionrules"></a>
## `TokenDistributionRules`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class TokenDistributionRules {
    free(): void;
    [Symbol.dispose](): void;
    constructor(options: TokenDistributionRulesOptions);
    changeDirectPurchasePricingRules: ChangeControlRules;
    mintingAllowChoosingDestination: boolean;
    mintingAllowChoosingDestinationRules: ChangeControlRules;
    get newTokensDestinationIdentity(): Identifier | undefined;
    set newTokensDestinationIdentity(value: IdentifierLikeOrUndefined);
    newTokensDestinationIdentityRules: ChangeControlRules;
    get perpetualDistribution(): TokenPerpetualDistribution | undefined;
    set perpetualDistribution(value: any);
    perpetualDistributionRules: ChangeControlRules;
    get preProgrammedDistribution(): TokenPreProgrammedDistribution | undefined;
    set preProgrammedDistribution(value: any);
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-tokenkeepshistoryrules"></a>
## `TokenKeepsHistoryRules`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class TokenKeepsHistoryRules {
    free(): void;
    [Symbol.dispose](): void;
    constructor(options: TokenKeepsHistoryRulesOptions);
    isKeepingBurningHistory: boolean;
    isKeepingDirectPricingHistory: boolean;
    isKeepingDirectPurchaseHistory: boolean;
    isKeepingFreezingHistory: boolean;
    isKeepingMintingHistory: boolean;
    isKeepingTransferHistory: boolean;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-tokenmarketplacerules"></a>
## `TokenMarketplaceRules`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class TokenMarketplaceRules {
    free(): void;
    [Symbol.dispose](): void;
    constructor(tradeMode: TokenTradeMode, tradeModeChangeRules: ChangeControlRules);
    tradeMode: TokenTradeMode;
    tradeModeChangeRules: ChangeControlRules;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-gasfeespaidby"></a>
## `GasFeesPaidBy`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export enum GasFeesPaidBy {
    DocumentOwner = 0,
    ContractOwner = 1,
    PreferContractOwner = 2,
}
```

<a id="type-groupactioneventjson"></a>
## `GroupActionEventJSON`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface GroupActionEventJSON {
    type: "tokenEvent";
    data: TokenEventJSON;
}
```

<a id="type-groupactioneventobject"></a>
## `GroupActionEventObject`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface GroupActionEventObject {
    type: "tokenEvent";
    data: TokenEventObject;
}
```

<a id="type-groupactioneventvariant"></a>
## `GroupActionEventVariant`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export enum GroupActionEventVariant {
    TokenEvent = 0,
}
```

<a id="type-tokenevent"></a>
## `TokenEvent`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class TokenEvent {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromJSON(js: TokenEventJSON): TokenEvent;
    static fromObject(obj: TokenEventObject): TokenEvent;
    toJSON(): TokenEventJSON;
    toObject(): TokenEventObject;
    static readonly __struct: string;
    readonly __type: string;
    readonly variant: TokenEventVariant;
}
```

<a id="type-groupstatetransitioninfooptions"></a>
## `GroupStateTransitionInfoOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface GroupStateTransitionInfoOptions {
    groupContractPosition: number;
    actionId: IdentifierLike;
    isActionProposer?: boolean;
}
```

<a id="type-identitykeyssearchkind"></a>
## `IdentityKeysSearchKind`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type IdentityKeysSearchKind = 'current' | 'all';
```

<a id="type-contractboundsjson"></a>
## `ContractBoundsJSON`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface ContractBoundsJSON {
    identifier: string;
    documentTypeName?: string;
    contractBoundsType: "SingleContract" | "SingleContractDocumentType";
}
```

<a id="type-contractboundsobject"></a>
## `ContractBoundsObject`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface ContractBoundsObject {
    identifier: Uint8Array;
    documentTypeName?: string;
    contractBoundsType: "SingleContract" | "SingleContractDocumentType";
}
```

<a id="type-statusprotocol"></a>
## `StatusProtocol`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class StatusProtocol {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromJSON(js: object): StatusProtocol;
    static fromObject(obj: object): StatusProtocol;
    toJSON(): any;
    toObject(): any;
    drive: StatusDriveProtocol;
    tenderdash: StatusTenderdashProtocol;
}
```

<a id="type-statussoftware"></a>
## `StatusSoftware`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class StatusSoftware {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromJSON(js: object): StatusSoftware;
    static fromObject(obj: object): StatusSoftware;
    toJSON(): any;
    toObject(): any;
    dapi: string;
    get drive(): string | undefined;
    set drive(value: string | null | undefined);
    get tenderdash(): string | undefined;
    set tenderdash(value: string | null | undefined);
}
```

<a id="type-outpointjson"></a>
## `OutPointJSON`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface OutPointJSON {
    txid: string;
    vout: number;
}
```

<a id="type-outpointobject"></a>
## `OutPointObject`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface OutPointObject {
    txid: string;
    vout: number;
}
```

<a id="type-blockinfojson"></a>
## `BlockInfoJSON`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface BlockInfoJSON {
    timeMs: number | string;
    height: number | string;
    coreHeight: number;
    epochIndex: number;
}
```

<a id="type-blockinfoobject"></a>
## `BlockInfoObject`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface BlockInfoObject {
    timeMs: bigint;
    height: bigint;
    coreHeight: number;
    epochIndex: number;
}
```

<a id="type-blockinfooptions"></a>
## `BlockInfoOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface BlockInfoOptions {
    timeMs: bigint;
    height: bigint;
    coreHeight: number;
    epochIndex: number;
}
```

<a id="type-contesteddocumentvotepollwinnerinfojson"></a>
## `ContestedDocumentVotePollWinnerInfoJSON`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type ContestedDocumentVotePollWinnerInfoJSON =
| { type: "noWinner" }
| { type: "locked" }
| { type: "wonByIdentity"; data: string };
```

<a id="type-contesteddocumentvotepollwinnerinfoobject"></a>
## `ContestedDocumentVotePollWinnerInfoObject`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type ContestedDocumentVotePollWinnerInfoObject =
| { type: "noWinner" }
| { type: "locked" }
| { type: "wonByIdentity"; data: Uint8Array };
```

<a id="type-canchangeadminactiontakersoptions"></a>
## `CanChangeAdminActionTakersOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface CanChangeAdminActionTakersOptions {
    adminActionTakers: AuthorizedActionTakers;
    contractOwnerId: IdentifierLike;
    mainGroup?: number;
    groups: Record<number, Group>;
    actionTaker: ActionTaker;
    goal: ActionGoalLike;
}
```

<a id="type-changecontrolrulesoptions"></a>
## `ChangeControlRulesOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface ChangeControlRulesOptions {
    authorizedToMakeChange: AuthorizedActionTakers;
    adminActionTakers: AuthorizedActionTakers;
    isChangingAuthorizedActionTakersToNoOneAllowed?: boolean;
    isChangingAdminActionTakersToNoOneAllowed?: boolean;
    isSelfChangingAdminActionTakersAllowed?: boolean;
}
```

<a id="type-tokenconfigurationlocalization"></a>
## `TokenConfigurationLocalization`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class TokenConfigurationLocalization {
    free(): void;
    [Symbol.dispose](): void;
    constructor(shouldCapitalize: boolean, singularForm: string, pluralForm: string);
    static fromJSON(value: TokenConfigurationLocalizationJSON): TokenConfigurationLocalization;
    static fromObject(value: TokenConfigurationLocalizationObject): TokenConfigurationLocalization;
    toJSON(): TokenConfigurationLocalizationJSON;
    toObject(): TokenConfigurationLocalizationObject;
    pluralForm: string;
    shouldCapitalize: boolean;
    singularForm: string;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-identifierlikeorundefined"></a>
## `IdentifierLikeOrUndefined`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type IdentifierLikeOrUndefined = Identifier | Uint8Array | string | undefined;
```

<a id="type-tokendistributionrulesoptions"></a>
## `TokenDistributionRulesOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface TokenDistributionRulesOptions {
    perpetualDistribution?: TokenPerpetualDistribution;
    perpetualDistributionRules: ChangeControlRules;
    preProgrammedDistribution?: TokenPreProgrammedDistribution;
    newTokensDestinationIdentity?: IdentifierLike;
    newTokensDestinationIdentityRules: ChangeControlRules;
    mintingAllowChoosingDestination: boolean;
    mintingAllowChoosingDestinationRules: ChangeControlRules;
    changeDirectPurchasePricingRules: ChangeControlRules;
}
```

<a id="type-tokenperpetualdistribution"></a>
## `TokenPerpetualDistribution`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class TokenPerpetualDistribution {
    free(): void;
    [Symbol.dispose](): void;
    constructor(distributionType: RewardDistributionType, recipient: TokenDistributionRecipient);
    distributionType: RewardDistributionType;
    distributionRecipient: TokenDistributionRecipient;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-tokenpreprogrammeddistribution"></a>
## `TokenPreProgrammedDistribution`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class TokenPreProgrammedDistribution {
    free(): void;
    [Symbol.dispose](): void;
    constructor(distributions: PreProgrammedDistributionsMap);
    distributions: PreProgrammedDistributionsMap;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-tokenkeepshistoryrulesoptions"></a>
## `TokenKeepsHistoryRulesOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface TokenKeepsHistoryRulesOptions {
    isKeepingTransferHistory?: boolean;
    isKeepingFreezingHistory?: boolean;
    isKeepingMintingHistory?: boolean;
    isKeepingBurningHistory?: boolean;
    isKeepingDirectPricingHistory?: boolean;
    isKeepingDirectPurchaseHistory?: boolean;
}
```

<a id="type-tokentrademode"></a>
## `TokenTradeMode`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class TokenTradeMode {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static NotTradeable(): TokenTradeMode;
    static readonly __struct: string;
    readonly __type: string;
    readonly value: string;
}
```

<a id="type-tokeneventjson"></a>
## `TokenEventJSON`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface TokenEventJSON {
    type: string;
    data?: unknown;
}
```

<a id="type-tokeneventobject"></a>
## `TokenEventObject`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface TokenEventObject {
    type: string;
    data?: unknown;
}
```

<a id="type-tokeneventvariant"></a>
## `TokenEventVariant`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export enum TokenEventVariant {
    Mint = 0,
    Burn = 1,
    Freeze = 2,
    Unfreeze = 3,
    DestroyFrozenFunds = 4,
    Transfer = 5,
    Claim = 6,
    EmergencyAction = 7,
    ConfigUpdate = 8,
    ChangePriceForDirectPurchase = 9,
    DirectPurchase = 10,
}
```

<a id="type-statusdriveprotocol"></a>
## `StatusDriveProtocol`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class StatusDriveProtocol {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromJSON(js: object): StatusDriveProtocol;
    static fromObject(obj: object): StatusDriveProtocol;
    toJSON(): any;
    toObject(): any;
    current: number;
    latest: number;
}
```

<a id="type-statustenderdashprotocol"></a>
## `StatusTenderdashProtocol`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class StatusTenderdashProtocol {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromJSON(js: object): StatusTenderdashProtocol;
    static fromObject(obj: object): StatusTenderdashProtocol;
    toJSON(): any;
    toObject(): any;
    block: number;
    p2p: number;
}
```

<a id="type-actiongoallike"></a>
## `ActionGoalLike`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type ActionGoalLike = ActionGoal | string | number;
```

<a id="type-actiontaker"></a>
## `ActionTaker`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class ActionTaker {
    free(): void;
    [Symbol.dispose](): void;
    constructor(value: ActionTakerValue);
    value: ActionTakerValue;
    static readonly __struct: string;
    readonly takerType: string;
    readonly __type: string;
}
```

<a id="type-tokenconfigurationlocalizationjson"></a>
## `TokenConfigurationLocalizationJSON`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface TokenConfigurationLocalizationJSON {
    $formatVersion: string;
    shouldCapitalize: boolean;
    singularForm: string;
    pluralForm: string;
}
```

<a id="type-tokenconfigurationlocalizationobject"></a>
## `TokenConfigurationLocalizationObject`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface TokenConfigurationLocalizationObject {
    $formatVersion: string;
    shouldCapitalize: boolean;
    singularForm: string;
    pluralForm: string;
}
```

<a id="type-rewarddistributiontype"></a>
## `RewardDistributionType`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class RewardDistributionType {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static BlockBasedDistribution(interval: bigint, _function: DistributionFunction): RewardDistributionType;
    static EpochBasedDistribution(interval: number, _function: DistributionFunction): RewardDistributionType;
    static TimeBasedDistribution(interval: bigint, _function: DistributionFunction): RewardDistributionType;
    readonly distribution: RewardDistributionValue;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-tokendistributionrecipient"></a>
## `TokenDistributionRecipient`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class TokenDistributionRecipient {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static ContractOwner(): TokenDistributionRecipient;
    static EvonodesByParticipation(): TokenDistributionRecipient;
    static Identity(identityId: IdentifierLike): TokenDistributionRecipient;
    readonly recipientType: string;
    static readonly __struct: string;
    readonly __type: string;
    readonly value: Identifier | undefined;
}
```

<a id="type-preprogrammeddistributionsmap"></a>
## `PreProgrammedDistributionsMap`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type PreProgrammedDistributionsMap = Map<string, DistributionAmountsMap>;
```

<a id="type-actiongoal"></a>
## `ActionGoal`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export enum ActionGoal {
    ActionCompletion = 0,
    ActionParticipation = 1,
}
```

<a id="type-actiontakervalue"></a>
## `ActionTakerValue`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type ActionTakerValue = IdentifierLike | IdentifierLike[];
```

<a id="type-distributionfunction"></a>
## `DistributionFunction`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class DistributionFunction {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static Exponential(opts: DistributionExponential): DistributionFunction;
    static FixedAmountDistribution(opts: DistributionFixedAmount): DistributionFunction;
    static InvertedLogarithmic(opts: DistributionInvertedLogarithmic): DistributionFunction;
    static Linear(opts: DistributionLinear): DistributionFunction;
    static Logarithmic(opts: DistributionLogarithmic): DistributionFunction;
    static Polynomial(opts: DistributionPolynomial): DistributionFunction;
    static Random(opts: DistributionRandom): DistributionFunction;
    static StepDecreasingAmount(opts: DistributionStepDecreasingAmount): DistributionFunction;
    static Stepwise(steps_with_amount: Record<string, bigint>): DistributionFunction;
    readonly functionName: string;
    readonly functionValue: DistributionFixedAmount | DistributionRandom | DistributionStepDecreasingAmount | Record<string, bigint> | DistributionLinear | DistributionPolynomial | DistributionExponential | DistributionLogarithmic | DistributionInvertedLogarithmic;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-rewarddistributionvalue"></a>
## `RewardDistributionValue`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type RewardDistributionValue =
| BlockBasedDistribution
| TimeBasedDistribution
| EpochBasedDistribution;
```

<a id="type-distributionamountsmap"></a>
## `DistributionAmountsMap`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type DistributionAmountsMap = Map<string, bigint>;
```

<a id="type-distributionexponential"></a>
## `DistributionExponential`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class DistributionExponential {
    free(): void;
    [Symbol.dispose](): void;
    constructor(options: DistributionExponentialOptions);
    a: bigint;
    b: bigint;
    d: bigint;
    m: bigint;
    get maxValue(): bigint | undefined;
    set maxValue(value: bigint | null | undefined);
    get minValue(): bigint | undefined;
    set minValue(value: bigint | null | undefined);
    n: bigint;
    o: bigint;
    get startMoment(): bigint | undefined;
    set startMoment(value: bigint | null | undefined);
}
```

<a id="type-distributionfixedamount"></a>
## `DistributionFixedAmount`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class DistributionFixedAmount {
    free(): void;
    [Symbol.dispose](): void;
    constructor(options: DistributionFixedAmountOptions);
    amount: bigint;
}
```

<a id="type-distributioninvertedlogarithmic"></a>
## `DistributionInvertedLogarithmic`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class DistributionInvertedLogarithmic {
    free(): void;
    [Symbol.dispose](): void;
    constructor(options: DistributionInvertedLogarithmicOptions);
    a: bigint;
    b: bigint;
    d: bigint;
    m: bigint;
    get maxValue(): bigint | undefined;
    set maxValue(value: bigint | null | undefined);
    get minValue(): bigint | undefined;
    set minValue(value: bigint | null | undefined);
    n: bigint;
    o: bigint;
    get startMoment(): bigint | undefined;
    set startMoment(value: bigint | null | undefined);
}
```

<a id="type-distributionlinear"></a>
## `DistributionLinear`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class DistributionLinear {
    free(): void;
    [Symbol.dispose](): void;
    constructor(options: DistributionLinearOptions);
    a: bigint;
    d: bigint;
    get maxValue(): bigint | undefined;
    set maxValue(value: bigint | null | undefined);
    get minValue(): bigint | undefined;
    set minValue(value: bigint | null | undefined);
    get startStep(): bigint | undefined;
    set startStep(value: bigint | null | undefined);
    startingAmount: bigint;
}
```

<a id="type-distributionlogarithmic"></a>
## `DistributionLogarithmic`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class DistributionLogarithmic {
    free(): void;
    [Symbol.dispose](): void;
    constructor(options: DistributionLogarithmicOptions);
    a: bigint;
    b: bigint;
    d: bigint;
    m: bigint;
    get maxValue(): bigint | undefined;
    set maxValue(value: bigint | null | undefined);
    get minValue(): bigint | undefined;
    set minValue(value: bigint | null | undefined);
    n: bigint;
    o: bigint;
    get startMoment(): bigint | undefined;
    set startMoment(value: bigint | null | undefined);
}
```

<a id="type-distributionpolynomial"></a>
## `DistributionPolynomial`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class DistributionPolynomial {
    free(): void;
    [Symbol.dispose](): void;
    constructor(options: DistributionPolynomialOptions);
    a: bigint;
    b: bigint;
    d: bigint;
    m: bigint;
    get maxValue(): bigint | undefined;
    set maxValue(value: bigint | null | undefined);
    get minValue(): bigint | undefined;
    set minValue(value: bigint | null | undefined);
    n: bigint;
    o: bigint;
    get startMoment(): bigint | undefined;
    set startMoment(value: bigint | null | undefined);
}
```

<a id="type-distributionrandom"></a>
## `DistributionRandom`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class DistributionRandom {
    free(): void;
    [Symbol.dispose](): void;
    constructor(options: DistributionRandomOptions);
    max: bigint;
    min: bigint;
}
```

<a id="type-distributionstepdecreasingamount"></a>
## `DistributionStepDecreasingAmount`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class DistributionStepDecreasingAmount {
    free(): void;
    [Symbol.dispose](): void;
    constructor(options: DistributionStepDecreasingAmountOptions);
    decreasePerIntervalDenominator: number;
    decreasePerIntervalNumerator: number;
    distributionStartAmount: bigint;
    get maxIntervalCount(): number | undefined;
    set maxIntervalCount(value: number | null | undefined);
    get minValue(): bigint | undefined;
    set minValue(value: bigint | null | undefined);
    get startDecreasingOffset(): bigint | undefined;
    set startDecreasingOffset(value: bigint | null | undefined);
    stepCount: number;
    trailingDistributionIntervalAmount: bigint;
}
```

<a id="type-blockbaseddistribution"></a>
## `BlockBasedDistribution`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class BlockBasedDistribution {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    function: DistributionFunction;
    static readonly __struct: string;
    readonly __type: string;
    interval: bigint;
}
```

<a id="type-epochbaseddistribution"></a>
## `EpochBasedDistribution`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class EpochBasedDistribution {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    function: DistributionFunction;
    static readonly __struct: string;
    readonly __type: string;
    interval: number;
}
```

<a id="type-timebaseddistribution"></a>
## `TimeBasedDistribution`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class TimeBasedDistribution {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    interval: bigint;
    function: DistributionFunction;
    static readonly __struct: string;
    readonly __type: string;
}
```

<a id="type-distributionexponentialoptions"></a>
## `DistributionExponentialOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface DistributionExponentialOptions {
    a: bigint;
    d: bigint;
    m: bigint;
    n: bigint;
    o: bigint;
    startMoment?: bigint;
    b: bigint;
    minValue?: bigint;
    maxValue?: bigint;
}
```

<a id="type-distributionfixedamountoptions"></a>
## `DistributionFixedAmountOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface DistributionFixedAmountOptions {
    amount: bigint;
}
```

<a id="type-distributioninvertedlogarithmicoptions"></a>
## `DistributionInvertedLogarithmicOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface DistributionInvertedLogarithmicOptions {
    a: bigint;
    d: bigint;
    m: bigint;
    n: bigint;
    o: bigint;
    startMoment?: bigint;
    b: bigint;
    minValue?: bigint;
    maxValue?: bigint;
}
```

<a id="type-distributionlinearoptions"></a>
## `DistributionLinearOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface DistributionLinearOptions {
    a: bigint;
    d: bigint;
    startStep?: bigint;
    startingAmount: bigint;
    minValue?: bigint;
    maxValue?: bigint;
}
```

<a id="type-distributionlogarithmicoptions"></a>
## `DistributionLogarithmicOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface DistributionLogarithmicOptions {
    a: bigint;
    d: bigint;
    m: bigint;
    n: bigint;
    o: bigint;
    startMoment?: bigint;
    b: bigint;
    minValue?: bigint;
    maxValue?: bigint;
}
```

<a id="type-distributionpolynomialoptions"></a>
## `DistributionPolynomialOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface DistributionPolynomialOptions {
    a: bigint;
    d: bigint;
    m: bigint;
    n: bigint;
    o: bigint;
    startMoment?: bigint;
    b: bigint;
    minValue?: bigint;
    maxValue?: bigint;
}
```

<a id="type-distributionrandomoptions"></a>
## `DistributionRandomOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface DistributionRandomOptions {
    min: bigint;
    max: bigint;
}
```

<a id="type-distributionstepdecreasingamountoptions"></a>
## `DistributionStepDecreasingAmountOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface DistributionStepDecreasingAmountOptions {
    stepCount: number;
    decreasePerIntervalNumerator: number;
    decreasePerIntervalDenominator: number;
    startDecreasingOffset?: bigint;
    maxIntervalCount?: number;
    distributionStartAmount: bigint;
    trailingDistributionIntervalAmount: bigint;
    minValue?: bigint;
}
```
