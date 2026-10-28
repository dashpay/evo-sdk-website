# Evo SDK Type Reference

Generated from `@dashevo/evo-sdk@5.0.1` published TypeScript declarations under `dist/`.

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
     * "chain") — matching the `$type` discriminator emitted by `toObject()` /
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
    /**
     * The first `propertyConstraints` rule `document` breaks, in name order,
     * evaluated with the same code consensus runs on a create or replace: its
     * properties, its owner for `$ownerId`, the revision the write records for
     * `$revision` (below), and for the system times the device clock in place
     * of the block time the
     * write will record (the document's stored creation and transfer times
     * when it has them). A rule reading a block height the write records is
     * not judged, since the height is unknown until the block, a rule reading
     * a `countOf` or `sumOf` total, which only the platform reads from state
     * (a rule's `readsTotals` lists them), or a rule reading a value of the
     * document a reference points at, which the platform reads with the
     * reference (a rule's `readsReferenced` lists them).
     * `undefined` when it meets every rule of its document type.
     *
     * `storedDocument` is the stored version the write replaces, which a rule
     * reads through `$old.` (a rule's `readsStored` says it does): the stored
     * document for a replace, `null` for a create, which has none, so that
     * every `$old.` read is absent. Left `undefined`, a rule reading it is not
     * judged, and neither is one reading `$revision`, which depends on the
     * write: 1 on a create, one more than the stored on a replace. Given
     * either, `$revision`, `$ownerId` and the creation and
     * transfer times are what consensus judges, whatever `document` holds: on
     * a replace the stored document's owner, creation and transfer and the
     * revision after its own, the only one consensus accepts on a replace;
     * on a create revision 1 and the device clock.
     *
     * A pre-check, so an app can refuse a document before paying for a
     * transition consensus would refuse with
     * `DocumentPropertyConstraintViolatedError` (code 10422). It judges the
     * rules alone, not the document's JSON schema. Throws when the document
     * belongs to another contract or names a document type this one lacks,
     * and when the stored document is not the same document.
     */
    checkDocumentPropertyConstraints(document: Document, storedDocument: Document | null | undefined): DocumentPropertyConstraintViolation | undefined;
    constructor(options: DataContractOptions);
    /**
     * The `distinctFrom` declarations of one document type, in schema
     * property order: each `{ path, distinctFrom }` names an identifier
     * property and what its value must differ from, `"$ownerId"` or the
     * dotted path of another identifier property of the same type.
     *
     * Empty when the document type declares none (the normal case). Throws
     * when the contract has no document type by that name, so "no such
     * type" and "nothing declared" stay distinguishable.
     *
     * The keyword is only parsed from protocol version 14 onward. A
     * contract deserialized against an earlier platform version reports an
     * empty list, which is exactly what consensus enforced at that version,
     * while `toJSON()` still shows the raw keyword either way.
     */
    documentTypeDistinctFrom(documentTypeName: string): Array<DocumentPropertyDistinctFrom>;
    /**
     * All `encryptedFor` declarations of one document type, in schema
     * property order: which byte array properties are encrypted, for whom,
     * under which key ids and under which scheme.
     *
     * Returns an empty array when the document type declares none. Throws
     * when the contract has no document type by that name, so "no such
     * type" and "nothing encrypted" stay distinguishable.
     *
     * The keyword is only parsed from protocol version 14 onward. A
     * contract deserialized against an earlier platform version reports
     * none, which is exactly what consensus enforced at that version, while
     * `toJSON()` still shows the raw keyword either way.
     */
    documentTypeEncryptedProperties(documentTypeName: string): Array<DocumentPropertyEncryption>;
    /**
     * The `immutable` declarations of one document type: `{ immutable:
     * string[], immutableWhen: Record<string, condition> }`, the properties
     * frozen at creation and those frozen under a condition, each sorted by
     * property name.
     *
     * Both are empty when the document type declares nothing (the
     * normal case, and the only case for a type whose documents are not
     * mutable). Throws when the contract has no document type by that
     * name, so "no such type" and "nothing frozen" stay distinguishable.
     *
     * The keywords are only parsed from protocol version 14 onward. A
     * contract deserialized against an earlier platform version reports
     * empty lists, which is exactly what consensus enforced at that
     * version, while `toJSON()` still shows the raw keywords either way.
     */
    documentTypeImmutableProperties(documentTypeName: string): DocumentTypeImmutableProperties;
    /**
     * All `propertyConstraints` rules of one document type, in name order,
     * the order consensus checks them in: each rule's name, the rule as the
     * schema declares it, every property it reads and how, and whether it
     * reads `$ownerId` (then a transfer or a purchase is judged against it
     * too).
     *
     * Returns an empty array when the document type declares none. Throws
     * when the contract has no document type by that name, so "no such
     * type" and "no rules" stay distinguishable.
     *
     * The keyword is only parsed from protocol version 14 onward. A
     * contract deserialized against an earlier platform version reports
     * none, which is exactly what consensus enforced at that version, while
     * `toJSON()` still shows the raw keyword either way.
     */
    documentTypePropertyConstraints(documentTypeName: string): Array<DocumentPropertyConstraint>;
    /**
     * All `refersTo` declarations of one document type: its `ownerRefersTo`
     * or `creatorRefersTo` first, at the path `$ownerId` or `$creatorId`,
     * then the properties' own in schema property order.
     *
     * Returns an empty array when the document type declares none. Throws
     * when the contract has no document type by that name — an empty array
     * would conflate "no such type" with "no references".
     *
     * Reference declarations are only parsed from protocol version 14
     * onward. A contract deserialized against an earlier platform version
     * reports none, which is exactly what consensus enforced at that
     * version — but note the trap: `DataContract.fromBytes(bytes, false, 1)`
     * yields `[]` even for a contract whose raw schema does carry
     * `refersTo`, and `toJSON()` still shows the raw keyword either way.
     */
    documentTypeReferences(documentTypeName: string): Array<DocumentPropertyReference>;
    /**
     * Every typed array property of one document type (`type: "array"`
     * with an `items` element schema), in schema property order: `{ path,
     * items, minItems?, maxItems?, uniqueItems }`.
     *
     * Returns an empty array when the document type declares none. Throws
     * when the contract has no document type by that name, so "no such
     * type" and "no typed arrays" stay distinguishable.
     *
     * Typed arrays are only parsed from protocol version 14 onward. A
     * contract deserialized against an earlier platform version cannot
     * carry one: the parsers of those versions refuse an array that is not
     * a byte array.
     */
    documentTypeTypedArrays(documentTypeName: string): Array<DocumentTypedArrayProperty>;
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
    /**
     * Every document type that declares at least one `distinctFrom`, keyed
     * by document type name.
     *
     * Document types with no declarations are omitted, so an empty `Map`
     * means "this contract declares no distinctFrom at all".
     */
    readonly documentDistinctFrom: Map<string, Array<DocumentPropertyDistinctFrom>>;
    /**
     * Every document type that declares at least one encrypted property,
     * keyed by document type name.
     *
     * Document types with no declarations are omitted, so an empty `Map`
     * means "this contract declares no encrypted property at all".
     */
    readonly documentEncryptedProperties: Map<string, Array<DocumentPropertyEncryption>>;
    /**
     * Every document type that freezes at least one property, keyed by
     * document type name.
     *
     * Document types whose `immutable` keyword lists nothing are omitted, so
     * an empty `Map` means "nothing in this contract is frozen per
     * property".
     */
    readonly documentImmutableProperties: Map<string, DocumentTypeImmutableProperties>;
    /**
     * Every document type that declares `propertyConstraints`, keyed by
     * document type name.
     *
     * Document types with no rules are omitted, so an empty `Map` means
     * "this contract declares no propertyConstraints at all".
     */
    readonly documentPropertyConstraints: Map<string, Array<DocumentPropertyConstraint>>;
    /**
     * Every document type that declares at least one reference, keyed by
     * document type name.
     *
     * Document types with no declarations are omitted, so an empty `Map`
     * means "this contract declares no references at all".
     */
    readonly documentReferences: Map<string, Array<DocumentPropertyReference>>;
    /**
     * Every document type that declares at least one typed array property,
     * keyed by document type name.
     *
     * Document types with none are omitted, so an empty `Map` means "this
     * contract declares no typed arrays at all".
     */
    readonly documentTypedArrays: Map<string, Array<DocumentTypedArrayProperty>>;
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
     * Create a Document from a JSON object (canonical-tagged shape).
     * JSON format has identifiers as base58 strings.
     */
    static fromJSON(value: DocumentJSON, _platform_version: PlatformVersionLike): Document;
    /**
     * Create a Document from a JS object (canonical-tagged shape).
     */
    static fromObject(value: DocumentObject, _platform_version: PlatformVersionLike): Document;
    /**
     * Derives the id of a document that is about to be created, the way
     * consensus recomputes it for the create transition.
     *
     * From protocol version 14 the id commits to the identity contract
     * nonce of the create transition, so `identityContractNonce` is
     * required at that version (and ignored before it). The platform
     * version defaults to the latest.
     */
    static generateId(documentTypeName: string, ownerId: IdentifierLike, dataContractId: IdentifierLike, entropy?: Uint8Array | null, identityContractNonce?: bigint | null, platformVersion?: PlatformVersionLike | null): Uint8Array;
    /**
     * Gives the document the id its create transition will carry, derived
     * from its entropy and the identity contract nonce that transition is
     * going to use.
     *
     * `new DocumentCreateTransition(...)` does this on its own; call it
     * yourself to know the id before the transition exists (a document that
     * another document in the same batch references). The transition must
     * then be built with the same nonce.
     *
     * Throws when the document carries no entropy (one read back from
     * Platform), since only a new document can be created.
     */
    setIdForCreation(identityContractNonce: bigint, platformVersion?: PlatformVersionLike | null): void;
    toBase64(data_contract: DataContract, platform_version: PlatformVersionLike): string;
    toBytes(data_contract: DataContract, platform_version: PlatformVersionLike): Uint8Array;
    toHex(data_contract: DataContract, platform_version: PlatformVersionLike): string;
    /**
     * Convert to a JSON-compatible JS object with binary fields as strings.
     */
    toJSON(_platform_version: PlatformVersionLike): DocumentJSON;
    /**
     * Convert to a JS object with binary fields as Uint8Array.
     *
     * Wire shape (Phase D step 8 slice B):
     * - `$formatVersion: "0"` — canonical Document version tag
     * - `$dataContractId`, `$type`, `$entropy` — wasm-side metadata
     * - V0 Document fields (`$id`, `$ownerId`, `$revision`, …) flat
     *   alongside user-defined properties
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
    /**
     * The block time at which a moderator of the contract last wrote the fields the document
     * type keeps for its moderators (`moderatorAbilities.changeFields`); `undefined` until one
     * does.
     */
    readonly moderatedAt: bigint | undefined;
    /**
     * The moderator who last wrote those fields; `undefined` until one does.
     */
    readonly moderatedBy: Identifier | undefined;
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

