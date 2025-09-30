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
 */
function validateResultWithProof(result) {
  expect(result.success).toBe(true);
  expect(result.result).toBeDefined();
  
  // Parse the result as JSON to check the format
  const resultData = JSON.parse(result.result);
  expect(resultData).toHaveProperty('data');
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
 * @param {string} resultStr - The raw result string containing contract data
 */
function validateContractResult(resultStr) {
  expect(() => JSON.parse(resultStr)).not.toThrow();
  const contractData = JSON.parse(resultStr);
  expect(contractData).toBeDefined();
  expect(contractData).toHaveProperty('id');
  expect(contractData).toHaveProperty('config');
}

/**
 * Helper function to validate document result
 * @param {string} resultStr - The raw result string containing document data
 */
function validateDocumentResult(resultStr) {
  expect(() => JSON.parse(resultStr)).not.toThrow();
  const documentData = JSON.parse(resultStr);
  expect(documentData).toBeDefined();
  // Documents can be arrays or single objects
  if (Array.isArray(documentData)) {
    expect(documentData.length).toBeGreaterThanOrEqual(0);
    // Validate each document in the array has ownerId
    documentData.forEach(document => {
      expect(document).toHaveProperty('ownerId');
    });
  } else {
    expect(documentData).toBeInstanceOf(Object);
    // Validate single document has ownerId
    expect(documentData).toHaveProperty('ownerId');
  }
}

/**
 * Helper function to validate numeric results and ensure they're valid
 * @param {string} resultStr - The raw result string
 * @param {string} propertyName - The property name to extract
 * @returns {number} - The validated numeric value
 */
function validateNumericResult(resultStr, propertyName = 'balance') {
  const numericValue = parseNumericResult(resultStr, propertyName);
  expect(numericValue).not.toBeNaN();
  expect(numericValue).toBeGreaterThanOrEqual(0);
  return numericValue;
}

/**
 * Specific validation functions for parameterized tests
 */
function validateIdentityResult(resultStr) {
  expect(() => JSON.parse(resultStr)).not.toThrow();
  const identityData = JSON.parse(resultStr);
  expect(identityData).toHaveProperty('id');
  expect(identityData).toHaveProperty('publicKeys');
  expect(identityData).toHaveProperty('balance');
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
  expect(() => JSON.parse(resultStr)).not.toThrow();
  const keysData = JSON.parse(resultStr);
  expect(keysData).toBeDefined();
  keysData.forEach(key => {
      expect(key).toHaveProperty('keyId')
      expect(key).toHaveProperty('purpose')
    });
}

function validateIdentitiesContractKeysResult(resultStr) {
  expect(() => JSON.parse(resultStr)).not.toThrow();
  const contractKeysData = JSON.parse(resultStr);
  expect(contractKeysData).toBeDefined();
  expect(Array.isArray(contractKeysData)).toBe(true);
  
  contractKeysData.forEach(identityResult => {
    expect(identityResult).toHaveProperty('identityId');
    expect(identityResult).toHaveProperty('keys');
    expect(Array.isArray(identityResult.keys)).toBe(true);
    
    identityResult.keys.forEach(key => {
      expect(key).toHaveProperty('keyId');
      expect(key).toHaveProperty('purpose');
      expect(key).toHaveProperty('keyType');
      expect(key).toHaveProperty('publicKeyData');
      expect(key).toHaveProperty('securityLevel');
    });
  });
}

function validateIdentitiesResult(resultStr) {
  expect(() => JSON.parse(resultStr)).not.toThrow();
  const identitiesData = JSON.parse(resultStr);
  expect(identitiesData).toBeDefined();
  
  if (Array.isArray(identitiesData)) {
    expect(identitiesData.length).toBeGreaterThanOrEqual(0);
    // Validate each identity using the single identity validator
    identitiesData.forEach(identity => {
      validateIdentityResult(JSON.stringify(identity));
    });
  } else {
    // Single identity - use the existing validator
    validateIdentityResult(JSON.stringify(identitiesData));
  }
}

function validateBalancesResult(resultStr) {
  expect(() => JSON.parse(resultStr)).not.toThrow();
  const balancesData = JSON.parse(resultStr);
  expect(balancesData).toBeDefined();
  if (Array.isArray(balancesData)) {
    expect(balancesData.length).toBeGreaterThanOrEqual(0);
    // Validate each balance object in the array
    balancesData.forEach(balanceObj => {
      expect(balanceObj).toHaveProperty('balance');
    });
  }
}

function validateBalanceAndRevisionResult(resultStr) {
  expect(() => JSON.parse(resultStr)).not.toThrow();
  const data = JSON.parse(resultStr);
  expect(data).toBeDefined();
  expect(data).toBeInstanceOf(Object);
  expect(data).toHaveProperty('balance');
  expect(data).toHaveProperty('revision');
}

function validateTokenBalanceResult(resultStr) {
  expect(() => JSON.parse(resultStr)).not.toThrow();
  const tokenData = JSON.parse(resultStr);
  expect(tokenData).toBeDefined();
  tokenData.forEach(token => {
    expect(token).toHaveProperty('balance');
  });
}

function validateTokenInfoResult(resultStr) {
  expect(() => JSON.parse(resultStr)).not.toThrow();
  const tokenInfoData = JSON.parse(resultStr);
  expect(tokenInfoData).toBeDefined();
  tokenInfoData.forEach(token => {
    expect(token).toHaveProperty('isFrozen');
  });
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
      expect(contractsData).toHaveProperty('dataContracts');
      expect(typeof contractsData.dataContracts).toBe('object');
      
      // Validate each contract using validateContractResult
      Object.values(contractsData.dataContracts).forEach(contract => {
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
        validateContractResult(JSON.stringify(resultData.data));
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
        expect(contractsData).toHaveProperty('dataContracts');
        expect(typeof contractsData.dataContracts).toBe('object');
        
        // Validate each contract using validateContractResult
        Object.values(contractsData.dataContracts).forEach(contract => {
          validateContractResult(JSON.stringify(contract));
        });
      } else {
        validateResultWithoutProof(result);
        // Multiple contracts result should be valid JSON
        expect(() => JSON.parse(result.result)).not.toThrow();
        const contractsData = JSON.parse(result.result);
        expect(contractsData).toBeDefined();
        expect(contractsData).toHaveProperty('dataContracts');
        expect(typeof contractsData.dataContracts).toBe('object');
        
        // Validate each contract using validateContractResult
        Object.values(contractsData.dataContracts).forEach(contract => {
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
          expect(Object.keys(JSON.parse(result))).toEqual(expect.arrayContaining([
            'version', 'node', 'chain', 'network', 'stateSync', 'time'
          ]));
        }
      },
      { 
        name: 'getTotalCreditsInPlatform', 
        hasProofSupport: true, 
        needsParameters: false,
        validateFn: (result) => {
          expect(result).toBeDefined();
          expect(result).toMatch(/\d+|credits|balance/i);
        }
      },
      { 
        name: 'getCurrentQuorumsInfo', 
        hasProofSupport: false, // No proof function in SDK 
        needsParameters: false,
        validateFn: (result) => {
          expect(() => JSON.parse(result)).not.toThrow();
          const quorumsData = JSON.parse(result);
          expect(quorumsData).toBeDefined();
          expect(quorumsData).toHaveProperty('quorums');
          expect(Array.isArray(quorumsData.quorums)).toBe(true);
        }
      },
      { 
        name: 'getPrefundedSpecializedBalance', 
        hasProofSupport: true, 
        needsParameters: true,
        validateFn: (result) => {
          expect(() => JSON.parse(result)).not.toThrow();
          const balanceData = JSON.parse(result);
          expect(balanceData).toBeDefined();
          expect(balanceData).toHaveProperty('identityId');
          expect(balanceData).toHaveProperty('balance');
        }
      }
    ];

    systemQueries.forEach(({ name, hasProofSupport, needsParameters, validateFn }) => {
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

  test.describe('Epoch & Block Queries', () => {
    const epochQueries = [
      { 
        name: 'getCurrentEpoch', 
        hasProofSupport: true, 
        needsParameters: false,
        validateFn: (result) => {
          expect(result).toBeDefined();
          expect(result).toMatch(/\d+|epoch/i);
        }
      },
      { 
        name: 'getEpochsInfo', 
        hasProofSupport: true, 
        needsParameters: true,
        validateFn: (result) => {
          expect(() => JSON.parse(result)).not.toThrow();
          const epochData = JSON.parse(result);
          expect(epochData).toBeDefined();
          expect(typeof epochData === 'object').toBe(true);
        }
      },
      { 
        name: 'getFinalizedEpochInfos', 
        hasProofSupport: true, 
        needsParameters: true,
        validateFn: (result) => {
          expect(() => JSON.parse(result)).not.toThrow();
          const epochData = JSON.parse(result);
          expect(epochData).toBeDefined();
          expect(typeof epochData === 'object').toBe(true);
        }
      },
      { 
        name: 'getEvonodesProposedEpochBlocksByIds', 
        hasProofSupport: false, // Proof support not yet implemented in SDK
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
        hasProofSupport: false, // Proof support not yet implemented in SDK
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
          expect(Array.isArray(tokenStatuses)).toBe(true);
          tokenStatuses.forEach(token => {
            expect(token).toHaveProperty('isPaused');
            expect(typeof token.isPaused).toBe('boolean');
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
          expect(Array.isArray(priceData)).toBe(true);
          priceData.forEach(token => {
            expect(token).toHaveProperty('basePrice');
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
          expect(contractInfo).toHaveProperty('contractId');
        }
      },
      { 
        name: 'getTokenPerpetualDistributionLastClaim', 
        hasProofSupport: false, 
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
          expect(supplyData).toHaveProperty('totalSupply');
        }
      }
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
      
      // Wait a bit for the error to appear
      await evoSdkPage.page.waitForTimeout(1000);
      
      // Check for error status
      const statusBanner = evoSdkPage.page.locator('#statusBanner');
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
      
      // Should contain status data with version info
      expect(result.result).toContain('version');
      
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
          expect(result).toContain('currentProtocolVersion');
        }
      },
      { 
        name: 'getProtocolVersionUpgradeVoteStatus', 
        hasProofSupport: false, // Proof support not yet implemented in SDK
        needsParameters: true,
        validateFn: (result) => {
          expect(() => JSON.parse(result)).not.toThrow();
          const voteData = JSON.parse(result);
          expect(voteData).toBeDefined();
          expect(typeof voteData === 'object').toBe(true);
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
        hasProofSupport: false, // Not working currently
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
        } else {
          test.skip('with proof info', async () => {
            // Proof support not yet implemented for this query
          });
        }
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
  });
});
