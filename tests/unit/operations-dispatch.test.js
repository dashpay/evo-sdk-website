import { describe, it, expect, vi, beforeAll } from 'vitest';

// Focused dispatch coverage for the callEvo() query switch: these operations
// convert form inputs (hex strings, bigint text, JSON clauses) before calling
// the SDK, and that conversion is otherwise only exercised by network-bound
// E2E tests.

// operations.js transitively imports state.js, which touches `document` at
// import time; stub a minimal shim before dynamically importing (same
// approach as dynamic-handlers.test.js).
let callEvo;

beforeAll(async () => {
  vi.stubGlobal('document', {
    getElementById: () => null,
    querySelectorAll: () => [],
  });
  ({ callEvo } = await import('../../public/src/operations.js'));
});

const HEX_A = 'a3f1c2d4e5b60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90';

function makeClient() {
  return {
    documents: {
      count: vi.fn().mockResolvedValue('count'),
      countWithProof: vi.fn().mockResolvedValue('countProof'),
      sum: vi.fn().mockResolvedValue('sum'),
      sumWithProof: vi.fn().mockResolvedValue('sumProof'),
      average: vi.fn().mockResolvedValue('average'),
      averageWithProof: vi.fn().mockResolvedValue('averageProof'),
      history: vi.fn().mockResolvedValue('history'),
      historyWithProof: vi.fn().mockResolvedValue('historyProof'),
    },
    tokens: {
      identityBalances: vi.fn().mockResolvedValue('balances'),
      identityBalancesWithProof: vi.fn().mockResolvedValue('balancesProof'),
    },
    shielded: {
      poolState: vi.fn().mockResolvedValue(123n),
      poolStateWithProof: vi.fn().mockResolvedValue('poolProof'),
      encryptedNotes: vi.fn().mockResolvedValue([]),
      encryptedNotesWithProof: vi.fn().mockResolvedValue('notesProof'),
      anchors: vi.fn().mockResolvedValue([]),
      anchorsWithProof: vi.fn().mockResolvedValue([]),
      mostRecentAnchor: vi.fn().mockResolvedValue(undefined),
      mostRecentAnchorWithProof: vi.fn().mockResolvedValue(undefined),
      nullifiers: vi.fn().mockResolvedValue([]),
      nullifiersWithProof: vi.fn().mockResolvedValue([]),
    },
  };
}

function run(client, itemKey, values = {}, useProof = false) {
  return callEvo(client, 'queries', itemKey, [], [], useProof, values);
}