<a id="type-documentactionfeeagreement"></a>
## `DocumentActionFeeAgreement`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class DocumentActionFeeAgreement {
    free(): void;
    [Symbol.dispose](): void;
    constructor(options: DocumentActionFeeAgreementOptions);
    /**
     * The agreement a transition performing `action` on a document of the type
     * `documentTypeName` of `dataContract` must carry, or `undefined` when the type charges
     * nothing for it. It names what the contract declares, so it is only as current as
     * `dataContract`: pass the contract the user was shown. `feeMultiplier` is required for a
     * fee priced by the fee multiplier; a fixed fee names none, so for one it is only
     * validated. The Rust SDK's `DocumentActionFeeAgreement::for_document_type_action`.
     */
    static forDocumentTypeAction(dataContract: DataContract, documentTypeName: string, action: DocumentActionFeeAction, feeMultiplier?: AgreedFeeMultiplierOptions | null): DocumentActionFeeAgreement | undefined;
    static fromJSON(js: DocumentActionFeeAgreementJSON): DocumentActionFeeAgreement;
    static fromObject(obj: DocumentActionFeeAgreementObject): DocumentActionFeeAgreement;
    toJSON(): DocumentActionFeeAgreementJSON;
    toObject(): DocumentActionFeeAgreementObject;
    readonly feeMultiplierIncreaseTolerancePercent: number | undefined;
    readonly knownFeeMultiplierPermille: bigint | undefined;
    readonly moderators: bigint;
    readonly owner: bigint;
    readonly pricing: string;
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
     * The most, in credits, the document pays into the contest it joins when its
     * document type has a contested index. From protocol version 14 it is charged
     * the fund to join the contest, which doubles once the contest holds 250
     * contenders and again for every 50 more, and is refused, paid, when that is
     * more than this. The identity must hold what it states. Leave it out to state
     * the fund to join read just before the document is submitted. A document that
     * joins no contest ignores it.
     */
    contestFund?: bigint;

    /**
     * The action fee the signer agrees to pay, as the contract shown to the user
     * declares it. Required when the document type's `actionFees` charge for this
     * action (protocol version 14+). `DocumentActionFeeAgreement.forDocumentTypeAction`
     * builds it from that contract.
     */
    actionFeeAgreement?: DocumentActionFeeAgreement;

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
     * The action fee the signer agrees to pay, as the contract shown to the user
     * declares it. Required when the document type's `actionFees` charge for this
     * action (protocol version 14+). `DocumentActionFeeAgreement.forDocumentTypeAction`
     * builds it from that contract.
     */
    actionFeeAgreement?: DocumentActionFeeAgreement;

    /**
     * Optional settings for the broadcast operation.
     * Includes retries, timeouts, userFeeIncrease, etc.
     */
    settings?: PutSettings;
}
```

<a id="type-documenthistoryquery"></a>
## `DocumentHistoryQuery`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface DocumentHistoryQuery {
    /**
     * Data contract identifier.
     */
    dataContractId: IdentifierLike

    /**
     * Document type name.
     */
    documentTypeName: string;

    /**
     * Document identifier.
     */
    documentId: IdentifierLike

    /**
     * Millisecond timestamp (exclusive) to start after.
     * @default 0
     */
    startAtMs?: number;

    /**
     * Maximum number of entries to return.
     * @default undefined
     */
    limit?: number;

    /**
     * Offset for pagination through the document history.
     * @default undefined
     */
    offset?: number;
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
     * The action fee the signer agrees to pay, as the contract shown to the user
     * declares it. Required when the document type's `actionFees` charge for this
     * action (protocol version 14+). `DocumentActionFeeAgreement.forDocumentTypeAction`
     * builds it from that contract.
     */
    actionFeeAgreement?: DocumentActionFeeAgreement;

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
     * The action fee the signer agrees to pay, as the contract shown to the user
     * declares it. Required when the document type's `actionFees` charge for this
     * action (protocol version 14+). `DocumentActionFeeAgreement.forDocumentTypeAction`
     * builds it from that contract.
     */
    actionFeeAgreement?: DocumentActionFeeAgreement;

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
     * The action fee the signer agrees to pay, as the contract shown to the user
     * declares it. Required when the document type's `actionFees` charge for this
     * action (protocol version 14+). `DocumentActionFeeAgreement.forDocumentTypeAction`
     * builds it from that contract.
     */
    actionFeeAgreement?: DocumentActionFeeAgreement;

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
     * The action fee the signer agrees to pay, as the contract shown to the user
     * declares it. Required when the document type's `actionFees` charge for this
     * action (protocol version 14+). `DocumentActionFeeAgreement.forDocumentTypeAction`
     * builds it from that contract.
     */
    actionFeeAgreement?: DocumentActionFeeAgreement;

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
     * Aggregate-query option: SQL-shaped `GROUP BY` field list. Mirrors
     * the v1 wire's `group_by: repeated string` directly. Ignored by
     * the regular document-fetch path.
     *
     * - `[]` or omitted → one ungrouped result entry, keyed by the
     *   empty string. Its value is the total count for
     *   `getDocumentsCount`, total sum for `getDocumentsSum`, or
     *   `{count, sum}` for `getDocumentsAverage`.
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

    /**
     * Time-range bucket selections for "trending"-style queries. Each entry
     * picks a single bucket of a timestamp field covered by a `timeRange`
     * index. For the relative selectors the server resolves the bucket from
     * the current block time and the proof verifier re-derives it from the
     * signed response metadata; `"byStart"` names the bucket absolutely, so
     * both sides read it straight from the query. Provable either way.
     * Requires protocol version 14+ (the first version whose contract
     * grammar hosts `timeRange` indexes).
     *
     * - `selector: "oldest"` → the oldest still-active range (a near-full
     *   trailing window of ~`range`; best for "trending over the last window").
     * - `selector: "newest"` → the freshest started range (latest partial slice).
     * - `selector: "byStart"` → the range starting exactly at `startMs` — any
     *   window, current or historic. `startMs` is then required and must be a
     *   window start on the grid (`phase + k * step`, in milliseconds); an
     *   off-grid start is rejected rather than snapped, and an empty window
     *   is a provable empty answer. The relative selectors must not carry
     *   `startMs`.
     *
     * `grid` names one of the field's grids in the contract's own declared
     * seconds (`{ range, step, phase? }`) — required when the contract buckets
     * the field with more than one `timeRange` grid, where the bare selector
     * is ambiguous and rejected. A zero phase is spelled by omission.
     * @default []
     */
    timeRange?: {
        field: string;
        selector: "newest" | "oldest" | "byStart";
        startMs?: number;
        grid?: { range: number; step: number; phase?: number };
    }[];

    /**
     * Integer-range window selections. Each entry picks one window of an
     * integer field covered by an `integerRange` index, named by its start:
     * `start` must be a window start on the grid (`phase + k * step`, within
     * the field's integer type, or the type's minimum for a clamped bottom
     * window). An off-grid start is rejected rather than snapped, and an
     * empty window is a provable empty answer. The server and the proof
     * verifier resolve the same window from the query alone. Requires
     * protocol version 14+.
     *
     * `start` is a number, or a decimal string for values beyond
     * `Number.MAX_SAFE_INTEGER`. `grid` names one of the field's grids
     * verbatim (`{ range, step, phase? }`) and is required when the contract
     * buckets the field with more than one `integerRange` grid.
     * @default []
     */
    integerRange?: {
        field: string;
        start: number | string;
        grid?: { range: number; step: number; phase?: number };
    }[];
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

    /**
     * The most, in credits, the registration pays into the contest a contested
     * name joins. From protocol version 14 it is charged the fund to join the
     * contest, which doubles once the contest holds 250 contenders and again
     * for every 50 more, and is refused, paid, when that is more than this.
     * The identity must hold what it states. Leave it out to state the fund to
     * join read just before the domain is submitted.
     */
    contestFund?: bigint;
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

<a id="type-generatemnemonicparams"></a>
## `GenerateMnemonicParams`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface GenerateMnemonicParams {
    wordCount?: number;
    languageCode?: string;
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
    static fromJSON(js: GroupJSON): Group;
    static fromObject(obj: GroupObject): Group;
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
    /**
     * `fromObject` keeps the manual path because the wasm API dispatches on
     * the `platform_version` arg (via `try_from_platform_versioned`) rather
     * than the value's embedded `$formatVersion` tag — explicit version
     * coupling is the wasm SDK convention. The canonical
     * `ValueConvertible::from_object` would dispatch on the tag.
     */
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
     * Deserialize from JSON-compatible JS object (canonical wire shape).
     *
     * Expects base64 strings for binary fields, base58 strings for
     * identifiers — the canonical shape produced by `toJSON`.
     * `platform_version` is accepted for SDK API consistency but not
     * load-bearing today (canonical tag-driven dispatch handles V0).
     */
    static fromJSON(value: IdentityPublicKeyJSON, _platform_version: PlatformVersionLike): IdentityPublicKey;
    /**
     * Deserialize from JS object (non-human-readable).
     *
     * Uses platform_value conversion which properly handles the tagged enum.
     * `platform_version` is accepted for SDK API consistency but not
     * load-bearing today — canonical `ValueConvertible::from_object`
     * dispatches on the value's `$formatVersion` tag, which produces
     * identical output for the only currently-defined V0.
     */
    static fromObject(value: IdentityPublicKeyObject, _platform_version: PlatformVersionLike): IdentityPublicKey;
    getPublicKeyHash(): string;
    hex(): string;
    toBytes(): Uint8Array;
    /**
     * Serialize to JSON-compatible JS object (canonical wire shape).
     *
     * Binary fields render as base64 strings. Identifier fields render
     * as base58 strings. This matches the canonical `JsonConvertible`
     * path used by every other rs-dpp type's JSON conversion in this
     * SDK — including `IdentityWasm.toJSON`'s embedded public keys.
     */
    toJSON(): IdentityPublicKeyJSON;
    /**
     * Serialize to JS object (non-human-readable).
     *
     * Uses platform_value conversion which properly handles the tagged enum.
     * `disabledAt: null` is stripped automatically by the
     * `skip_serializing_if` attribute on the rs-dpp side.
     */
    toObject(): IdentityPublicKeyObject;
    validatePrivateKey(private_key_bytes_input: Uint8Array, network: NetworkLike): boolean;
    readonly contractBounds: ContractBounds | undefined;
    data: string;
    get disabledAt(): bigint | undefined;
    set disabledAt(value: any);
    /**
     * The block time in milliseconds from which the key can no longer sign, `undefined` when
     * it does not expire
     */
    get expiresAt(): bigint | undefined;
    /**
     * Setting an expiry on a version 0 key makes it a version 1 key
     */
    set expiresAt(value: bigint | null | undefined);
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
    /**
     * The total credits the key may spend over its lifetime, `undefined` when it has no budget
     */
    get totalBudget(): bigint | undefined;
    /**
     * Setting a budget on a version 0 key makes it a version 1 key
     */
    set totalBudget(value: bigint | null | undefined);
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
    /**
     * The block time in milliseconds from which the key can no longer sign, `undefined` when
     * it does not expire
     */
    get expiresAt(): bigint | undefined;
    /**
     * Setting an expiry on a version 0 key makes it a version 1 key. The key's own signature
     * no longer covers it afterwards: sign again.
     */
    set expiresAt(value: bigint | null | undefined);
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
    /**
     * The credits the key may spend over its lifetime, `undefined` when it has no budget
     */
    get totalBudget(): bigint | undefined;
    /**
     * Setting a budget on a version 0 key makes it a version 1 key. The key's own signature
     * no longer covers it afterwards: sign again.
     */
    set totalBudget(value: bigint | null | undefined);
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
     * Use IdentityPublicKeyInCreation to create new keys. A key built with `totalBudget` or
     * `expiresAt` is registered with those limits (protocol version 14); the signer must hold
     * its private key as well as the master key, since a new key signs its own registration.
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

<a id="type-keypair"></a>
## `KeyPair`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class KeyPair {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromJSON(js: object): KeyPair;
    static fromObject(obj: object): KeyPair;
    toJSON(): any;
    toObject(): any;
    address: string;
    network: string;
    privateKeyHex: string;
    privateKeyWif: string;
    publicKey: string;
}
```

