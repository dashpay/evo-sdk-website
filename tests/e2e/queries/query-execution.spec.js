const { test, expect } = require('@playwright/test');
const { EvoSdkPage } = require('../utils/sdk-page');
const { ParameterInjector } = require('../utils/parameter-injector');

/**
 * Helper function to execute a query with proof toggle enabled
 * @param {EvoSdkPage} evoSdkPage - The page object instance
 * @param {ParameterInjector} parameterInjector - The parameter injector instance
 * @param {string} category - Query category (e.g., 'identity', 'documents')
 * @param {string} queryName - Query name (e.g., 'getIdentity')
 * @param {string} network - Network to use ('testnet' or 'mainnet')
 * @returns {Promise<Object>} - The query result object
 */
async function executeQueryWithProof(
  evoSdkPage,
  parameterInjector,
  category,
  queryName,
  network = 'testnet',
  options = {}
) {
  const operationType = options.operationType || 'queries';
  const parameterCategory = options.parameterCategory || category;

  await evoSdkPage.setupQuery(category, queryName, {}, { operationType });

  // Enable proof info if available
  const proofEnabled = await evoSdkPage.enableProofInfo();

  // If proof was enabled, wait for the toggle to be actually checked
  if (proofEnabled) {
    const proofToggle = evoSdkPage.page.locator('#proofToggle');
    await expect(proofToggle).toBeChecked();
  }

  const success = await parameterInjector.injectParameters(parameterCategory, queryName, network);
  expect(success).toBe(true);

  const result = await evoSdkPage.executeQueryAndGetResult();

  return { result, proofEnabled };
}

/**
 * Helper function to parse balance/nonce responses that may contain large numbers
 * @param {string} resultStr - The raw result string from the query
 * @param {string} propertyName - The property name to extract (e.g., 'balance', 'nonce')
 * @returns {number} - The parsed number value
 */
function parseNumericResult(resultStr, propertyName = 'balance') {
  const trimmedStr = resultStr.trim();

  // Try to parse as JSON first (in case it's a JSON response)
  let numericValue;
  try {
    const parsed = JSON.parse(trimmedStr);

    // Check if it's a JSON object with the expected property
    if (typeof parsed === 'object' && parsed[propertyName] !== undefined) {
      numericValue = Number(parsed[propertyName]);
    } else if (typeof parsed === 'number') {
      numericValue = parsed;
    } else {
      numericValue = Number(parsed);
    }
  } catch {
    // If not JSON, try parsing directly as number
    numericValue = Number(trimmedStr);

    // If Number() fails, log the issue
    if (isNaN(numericValue)) {
      console.error(`Failed to parse ${propertyName}:`, trimmedStr, 'type:', typeof trimmedStr);
    }
  }

  return numericValue;
}

/**
 * Helper function to validate basic query result properties
 * @param {Object} result - The query result object
 */
function validateBasicQueryResult(result) {
  expect(result.success).toBe(true);
  expect(result.result).toBeDefined();
  expect(result.hasError).toBe(false);
  expect(result.result).not.toContain('Error executing query');
  expect(result.result).not.toContain('not found');
  expect(result.result).not.toContain('invalid');
}

/**
 * Helper function to validate basic query result properties for DPNS queries
 * (allows "not found" as valid response)
 * @param {Object} result - The query result object
 */
function validateBasicDpnsQueryResult(result) {
  expect(result.success).toBe(true);
  expect(result.result).toBeDefined();
  expect(result.hasError).toBe(false);
  expect(result.result).not.toContain('Error executing query');
  expect(result.result).not.toContain('invalid');
}

/**
 * Helper function to validate proof content contains expected fields
 * @param {Object} resultData - The parsed JSON result containing proof fields
 */
function validateProofContent(resultData) {
  expect(resultData).toBeDefined();
  expect(resultData).toHaveProperty('proof');
  expect(resultData.proof).toHaveProperty('grovedbProof');
  expect(resultData.proof).toHaveProperty('quorumHash');
  expect(resultData.proof).toHaveProperty('signature');
  expect(resultData.proof).toHaveProperty('round');
  expect(resultData.proof).toHaveProperty('blockIdHash');
  expect(resultData.proof).toHaveProperty('quorumType');
}

/**
 * Helper function to validate result with proof
 * @param {Object} result - The query result object
 * @param {Object} options - Validation options
 * @param {boolean} options.allowNullData - If true, allows data to be null/undefined (for queries that may return no data)
 */
function validateResultWithProof(result, options = {}) {
  const { allowNullData = false } = options;
  expect(result.success).toBe(true);
  expect(result.result).toBeDefined();

  // Parse the result as JSON to check the format
  const resultData = JSON.parse(result.result);
  if (!allowNullData) {
    expect(resultData).toHaveProperty('data');
  }
  expect(resultData).toHaveProperty('metadata');
  expect(resultData).toHaveProperty('proof');

  // Validate metadata structure
  expect(resultData.metadata).toHaveProperty('height');
  expect(resultData.metadata).toHaveProperty('coreChainLockedHeight');
  expect(resultData.metadata).toHaveProperty('timeMs');
  expect(resultData.metadata).toHaveProperty('protocolVersion');

  // Validate proof structure
  validateProofContent(resultData);
}

/**
 * Helper function to validate result without proof
 * @param {Object} result - The query result object
 */
function validateResultWithoutProof(result) {
  expect(result.success).toBe(true);
  expect(result.result).toBeDefined();

  // For queries without proof, try to parse as JSON, but handle plain strings too
  try {
    const resultData = JSON.parse(result.result);
    // If it's a JSON object, ensure no proof field exists
    if (typeof resultData === 'object' && resultData !== null && resultData.hasOwnProperty('data')) {
      expect(resultData).not.toHaveProperty('proof');
      expect(resultData).toHaveProperty('data');
    }
  } catch {
    // If it's not valid JSON (like a plain string), that's also valid for non-proof queries
    expect(typeof result.result).toBe('string');
  }
}

/**
 * Helper function to validate data contract result
 * DataContract now has toJSON() so we just validate it's valid JSON
 * @param {string} resultStr - The raw result string containing contract data
 */
function validateContractResult(resultStr) {
  const contractData = JSON.parse(resultStr);
  expect(contractData).toBeDefined();
  expect(typeof contractData).toBe('object');
  // Contract must have data - empty {} is not acceptable
  expect(Object.keys(contractData).length).toBeGreaterThan(0);
  // Check contract structure
  expect(contractData.id || contractData.$id).toBeDefined();
  expect(contractData).toHaveProperty('ownerId');
  expect(contractData).toHaveProperty('version');
  expect(contractData).toHaveProperty('documentSchemas');
  // Validate types
  expect(typeof (contractData.id || contractData.$id)).toBe('string');
  expect(typeof contractData.ownerId).toBe('string');
  expect(typeof contractData.version).toBe('number');
  expect(typeof contractData.documentSchemas).toBe('object');
}

/**
 * Helper function to validate document result
 * Document now has toJSON() so we just validate it's valid JSON
 * @param {string} resultStr - The raw result string containing document data
 */
function validateDocumentResult(resultStr) {
  expect(() => JSON.parse(resultStr)).not.toThrow();
  const documentData = JSON.parse(resultStr);
  expect(documentData).toBeDefined();
  // Documents can be arrays, single objects, or Map-like objects (keyed by document ID)
  // With toJSON() we just need to verify the structure is valid JSON
  if (Array.isArray(documentData)) {
    expect(documentData.length).toBeGreaterThanOrEqual(0);
  } else if (documentData && typeof documentData === 'object') {
    // Valid document object - toJSON handles serialization
    expect(typeof documentData).toBe('object');
  }
}