describe('document aggregate dispatch', () => {
  const baseInputs = {
    dataContractId: 'contract-id',
    documentTypeName: 'domain',
    where: '[["normalizedParentDomainName", "==", "dash"]]',
    orderBy: '[["normalizedLabel", "asc"]]',
    limit: 5,
  };
  const expectedPayload = {
    dataContractId: 'contract-id',
    documentTypeName: 'domain',
    where: [['normalizedParentDomainName', '==', 'dash']],
    orderBy: [['normalizedLabel', 'asc']],
    limit: 5,
    startAfter: undefined,
    startAt: undefined,
  };

  it('getDocumentCount builds the query payload and dispatches by proof mode', async () => {
    const c = makeClient();
    await run(c, 'getDocumentCount', baseInputs);
    expect(c.documents.count).toHaveBeenCalledWith(expectedPayload);
    await run(c, 'getDocumentCount', baseInputs, true);
    expect(c.documents.countWithProof).toHaveBeenCalledWith(expectedPayload);
  });

  it('includes groupBy only when values are provided', async () => {
    const c = makeClient();
    await run(c, 'getDocumentCount', { ...baseInputs, groupBy: ['normalizedParentDomainName'] });
    expect(c.documents.count).toHaveBeenCalledWith({
      ...expectedPayload,
      groupBy: ['normalizedParentDomainName'],
    });
    await run(c, 'getDocumentCount', { ...baseInputs, groupBy: [] });
    expect(c.documents.count).toHaveBeenLastCalledWith(expectedPayload);
  });

  it('getDocumentSum passes the property as a positional argument', async () => {
    const c = makeClient();
    await run(c, 'getDocumentSum', { ...baseInputs, sumProperty: 'amount' });
    expect(c.documents.sum).toHaveBeenCalledWith(expectedPayload, 'amount');
    await run(c, 'getDocumentSum', { ...baseInputs, sumProperty: 'amount' }, true);
    expect(c.documents.sumWithProof).toHaveBeenCalledWith(expectedPayload, 'amount');
  });

  it('getDocumentSum requires the property', async () => {
    await expect(run(makeClient(), 'getDocumentSum', baseInputs)).rejects.toThrow('Sum property is required');
  });

  it('getDocumentAverage passes the property as a positional argument', async () => {
    const c = makeClient();
    await run(c, 'getDocumentAverage', { ...baseInputs, averageProperty: 'amount' });
    expect(c.documents.average).toHaveBeenCalledWith(expectedPayload, 'amount');
    await run(c, 'getDocumentAverage', { ...baseInputs, averageProperty: 'amount' }, true);
    expect(c.documents.averageWithProof).toHaveBeenCalledWith(expectedPayload, 'amount');
  });

  it('getDocumentAverage requires the property', async () => {
    await expect(run(makeClient(), 'getDocumentAverage', baseInputs)).rejects.toThrow('Average property is required');
  });

  it('rejects invalid where JSON with a labeled error', async () => {
    await expect(run(makeClient(), 'getDocumentCount', { ...baseInputs, where: '{not json' }))
      .rejects.toThrow('Invalid JSON in Where');
  });

  it('getDocumentHistory builds its payload with optional fields omitted', async () => {
    const c = makeClient();
    await run(c, 'getDocumentHistory', {
      dataContractId: 'contract-id',
      documentTypeName: 'domain',
      documentId: 'doc-id',
    });
    expect(c.documents.history).toHaveBeenCalledWith({
      dataContractId: 'contract-id',
      documentTypeName: 'domain',
      documentId: 'doc-id',
      startAtMs: undefined,
      limit: undefined,
      offset: undefined,
    });
    await run(c, 'getDocumentHistory', {
      dataContractId: 'contract-id',
      documentTypeName: 'domain',
      documentId: 'doc-id',
      startAtMs: 1700000000000,
      limit: 3,
      offset: 1,
    }, true);
    expect(c.documents.historyWithProof).toHaveBeenCalledWith({
      dataContractId: 'contract-id',
      documentTypeName: 'domain',
      documentId: 'doc-id',
      startAtMs: 1700000000000,
      limit: 3,
      offset: 1,
    });
  });
});

describe('getTokenBalancesForIdentity dispatch', () => {
  it('passes identity id and filtered token ids in both proof modes', async () => {
    const c = makeClient();
    await run(c, 'getTokenBalancesForIdentity', { identityId: 'id-1', tokenIds: ['tok-1', '', null, 'tok-2'] });
    expect(c.tokens.identityBalances).toHaveBeenCalledWith('id-1', ['tok-1', 'tok-2']);
    await run(c, 'getTokenBalancesForIdentity', { identityId: 'id-1', tokenIds: ['tok-1'] }, true);
    expect(c.tokens.identityBalancesWithProof).toHaveBeenCalledWith('id-1', ['tok-1']);
  });
});