<a id="type-masternodevoteoptions"></a>
## `MasternodeVoteOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface MasternodeVoteOptions {
    /**
     * The ProTxHash of the masternode: an Identifier, its 32 bytes, the hex Core's RPC shows,
     * or base58.
     */
    masternodeProTxHash: IdentifierLike;

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

<a id="type-networklike"></a>
## `NetworkLike`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type NetworkLike = Network | "mainnet" | "testnet" | "devnet" | "regtest" | 0 | 1 | 2 | 3;
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
    /**
     * Protocol version the chain was running when this response was produced.
     */
    readonly currentProtocolVersion: number;
    /**
     * Candidate upgrade version: the version above the current one with the
     * most evonode votes, if any votes exist.
     */
    readonly nextProtocolVersion: number | undefined;
    /**
     * Number of evonode votes cast for `nextProtocolVersion`.
     */
    readonly voteCount: bigint | undefined;
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

<a id="type-shieldedencryptednote"></a>
## `ShieldedEncryptedNote`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class ShieldedEncryptedNote {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromJSON(js: object): ShieldedEncryptedNote;
    static fromObject(obj: object): ShieldedEncryptedNote;
    toJSON(): any;
    toObject(): any;
    readonly cmx: Uint8Array;
    readonly cvNet: Uint8Array;
    readonly encryptedNote: Uint8Array;
    readonly nullifier: Uint8Array;
}
```

<a id="type-shieldednullifierstatus"></a>
## `ShieldedNullifierStatus`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class ShieldedNullifierStatus {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromJSON(js: object): ShieldedNullifierStatus;
    static fromObject(obj: object): ShieldedNullifierStatus;
    toJSON(): any;
    toObject(): any;
    readonly isSpent: boolean;
    readonly nullifier: Uint8Array;
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
    /**
     * The credit balance of the transition's owner after it executed, when DAPI reported it.
     */
    readonly ownerBalance: bigint | undefined;
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
     * The remaining token balance when supplied by the proof.
     * Group burn co-signers receive `undefined`, including after the action closes.
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
     * The type of distribution to claim from: "preProgrammed", "perpetual" or "oncePerIdentity".
     */
    distributionType: "preProgrammed" | "perpetual" | "oncePerIdentity";

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
     * The flat price in credits for one token (SinglePrice schedule).
     * Set to null to disable direct purchases.
     * Mutually exclusive with `priceTiers`.
     */
    price?: bigint | null;

    /**
     * Tiered direct-purchase pricing (SetPrices schedule).
     *
     * Maps the minimum bulk-buy amount (token amount, as a string key)
     * to the per-token price in credits for that tier. Keys are unsigned
     * integers encoded as strings; values are credit amounts as bigint.
     *
     * Example: `{ "1": 1_000n, "100": 900n, "1000": 800n }` charges 1000
     * credits/token for purchases of 1+, 900 for purchases of 100+, and
     * 800 for purchases of 1000+.
     *
     * Mutually exclusive with `price`. Must contain at least one entry.
     */
    priceTiers?: Record<string, bigint>;

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

<a id="type-vote"></a>
## `Vote`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class Vote {
    free(): void;
    [Symbol.dispose](): void;
    constructor(votePoll: VotePoll, resourceVoteChoice: ResourceVoteChoice);
    static fromJSON(js: VoteJSON): Vote;
    static fromObject(obj: VoteObject): Vote;
    toJSON(): VoteJSON;
    toObject(): VoteObject;
    choice: ResourceVoteChoice;
    poll: VotePoll;
    static readonly __struct: string;
    readonly __type: string;
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
     * Starting timestamp (milliseconds) to filter polls. Accepts the
     * `timestampMs` bigint of a returned entry, for paging.
     * @default undefined
     */
    startTimeMs?: number | bigint;

    /**
     * Include the `startTimeMs` boundary when true.
     * @default true
     */
    startTimeIncluded?: boolean;

    /**
     * Ending timestamp (milliseconds) to filter polls.
     * @default undefined
     */
    endTimeMs?: number | bigint;

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
| ({ $type: "instant" } & InstantAssetLockProofJSON)
| ({ $type: "chain" } & ChainAssetLockProofJSON);
```