/**
 * Helper function to validate numeric results and ensure they're valid
 * @param {string} resultStr - The raw result string
 * @param {string} propertyName - The property name to extract
 * @returns {number|null} - The validated numeric value or null if not available
 */
function validateNumericResult(resultStr, propertyName = 'balance') {
  // First check if it's an empty object - SDK may return {} for non-existent data
  try {
    const parsed = JSON.parse(resultStr.trim());
    if (typeof parsed === 'object' && parsed !== null && Object.keys(parsed).length === 0) {
      // Empty object is valid - means no data found (e.g., identity has 0 balance or doesn't exist)
      return null;
    }
  } catch {
    // Continue to normal parsing
  }

  const numericValue = parseNumericResult(resultStr, propertyName);
  expect(numericValue).not.toBeNaN();
  expect(numericValue).toBeGreaterThanOrEqual(0);
  return numericValue;
}

/**
 * Specific validation functions for parameterized tests
 * Identity now has toJSON() so we just validate it's valid JSON with expected structure
 */
function validateIdentityResult(resultStr) {
  const identityData = JSON.parse(resultStr);
  expect(identityData).toBeDefined();
  expect(typeof identityData).toBe('object');
  // Identity must have data - empty {} is not acceptable
  expect(Object.keys(identityData).length).toBeGreaterThan(0);
  // Check identity structure
  expect(identityData.id || identityData.$id).toBeDefined();
  expect(identityData).toHaveProperty('publicKeys');
  expect(identityData).toHaveProperty('balance');
  expect(identityData).toHaveProperty('revision');
  // Validate public keys array
  expect(Array.isArray(identityData.publicKeys)).toBe(true);
  expect(identityData.publicKeys.length).toBeGreaterThan(0);
  // Validate balance is numeric
  expect(typeof identityData.balance).toBe('number');
  expect(identityData.balance).toBeGreaterThanOrEqual(0);
}

/**
 * Validation functions for DPNS queries
 */

function validateBooleanResult(resultStr) {
  expect(() => JSON.parse(resultStr)).not.toThrow();
  const booleanData = JSON.parse(resultStr);
  expect(booleanData).toBeDefined();
  expect(typeof booleanData).toBe('boolean');
}


function validateKeysResult(resultStr) {
  const keysData = JSON.parse(resultStr);
  expect(keysData).toBeDefined();
  // Keys should be an array
  expect(Array.isArray(keysData)).toBe(true);
  // If there are keys, check their structure
  if (keysData.length > 0) {
    const firstKey = keysData[0];
    // Key must have properties (not empty {})
    expect(Object.keys(firstKey).length).toBeGreaterThan(0);
    expect(firstKey).toHaveProperty('id');
    expect(firstKey).toHaveProperty('type');
    expect(firstKey).toHaveProperty('purpose');
    expect(firstKey).toHaveProperty('securityLevel');
    expect(firstKey).toHaveProperty('data');
    // Validate types
    expect(typeof firstKey.id).toBe('number');
    expect(typeof firstKey.type).toBe('number');
  }
}

function validateIdentitiesContractKeysResult(resultStr) {
  const contractKeysData = JSON.parse(resultStr);
  expect(contractKeysData).toBeDefined();
  // Result can be an array or object
  if (Array.isArray(contractKeysData)) {
    // Empty array is valid when no contract keys exist
    expect(contractKeysData).toBeDefined();
  } else {
    expect(typeof contractKeysData).toBe('object');
    // Check first identity's keys if any exist
    const keys = Object.keys(contractKeysData);
    if (keys.length > 0) {
      const firstIdentityKeys = Object.values(contractKeysData)[0];
      expect(Array.isArray(firstIdentityKeys)).toBe(true);
    }
  }
}

function validateIdentitiesResult(resultStr) {
  const identitiesData = JSON.parse(resultStr);
  expect(identitiesData).toBeDefined();
  // Should be an array or object of identities
  if (Array.isArray(identitiesData)) {
    expect(identitiesData.length).toBeGreaterThan(0);
    // Check first identity
    const firstIdentity = identitiesData[0];
    expect(firstIdentity.id || firstIdentity.$id).toBeDefined();
    expect(firstIdentity).toHaveProperty('publicKeys');
    expect(firstIdentity).toHaveProperty('balance');
  } else {
    expect(typeof identitiesData).toBe('object');
    expect(Object.keys(identitiesData).length).toBeGreaterThan(0);
  }
}

function validateBalancesResult(resultStr) {
  const balancesData = JSON.parse(resultStr);
  expect(balancesData).toBeDefined();
  expect(typeof balancesData).toBe('object');
  // Should have identity IDs as keys with balance values
  expect(Object.keys(balancesData).length).toBeGreaterThan(0);
  // Check first balance is a valid value (can be number or string for BigInt)
  const firstBalance = Object.values(balancesData)[0];
  expect(firstBalance !== null && firstBalance !== undefined).toBe(true);
  // Balance should be convertible to a number >= 0
  const numBalance = Number(firstBalance);
  expect(numBalance).toBeGreaterThanOrEqual(0);
}

function validateBalanceAndRevisionResult(resultStr) {
  const data = JSON.parse(resultStr);
  expect(data).toBeDefined();
  expect(typeof data).toBe('object');
  // Check required structure
  expect(data).toHaveProperty('balance');
  expect(data).toHaveProperty('revision');
  // Validate types
  expect(typeof data.balance).toBe('number');
  expect(data.balance).toBeGreaterThanOrEqual(0);
  expect(typeof data.revision).toBe('number');
  expect(data.revision).toBeGreaterThanOrEqual(0);
}

function validateTokenBalanceResult(resultStr) {
  const tokenData = JSON.parse(resultStr);
  expect(tokenData).toBeDefined();
  expect(typeof tokenData).toBe('object');
  // Token balances should have token IDs as keys with balance values
  if (Object.keys(tokenData).length > 0) {
    const firstBalance = Object.values(tokenData)[0];
    // Balance can be a number or BigInt string
    expect(firstBalance !== null && firstBalance !== undefined).toBe(true);
  }
}

function validateTokenInfoResult(resultStr) {
  const tokenInfoData = JSON.parse(resultStr);
  expect(tokenInfoData).toBeDefined();
  expect(typeof tokenInfoData).toBe('object');
  // Token info should have token IDs as keys with info objects
  if (Object.keys(tokenInfoData).length > 0) {
    const firstTokenInfo = Object.values(tokenInfoData)[0];
    expect(typeof firstTokenInfo).toBe('object');
  }
}