describe('shielded dispatch', () => {
  it('getShieldedPoolState dispatches by proof mode', async () => {
    const c = makeClient();
    await expect(run(c, 'getShieldedPoolState')).resolves.toBe(123n);
    await run(c, 'getShieldedPoolState', {}, true);
    expect(c.shielded.poolStateWithProof).toHaveBeenCalled();
  });

  it('getShieldedEncryptedNotes converts startIndex to a BigInt without precision loss', async () => {
    const c = makeClient();
    const huge = '18446744073709551615'; // exceeds Number.MAX_SAFE_INTEGER
    await run(c, 'getShieldedEncryptedNotes', { startIndex: huge, count: 10 });
    expect(c.shielded.encryptedNotes).toHaveBeenCalledWith(18446744073709551615n, 10);
  });

  it('getShieldedEncryptedNotes defaults a blank startIndex to 0n', async () => {
    const c = makeClient();
    await run(c, 'getShieldedEncryptedNotes', { startIndex: '', count: 5 });
    expect(c.shielded.encryptedNotes).toHaveBeenCalledWith(0n, 5);
    await run(c, 'getShieldedEncryptedNotes', { count: 5 }, true);
    expect(c.shielded.encryptedNotesWithProof).toHaveBeenCalledWith(0n, 5);
  });

  it('getShieldedEncryptedNotes rejects non-integer inputs', async () => {
    await expect(run(makeClient(), 'getShieldedEncryptedNotes', { startIndex: '-1', count: 5 }))
      .rejects.toThrow('Start index must be a non-negative integer');
    await expect(run(makeClient(), 'getShieldedEncryptedNotes', { startIndex: '1.5', count: 5 }))
      .rejects.toThrow('Start index must be a non-negative integer');
    await expect(run(makeClient(), 'getShieldedEncryptedNotes', { count: 0 }))
      .rejects.toThrow('Count must be a positive integer');
    await expect(run(makeClient(), 'getShieldedEncryptedNotes', { count: 2.5 }))
      .rejects.toThrow('Count must be a positive integer');
  });

  it('getShieldedNullifiers converts hex strings (with or without 0x) to 32-byte arrays', async () => {
    const c = makeClient();
    await run(c, 'getShieldedNullifiers', { nullifiers: [HEX_A, `0x${HEX_A}`] });
    const [nullifiers] = c.shielded.nullifiers.mock.calls[0];
    expect(nullifiers).toHaveLength(2);
    for (const bytes of nullifiers) {
      expect(bytes).toBeInstanceOf(Uint8Array);
      expect(bytes).toHaveLength(32);
      expect(bytes[0]).toBe(0xa3);
      expect(bytes[31]).toBe(0x90);
    }
    await run(c, 'getShieldedNullifiers', { nullifiers: [HEX_A] }, true);
    expect(c.shielded.nullifiersWithProof).toHaveBeenCalled();
  });

  it('getShieldedNullifiers rejects invalid input', async () => {
    await expect(run(makeClient(), 'getShieldedNullifiers', { nullifiers: ['zz'.repeat(32)] }))
      .rejects.toThrow('expected 64 hexadecimal characters');
    await expect(run(makeClient(), 'getShieldedNullifiers', { nullifiers: [HEX_A.slice(0, 62)] }))
      .rejects.toThrow('expected 64 hexadecimal characters');
    await expect(run(makeClient(), 'getShieldedNullifiers', { nullifiers: [] }))
      .rejects.toThrow('At least one nullifier is required');
  });

  it('getShieldedAnchors hex-encodes raw results', async () => {
    const c = makeClient();
    c.shielded.anchors.mockResolvedValue([
      new Uint8Array(32).fill(0xab),
      new Uint8Array(32).fill(0x01),
    ]);
    await expect(run(c, 'getShieldedAnchors')).resolves.toEqual([
      'ab'.repeat(32),
      '01'.repeat(32),
    ]);
  });

  it('getShieldedAnchors converts proof-wrapped data while preserving metadata and proof', async () => {
    const c = makeClient();
    const metadata = { height: 1 };
    const proof = { quorumHash: 'abc' };
    c.shielded.anchorsWithProof.mockResolvedValue({
      data: [new Uint8Array(32).fill(0xcd)],
      metadata,
      proof,
    });
    await expect(run(c, 'getShieldedAnchors', {}, true)).resolves.toEqual({
      data: ['cd'.repeat(32)],
      metadata,
      proof,
    });
  });

  it('getShieldedMostRecentAnchor hex-encodes a single anchor and passes undefined through', async () => {
    const c = makeClient();
    c.shielded.mostRecentAnchor.mockResolvedValue(new Uint8Array(32).fill(0x0f));
    await expect(run(c, 'getShieldedMostRecentAnchor')).resolves.toBe('0f'.repeat(32));

    c.shielded.mostRecentAnchor.mockResolvedValue(undefined);
    await expect(run(c, 'getShieldedMostRecentAnchor')).resolves.toBeUndefined();

    c.shielded.mostRecentAnchorWithProof.mockResolvedValue({ data: null, metadata: {}, proof: {} });
    await expect(run(c, 'getShieldedMostRecentAnchor', {}, true)).resolves.toEqual({
      data: null,
      metadata: {},
      proof: {},
    });
  });
});