<a id="type-assetlockproofobject"></a>
## `AssetLockProofObject`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type AssetLockProofObject =
| ({ $type: "instant" } & InstantAssetLockProofObject)
| ({ $type: "chain" } & ChainAssetLockProofObject);
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
    /**
     * Contract moderation (protocol version 14): the banlist, suspension list and/or warning
     * list the contract keeps and who may edit them. Absent for an unmoderated contract.
     */
    moderation?: ContractModerationConfig;
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

<a id="type-documentpropertyconstraint"></a>
## `DocumentPropertyConstraint`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type DocumentPropertyConstraint = {
    /** The rule's name, its key in `propertyConstraints`. Rules are checked in name order. */
    name: string;
    /** The rule as the schema declares it. */
    rule: PropertyConstraintCondition;
    /**
     * Every property of the document type the rule reads, in declared order,
     * one of the stored version under its `$old.` path; `$ownerId` and
     * `$old.$ownerId` are no properties and are not listed, and neither is a
     * value of a referenced document (`readsReferenced`).
     */
    reads: Array<{ path: string; kind: PropertyConstraintReadKind }>;
    /**
     * Whether the rule reads `$ownerId` or `$old.$ownerId`, or a total that
     * depends on the owner: then a transfer or a purchase is judged against it
     * too.
     */
    readsOwner: boolean;
    /**
     * The system values the rule reads, in declared order, of either version. A
     * price update is judged against a rule reading the update's, a transfer or
     * a purchase against one reading the transfer's, and each against one
     * reading `$revision`.
     */
    readsSystem: PropertyConstraintSystemProperty[];
    /**
     * Whether the rule reads the stored version of the document through
     * `$old.`. `checkDocumentPropertyConstraints` judges it only when told what
     * the stored version is: none for a create, or the stored document.
     */
    readsStored: boolean;
    /**
     * The `countOf` and `sumOf` totals the rule reads, in declared order, one
     * read twice listed twice. The pre-check does not judge a rule reading one.
     */
    readsTotals: PropertyConstraintTotalRead[];
    /**
     * The values the rule reads of the documents the type's references point
     * at, in declared order, one read twice listed twice. The pre-check does not
     * judge a rule reading one.
     */
    readsReferenced: PropertyConstraintReferencedRead[];
};
```

<a id="type-documentpropertyconstraintviolation"></a>
## `DocumentPropertyConstraintViolation`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type DocumentPropertyConstraintViolation = {
    /** The broken rule's name. */
    rule: string;
    violation: PropertyConstraintViolationKind;
    /** A readable reason, as in the consensus error's message. */
    message: string;
};
```

<a id="type-documentpropertydistinctfrom"></a>
## `DocumentPropertyDistinctFrom`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type DocumentPropertyDistinctFrom = {
    /**
     * Dotted path of the declaring property within the document type, for
     * example `"delegateId"`, or `"meta.reviewerId"` for a nested one. An
     * identifier property, or a typed array of identifiers whose `items`
     * carry the declaration, in which case every element is bound. This is the same string consensus reports in the `property` field
     * of `DocumentPropertyNotDistinctError` (code 10419).
     */
    path: string;
    /**
     * What the property's value must differ from: `"$ownerId"` for the
     * document's owner, or the dotted path of another identifier property of
     * the same document type. Consensus refuses a create or replace whose two
     * values are equal; when the named property is absent from the document
     * there is nothing to differ from, so the write passes.
     */
    distinctFrom: string;
};
```

<a id="type-documentpropertyencryption"></a>
## `DocumentPropertyEncryption`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type DocumentPropertyEncryption = {
    /**
     * Dotted path of the declaring byte array property within the document
     * type, for example `"encryptedMessage"`, or `"meta.blob"` for a nested
     * one. This is the string consensus reports in the `property` field of
     * the shape error (code 10420).
     */
    path: string;
    /**
     * Whose keys decrypt the bytes: the dotted path of an identifier property
     * of the same document type whose value is the recipient identity's id,
     * or `"$ownerId"` for a message the writer encrypts to themself.
     */
    recipient: string;
    /**
     * Dotted path of the integer property of the same document type carrying
     * the id of the recipient's key.
     */
    recipientKey: string;
    /**
     * Dotted path of the integer property of the same document type carrying
     * the id of the sender's key.
     */
    senderKey: string;
    /** How the bytes were produced. */
    scheme: EncryptionScheme;
};
```

<a id="type-documentpropertyreference"></a>
## `DocumentPropertyReference`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type DocumentPropertyReference = {
    /**
     * Dotted path of the declaring property within the document type — for
     * example `"author"`, or `"meta.parentId"` for a nested one. A
     * declaration on the `items` of a typed array of identifiers, which every
     * element carries, is listed with the list path of its elements, for
     * example `"reasons[]"`; its `type` is never `identityPublicKey`, which
     * an element cannot declare.
     *
     * The document type's `ownerRefersTo` declaration, whose value is the
     * document's `$ownerId`, the writer, is listed first with the path
     * `"$ownerId"`, which is not a property path: the value it checks is the
     * document's owner. Consensus checks it with the writer's id when a
     * document is created, and when a replace changes a property its `findBy`
     * or `where` reads (every replace for a `deletableDocument` found by
     * `findBy`, which gates the writer on its document still existing); in its
     * `findBy`, `'.'` is the writer. Its `type` is `identity`, a
     * `permanentDocument` or `deletableDocument` with `findBy`, or a
     * `permanentDocument` with `inList`, the targets a writer can be, on a document type whose
     * documents can be neither transferred nor traded. On a type whose documents can, a
     * `creatorRefersTo` declaration takes its place, listed first with the
     * path `"$creatorId"`: the same, with the document's creator, who never
     * changes, as the value, and a `deletableDocument` only with a `findBy`
     * function (see {@link DocumentReferenceFindByFunction}).
     *
     * This is the same string consensus reports in the `path` field of the
     * document-write reference errors (codes 40120-40125, 40131, 40135,
     * 40136, 40142 and 40149), except that a write error names the failing element by its
     * index (`"reasons[2]"` for
     * the third). Note that contract *registration* errors prefix it with the
     * document type name (`"<documentType>.<path>"`, `"<documentType>.reasons[]"`)
     * and name one leaf of a reference expression by where it sits
     * (`"<documentType>.<path>.anyOf[1].allOf[0]"`), while document *write*
     * errors do neither.
     */
    path: string;
} & DocumentPropertyReferenceTarget;
```

<a id="type-documenttypeimmutableproperties"></a>
## `DocumentTypeImmutableProperties`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type DocumentTypeImmutableProperties = {
    /**
     * Top-level properties frozen at document creation. A replace that
     * changes, adds or removes any of them is rejected with consensus code
     * 40128 (`DocumentImmutabilityErrorCode.DocumentImmutablePropertyChanged`).
     */
    immutable: string[];
    /**
     * Top-level properties frozen for any replace their condition holds for,
     * each with the condition as the contract declares it (the grammar of a
     * `propertyConstraints` rule). It is judged on the document the replace
     * writes, whose `$updatedAt` is the replace's block time, and reads the
     * stored document through `$old.` paths: `{ present: "$old.mood" }` lets an
     * absent `mood` be set once. A replace changing one while its condition
     * holds is rejected with code 40128 as well. No key is also in `immutable`.
     */
    immutableWhen: Record<string, unknown>;
};
```