test.describe('Evo SDK Query Execution Tests', () => {
  let evoSdkPage;
  let parameterInjector;

  test.beforeEach(async ({ page }) => {
    evoSdkPage = new EvoSdkPage(page);
    parameterInjector = new ParameterInjector(evoSdkPage);
    await evoSdkPage.initialize('testnet');
  });

  test.describe('Data Contract Queries', () => {
    test('should execute getDataContract query', async () => {
      await evoSdkPage.setupQuery('dataContract', 'getDataContract');
      await evoSdkPage.disableProofInfo();

      const success = await parameterInjector.injectParameters('dataContract', 'getDataContract', 'testnet');
      expect(success).toBe(true);

      const result = await evoSdkPage.executeQueryAndGetResult();

      // Use helper functions for validation
      validateBasicQueryResult(result);
      validateResultWithoutProof(result);
      validateContractResult(result.result);
    });

    test('should execute getDataContracts query for multiple contracts', async () => {
      await evoSdkPage.setupQuery('dataContract', 'getDataContracts');
      await evoSdkPage.disableProofInfo();

      const success = await parameterInjector.injectParameters('dataContract', 'getDataContracts', 'testnet');
      expect(success).toBe(true);

      const result = await evoSdkPage.executeQueryAndGetResult();

      // Use helper functions for validation
      validateBasicQueryResult(result);
      validateResultWithoutProof(result);

      // Multiple contracts result should be valid JSON
      expect(() => JSON.parse(result.result)).not.toThrow();
      const contractsData = JSON.parse(result.result);
      expect(contractsData).toBeDefined();
      expect(typeof contractsData).toBe('object');

      // Validate each contract using validateContractResult
      Object.values(contractsData).forEach(contract => {
        validateContractResult(JSON.stringify(contract));
      });
    });

    test('should execute getDataContractHistory query', async () => {
      await evoSdkPage.setupQuery('dataContract', 'getDataContractHistory');
      await evoSdkPage.disableProofInfo();

      const success = await parameterInjector.injectParameters('dataContract', 'getDataContractHistory', 'testnet');
      expect(success).toBe(true);

      const result = await evoSdkPage.executeQueryAndGetResult();

      // Use helper functions for validation
      validateBasicQueryResult(result);
      validateResultWithoutProof(result);

      // Contract history should be valid JSON (array of contract versions)
      expect(() => JSON.parse(result.result)).not.toThrow();
      const historyData = JSON.parse(result.result);
      expect(historyData).toBeDefined();
      expect(Array.isArray(historyData) || typeof historyData === 'object').toBe(true);
    });

    test('should execute getDataContract query with proof info', async () => {
      const { result, proofEnabled } = await executeQueryWithProof(
        evoSdkPage,
        parameterInjector,
        'dataContract',
        'getDataContract',
        'testnet'
      );

      // Validate basic result
      validateBasicQueryResult(result);

      // If proof was enabled, verify proof present
      if (proofEnabled) {
        validateResultWithProof(result);
        // Extract data field for validation when in proof mode
        const resultData = JSON.parse(result.result);
        const contract = resultData.data;
        validateContractResult(JSON.stringify(contract));
      } else {
        validateResultWithoutProof(result);
        validateContractResult(result.result);
      }
    });

    test('should execute getDataContracts query with proof info', async () => {
      const { result, proofEnabled } = await executeQueryWithProof(
        evoSdkPage,
        parameterInjector,
        'dataContract',
        'getDataContracts',
        'testnet'
      );

      // Validate basic result
      validateBasicQueryResult(result);

      // If proof was enabled, verify new format with proof
      if (proofEnabled) {
        validateResultWithProof(result);
        // Extract data field for validation when in proof mode
        const resultData = JSON.parse(result.result);
        const contractsData = resultData.data;
        expect(contractsData).toBeDefined();
        expect(typeof contractsData).toBe('object');

        // Validate each contract using validateContractResult
        Object.values(contractsData).forEach(contract => {
          validateContractResult(JSON.stringify(contract));
        });
      } else {
        validateResultWithoutProof(result);
        // Multiple contracts result should be valid JSON
        expect(() => JSON.parse(result.result)).not.toThrow();
        const contractsData = JSON.parse(result.result);
        expect(contractsData).toBeDefined();
        expect(typeof contractsData).toBe('object');

        // Validate each contract using validateContractResult
        Object.values(contractsData).forEach(contract => {
          validateContractResult(JSON.stringify(contract));
        });
      }
    });

    test('should execute getDataContractHistory query with proof info', async () => {
      const { result, proofEnabled } = await executeQueryWithProof(
        evoSdkPage,
        parameterInjector,
        'dataContract',
        'getDataContractHistory',
        'testnet'
      );

      // Validate basic result
      validateBasicQueryResult(result);

      // If proof was enabled, verify proof
      if (proofEnabled) {
        validateResultWithProof(result);
        // Extract data field for validation when in proof mode
        const resultData = JSON.parse(result.result);
        const historyData = resultData.data;
        expect(historyData).toBeDefined();
        expect(Array.isArray(historyData) || typeof historyData === 'object').toBe(true);
      } else {
        validateResultWithoutProof(result);
        // Contract history should be valid JSON
        expect(() => JSON.parse(result.result)).not.toThrow();
        const historyData = JSON.parse(result.result);
        expect(historyData).toBeDefined();
        expect(Array.isArray(historyData) || typeof historyData === 'object').toBe(true);
      }
    });
  });

  test.describe('Document Queries', () => {
    test('should execute getDocuments query', async () => {
      await evoSdkPage.setupQuery('document', 'getDocuments');
      await evoSdkPage.disableProofInfo();

      const success = await parameterInjector.injectParameters('document', 'getDocuments', 'testnet');
      expect(success).toBe(true);

      const result = await evoSdkPage.executeQueryAndGetResult();

      // Use helper functions for validation
      validateBasicQueryResult(result);
      validateResultWithoutProof(result);
      validateDocumentResult(result.result);
    });

    test('should execute getDocument query for specific document', async () => {
      await evoSdkPage.setupQuery('document', 'getDocument');
      await evoSdkPage.disableProofInfo();

      const success = await parameterInjector.injectParameters('document', 'getDocument', 'testnet');
      expect(success).toBe(true);

      const result = await evoSdkPage.executeQueryAndGetResult();

      // Use helper functions for validation
      validateBasicQueryResult(result);
      validateResultWithoutProof(result);
      validateDocumentResult(result.result);
    });

    test('should execute getDocuments query with proof info', async () => {
      const { result, proofEnabled } = await executeQueryWithProof(
        evoSdkPage,
        parameterInjector,
        'document',
        'getDocuments',
        'testnet'
      );

      // Validate basic result
      validateBasicQueryResult(result);

      // If proof was enabled, verify proof
      if (proofEnabled) {
        validateResultWithProof(result);
        // Extract data field for validation when in proof mode
        const resultData = JSON.parse(result.result);
        validateDocumentResult(JSON.stringify(resultData.data));
      } else {
        validateResultWithoutProof(result);
        validateDocumentResult(result.result);
      }
    });

    test('should execute getDocument query with proof info', async () => {
      const { result, proofEnabled } = await executeQueryWithProof(
        evoSdkPage,
        parameterInjector,
        'document',
        'getDocument',
        'testnet'
      );

      // Validate basic result
      validateBasicQueryResult(result);

      // If proof was enabled, verify proof
      if (proofEnabled) {
        validateResultWithProof(result);
        // Extract data field for validation when in proof mode
        const resultData = JSON.parse(result.result);
        validateDocumentResult(JSON.stringify(resultData.data));
      } else {
        validateResultWithoutProof(result);
        validateDocumentResult(result.result);
      }
    });
  });

  test.describe('System Queries', () => {
    const systemQueries = [
      {
        name: 'getStatus',
        hasProofSupport: false, // No proof function in SDK
        needsParameters: false,
        validateFn: (result) => {
          expect(result).toBeDefined();
          const parsed = JSON.parse(result);
          // Check top-level structure
          expect(parsed).toHaveProperty('version');
          expect(parsed).toHaveProperty('node');
          expect(parsed).toHaveProperty('chain');
          expect(parsed).toHaveProperty('network');
          expect(parsed).toHaveProperty('stateSync');
          expect(parsed).toHaveProperty('time');
          // Check version structure
          expect(parsed.version).toHaveProperty('software');
          expect(parsed.version).toHaveProperty('protocol');
          expect(parsed.version.software).toHaveProperty('dapi');
          expect(parsed.version.software).toHaveProperty('drive');
          expect(parsed.version.software).toHaveProperty('tenderdash');
          // Check chain structure
          expect(parsed.chain).toHaveProperty('catchingUp');
          expect(parsed.chain).toHaveProperty('latestBlockHash');
          expect(parsed.chain).toHaveProperty('latestBlockHeight');
          // Check time structure
          expect(parsed.time).toHaveProperty('local');
          expect(parsed.time).toHaveProperty('block');
        }
      },
      {
        name: 'getTotalCreditsInPlatform',
        hasProofSupport: true,
        needsParameters: false,
        validateFn: (result) => {
          expect(result).toBeDefined();
          // Result should be a numeric string representing total credits
          // Handle both plain strings and JSON-stringified strings
          let creditsValue = result;
          // If result is a JSON-stringified string (has extra quotes), parse it
          if (result.startsWith('"') && result.endsWith('"')) {
            creditsValue = JSON.parse(result);
          }
          const credits = BigInt(creditsValue);
          expect(credits).toBeGreaterThanOrEqual(0n);
        }
      },
      {
        name: 'getCurrentQuorumsInfo',
        hasProofSupport: false, // No proof function in SDK
        needsParameters: false,
        validateFn: (result) => {
          expect(result).toBeDefined();
          const parsed = JSON.parse(result);
          // Check top-level structure
          expect(parsed).toHaveProperty('quorums');
          expect(parsed).toHaveProperty('height');
          // Check quorums array
          expect(Array.isArray(parsed.quorums)).toBe(true);
          expect(parsed.quorums.length).toBeGreaterThan(0);
          // Check first quorum structure
          const firstQuorum = parsed.quorums[0];
          expect(firstQuorum).toHaveProperty('quorumHash');
          expect(firstQuorum).toHaveProperty('quorumType');
          expect(firstQuorum).toHaveProperty('memberCount');
          expect(firstQuorum).toHaveProperty('threshold');
          expect(firstQuorum).toHaveProperty('isVerified');
          // Validate types
          expect(typeof firstQuorum.quorumHash).toBe('string');
          expect(typeof firstQuorum.quorumType).toBe('string');
          expect(typeof firstQuorum.memberCount).toBe('number');
          expect(typeof firstQuorum.threshold).toBe('number');
          expect(typeof firstQuorum.isVerified).toBe('boolean');
        }
      },
      {
        name: 'getPrefundedSpecializedBalance',
        hasProofSupport: true,
        needsParameters: true,
        allowNullData: true, // Balance may not exist, so data can be null
        validateFn: (result) => {
          // Result can be null/undefined if no prefunded balance exists
          if (result === 'null' || result === 'undefined' || result === null || result === undefined) {
            return; // Valid - no balance exists
          }
          const parsed = JSON.parse(result);
          // Check structure when balance exists
          expect(parsed).toHaveProperty('identityId');
          expect(parsed).toHaveProperty('balance');
          expect(typeof parsed.identityId).toBe('string');
          // Balance should be a valid number (BigInt compatible)
          const balance = BigInt(parsed.balance);
          expect(balance).toBeGreaterThanOrEqual(0n);
        }
      },
      {
        name: 'getPathElements',
        hasProofSupport: true,
        needsParameters: true,
        validateFn: (result) => {
          // Result is an array of path elements from GroveDB
          expect(() => JSON.parse(result)).not.toThrow();
          const elements = JSON.parse(result);
          expect(elements).toBeDefined();
          expect(Array.isArray(elements)).toBe(true);
        }
      }
    ];

    systemQueries.forEach(({ name, hasProofSupport, needsParameters, allowNullData, validateFn }) => {
      test.describe(`${name} query (parameterized)`, () => {
        test('without proof info', async () => {
          await evoSdkPage.setupQuery('system', name);
          await evoSdkPage.disableProofInfo();

          if (needsParameters) {
            const success = await parameterInjector.injectParameters('system', name, 'testnet');
            expect(success).toBe(true);
          }

          const result = await evoSdkPage.executeQueryAndGetResult();
          validateBasicQueryResult(result);
          validateResultWithoutProof(result);
          validateFn(result.result);
        });

        if (hasProofSupport) {
          test('with proof info', async () => {
            const { result, proofEnabled } = await executeQueryWithProof(
              evoSdkPage,
              parameterInjector,
              'system',
              name,
              'testnet'
            );

            validateBasicQueryResult(result);

            if (proofEnabled) {
              validateResultWithProof(result, { allowNullData });
              // Extract data field for validation when in proof mode
              const resultData = JSON.parse(result.result);
              validateFn(JSON.stringify(resultData.data));
            } else {
              validateResultWithoutProof(result);
              validateFn(result.result);
            }
          });
        }
        // No proof test for queries that will never have proof support
      });
    });
  });

  test.describe('Epoch & Block Queries', () => {
    const epochQueries = [
      {
        name: 'getCurrentEpoch',
        hasProofSupport: true,
        needsParameters: false,
        validateFn: (result, isProofMode = false) => {
          expect(result).toBeDefined();
          const parsed = JSON.parse(result);
          // In proof mode, data is wrapped in { data, metadata, proof }
          const epochResult = isProofMode && parsed.data ? parsed.data : parsed;
          // Result is wrapped in V0 with epoch info
          expect(epochResult).toHaveProperty('V0');
          const epochInfo = epochResult.V0;
          expect(epochInfo).toHaveProperty('index');
          expect(epochInfo).toHaveProperty('first_block_time');
          expect(epochInfo).toHaveProperty('first_block_height');
          expect(epochInfo).toHaveProperty('first_core_block_height');
          expect(epochInfo).toHaveProperty('fee_multiplier_permille');
          expect(typeof epochInfo.index).toBe('number');
          expect(epochInfo.index).toBeGreaterThanOrEqual(0);
        }
      },
      {
        name: 'getEpochsInfo',
        hasProofSupport: true,
        needsParameters: true,
        validateFn: (result, isProofMode = false) => {
          const parsed = JSON.parse(result);
          expect(parsed).toBeDefined();
          // In proof mode, data is wrapped in { data, metadata, proof }
          const epochData = isProofMode && parsed.data ? parsed.data : parsed;
          // Should be an object with epoch numbers as keys
          expect(typeof epochData).toBe('object');
          const keys = Object.keys(epochData);
          expect(keys.length).toBeGreaterThan(0);
          // Check first epoch structure (wrapped in V0)
          const firstKey = keys[0];
          const firstEpoch = epochData[firstKey];
          expect(firstEpoch).toHaveProperty('V0');
          const epochInfo = firstEpoch.V0;
          expect(epochInfo).toHaveProperty('index');
          expect(epochInfo).toHaveProperty('first_block_time');
          expect(epochInfo).toHaveProperty('first_block_height');
          expect(epochInfo).toHaveProperty('first_core_block_height');
          expect(epochInfo).toHaveProperty('fee_multiplier_permille');
        }
      },
      {
        name: 'getFinalizedEpochInfos',
        hasProofSupport: true,
        needsParameters: true,
        validateFn: (result, isProofMode = false) => {
          const parsed = JSON.parse(result);
          expect(parsed).toBeDefined();
          // In proof mode, data is wrapped in { data, metadata, proof }
          const epochData = isProofMode && parsed.data ? parsed.data : parsed;
          // Should be an object with epoch numbers as keys
          expect(typeof epochData).toBe('object');
          const keys = Object.keys(epochData);
          // Can be empty if no finalized epochs in range
          if (keys.length > 0) {
            // Check first epoch structure (wrapped in V0)
            const firstKey = keys[0];
            const firstEpoch = epochData[firstKey];
            expect(firstEpoch).toHaveProperty('V0');
            const epochInfo = firstEpoch.V0;
            expect(epochInfo).toHaveProperty('index');
            expect(epochInfo).toHaveProperty('first_block_time');
            expect(epochInfo).toHaveProperty('first_block_height');
            expect(epochInfo).toHaveProperty('first_core_block_height');
            expect(epochInfo).toHaveProperty('fee_multiplier_permille');
          }
        }
      },
      {
        name: 'getEvonodesProposedEpochBlocksByIds',
        hasProofSupport: true,
        needsParameters: true,
        validateFn: (result) => {
          expect(() => JSON.parse(result)).not.toThrow();
          const blockData = JSON.parse(result);
          expect(blockData).toBeDefined();
          expect(typeof blockData === 'object').toBe(true);
        }
      },
      {
        name: 'getEvonodesProposedEpochBlocksByRange',
        hasProofSupport: true,
        needsParameters: true,
        validateFn: (result) => {
          expect(() => JSON.parse(result)).not.toThrow();
          const blockData = JSON.parse(result);
          expect(blockData).toBeDefined();
          expect(typeof blockData === 'object').toBe(true);
        }
      }
    ];

    epochQueries.forEach(({ name, hasProofSupport, needsParameters, validateFn }) => {
      test.describe(`${name} query (parameterized)`, () => {
        test('without proof info', async () => {
          await evoSdkPage.setupQuery('epoch', name);
          await evoSdkPage.disableProofInfo();

          if (needsParameters) {
            const success = await parameterInjector.injectParameters('epoch', name, 'testnet');
            expect(success).toBe(true);
          }

          const result = await evoSdkPage.executeQueryAndGetResult();
          validateBasicQueryResult(result);
          validateResultWithoutProof(result);
          validateFn(result.result);
        });

        if (hasProofSupport) {
          test('with proof info', async () => {
            const { result, proofEnabled } = await executeQueryWithProof(
              evoSdkPage,
              parameterInjector,
              'epoch',
              name,
              'testnet'
            );

            validateBasicQueryResult(result);

            if (proofEnabled) {
              validateResultWithProof(result);
              // For epoch queries, pass the full result for validation since
              // getCurrentEpoch has epoch in metadata, not in data
              validateFn(result.result, true);
            } else {
              validateResultWithoutProof(result);
              validateFn(result.result, false);
            }
          });
        } else {
          test.skip('with proof info', async () => {
            // Proof support not yet implemented for this query
          });
        }
      });
    });
  });

  test.describe('Token Queries', () => {
    const tokenQueries = [
      {
        name: 'getTokenStatuses',
        hasProofSupport: true,
        needsParameters: true,
        validateFn: (result) => {
          expect(() => JSON.parse(result)).not.toThrow();
          const tokenStatuses = JSON.parse(result);
          expect(tokenStatuses).toBeDefined();
          expect(typeof tokenStatuses === 'object').toBe(true);
          // Token statuses may return empty objects {} if token has no special status
          // Only validate isPaused if the property exists
          const entries = Array.isArray(tokenStatuses) ? tokenStatuses : Object.values(tokenStatuses);
          entries.forEach(token => {
            if (token && Object.keys(token).length > 0 && 'isPaused' in token) {
              expect(typeof token.isPaused).toBe('boolean');
            }
          });
        }
      },
      {
        name: 'getTokenDirectPurchasePrices',
        hasProofSupport: true,
        needsParameters: true,
        validateFn: (result) => {
          expect(() => JSON.parse(result)).not.toThrow();
          const priceData = JSON.parse(result);
          expect(priceData).toBeDefined();
          expect(typeof priceData === 'object').toBe(true);
          // Price data may return empty objects {} if token has no price set
          // Only validate basePrice if the property exists
          const entries = Array.isArray(priceData) ? priceData : Object.values(priceData);
          entries.forEach(token => {
            if (token && Object.keys(token).length > 0 && 'basePrice' in token) {
              expect(typeof token.basePrice).toBeDefined();
            }
          });
        }
      },
      {
        name: 'getTokenContractInfo',
        hasProofSupport: true,
        needsParameters: true,
        validateFn: (result) => {
          expect(() => JSON.parse(result)).not.toThrow();
          const contractInfo = JSON.parse(result);
          expect(contractInfo).toBeDefined();
          expect(typeof contractInfo === 'object').toBe(true);
        }
      },
      {
        name: 'getTokenPerpetualDistributionLastClaim',
        hasProofSupport: true,
        needsParameters: true,
        validateFn: (result) => {
          expect(() => JSON.parse(result)).not.toThrow();
          const claimData = JSON.parse(result);
          expect(claimData).toBeDefined();
          expect(typeof claimData === 'object').toBe(true);
        }
      },
      {
        name: 'getTokenTotalSupply',
        hasProofSupport: true,
        needsParameters: true,
        validateFn: (result) => {
          expect(() => JSON.parse(result)).not.toThrow();
          const supplyData = JSON.parse(result);
          expect(supplyData).toBeDefined();
          expect(typeof supplyData === 'object').toBe(true);
        }
      }
      // Note: getTokenPriceByContract requires a token contract with specific pricing configuration.
      // As of now, no tokens on testnet have pricing configured, so this test is skipped.
      // Error: "No pricing schedule found for token at contract ... position 0"
    ];

    tokenQueries.forEach(({ name, hasProofSupport, needsParameters, validateFn }) => {
      test.describe(`${name} query (parameterized)`, () => {
        test('without proof info', async () => {
          await evoSdkPage.setupQuery('token', name);
          await evoSdkPage.disableProofInfo();

          if (needsParameters) {
            const success = await parameterInjector.injectParameters('token', name, 'testnet');
            expect(success).toBe(true);
          }

          const result = await evoSdkPage.executeQueryAndGetResult();
          validateBasicQueryResult(result);
          validateResultWithoutProof(result);
          validateFn(result.result);
        });

        if (hasProofSupport) {
          test('with proof info', async () => {
            const { result, proofEnabled } = await executeQueryWithProof(
              evoSdkPage,
              parameterInjector,
              'token',
              name,
              'testnet'
            );

            validateBasicQueryResult(result);

            if (proofEnabled) {
              validateResultWithProof(result);
              // Extract data field for validation when in proof mode
              const resultData = JSON.parse(result.result);
              validateFn(JSON.stringify(resultData.data));
            } else {
              validateResultWithoutProof(result);
              validateFn(result.result);
            }
          });
        } else {
          test.skip('with proof info', async () => {
            // Proof support not yet implemented for this query
          });
        }
      });
    });
  });

  test.describe('Voting & Contested Resources Queries', () => {
    const votingQueries = [
      {
        name: 'getContestedResources',
        hasProofSupport: true,
        needsParameters: true,
        validateFn: (result) => {
          expect(() => JSON.parse(result)).not.toThrow();
          const contestedData = JSON.parse(result);
          expect(contestedData).toBeDefined();
          expect(typeof contestedData === 'object').toBe(true);
        }
      },
      {
        name: 'getContestedResourceVoteState',
        hasProofSupport: true,
        needsParameters: true,
        validateFn: (result) => {
          expect(() => JSON.parse(result)).not.toThrow();
          const voteStateData = JSON.parse(result);
          expect(voteStateData).toBeDefined();
          expect(typeof voteStateData === 'object').toBe(true);
        }
      },
      {
        name: 'getContestedResourceVotersForIdentity',
        hasProofSupport: true,
        needsParameters: true,
        validateFn: (result) => {
          expect(() => JSON.parse(result)).not.toThrow();
          const votersData = JSON.parse(result);
          expect(votersData).toBeDefined();
          expect(typeof votersData === 'object').toBe(true);
        }
      },
      {
        name: 'getContestedResourceIdentityVotes',
        hasProofSupport: true,
        needsParameters: true,
        validateFn: (result) => {
          expect(() => JSON.parse(result)).not.toThrow();
          const identityVotesData = JSON.parse(result);
          expect(identityVotesData).toBeDefined();
          expect(typeof identityVotesData === 'object').toBe(true);
        }
      },
      {
        name: 'getVotePollsByEndDate',
        hasProofSupport: true,
        needsParameters: true,
        validateFn: (result) => {
          expect(() => JSON.parse(result)).not.toThrow();
          const pollsData = JSON.parse(result);
          expect(pollsData).toBeDefined();
          expect(typeof pollsData === 'object').toBe(true);
        }
      }
    ];

    votingQueries.forEach(({ name, hasProofSupport, needsParameters, validateFn }) => {
      test.describe(`${name} query (parameterized)`, () => {
        test('without proof info', async () => {
          await evoSdkPage.setupQuery('voting', name);
          await evoSdkPage.disableProofInfo();

          if (needsParameters) {
            const success = await parameterInjector.injectParameters('voting', name, 'testnet');
            expect(success).toBe(true);
          }

          const result = await evoSdkPage.executeQueryAndGetResult();
          validateBasicQueryResult(result);
          validateResultWithoutProof(result);
          validateFn(result.result);
        });

        if (hasProofSupport) {
          test('with proof info', async () => {
            const { result, proofEnabled } = await executeQueryWithProof(
              evoSdkPage,
              parameterInjector,
              'voting',
              name,
              'testnet'
            );

            validateBasicQueryResult(result);

            if (proofEnabled) {
              validateResultWithProof(result);
              // Extract data field for validation when in proof mode
              const resultData = JSON.parse(result.result);
              validateFn(JSON.stringify(resultData.data));
            } else {
              validateResultWithoutProof(result);
              validateFn(result.result);
            }
          });
        } else {
          test.skip('with proof info', async () => {
            // Proof support not yet implemented for this query
          });
        }
      });
    });
  });

  test.describe('Group Queries', () => {
    const groupQueries = [
      {
        name: 'getGroupInfo',
        hasProofSupport: true,
        needsParameters: true,
        validateFn: (result) => {
          expect(() => JSON.parse(result)).not.toThrow();
          const groupInfo = JSON.parse(result);
          expect(groupInfo).toBeDefined();
          expect(typeof groupInfo === 'object').toBe(true);
        }
      },
      {
        name: 'getGroupInfos',
        hasProofSupport: true,
        needsParameters: true,
        validateFn: (result) => {
          expect(() => JSON.parse(result)).not.toThrow();
          const groupInfos = JSON.parse(result);
          expect(groupInfos).toBeDefined();
          expect(typeof groupInfos === 'object').toBe(true);
        }
      },
      {
        name: 'getGroupActions',
        hasProofSupport: true,
        needsParameters: true,
        validateFn: (result) => {
          expect(() => JSON.parse(result)).not.toThrow();
          const groupActions = JSON.parse(result);
          expect(groupActions).toBeDefined();
          expect(typeof groupActions === 'object').toBe(true);
        }
      },
      {
        name: 'getGroupActionSigners',
        hasProofSupport: true,
        needsParameters: true,
        validateFn: (result) => {
          expect(() => JSON.parse(result)).not.toThrow();
          const actionSigners = JSON.parse(result);
          expect(actionSigners).toBeDefined();
          expect(typeof actionSigners === 'object').toBe(true);
        }
      },
      {
        name: 'getGroupMembers',
        hasProofSupport: true,
        needsParameters: true,
        validateFn: (result) => {
          expect(() => JSON.parse(result)).not.toThrow();
          const members = JSON.parse(result);
          expect(members).toBeDefined();
          expect(typeof members === 'object').toBe(true);
        }
      },
      {
        name: 'getGroupsDataContracts',
        hasProofSupport: true,
        needsParameters: true,
        validateFn: (result) => {
          expect(() => JSON.parse(result)).not.toThrow();
          const groupsData = JSON.parse(result);
          expect(groupsData).toBeDefined();
          expect(typeof groupsData === 'object').toBe(true);
        }
      },
      {
        name: 'getIdentityGroups',
        hasProofSupport: true,
        needsParameters: true,
        validateFn: (result) => {
          expect(() => JSON.parse(result)).not.toThrow();
          const identityGroups = JSON.parse(result);
          expect(identityGroups).toBeDefined();
          // Can be array or object
          expect(typeof identityGroups === 'object' || Array.isArray(identityGroups)).toBe(true);
        }
      }
    ];

    groupQueries.forEach(({ name, hasProofSupport, needsParameters, validateFn }) => {
      test.describe(`${name} query (parameterized)`, () => {
        test('without proof info', async () => {
          await evoSdkPage.setupQuery('group', name);
          await evoSdkPage.disableProofInfo();

          if (needsParameters) {
            const success = await parameterInjector.injectParameters('group', name, 'testnet');
            expect(success).toBe(true);
          }

          const result = await evoSdkPage.executeQueryAndGetResult();
          validateBasicQueryResult(result);
          validateResultWithoutProof(result);
          validateFn(result.result);
        });

        if (hasProofSupport) {
          test('with proof info', async () => {
            const { result, proofEnabled } = await executeQueryWithProof(
              evoSdkPage,
              parameterInjector,
              'group',
              name,
              'testnet'
            );

            validateBasicQueryResult(result);

            if (proofEnabled) {
              validateResultWithProof(result);
              // Extract data field for validation when in proof mode
              const resultData = JSON.parse(result.result);
              validateFn(JSON.stringify(resultData.data));
            } else {
              validateResultWithoutProof(result);
              validateFn(result.result);
            }
          });
        } else {
          test.skip('with proof info', async () => {
            // Proof support not yet implemented for this query
          });
        }
      });
    });
  });

  test.describe('Platform Address Queries', () => {
    const addressQueries = [
      {
        name: 'getPlatformAddress',
        hasProofSupport: false, // Server returns "Operation is not implemented"
        needsParameters: true,
        // Server doesn't support non-proof query for single address
        skipNonProof: true,
        validateFn: (result) => {
          // Platform address may or may not exist (undefined is valid)
          // Just verify we got a response
          expect(result).toBeDefined();
        }
      },
      {
        name: 'getPlatformAddresses',
        hasProofSupport: true,
        needsParameters: true,
        validateFn: (result) => {
          // Should return a map/object of addresses
          expect(result).toBeDefined();
        }
      }
    ];

    addressQueries.forEach(({ name, hasProofSupport, needsParameters, skipNonProof, validateFn }) => {
      test.describe(`${name} query (parameterized)`, () => {
        if (skipNonProof) {
          test.skip('without proof info', async () => {
            // Server doesn't support non-proof query for this operation
          });
        } else {
          test('without proof info', async () => {
            await evoSdkPage.setupQuery('address', name);
            await evoSdkPage.disableProofInfo();

            if (needsParameters) {
              const success = await parameterInjector.injectParameters('address', name, 'testnet');
              expect(success).toBe(true);
            }

            const result = await evoSdkPage.executeQueryAndGetResult();
            validateBasicQueryResult(result);
            validateResultWithoutProof(result);
            validateFn(result.result);
          });
        }

        if (hasProofSupport) {
          test('with proof info', async () => {
            const { result, proofEnabled } = await executeQueryWithProof(
              evoSdkPage,
              parameterInjector,
              'address',
              name,
              'testnet'
            );

            validateBasicQueryResult(result);

            if (proofEnabled) {
              validateResultWithProof(result);
              // Extract data field for validation when in proof mode
              const resultData = JSON.parse(result.result);
              validateFn(JSON.stringify(resultData.data));
            } else {
              validateResultWithoutProof(result);
              validateFn(result.result);
            }
          });
        } else {
          test.skip('with proof info', async () => {
            // Proof support not yet implemented for this query
          });
        }
      });
    });
  });

  test.describe('Error Handling', () => {
    test('should handle invalid identity ID gracefully', async () => {
      await evoSdkPage.setupQuery('identity', 'getIdentity');

      // Fill with invalid ID (contains invalid base58 characters '0', 'O', 'I', 'l')
      await evoSdkPage.fillQueryParameters({ id: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4SOIl0' });

      const outcome = await evoSdkPage.executeQueryAndGetResult();

      const statusText = outcome.statusText || '';
      const resultText = outcome.result || '';

      const indicator = outcome.hasError
        || statusText.toLowerCase().includes('error')
        || /error|invalid|null/i.test(resultText);

      expect(indicator).toBe(true);
      expect(statusText).toBeTruthy();
    });

    test('should handle empty required fields', async () => {
      await evoSdkPage.setupQuery('identity', 'getIdentity');

      // Don't fill any parameters, try to execute
      const executeButton = evoSdkPage.page.locator('#executeQuery');
      await executeButton.click();

      // Wait for status banner to show error
      const statusBanner = evoSdkPage.page.locator('#statusBanner');
      await statusBanner.waitFor({ state: 'visible', timeout: 5000 });
      await evoSdkPage.page.waitForFunction(
        () => {
          const banner = document.getElementById('statusBanner');
          return banner && banner.classList.contains('error');
        },
        { timeout: 5000 }
      );

      // Check for error status
      const statusClass = await statusBanner.getAttribute('class');
      const statusText = await evoSdkPage.getStatusBannerText();

      // Should show error or validation message
      expect(statusClass).toContain('error');
      expect(statusText).toContain('required');
    });
  });


  test.describe('Network Switching', () => {
    test('should execute queries on mainnet', async () => {
      // Switch to mainnet
      await evoSdkPage.setNetwork('mainnet');

      await evoSdkPage.setupQuery('system', 'getStatus');

      const result = await evoSdkPage.executeQueryAndGetResult();

      // Verify query executed successfully
      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();

      // Verify the result is not an error message
      expect(result.hasError).toBe(false);
      expect(result.result).not.toContain('Error executing query');
      expect(result.result).not.toContain('not found');

      // Result should be valid JSON - may be empty {} if no status data available
      expect(() => JSON.parse(result.result)).not.toThrow();
      const statusData = JSON.parse(result.result);
      expect(typeof statusData === 'object').toBe(true);

    });
  });

  test.describe('Protocol & Version Queries', () => {
    const protocolQueries = [
      {
        name: 'getProtocolVersionUpgradeState',
        hasProofSupport: true,
        needsParameters: false,
        validateFn: (result) => {
          expect(result).toBeDefined();
          const stateData = JSON.parse(result);
          expect(typeof stateData).toBe('object');
          // Check required structure
          expect(stateData).toHaveProperty('currentProtocolVersion');
          expect(stateData).toHaveProperty('thresholdReached');
          expect(typeof stateData.currentProtocolVersion).toBe('number');
          expect(typeof stateData.thresholdReached).toBe('boolean');
        }
      },
      {
        name: 'getProtocolVersionUpgradeVoteStatus',
        hasProofSupport: true,
        needsParameters: true,
        validateFn: (result) => {
          const voteData = JSON.parse(result);
          expect(voteData).toBeDefined();
          expect(typeof voteData).toBe('object');
          // Vote status can have various structures depending on state
          expect(Object.keys(voteData).length).toBeGreaterThanOrEqual(0);
        }
      }
    ];

    protocolQueries.forEach(({ name, hasProofSupport, needsParameters, validateFn }) => {
      test.describe(`${name} query (parameterized)`, () => {
        test('without proof info', async () => {
          await evoSdkPage.setupQuery('protocol', name);
          await evoSdkPage.disableProofInfo();

          if (needsParameters) {
            const success = await parameterInjector.injectParameters('protocol', name, 'testnet');
            expect(success).toBe(true);
          }

          const result = await evoSdkPage.executeQueryAndGetResult();
          validateBasicQueryResult(result);
          validateResultWithoutProof(result);
          validateFn(result.result);
        });

        if (hasProofSupport) {
          test('with proof info', async () => {
            const { result, proofEnabled } = await executeQueryWithProof(
              evoSdkPage,
              parameterInjector,
              'protocol',
              name,
              'testnet'
            );

            validateBasicQueryResult(result);

            if (proofEnabled) {
              validateResultWithProof(result);
              // Extract data field for validation when in proof mode
              const resultData = JSON.parse(result.result);
              validateFn(JSON.stringify(resultData.data));
            } else {
              validateResultWithoutProof(result);
              validateFn(result.result);
            }
          });
        } else {
          test.skip('with proof info', async () => {
            // Proof support not yet implemented for this query
          });
        }
      });
    });
  });

  test.describe('DPNS Queries', () => {
    const dpnsQueries = [
      {
        category: 'lookup',
        name: 'getDpnsUsername',
        hasProofSupport: true,
        needsParameters: true,
        validateFn: (result) => {
          expect(result).toBeDefined();
          // Can be a string username or "null" as a string
          if (result === 'null') {
            expect(result).toBe('null');
          } else {
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
          }
        }
      },
      {
        category: 'lookup',
        name: 'getDpnsUsernames',
        hasProofSupport: true,
        needsParameters: true,
        validateFn: (result) => {
          expect(() => JSON.parse(result)).not.toThrow();
          const usernamesData = JSON.parse(result);
          expect(usernamesData).toBeDefined();
          expect(Array.isArray(usernamesData)).toBe(true);
          // Each item should be a plain string username
          usernamesData.forEach(username => {
            expect(typeof username).toBe('string');
            expect(username.length).toBeGreaterThan(0);
          });
        }
      },
      {
        category: 'lookup',
        name: 'getDpnsUsernameByName',
        hasProofSupport: true,
        needsParameters: true,
        validateFn: (result) => {
          expect(result).toBeDefined();
          // Can be a string username or "null" as a string
          if (result === 'null') {
            expect(result).toBe('null');
          } else {
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
          }
        }
      },
      {
        category: 'lookup',
        name: 'dpnsResolve',
        hasProofSupport: false,  // Proof support not yet implemented in SDK
        needsParameters: true,
        validateFn: (result) => {
          expect(result).toBeDefined();
          // dpnsResolve returns a plain string identity ID or "null" if not found
          if (result === 'null') {
            expect(result).toBe('null');
          } else {
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
            // Should look like an identity ID (base58 string)
            expect(result).toMatch(/^[1-9A-HJ-NP-Za-km-z]+$/);
          }
        }
      },
      {
        category: 'validation',
        name: 'dpnsCheckAvailability',
        hasProofSupport: false,  // Proof support not yet implemented in SDK
        needsParameters: true,
        validateFn: validateBooleanResult
      },
      {
        category: 'validation',
        name: 'dpnsConvertToHomographSafe',
        hasProofSupport: false,  // Utility function, no proof needed
        needsParameters: true,
        validateFn: (result) => {
          expect(result).toBeDefined();
          expect(typeof result).toBe('string');
          expect(result.length).toBeGreaterThan(0);
        }
      },
      {
        category: 'validation',
        name: 'dpnsIsValidUsername',
        hasProofSupport: false,  // Utility function, no proof needed
        needsParameters: true,
        validateFn: validateBooleanResult
      },
      {
        category: 'validation',
        name: 'dpnsIsContestedUsername',
        hasProofSupport: false,  // Proof support not yet implemented in SDK
        needsParameters: true,
        validateFn: validateBooleanResult
      },
      // TODO: re-enable if the WASM SDK method is implemented it js-evo-sdk
      // {
      //   name: 'dpnsSearch', 
      //   hasProofSupport: true, 
      //   needsParameters: true,
      //   validateFn: (result) => {
      //     expect(() => JSON.parse(result)).not.toThrow();
      //     const searchData = JSON.parse(result);
      //     expect(searchData).toBeDefined();
      //     if (Array.isArray(searchData)) {
      //       expect(searchData.length).toBeGreaterThanOrEqual(0);
      //       searchData.forEach(result => {
      //         expect(result).toHaveProperty('username');
      //       });
      //     }
      //   }
      // }
    ];

    dpnsQueries.forEach(({ category, name, hasProofSupport, needsParameters, validateFn }) => {
      test.describe(`${name} query (parameterized)`, () => {
        test('without proof info', async () => {
          await evoSdkPage.setupQuery(category, name, {}, { operationType: 'dpns' });
          await evoSdkPage.disableProofInfo();

          if (needsParameters) {
            const success = await parameterInjector.injectParameters('dpns', name, 'testnet');
            expect(success).toBe(true);
          }

          const result = await evoSdkPage.executeQueryAndGetResult();
          validateBasicDpnsQueryResult(result);
          validateResultWithoutProof(result);
          validateFn(result.result);
        });

        if (hasProofSupport) {
          test('with proof info', async () => {
            const { result, proofEnabled } = await executeQueryWithProof(
              evoSdkPage,
              parameterInjector,
              category,
              name,
              'testnet',
              { operationType: 'dpns', parameterCategory: 'dpns' }
            );

            validateBasicDpnsQueryResult(result);

            if (proofEnabled) {
              validateResultWithProof(result);
              // Extract data field for validation when in proof mode
              const resultData = JSON.parse(result.result);
              validateFn(JSON.stringify(resultData.data));
            } else {
              validateResultWithoutProof(result);
              validateFn(result.result);
            }
          });
        }
        // No proof test for utility functions or queries without proof support
      });
    });
  });

  // Test Identity Queries
  test.describe('Identity Queries', () => {
    // Complete set of all available identity queries with correct proof support
    const testQueries = [
      { name: 'getIdentity', hasProofSupport: true, validateFn: validateIdentityResult },
      { name: 'getIdentityBalance', hasProofSupport: true, validateFn: (result) => validateNumericResult(result, 'balance') },
      { name: 'getIdentityKeys', hasProofSupport: true, validateFn: validateKeysResult },
      { name: 'getIdentityNonce', hasProofSupport: true, validateFn: (result) => validateNumericResult(result, 'nonce') },
      { name: 'getIdentityContractNonce', hasProofSupport: true, validateFn: (result) => validateNumericResult(result, 'nonce') },
      { name: 'getIdentityByPublicKeyHash', hasProofSupport: true, validateFn: validateIdentityResult },
      { name: 'getIdentitiesContractKeys', hasProofSupport: true, validateFn: validateIdentitiesContractKeysResult },
      { name: 'getIdentitiesBalances', hasProofSupport: true, validateFn: validateBalancesResult },
      { name: 'getIdentityBalanceAndRevision', hasProofSupport: true, validateFn: validateBalanceAndRevisionResult },
      { name: 'getIdentityByNonUniquePublicKeyHash', hasProofSupport: true, validateFn: validateIdentitiesResult },
      { name: 'getIdentityTokenBalances', hasProofSupport: true, validateFn: validateTokenBalanceResult },
      { name: 'getIdentitiesTokenBalances', hasProofSupport: true, validateFn: validateTokenBalanceResult },
      { name: 'getIdentityTokenInfos', hasProofSupport: true, validateFn: validateTokenInfoResult },
      { name: 'getIdentitiesTokenInfos', hasProofSupport: true, validateFn: validateTokenInfoResult }
    ];

    testQueries.forEach(({ name, hasProofSupport, validateFn }) => {
      test.describe(`${name} query (parameterized)`, () => {
        test('without proof info', async () => {
          await evoSdkPage.setupQuery('identity', name);
          await evoSdkPage.disableProofInfo();

          const success = await parameterInjector.injectParameters('identity', name, 'testnet');
          expect(success).toBe(true);

          const result = await evoSdkPage.executeQueryAndGetResult();
          validateBasicQueryResult(result);
          expect(result.result.length).toBeGreaterThan(0);
          validateResultWithoutProof(result);
          validateFn(result.result);
        });

        if (hasProofSupport) {
          test('with proof info', async () => {
            const { result, proofEnabled } = await executeQueryWithProof(
              evoSdkPage,
              parameterInjector,
              'identity',
              name,
              'testnet'
            );

            validateBasicQueryResult(result);
            expect(result.result.length).toBeGreaterThan(0);

            if (proofEnabled) {
              validateResultWithProof(result);
              // Extract data field for validation when in proof mode
              const resultData = JSON.parse(result.result);
              validateFn(JSON.stringify(resultData.data));
            } else {
              validateResultWithoutProof(result);
              validateFn(result.result);
            }
          });
        } else {
          test.skip('with proof info', async () => {
            // Proof support not yet implemented in SDK for this query
          });
        }
      });
    });

    // getIdentityUnproved - no proof support and will never be implemented (by design)
    test('getIdentityUnproved query', async () => {
      await evoSdkPage.setupQuery('identity', 'getIdentityUnproved');
      await evoSdkPage.disableProofInfo();

      const success = await parameterInjector.injectParameters('identity', 'getIdentityUnproved', 'testnet');
      expect(success).toBe(true);

      const result = await evoSdkPage.executeQueryAndGetResult();
      validateBasicQueryResult(result);
      expect(result.result.length).toBeGreaterThan(0);
      validateResultWithoutProof(result);
      validateIdentityResult(result.result);
    });
  });
});