<a id="type-documenttypedarrayproperty"></a>
## `DocumentTypedArrayProperty`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type DocumentTypedArrayProperty = {
    /**
     * Dotted path of the property within the document type, for example
     * `"reasons"`, or `"team.members"` for one nested in an object.
     */
    path: string;
    /** What every element is. */
    items: DocumentTypedArrayItem;
    /** The fewest elements a document may hold; absent when not declared. */
    minItems?: number;
    /** The most elements a document may hold; every typed array declares it. */
    maxItems: number;
    /** Whether a document repeating an element is refused. */
    uniqueItems: boolean;
};
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
    /**
     * The token configuration format version: 0 for a transferable token without a shielded
     * pool, 1 for one with a pool or a non-transferable token.
     */
    readonly formatVersion: number;
    freezeRules: ChangeControlRules;
    /**
     * Whether the token has its own shielded pool (format version 1 configurations only).
     */
    hasShieldedPool: boolean;
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
    /**
     * The fewest notes the shielded pool must hold before tokens may leave it. 0 means no
     * threshold, which is also what every token without a pool reports.
     */
    get minimumPoolNotesForOutgoing(): bigint;
    /**
     * `undefined` or `null` removes the threshold. Throws for a token that has no shielded
     * pool, which has no threshold to hold.
     */
    set minimumPoolNotesForOutgoing(value: any);
    /**
     * Whether holders may move the token to another identity. Always true for format
     * version 0 configurations.
     */
    transferable: boolean;
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
    /** When a moderator last wrote the fields the document type keeps for its moderators */
    $moderatedAt?: string;
    /** The moderator who last wrote them */
    $moderatedBy?: string;
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
    /** When a moderator last wrote the fields the document type keeps for its moderators */
    $moderatedAt?: bigint;
    /** The moderator who last wrote them */
    $moderatedBy?: Identifier;
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
    /**
     * Document ID. Derived when not provided (see `identityContractNonce`).
     * Together with `identityContractNonce` it must equal the derived id, or
     * the constructor throws: the nonce fixes the id, and a different explicit
     * one could only be referenced, never created. Whatever is given here is
     * replaced by `new DocumentCreateTransition(...)`, which can only carry the
     * id consensus recomputes.
     */
    id?: IdentifierLike;
    /** Entropy bytes (32 bytes, auto-generated if not provided) */
    entropy?: Uint8Array;
    /**
     * Identity contract nonce the create transition of this document is going
     * to use. From protocol version 14 the id of a new document commits to
     * that nonce, so without it the derived `id` is a placeholder that
     * `new DocumentCreateTransition(...)` replaces (and mirrors back onto this
     * document). Pass the nonce here, or call `setIdForCreation`, to have the
     * final id from the start.
     */
    identityContractNonce?: bigint;
    /** Platform version the id is derived for (default: latest) */
    platformVersion?: PlatformVersionLike;
}
```

<a id="type-agreedfeemultiplieroptions"></a>
## `AgreedFeeMultiplierOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface AgreedFeeMultiplierOptions {
    knownPermille: bigint;
    increaseTolerancePercent: number;
}
```

<a id="type-documentactionfeeaction"></a>
## `DocumentActionFeeAction`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type DocumentActionFeeAction =
| 'create'
| 'replace'
| 'delete'
| 'transfer'
| 'purchase'
| 'updatePrice'
| BatchType;
```

<a id="type-documentactionfeeagreementjson"></a>
## `DocumentActionFeeAgreementJSON`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface DocumentActionFeeAgreementJSON {
    $formatVersion: string;
    owner: number | string;
    moderators: number | string;
    feeMultiplier: AgreedFeeMultiplierJSON | null;
}
```

<a id="type-documentactionfeeagreementobject"></a>
## `DocumentActionFeeAgreementObject`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface DocumentActionFeeAgreementObject {
    $formatVersion: string;
    owner: bigint;
    moderators: bigint;
    feeMultiplier: AgreedFeeMultiplierObject | null;
}
```

<a id="type-documentactionfeeagreementoptions"></a>
## `DocumentActionFeeAgreementOptions`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface DocumentActionFeeAgreementOptions {
    owner?: bigint;
    moderators?: bigint;
    feeMultiplier?: AgreedFeeMultiplierOptions;
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
| 'StartsWith'
| 'contains'
| 'Contains'
| 'containsAny'
| 'ContainsAny';
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
    $formatVersion: "0";
    contract_id: string;
    proposer_id: string;
    token_contract_position: number;
    event: GroupActionEventJSON;
}
```

<a id="type-groupactionobject"></a>
## `GroupActionObject`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface GroupActionObject {
    $formatVersion: "0";
    contract_id: Uint8Array;
    proposer_id: Uint8Array;
    token_contract_position: number;
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
    /**
     * Bounds to every member of a contract group. Only authentication keys may carry them.
     */
    static ContractGroup(contractGroupId: IdentifierLike): ContractBounds;
    static SingleContract(contractId: IdentifierLike): ContractBounds;
    static SingleContractDocumentType(contractId: IdentifierLike, documentTypeName: string): ContractBounds;
    constructor(contractId: IdentifierLike, documentTypeName?: string | null);
    static fromJSON(js: ContractBoundsJSON): ContractBounds;
    static fromObject(obj: ContractBoundsObject): ContractBounds;
    toJSON(): ContractBoundsJSON;
    toObject(): ContractBoundsObject;
    readonly contractBoundsType: string;
    readonly contractBoundsTypeNumber: number;
    /**
     * The contract group id, for `contractGroup` bounds only.
     */
    readonly contractGroupId: Identifier | undefined;
    get documentTypeName(): string | undefined;
    set documentTypeName(value: string);
    /**
     * The contract id, or the contract group id for `contractGroup` bounds.
     */
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
    totalBudget?: number | string;
    expiresAt?: number | string;
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
    totalBudget?: bigint;
    expiresAt?: bigint;
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
    /** Credits the key may spend over its lifetime (protocol version 14); makes it a version 1 key */
    totalBudget?: bigint;
    /** Block time in milliseconds from which the key can no longer sign; makes it a version 1 key */
    expiresAt?: bigint;
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
    $formatVersion: string;
    keyId: number;
    purpose: string;
    securityLevel: string;
    keyType: string;
    isReadOnly: boolean;
    data: string;
    signature?: string;
    contractBounds?: ContractBoundsJSON;
    totalBudget?: number | string;
    expiresAt?: number | string;
}
```

<a id="type-identitypublickeyincreationobject"></a>
## `IdentityPublicKeyInCreationObject`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface IdentityPublicKeyInCreationObject {
    $formatVersion: string;
    keyId: number;
    purpose: Purpose;
    securityLevel: SecurityLevel;
    keyType: KeyType;
    isReadOnly: boolean;
    data: Uint8Array;
    signature?: Uint8Array;
    contractBounds?: ContractBoundsObject;
    totalBudget?: bigint;
    expiresAt?: bigint;
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
    totalBudget?: bigint;
    expiresAt?: bigint;
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
| "bidirectionalReference"
| "itemWithBackwardsReferences"
| "sumItemWithBackwardsReferences"
| "itemWithSumItemWithBackwardsReferences"
| "provableCountSumTree"
| "provableCountProvableSumTree"
| "provableSumTree"
| "provableSumIndexedTree"
| "provableCountIndexedTree"
| "provableCountProvableSumIndexedTree"
| "commitmentTree"
| "mmrTree"
| "bulkAppendTree"
| "denseAppendOnlyFixedSizeTree"
| "privateDocumentStore"
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
| "nonCountedProvableSumIndexedTree"
| "nonCountedProvableCountIndexedTree"
| "nonCountedProvableCountProvableSumIndexedTree"
| "nonCountedCommitmentTree"
| "nonCountedMmrTree"
| "nonCountedBulkAppendTree"
| "nonCountedDenseAppendOnlyFixedSizeTree"
| "nonCountedPrivateDocumentStore"
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
| { $type: "towardsIdentity"; identity: string }
| { $type: "abstain" }
| { $type: "lock" };
```

<a id="type-resourcevotechoiceobject"></a>
## `ResourceVoteChoiceObject`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type ResourceVoteChoiceObject =
| { $type: "towardsIdentity"; identity: Uint8Array }
| { $type: "abstain" }
| { $type: "lock" };
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
    $formatVersion: "0";
    contractId: string;
    tokenContractPosition: number;
}
```

<a id="type-tokencontractinfoobject"></a>
## `TokenContractInfoObject`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface TokenContractInfoObject {
    $formatVersion: "0";
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
    static fromJSON(js: any): TokenPricingSchedule;
    static fromObject(obj: any): TokenPricingSchedule;
    toJSON(): any;
    toObject(): any;
    readonly scheduleType: string;
    static readonly __struct: string;
    readonly __type: string;
    readonly value: bigint | Record<string, bigint>;
}
```

<a id="type-votejson"></a>
## `VoteJSON`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface VoteJSON {
    $type: "resourceVote";
    $formatVersion: string;
    votePoll: VotePollJSON;
    resourceVoteChoice: ResourceVoteChoiceJSON;
}
```

<a id="type-voteobject"></a>
## `VoteObject`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface VoteObject {
    $type: "resourceVote";
    $formatVersion: string;
    votePoll: VotePollObject;
    resourceVoteChoice: ResourceVoteChoiceObject;
}
```

<a id="type-votepolljson"></a>
## `VotePollJSON`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface VotePollJSON {
    $type: "contestedDocumentResourceVotePoll";
    contractId: string;
    documentTypeName: string;
    indexName: string;
    indexValues: any[];
}
```

<a id="type-votepollobject"></a>
## `VotePollObject`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface VotePollObject {
    $type: "contestedDocumentResourceVotePoll";
    contractId: Uint8Array;
    documentTypeName: string;
    indexName: string;
    indexValues: any[];
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

<a id="type-contractmoderationconfig"></a>
## `ContractModerationConfig`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface ContractModerationConfig {
    banlist: boolean;
    suspensions: boolean;
    /** The contract keeps a warning list: warnings bar nothing and accumulate until cleared. */
    warnings: boolean;
    moderators: ContractModerators;
}
```

<a id="type-propertyconstraintcondition"></a>
## `PropertyConstraintCondition`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type PropertyConstraintCondition =
| { equal: [PropertyConstraintExpression, PropertyConstraintExpression] | [PropertyConstraintEqualityOperand, PropertyConstraintEqualityOperand] }
| { notEqual: [PropertyConstraintExpression, PropertyConstraintExpression] | [PropertyConstraintEqualityOperand, PropertyConstraintEqualityOperand] }
| { lessThan: [PropertyConstraintExpression, PropertyConstraintExpression] }
| { lessThanOrEqual: [PropertyConstraintExpression, PropertyConstraintExpression] }
| { greaterThan: [PropertyConstraintExpression, PropertyConstraintExpression] }
| { greaterThanOrEqual: [PropertyConstraintExpression, PropertyConstraintExpression] }
| { in: [PropertyConstraintExpression, Array<number | bigint>] | [PropertyConstraintPath | { ifAbsent: [path: PropertyConstraintPath, value: string] }, string[]] }
| { notIn: [PropertyConstraintExpression, Array<number | bigint>] | [PropertyConstraintPath | { ifAbsent: [path: PropertyConstraintPath, value: string] }, string[]] }
| { startsWith: [PropertyConstraintEqualityOperand, PropertyConstraintEqualityOperand] }
| { endsWith: [PropertyConstraintEqualityOperand, PropertyConstraintEqualityOperand] }
| { contains: [path: PropertyConstraintPath, PropertyConstraintExpression | PropertyConstraintEqualityOperand] }
| { present: PropertyConstraintPath }
| { absent: PropertyConstraintPath }
| { anyOf: PropertyConstraintCondition[] }
| { allOf: PropertyConstraintCondition[] }
| { not: PropertyConstraintCondition }
| { ifThen: [PropertyConstraintCondition, PropertyConstraintCondition] }
| { ifThenElse: [PropertyConstraintCondition, PropertyConstraintCondition, PropertyConstraintCondition] };
```

<a id="type-propertyconstraintreadkind"></a>
## `PropertyConstraintReadKind`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type PropertyConstraintReadKind =
| 'value'
| 'presence'
| 'text'
| 'identifier'
| 'length'
| 'count'
| 'elements'
| 'bytes';
```

<a id="type-propertyconstraintreferencedread"></a>
## `PropertyConstraintReferencedRead`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type PropertyConstraintReferencedRead = {
    reference: string;
    path: string;
    kind: PropertyConstraintReadKind;
};
```

<a id="type-propertyconstraintsystemproperty"></a>
## `PropertyConstraintSystemProperty`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type PropertyConstraintSystemProperty =
| PropertyConstraintSystemValue
| `$old.${PropertyConstraintSystemValue}`;
```

<a id="type-propertyconstrainttotalread"></a>
## `PropertyConstraintTotalRead`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type PropertyConstraintTotalRead = {
    kind: 'countOf' | 'sumOf';
    documentType: string;
    property?: string;
    filter: string[];
};
```

<a id="type-propertyconstraintviolationkind"></a>
## `PropertyConstraintViolationKind`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type PropertyConstraintViolationKind =
| 'NotMet'
| 'Overflow'
| 'DivisionByZero'
| 'NegativeExponent'
| 'NotAnInteger';
```

<a id="type-encryptionscheme"></a>
## `EncryptionScheme`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type EncryptionScheme = 'ecdh-secp256k1-aes256-cbc';
```

<a id="type-documentpropertyreferencetarget"></a>
## `DocumentPropertyReferenceTarget`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type DocumentPropertyReferenceTarget =
| { type: 'identity' }
| {
    type: 'contract';
    /**
     * What the referenced contract must declare beyond existing, checked
     * by consensus when the referring document is written against the
     * contract fetched for the existence check and the block time:
     * `moderation: 'elected'` requires an elected moderation team and
     * `'electionOpen'` one whose own `electionDelay` has passed since the
     * contract's creation (or which declares none),
     * `minimumAgeSeconds` requires the contract's recorded creation time
     * to be at least that many seconds before the block time of the write,
     * and `minimumSecondsSinceUpdate` the same of the later of its creation
     * and last update times, and `owner: 'self'` requires the contract to
     * be owned by the writer of the referring document (its `$ownerId`),
     * `'other'` by anyone else; `readonly: true` requires a read-only
     * contract (one that can never be updated again), `keepsHistory: true`
     * one keeping its history, and `ownerProtected` an elected moderation
     * declaration whose owner protection flag has that value (code 40135
     * when any is unmet). Absent when the declaration carries no
     * requirement.
     */
    contractRequirements?: {
        moderation?: 'elected' | 'electionOpen';
        minimumAgeSeconds?: number;
        minimumSecondsSinceUpdate?: number;
        owner?: 'self' | 'other';
        readonly?: true;
        keepsHistory?: true;
        ownerProtected?: boolean;
    };
}
| { type: 'token' }
| {
    type: 'permanentDocument';
    /**
     * The contract the referenced document type lives in.
     *
     * Always present. When the schema omits `contractId` the declaration
     * targets the declaring contract itself, and this field reports the
     * declaring contract's own id — consensus resolves the two cases
     * identically, so a caller never has to special-case an absent value.
     * `ref.contractId.equals(contract.id)` is the self-reference test.
     */
    contractId: Identifier;
    /**
     * Name of the referenced document type. It must declare
     * `canBeDeleted: false`, which is what makes the reference
     * permanent — a target that could be deleted would leave the
     * reference dangling.
     */
    documentType: string;
    /**
     * How the referenced document is found when the property's value is
     * not its id. See {@link DocumentReferenceFindBy}. Absent when the
     * value is the referenced document's `$id`.
     */
    findBy?: DocumentReferenceFindBy;
    /**
     * What the referenced document must hold once found. See
     * {@link DocumentReferenceWhere}. Absent — not `{}`-valued — when the
     * declaration compares nothing.
     */
    where?: DocumentReferenceWhere;
    /**
     * Beside `findBy`: what the document `findBy` finds must meet when the
     * referring document is created. See {@link DocumentReferenceConstraints}.
     */
    constraints?: DocumentReferenceConstraints;
    /**
     * A list the value must be in: the value (on a typed array, every
     * element) must be one of the identifiers the typed array `inList`
     * holds, a dotted path on `documentType`, on the document `findBy`
     * names by `{ $id: <property> }`, the identifier property holding its
     * id. Consensus fetches that document, checks `where` against it, and
     * refuses a value its list does not hold, or one set while that
     * property is not (code 40120). The list's document can never be
     * deleted and the list never changes, so a value accepted once stays an
     * element. To resolve it yourself, fetch the document by that id and
     * look in `inList`.
     */
    inList?: string;
}
| {
    type: 'identityPublicKey';
    /**
     * Property of the same document type whose value carries the
     * referenced key id. The declaring property's own value carries the
     * identity id. A dotted path when the property is nested.
     */
    keyIdProperty: string;
    identityProperty?: never;
    /**
     * What the referenced key must be beyond existing and not being
     * disabled, checked by consensus when the referring document is
     * written against the key fetched for the existence check:
     * `purpose` requires the key's purpose to be the named one, and
     * `boundTo` requires the key's contract bounds to be exactly the
     * declaring contract and the named document type of it; a
     * whole-contract or contract group bound never meets it (code 40136
     * when either is unmet). Absent when the declaration carries no
     * requirement.
     */
    keyRequirements?: IdentityKeyReferenceRequirements;
}
| {
    /**
     * The inverse form, declared on the key id property itself: the
     * declaring property (an integer from 0 to 4294967295) carries the
     * key id, and `identityProperty` names whose key it is: `'$ownerId'`,
     * the document's owner, `'$creatorId'`, its creator (only on a
     * document type that records creator ids), or the dotted path of an
     * identifier property of the same document type. Consensus fetches
     * only the key (codes 40123 when it does not exist, 40124 when it is
     * disabled; 40125 when a key id is set while the named property is
     * not), and checks `keyRequirements` against it exactly as for the
     * identifier form.
     */
    type: 'identityPublicKey';
    identityProperty: '$ownerId' | '$creatorId' | (string & {});
    keyIdProperty?: never;
    /**
     * What the referenced key must be beyond existing and not being
     * disabled, checked by consensus when the referring document is
     * written against the key fetched for the existence check:
     * `purpose` requires the key's purpose to be the named one, and
     * `boundTo` requires the key's contract bounds to be exactly the
     * declaring contract and the named document type of it; a
     * whole-contract or contract group bound never meets it (code 40136
     * when either is unmet). Absent when the declaration carries no
     * requirement.
     */
    keyRequirements?: IdentityKeyReferenceRequirements;
}
| {
    /**
     * A document of a type whose documents CAN be deleted (the
     * counterpart of `permanentDocument`, disjoint from it). The
     * referenced document must exist, and every `where` entry must
     * hold, when the referring document is written; it may be
     * deleted afterwards, so a reader must expect the reference to
     * resolve to nothing. Every replace of the referring document
     * re-validates it: a dead reference has to be repointed at an
     * existing document or cleared.
     */
    type: 'deletableDocument';
    /**
     * The contract the referenced document type lives in. Always
     * present, resolved exactly as for `permanentDocument`.
     */
    contractId: Identifier;
    /** Name of the referenced document type; it must allow deletion. */
    documentType: string;
    /**
     * How the referenced document is found when the property's value is
     * not its id. See {@link DocumentReferenceFindBy}. Absent when the
     * value is the referenced document's `$id`. With `findBy` the
     * reference means "a document with this key exists now": once the one
     * it found is deleted the key may find another, and every replace
     * re-validates it, unless a `findBy` function computes the key: that
     * commitment is judged when the document is created only.
     */
    findBy?: DocumentReferenceFindBy;
    /**
     * What the referenced document must hold once found, exactly as for
     * `permanentDocument`. Absent — not `{}`-valued — when the declaration
     * compares nothing.
     */
    where?: DocumentReferenceWhere;
    /**
     * Beside `findBy`: what the document `findBy` finds must meet when the
     * referring document is created. See {@link DocumentReferenceConstraints}.
     */
    constraints?: DocumentReferenceConstraints;
    /**
     * Beside `findBy`, on a reference judged on the create alone (a `findBy`
     * function, or a document type whose documents are never replaced): the create deletes the document
     * `findBy` finds, the writer's own commitment, in the same state
     * transition.
     */
    consume?: true;
}
| {
    /**
     * A document of a type whose documents leave state only when the
     * contract's moderators remove them, each removal leaving a removal
     * record under the contract (`canBeDeleted: false`, no `ttl`, and
     * `moderatorAbilities.delete` keeping records). Between
     * `permanentDocument` and `deletableDocument`, disjoint from both. The
     * referenced document must exist, and every `where` entry must hold,
     * when the referring document is written; afterwards the reference
     * resolves to the document or, once a moderator removed it, to its
     * removal record, which a restore can bring the document back from. A
     * replace keeps it, re-validating it only when the value or a property
     * `where` reads changes, as for `permanentDocument`; on every replace
     * for a `where` value `$ownerId`, a `notEqual` bounded by `$ownerId`,
     * an ordering bounded by `$updatedAt` or `$transferredAt` (or their
     * heights), and a reference a `propertyConstraints` rule reads through,
     * which checks its whole `where`.
     */
    type: 'moderatedDocument';
    /**
     * The contract the referenced document type lives in. Always
     * present, resolved exactly as for `permanentDocument`.
     */
    contractId: Identifier;
    /**
     * Name of the referenced document type; its documents must leave
     * state only through a moderator's recorded removal.
     */
    documentType: string;
    /**
     * What the referenced document must hold, exactly as for
     * `permanentDocument`. Absent — not `{}`-valued — when the declaration
     * compares nothing.
     */
    where?: DocumentReferenceWhere;
}
| DocumentPropertyReferenceExpression;
```

<a id="type-documenttypedarrayitem"></a>
## `DocumentTypedArrayItem`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type DocumentTypedArrayItem =
| { type: 'integer'; minimum?: number; maximum?: number; enum?: number[] }
| { type: 'number'; minimum?: number; maximum?: number; enum?: number[] }
| { type: 'boolean'; enum?: boolean[] }
| { type: 'string'; minLength?: number; maxLength?: number; enum?: string[] }
| { type: 'byteArray'; minItems?: number; maxItems?: number }
| {
    type: 'identifier';
    /**
     * The `refersTo` declaration every element carries, when the `items`
     * schema declares one: consensus checks each element as a single
     * reference when a document is created or replaced, and a write error
     * names the failing element by its list path (`"reasons[2]"`). Never
     * `identityPublicKey`; a reference expression, which each element must
     * meet on its own. The same declaration is listed by
     * `documentTypeReferences` at the path `"<path>[]"`.
     */
    refersTo?: DocumentPropertyReferenceTarget;
};
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
    /**
     * Give the token its own shielded pool (protocol version 14+). Produces a
     * format-version-1 token configuration; the flag cannot change after creation, and
     * freezeRules, unfreezeRules and destroyFrozenFundsRules must then authorize no one
     * (no action takers and no admins): shielded notes cannot be frozen or destroyed.
     */
    hasShieldedPool?: boolean;
    /**
     * The fewest notes the token's shielded pool must hold before tokens may leave it for a
     * visible destination: unshielding to an identity, burning from the pool, or paying a
     * document's token cost out of the pool. Transfers that stay inside the pool are never
     * held back. Requires hasShieldedPool.
     *
     * What is counted is note commitments, not depositors, and one bundle carries several of
     * them, so a single depositor can reach a threshold alone: it says how busy the pool
     * should be before anyone leaves it, and guarantees no anonymity set. Omitted, or
     * undefined, means no threshold, which is the default because any threshold above 0 keeps
     * a new pool's first depositors from leaving until enough notes accumulate. A contract
     * create refuses a threshold above the protocol's maximum of 250. The issuer changes it
     * afterwards with a TokenConfigUpdate, under its own change control rules.
     */
    minimumPoolNotesForOutgoing?: bigint;
    /**
     * Whether holders may move the token to another identity (protocol version 14+).
     * Defaults to true. false produces a format-version-1 token configuration and cannot
     * change after creation: every TokenTransfer is refused, a document type may charge the
     * token only by burning it (so only its own contract's document types can use it), and
     * the token cannot have a shielded pool. Minting, claims, direct purchases, burns and
     * freezes work as configured.
     */
    transferable?: boolean;
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
    get oncePerIdentityDistribution(): TokenOncePerIdentityDistribution | undefined;
    set oncePerIdentityDistribution(value: any);
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

<a id="type-batchtype"></a>
## `BatchType`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export enum BatchType {
    Create = 0,
    Replace = 1,
    Delete = 2,
    Transfer = 3,
    Purchase = 4,
    UpdatePrice = 5,
    IgnoreWhileBumpingRevision = 6,
    IndexOnlyDelete = 7,
}
```

<a id="type-agreedfeemultiplierjson"></a>
## `AgreedFeeMultiplierJSON`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface AgreedFeeMultiplierJSON {
    knownPermille: number | string;
    increaseTolerancePercent: number;
}
```

<a id="type-agreedfeemultiplierobject"></a>
## `AgreedFeeMultiplierObject`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface AgreedFeeMultiplierObject {
    knownPermille: bigint;
    increaseTolerancePercent: number;
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
export type GroupActionEventJSON = { $kind: "tokenEvent" } & TokenEventJSON;
```

<a id="type-groupactioneventobject"></a>
## `GroupActionEventObject`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type GroupActionEventObject = { $kind: "tokenEvent" } & TokenEventObject;
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
    $type: ContractBoundsType;
    id: string;
    documentTypeName?: string;
}
```

<a id="type-contractboundsobject"></a>
## `ContractBoundsObject`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface ContractBoundsObject {
    $type: ContractBoundsType;
    id: Uint8Array;
    documentTypeName?: string;
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
| { $type: "noWinner" }
| { $type: "locked" }
| { $type: "wonByIdentity"; identity: string };
```

<a id="type-contesteddocumentvotepollwinnerinfoobject"></a>
## `ContestedDocumentVotePollWinnerInfoObject`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type ContestedDocumentVotePollWinnerInfoObject =
| { $type: "noWinner" }
| { $type: "locked" }
| { $type: "wonByIdentity"; identity: Uint8Array };
```

<a id="type-contractmoderators"></a>
## `ContractModerators`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type ContractModerators =
| { $type: "contractOwner" }
| { $type: "appointedModerators"; identities: string[] }
| ({
    $type: "elected";
    joinWindow?: number;
    voteWindow?: number;
    /**
     * Seconds after the contract's creation before the first charter may be filed
     * against it, unbounded; the election may be called at once when left out. A
     * reference requiring `moderation: 'electionOpen'` reads it.
     */
    electionDelay?: number;
    /**
     * How many members a seated team's leader may add after the election, each one an
     * identity that asked to join the team's proposal; 0 when left out, at most 15.
     */
    maxAddedModerators?: number;
    /**
     * The moderated document types of the contract, each with the non-empty abilities a
     * charter may claim on it: `ban`, `suspend` and `warn` need the list the contract
     * keeps, `deleteDocuments` the type setting `moderatorAbilities.delete`,
     * `changeDocumentFields` the type listing `moderatorAbilities.changeFields`. The lists stay
     * contract-wide. A charter does not price actions: a type's `actionFees.moderators`
     * amount is the most a team may charge.
     */
    moderatedDocumentTypes: Record<string, ModerationAbility[]>;
    interim: InterimModerators;
    /** Whether the owner is protected from the team; false when left out. */
    ownerProtected?: boolean;
} & ElectedModerationSeat);
```

<a id="type-propertyconstraintequalityoperand"></a>
## `PropertyConstraintEqualityOperand`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type PropertyConstraintEqualityOperand =
| string
| PropertyConstraintReferenced
| { const: string }
| { ifAbsent: [path: PropertyConstraintPath, value: string] };
```

<a id="type-propertyconstraintexpression"></a>
## `PropertyConstraintExpression`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type PropertyConstraintExpression =
| number
| bigint
| string
| PropertyConstraintReferenced
| { ifAbsent: [path: PropertyConstraintPath, value: number | bigint] }
| { add: PropertyConstraintExpression[] }
| { multiply: PropertyConstraintExpression[] }
| { subtract: [PropertyConstraintExpression, PropertyConstraintExpression] }
| { divide: [PropertyConstraintExpression, PropertyConstraintExpression] }
| { modulo: [PropertyConstraintExpression, PropertyConstraintExpression] }
| { power: [PropertyConstraintExpression, PropertyConstraintExpression] }
| { min: PropertyConstraintExpression[] }
| { max: PropertyConstraintExpression[] }
| { abs: PropertyConstraintExpression }
| { length: PropertyConstraintPath }
| { byteLength: PropertyConstraintPath }
| { count: PropertyConstraintPath }
| { countPresent: PropertyConstraintPath[] }
| { byteAt: [path: PropertyConstraintPath, index: number] }
| { countOf: [documentType: string] | [documentType: string, filter: PropertyConstraintAggregateFilter] }
| {
    sumOf:
    | [documentType: string, property: string]
    | [documentType: string, property: string, filter: PropertyConstraintAggregateFilter]
};
```

<a id="type-propertyconstraintpath"></a>
## `PropertyConstraintPath`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type PropertyConstraintPath = string | PropertyConstraintReferenced;
```

<a id="type-propertyconstraintsystemvalue"></a>
## `PropertyConstraintSystemValue`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type PropertyConstraintSystemValue =
| '$createdAt'
| '$updatedAt'
| '$transferredAt'
| '$createdAtBlockHeight'
| '$updatedAtBlockHeight'
| '$transferredAtBlockHeight'
| '$createdAtCoreBlockHeight'
| '$updatedAtCoreBlockHeight'
| '$transferredAtCoreBlockHeight'
| '$revision';
```

<a id="type-documentpropertyreferenceexpression"></a>
## `DocumentPropertyReferenceExpression`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type DocumentPropertyReferenceExpression =
| { type: 'anyOf'; anyOf: Array<DocumentPropertyReferenceOperand> }
| { type: 'allOf'; allOf: Array<DocumentPropertyReferenceOperand> };
```

<a id="type-documentreferenceconstraints"></a>
## `DocumentReferenceConstraints`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type DocumentReferenceConstraints = {
    minimumAgeBlocks?: number;
    chooseFirst?: DocumentReferenceChooseFirst;
};
```

<a id="type-documentreferencefindby"></a>
## `DocumentReferenceFindBy`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type DocumentReferenceFindBy = Record<string, string | DocumentReferenceFindByFunction>;
```

<a id="type-documentreferencewhere"></a>
## `DocumentReferenceWhere`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type DocumentReferenceWhere = Record<string, string | DocumentReferenceWhereCondition>;
```

<a id="type-identitykeyreferencerequirements"></a>
## `IdentityKeyReferenceRequirements`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type IdentityKeyReferenceRequirements = {
    purpose?: 'authentication' | 'encryption' | 'decryption' | 'transfer' | 'voting' | 'owner';
    boundTo?: string;
};
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
    static fromJSON(js: TokenConfigurationLocalizationJSON): TokenConfigurationLocalization;
    static fromObject(obj: TokenConfigurationLocalizationObject): TokenConfigurationLocalization;
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
    /**
     * A fixed amount every identity may claim exactly once. Setting it makes the rules
     * serialize as format version 1, which needs protocol version 14.
     */
    oncePerIdentityDistribution?: TokenOncePerIdentityDistribution;
}
```

<a id="type-tokenonceperidentitydistribution"></a>
## `TokenOncePerIdentityDistribution`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export class TokenOncePerIdentityDistribution {
    free(): void;
    [Symbol.dispose](): void;
    constructor(amount: any);
    get amount(): bigint;
    set amount(value: any);
    static readonly __struct: string;
    readonly __type: string;
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
    $type: string;
    [field: string]: unknown;
}
```

<a id="type-tokeneventobject"></a>
## `TokenEventObject`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export interface TokenEventObject {
    $type: string;
    [field: string]: unknown;
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
    Shield = 11,
    Unshield = 12,
    ShieldedTransfer = 13,
    MintToPool = 14,
    BurnFromPool = 15,
    ClaimToPool = 16,
    DirectPurchaseToPool = 17,
}
```

<a id="type-contractboundstype"></a>
## `ContractBoundsType`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type ContractBoundsType = "singleContract" | "documentType" | "contractGroup";
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

<a id="type-electedmoderationseat"></a>
## `ElectedModerationSeat`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type ElectedModerationSeat =
| { seatContestable: true; challengeCoolDown: number }
| { seatContestable: false; challengeCoolDown?: never };
```

<a id="type-interimmoderators"></a>
## `InterimModerators`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type InterimModerators =
| { $type: "contractOwner" }
| { $type: "appointedModerators"; identities: string[] }
| { $type: "notYetUsable" }
| { $type: "noModeration" };
```

<a id="type-moderationability"></a>
## `ModerationAbility`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type ModerationAbility = "deleteDocuments" | "ban" | "suspend" | "warn" | "changeDocumentFields";
```

<a id="type-propertyconstraintreferenced"></a>
## `PropertyConstraintReferenced`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type PropertyConstraintReferenced = {
    referenced: [reference: string, field: string];
};
```

<a id="type-propertyconstraintaggregatefilter"></a>
## `PropertyConstraintAggregateFilter`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type PropertyConstraintAggregateFilter = Record<
string,
string | number | bigint | { const: string }
>;
```

<a id="type-documentpropertyreferenceoperand"></a>
## `DocumentPropertyReferenceOperand`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type DocumentPropertyReferenceOperand =
| Extract<
DocumentPropertyReferenceTarget,
{ type: 'identity' | 'permanentDocument' | 'deletableDocument' }
>
| DocumentPropertyReferenceExpression;
```

<a id="type-documentreferencechoosefirst"></a>
## `DocumentReferenceChooseFirst`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type DocumentReferenceChooseFirst = {
    among: string;
    validWhen: Record<string, DocumentReferenceFindByFunction>;
    by: Array<Record<string, 'asc' | 'desc'>>;
};
```

<a id="type-documentreferencefindbyfunction"></a>
## `DocumentReferenceFindByFunction`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type DocumentReferenceFindByFunction = {
    function: 'sys.hash.sha256d';
    params: Array<string | { const: string }>;
};
```

<a id="type-documentreferencewherecondition"></a>
## `DocumentReferenceWhereCondition`

Source declaration: `wasm-sdk/dist/raw/wasm_sdk.d.ts`

```typescript
export type DocumentReferenceWhereCondition =
| { const: string | number | bigint | boolean }
| { notEqual: string | { const: string | number | bigint | boolean } }
| { in: Array<string | number | bigint | boolean> }
| { greaterThan: string | { const: number | bigint } }
| { greaterThanOrEqual: string | { const: number | bigint } }
| { lessThan: string | { const: number | bigint } }
| { lessThanOrEqual: string | { const: number | bigint } }
| { contains: string }
| { containsAll: string };
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
