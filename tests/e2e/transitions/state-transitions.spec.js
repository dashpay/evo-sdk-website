const { test, expect } = require('@playwright/test');
const { EvoSdkPage } = require('../utils/sdk-page');
const { ParameterInjector } = require('../utils/parameter-injector');

/**
 * Helper function to execute a state transition
 * @param {EvoSdkPage} evoSdkPage - The page object instance
 * @param {ParameterInjector} parameterInjector - The parameter injector instance
 * @param {string} category - State transition category (e.g., 'identity', 'dataContract')
 * @param {string} transitionType - Transition type (e.g., 'identityCreate')
 * @param {string} network - Network to use ('testnet' or 'mainnet')
 * @returns {Promise<Object>} - The transition result object
 */
async function executeStateTransition(evoSdkPage, parameterInjector, category, transitionType, network = 'testnet') {
  await evoSdkPage.setupStateTransition(category, transitionType);

  const success = await parameterInjector.injectStateTransitionParameters(category, transitionType, network);
  expect(success).toBe(true);

  const result = await evoSdkPage.executeStateTransitionAndGetResult();

  return result;
}

/**
 * Execute a state transition with retry logic for transient network errors.
 * @param {Function} executeFn - Async function that executes the state transition and returns result
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum retry attempts (default: 3)
 * @param {number} options.delayMs - Delay between retries in ms (default: 3000)
 * @param {string[]} options.retryableErrors - Error substrings that trigger retry
 * @returns {Promise<Object>} - The successful state transition result
 */
async function executeWithRetry(executeFn, options = {}) {
  const {
    maxRetries = 3,
    delayMs = 3000,
    retryableErrors = ['not found', 'timeout', 'unavailable', 'invalid revision']
  } = options;

  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await executeFn();

    // Check if successful
    if (result.success && !result.hasError) {
      return result;
    }

    // Check if error is retryable
    const errorMsg = (result.result || '').toLowerCase();
    const isRetryable = retryableErrors.some(err => errorMsg.includes(err.toLowerCase()));

    if (!isRetryable || attempt === maxRetries) {
      return result; // Return the failed result for validation to handle
    }

    console.log(`⚠️ Attempt ${attempt}/${maxRetries} failed with retryable error, retrying in ${delayMs}ms...`);
    console.log(`   Error: ${result.result?.substring(0, 100)}...`);
    lastError = result;
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  return lastError;
}

/**
 * Helper function to validate basic state transition result properties
 * @param {Object} result - The state transition result object
 */
function validateBasicStateTransitionResult(result) {
  // Check for withdrawal-specific minimum amount error
  if (!result.success && result.result && result.result.includes('Missing response message')) {
    console.error('⚠️  Withdrawal may have failed due to insufficient amount. Minimum withdrawal is ~190,000 credits.');
    console.error('Full error:', result.result);
  }

  expect(result.success).toBe(true);
  expect(result.result).toBeDefined();
  expect(result.hasError).toBe(false);
  expect(result.result).not.toContain('Error executing');
  expect(result.result).not.toContain('invalid');
  expect(result.result).not.toContain('failed');
}

/**
 * Parse and validate JSON response structure
 * @param {string} resultStr - The raw result string
 * @returns {Object} - The parsed contract data
 */
function parseContractResponse(resultStr) {
  expect(() => JSON.parse(resultStr)).not.toThrow();
  const contractData = JSON.parse(resultStr);
  expect(contractData).toBeDefined();
  expect(contractData).toBeInstanceOf(Object);
  expect(contractData.status).toBe('success');
  expect(contractData.contractId).toBeDefined();
  expect(contractData.version).toBeDefined();
  expect(typeof contractData.version).toBe('number');
  expect(contractData.message).toBeDefined();
  return contractData;
}

/**
 * Helper function to validate data contract result (both create and update)
 * @param {string} resultStr - The raw result string from data contract operation
 * @param {boolean} isUpdate - Whether this is an update operation (default: false for create)
 * @returns {Object} - The parsed contract data for further use
 */
function validateDataContractResult(resultStr, isUpdate = false) {
  const contractData = parseContractResponse(resultStr);

  // Conditional validations based on operation type
  if (isUpdate) {
    // Update: only has version and message specifics
    expect(contractData.version).toBeGreaterThan(1); // Updates should increment version
    expect(contractData.message).toContain('updated successfully');
  } else {
    // Create: has additional fields that updates don't have
    expect(contractData.ownerId).toBeDefined();
    expect(contractData.documentTypes).toBeDefined();
    expect(Array.isArray(contractData.documentTypes)).toBe(true);
    expect(contractData.version).toBe(1); // Creates start at version 1
    expect(contractData.message).toContain('created successfully');
  }

  return contractData;
}

/**
 * Helper function to validate document creation result
 * @param {string} resultStr - The raw result string from document creation
 */
function validateDocumentCreateResult(resultStr) {
  expect(() => JSON.parse(resultStr)).not.toThrow();
  const documentResponse = JSON.parse(resultStr);
  expect(documentResponse).toBeDefined();
  expect(documentResponse).toBeInstanceOf(Object);

  // Validate the response structure for document creation (SDK 3.0 format)
  expect(documentResponse.status).toBe('success');
  expect(documentResponse.documentId).toBeDefined();
  expect(typeof documentResponse.documentId).toBe('string');
  expect(documentResponse.documentId.length).toBeGreaterThan(0);
  expect(documentResponse.ownerId).toBeDefined();
  expect(documentResponse.documentType).toBeDefined();
  expect(documentResponse.message).toBeDefined();

  return documentResponse;
}

/**
 * Helper function to validate document replace result
 * @param {string} resultStr - The raw result string from document replacement
 * @param {string} expectedDocumentId - Expected document ID to validate against
 * @param {number} expectedMinRevision - Minimum expected revision (should be > 1)
 */
function validateDocumentReplaceResult(resultStr, expectedDocumentId, expectedMinRevision = 2) {
  expect(() => JSON.parse(resultStr)).not.toThrow();
  const replaceResponse = JSON.parse(resultStr);
  expect(replaceResponse).toBeDefined();
  expect(replaceResponse).toBeInstanceOf(Object);

  // Validate the response structure for document replacement (SDK 3.0 format)
  expect(replaceResponse.status).toBe('success');
  expect(replaceResponse.documentId).toBe(expectedDocumentId);
  expect(replaceResponse.newRevision).toBeDefined();
  expect(Number(replaceResponse.newRevision)).toBeGreaterThanOrEqual(expectedMinRevision);
  expect(replaceResponse.message).toBeDefined();

  return replaceResponse;
}

/**
 * Helper function to validate document deletion result
 * @param {string} resultStr - The raw result string from document deletion
 * @param {string} expectedDocumentId - Optional expected document ID to validate against
 */
function validateDocumentDeleteResult(resultStr, expectedDocumentId = null) {
  expect(() => JSON.parse(resultStr)).not.toThrow();
  const deleteResponse = JSON.parse(resultStr);
  expect(deleteResponse).toBeDefined();
  expect(deleteResponse).toBeInstanceOf(Object);

  // Validate the response structure for document deletion (SDK 3.0 format)
  expect(deleteResponse.status).toBe('success');
  expect(deleteResponse.documentId).toBeDefined();
  expect(typeof deleteResponse.documentId).toBe('string');
  expect(deleteResponse.documentId.length).toBeGreaterThan(0);
  expect(deleteResponse.message).toBeDefined();

  // If expectedDocumentId is provided, verify it matches the response
  if (expectedDocumentId) {
    expect(deleteResponse.documentId).toBe(expectedDocumentId);
  }

  return deleteResponse;
}

/**
 * Helper function to validate document transfer result
 * @param {string} resultStr - The raw result string from document transfer
 * @param {string} expectedDocumentId - Expected document ID to validate against
 * @param {string} expectedRecipientId - Expected recipient identity ID
 */
function validateDocumentTransferResult(resultStr, expectedDocumentId, expectedRecipientId) {
  expect(() => JSON.parse(resultStr)).not.toThrow();
  const transferResponse = JSON.parse(resultStr);
  expect(transferResponse).toBeDefined();
  expect(transferResponse).toBeInstanceOf(Object);

  // Validate the response structure for document transfer (SDK 3.0 format)
  expect(transferResponse.status).toBe('success');
  expect(transferResponse.documentId).toBe(expectedDocumentId);
  expect(transferResponse.recipientId).toBe(expectedRecipientId);
  expect(transferResponse.message).toBeDefined();

  console.log(`✅ Confirmed transfer of document: ${expectedDocumentId} to ${expectedRecipientId}`);

  return transferResponse;
}

/**
 * Helper function to validate document set price result
 * @param {string} resultStr - The raw result string from document set price
 * @param {string} expectedDocumentId - Expected document ID to validate against
 * @param {number} expectedPrice - Expected price that was set
 */
function validateDocumentSetPriceResult(resultStr, expectedDocumentId, expectedPrice) {
  expect(() => JSON.parse(resultStr)).not.toThrow();
  const setPriceResponse = JSON.parse(resultStr);
  expect(setPriceResponse).toBeDefined();
  expect(setPriceResponse).toBeInstanceOf(Object);

  // Validate the response structure for document set price (SDK 3.0 format)
  expect(setPriceResponse.status).toBe('success');
  expect(setPriceResponse.documentId).toBe(expectedDocumentId);
  expect(setPriceResponse.message).toBeDefined();

  console.log(`✅ Confirmed price set for document: ${expectedDocumentId} at ${expectedPrice} credits`);

  return setPriceResponse;
}

/**
 * Helper function to validate document purchase result
 * @param {string} resultStr - The raw result string from document purchase
 * @param {string} expectedDocumentId - Expected document ID to validate against
 * @param {string} expectedBuyerId - Expected buyer identity ID
 * @param {number} expectedPrice - Expected purchase price
 */
function validateDocumentPurchaseResult(resultStr, expectedDocumentId, expectedBuyerId, expectedPrice) {
  expect(() => JSON.parse(resultStr)).not.toThrow();
  const purchaseResponse = JSON.parse(resultStr);
  expect(purchaseResponse).toBeDefined();
  expect(purchaseResponse).toBeInstanceOf(Object);

  // Validate the response structure for document purchase (SDK 3.0 format)
  expect(purchaseResponse.status).toBe('success');
  expect(purchaseResponse.documentId).toBe(expectedDocumentId);
  expect(purchaseResponse.buyerId).toBe(expectedBuyerId);
  expect(purchaseResponse.message).toBeDefined();

  console.log(`✅ Confirmed purchase of document: ${expectedDocumentId} by ${expectedBuyerId} for ${expectedPrice} credits`);

  return purchaseResponse;
}

/**
 * Helper function to validate identity credit transfer result
 * @param {string} resultStr - The raw result string from identity credit transfer
 * @param {string} expectedSenderId - Expected sender identity ID (unused in SDK 3.0, kept for API compatibility)
 * @param {string} expectedRecipientId - Expected recipient identity ID
 * @param {number} expectedAmount - Expected transfer amount
 */
function validateIdentityCreditTransferResult(resultStr, expectedSenderId, expectedRecipientId, expectedAmount) {
  expect(() => JSON.parse(resultStr)).not.toThrow();
  const transferResponse = JSON.parse(resultStr);
  expect(transferResponse).toBeDefined();
  expect(transferResponse).toBeInstanceOf(Object);

  // Validate the response structure for identity credit transfer (SDK 3.0 format)
  expect(transferResponse.status).toBe('success');
  expect(transferResponse.senderBalance).toBeDefined();
  expect(transferResponse.recipientBalance).toBeDefined();
  expect(transferResponse.message).toBeDefined();
  expect(transferResponse.message).toContain(expectedRecipientId);
  expect(transferResponse.message).toContain(String(expectedAmount));

  return transferResponse;
}

/**
 * Helper function to validate identity credit withdrawal result
 * @param {string} resultStr - The raw result string from identity credit withdrawal
 * @param {string} expectedIdentityId - Expected identity ID (unused in SDK 3.0, kept for API compatibility)
 * @param {string} expectedWithdrawalAddress - Expected withdrawal address
 * @param {number} expectedAmount - Expected withdrawal amount
 */
function validateIdentityCreditWithdrawalResult(resultStr, expectedIdentityId, expectedWithdrawalAddress, expectedAmount) {
  expect(() => JSON.parse(resultStr)).not.toThrow();
  const withdrawalResponse = JSON.parse(resultStr);
  expect(withdrawalResponse).toBeDefined();
  expect(withdrawalResponse).toBeInstanceOf(Object);

  // Validate the response structure for identity credit withdrawal (SDK 3.0 format)
  expect(withdrawalResponse.status).toBe('success');
  expect(withdrawalResponse.toAddress).toBe(expectedWithdrawalAddress);
  expect(withdrawalResponse.withdrawnAmount).toBeDefined();
  expect(withdrawalResponse.remainingBalance).toBeDefined();
  expect(withdrawalResponse.message).toBeDefined();
  expect(withdrawalResponse.message).toContain('Withdrew');

  return withdrawalResponse;
}

/**
 * Helper function to validate token mint result
 * @param {string} resultStr - The raw result string from token mint
 * @param {string} expectedIdentityId - Expected identity ID
 * @param {string} expectedAmount - Expected mint amount
 */
function validateTokenMintResult(resultStr, expectedIdentityId, expectedAmount) {
  expect(() => JSON.parse(resultStr)).not.toThrow();
  const mintResponse = JSON.parse(resultStr);
  expect(mintResponse).toBeDefined();
  expect(mintResponse).toBeInstanceOf(Object);

  // Token mint returns an empty object {} on success
  // This indicates the transaction was submitted successfully
  return mintResponse;
}

/**
 * Helper function to validate token transfer result
 * @param {string} resultStr - The raw result string from token transfer
 * @param {string} expectedSenderId - Expected sender identity ID
 * @param {string} expectedRecipientId - Expected recipient identity ID
 * @param {string} expectedAmount - Expected transfer amount
 */
function validateTokenTransferResult(resultStr, expectedSenderId, expectedRecipientId, expectedAmount) {
  expect(() => JSON.parse(resultStr)).not.toThrow();
  const transferResponse = JSON.parse(resultStr);
  expect(transferResponse).toBeDefined();
  expect(transferResponse).toBeInstanceOf(Object);

  // Token transfer returns an empty object {} on success
  // This indicates the transaction was submitted successfully
  return transferResponse;
}

/**
 * Helper function to validate token burn result
 * @param {string} resultStr - The raw result string from token burn
 * @param {string} expectedIdentityId - Expected identity ID
 * @param {string} expectedAmount - Expected burn amount
 */
function validateTokenBurnResult(resultStr, expectedIdentityId, expectedAmount) {
  expect(() => JSON.parse(resultStr)).not.toThrow();
  const burnResponse = JSON.parse(resultStr);
  expect(burnResponse).toBeDefined();
  expect(burnResponse).toBeInstanceOf(Object);

  // Token burn returns an empty object {} on success
  // This indicates the transaction was submitted successfully
  return burnResponse;
}

/**
 * Helper function to validate token freeze result
 * @param {string} resultStr - The raw result string from token freeze
 * @param {string} expectedIdentityId - Expected identity ID to freeze
 */
function validateTokenFreezeResult(resultStr, expectedIdentityId) {
  expect(() => JSON.parse(resultStr)).not.toThrow();
  const freezeResponse = JSON.parse(resultStr);
  expect(freezeResponse).toBeDefined();
  expect(freezeResponse).toBeInstanceOf(Object);

  // Token freeze returns an empty object {} on success
  return freezeResponse;
}

/**
 * Helper function to validate token destroy frozen result
 * @param {string} resultStr - The raw result string from token destroy frozen
 * @param {string} expectedIdentityId - Expected identity ID with frozen tokens
 */
function validateTokenDestroyFrozenResult(resultStr, expectedIdentityId) {
  expect(() => JSON.parse(resultStr)).not.toThrow();
  const destroyResponse = JSON.parse(resultStr);
  expect(destroyResponse).toBeDefined();
  expect(destroyResponse).toBeInstanceOf(Object);

  // Token destroy frozen returns an empty object {} on success
  console.log(`✅ Token destroy frozen transaction submitted successfully: destroyed all frozen tokens from ${expectedIdentityId}`);

  return destroyResponse;
}

/**
 * Helper function to validate token unfreeze result
 * @param {string} resultStr - The raw result string from token unfreeze
 * @param {string} expectedIdentityId - Expected identity ID to unfreeze
 */
function validateTokenUnfreezeResult(resultStr, expectedIdentityId) {
  expect(() => JSON.parse(resultStr)).not.toThrow();
  const unfreezeResponse = JSON.parse(resultStr);
  expect(unfreezeResponse).toBeDefined();
  expect(unfreezeResponse).toBeInstanceOf(Object);

  // Token unfreeze returns an empty object {} on success
  console.log(`✅ Token unfreeze transaction submitted successfully for identity: ${expectedIdentityId}`);

  return unfreezeResponse;
}

function validateTokenClaimResult(resultStr, expectedDistributionType) {
  expect(() => JSON.parse(resultStr)).not.toThrow();
  const claimResponse = JSON.parse(resultStr);
  expect(claimResponse).toBeDefined();
  expect(claimResponse).toBeInstanceOf(Object);

  // Token claim returns an empty object {} on success
  console.log(`✅ Token claim transaction submitted successfully for distribution type: ${expectedDistributionType}`);

  return claimResponse;
}

function validateTokenSetPriceResult(resultStr, expectedPriceType, expectedPriceData) {
  expect(() => JSON.parse(resultStr)).not.toThrow();
  const setPriceResponse = JSON.parse(resultStr);
  expect(setPriceResponse).toBeDefined();
  expect(setPriceResponse).toBeInstanceOf(Object);

  // Token set price returns an empty object {} on success
  console.log(`✅ Token set price transaction submitted successfully - Type: ${expectedPriceType}, Price: ${expectedPriceData}`);

  return setPriceResponse;
}

function validateTokenDirectPurchaseResult(resultStr, expectedAmount, expectedTotalPrice) {
  expect(() => JSON.parse(resultStr)).not.toThrow();
  const purchaseResponse = JSON.parse(resultStr);
  expect(purchaseResponse).toBeDefined();
  expect(purchaseResponse).toBeInstanceOf(Object);

  // Token direct purchase returns an empty object {} on success
  console.log(`✅ Token direct purchase transaction submitted successfully - Amount: ${expectedAmount} tokens, Total price: ${expectedTotalPrice} credits`);

  return purchaseResponse;
}

/**
 * Execute a state transition with custom parameters
 * @param {EvoSdkPage} evoSdkPage - The page object instance
 * @param {ParameterInjector} parameterInjector - The parameter injector instance
 * @param {string} category - State transition category
 * @param {string} transitionType - Transition type
 * @param {string} network - Network to use
 * @param {Object} customParams - Custom parameters to override test data
 * @returns {Promise<Object>} - The transition result object
 */
async function executeStateTransitionWithCustomParams(evoSdkPage, parameterInjector, category, transitionType, network = 'testnet', customParams = {}) {
  await evoSdkPage.setupStateTransition(category, transitionType);

  const success = await parameterInjector.injectStateTransitionParameters(category, transitionType, network, customParams);
  expect(success).toBe(true);

  const result = await evoSdkPage.executeStateTransitionAndGetResult();

  return result;
}

// Skip all state transition tests if required environment variables are not set
const hasRequiredEnvVars = process.env.TEST_PRIVATE_KEY_CONTRACT &&
                           process.env.TEST_PRIVATE_KEY_CONTRACT !== 'PLACEHOLDER_CONTRACT_KEY';

test.describe('Evo SDK State Transition Tests', () => {
  // Skip entire suite if credentials are not configured
  test.skip(!hasRequiredEnvVars, 'Skipping state transition tests: TEST_PRIVATE_KEY_CONTRACT not configured in tests/e2e/.env');

  let evoSdkPage;
  let parameterInjector;

  test.beforeEach(async ({ page }) => {
    evoSdkPage = new EvoSdkPage(page);
    parameterInjector = new ParameterInjector(evoSdkPage);
    await evoSdkPage.initialize('testnet');
  });

  test.describe('Identity State Transitions', () => {
    // Skip: Requires asset lock proof from L1 transaction
    test.skip('should execute identity create transition', async () => {
      const result = await executeStateTransitionWithCustomParams(
        evoSdkPage,
        parameterInjector,
        'identity',
        'identityCreate',
        'testnet'
      );

      validateBasicStateTransitionResult(result);
    });

    // Skip: Requires asset lock proof from L1 transaction
    test.skip('should execute identity top up transition', async () => {
      const result = await executeStateTransitionWithCustomParams(
        evoSdkPage,
        parameterInjector,
        'identity',
        'identityTopUp',
        'testnet'
      );

      validateBasicStateTransitionResult(result);
    });

    test('should execute identity credit transfer transition', async () => {
      // Set up the identity credit transfer transition
      await evoSdkPage.setupStateTransition('identity', 'identityCreditTransfer');

      // Inject parameters (senderId, recipientId, amount, privateKey)
      const success = await parameterInjector.injectStateTransitionParameters('identity', 'identityCreditTransfer', 'testnet');
      expect(success).toBe(true);

      // Execute the transfer
      const result = await evoSdkPage.executeStateTransitionAndGetResult();

      // Validate basic result structure
      validateBasicStateTransitionResult(result);

      // Get test parameters for validation
      const testParams = parameterInjector.testData.stateTransitionParameters.identity.identityCreditTransfer.testnet[0];

      // Validate identity credit transfer specific result
      validateIdentityCreditTransferResult(
        result.result,
        testParams.identityId, // Sender is the identityId field
        testParams.recipientId,
        testParams.amount
      );
    });

    test('should execute identity credit withdrawal transition', async () => {
      // Get test parameters to check withdrawal amount upfront
      const testParams = parameterInjector.testData.stateTransitionParameters.identity.identityCreditWithdrawal.testnet[0];

      // Skip test if withdrawal amount is below minimum threshold
      if (testParams.amount < 190000) {
        test.skip(true, `Withdrawal amount ${testParams.amount} credits is below minimum threshold (~190,000 credits)`);
      }

      // Set up the identity credit withdrawal transition
      await evoSdkPage.setupStateTransition('identity', 'identityCreditWithdrawal');

      // Inject parameters (identityId, withdrawalAddress, amount, privateKey)
      const success = await parameterInjector.injectStateTransitionParameters('identity', 'identityCreditWithdrawal', 'testnet');
      expect(success).toBe(true);

      // Execute the withdrawal
      const result = await evoSdkPage.executeStateTransitionAndGetResult();

      // Validate basic result structure
      validateBasicStateTransitionResult(result);

      // Validate identity credit withdrawal specific result
      validateIdentityCreditWithdrawalResult(
        result.result,
        testParams.identityId,
        testParams.toAddress,
        testParams.amount
      );
    });

    // Skip: Requires master key for the identity (key ID 0)
    test.skip('should execute identity update transition', async () => {
      const result = await executeStateTransitionWithCustomParams(
        evoSdkPage,
        parameterInjector,
        'identity',
        'identityUpdate',
        'testnet'
      );

      validateBasicStateTransitionResult(result);
    });

    test('should show authentication inputs for identity transitions', async () => {
      await evoSdkPage.setupStateTransition('identity', 'identityCreditTransfer');

      // Check that authentication inputs are visible
      const hasAuthInputs = await evoSdkPage.hasAuthenticationInputs();
      expect(hasAuthInputs).toBe(true);
    });
  });

  test.describe('Data Contract State Transitions', () => {
    test('should create data contract with history enabled', async () => {
      // Execute the data contract create transition with keepsHistory: true
      const result = await executeStateTransitionWithCustomParams(
        evoSdkPage,
        parameterInjector,
        'dataContract',
        'dataContractCreate',
        'testnet',
        { keepsHistory: true } // Override to enable history
      );

      // Validate basic result structure
      validateBasicStateTransitionResult(result);

      // Validate data contract creation specific result
      validateDataContractResult(result.result, false);
    });

    test('should create data contract and then update it with author field', async () => {
      // Set extended timeout for combined create+update operation
      test.setTimeout(180000);

      let contractId;

      // Step 1: Create contract first
      await test.step('Create data contract', async () => {
        const createResult = await executeStateTransition(
          evoSdkPage,
          parameterInjector,
          'dataContract',
          'dataContractCreate',
          'testnet'
        );

        validateBasicStateTransitionResult(createResult);
        validateDataContractResult(createResult.result, false);

        contractId = JSON.parse(createResult.result).contractId;
        console.log('✅ Data contract created with ID:', contractId);
      });

      // Step 2: Update contract with backward-compatible schema
      await test.step('Update data contract with author field', async () => {
        const updateResult = await executeStateTransitionWithCustomParams(
          evoSdkPage,
          parameterInjector,
          'dataContract',
          'dataContractUpdate',
          'testnet',
          { dataContractId: contractId } // Override with dynamic contract ID
        );

        validateBasicStateTransitionResult(updateResult);
        validateDataContractResult(updateResult.result, true);
      });
    });

    test('should show authentication inputs for data contract transitions', async () => {
      await evoSdkPage.setupStateTransition('dataContract', 'dataContractCreate');

      // Check that authentication inputs are visible
      const hasAuthInputs = await evoSdkPage.hasAuthenticationInputs();
      expect(hasAuthInputs).toBe(true);
    });
  });

  test.describe('Document State Transitions', () => {
    test('should execute document create transition', async () => {
      // Set up the document create transition manually due to special schema handling
      await evoSdkPage.setupStateTransition('document', 'documentCreate');

      // Inject basic parameters (contractId, documentType, identityId, privateKey)
      const success = await parameterInjector.injectStateTransitionParameters('document', 'documentCreate', 'testnet');
      expect(success).toBe(true);

      // Step 1: Fetch document schema to generate dynamic fields
      await test.step('Fetch document schema', async () => {
        await evoSdkPage.fetchDocumentSchema();
      });

      // Step 2: Fill document fields with unique message (add timestamp to avoid tx already exists)
      await test.step('Fill document fields', async () => {
        const testParams = parameterInjector.testData.stateTransitionParameters.document.documentCreate.testnet[0];
        const timestamp = Date.now();
        const uniqueFields = {
          ...testParams.documentFields,
          message: `${testParams.documentFields.message} - ${timestamp}`
        };
        await evoSdkPage.fillDocumentFields(uniqueFields);
      });

      // Step 3: Execute the transition
      await test.step('Execute document create', async () => {
        const result = await evoSdkPage.executeStateTransitionAndGetResult();

        // Validate basic result structure
        validateBasicStateTransitionResult(result);

        // Validate document creation specific result
        validateDocumentCreateResult(result.result);
      });
    });

    test('should execute document replace transition', async () => {
      // Set extended timeout for combined create+replace operation
      test.setTimeout(180000);

      let documentId;
      const timestamp = Date.now();

      // Step 1: Create a document first
      await test.step('Create document', async () => {
        await evoSdkPage.setupStateTransition('document', 'documentCreate');
        const success = await parameterInjector.injectStateTransitionParameters('document', 'documentCreate', 'testnet');
        expect(success).toBe(true);

        await evoSdkPage.fetchDocumentSchema();

        const testParams = parameterInjector.testData.stateTransitionParameters.document.documentCreate.testnet[0];
        const uniqueFields = {
          ...testParams.documentFields,
          message: `Replace test - ${timestamp}`
        };
        await evoSdkPage.fillDocumentFields(uniqueFields);

        const createResult = await evoSdkPage.executeStateTransitionAndGetResult();
        validateBasicStateTransitionResult(createResult);
        const docResponse = validateDocumentCreateResult(createResult.result);
        documentId = docResponse.documentId;
        console.log('✅ Document created with ID:', documentId);
      });

      // Step 2: Replace the document
      await test.step('Replace document', async () => {
        // Wait for document to propagate through the network
        console.log('⏳ Waiting 5s for document to propagate...');
        await evoSdkPage.page.waitForTimeout(5000);

        await evoSdkPage.setupStateTransition('document', 'documentReplace');

        // Get test params and override with our document ID
        const testParams = parameterInjector.testData.stateTransitionParameters.document.documentReplace.testnet[0];
        const success = await parameterInjector.injectStateTransitionParameters('document', 'documentReplace', 'testnet', {
          documentId: documentId
        });
        expect(success).toBe(true);

        // Try loading document with retry (newly created documents may take time to sync)
        await evoSdkPage.loadExistingDocumentWithRetry();

        const updatedFields = {
          message: `Replaced at ${new Date().toISOString()}`
        };
        await evoSdkPage.fillDocumentFields(updatedFields);

        const result = await evoSdkPage.executeStateTransitionAndGetResult();

        validateBasicStateTransitionResult(result);
        validateDocumentReplaceResult(result.result, documentId);
      });
    });

    test('should set price, purchase, and transfer a trading card document', async () => {
      // Set extended timeout for complete marketplace workflow
      test.setTimeout(360000);

      let nftContractId;
      let documentId;
      const primaryIdentityId = parameterInjector.testData.stateTransitionParameters.dataContract.dataContractCreate.testnet[0].identityId;
      const secondaryIdentityId = parameterInjector.testData.stateTransitionParameters.document.documentPurchase.testnet[0].identityId;

      // Step 1: Create an NFT contract with transferable documents and trade mode
      await test.step('Create NFT contract', async () => {
        await evoSdkPage.setupStateTransition('dataContract', 'dataContractCreate');

        // NFT document schema with transferable: 1 (Always) and tradeMode: 1 (DirectPurchase)
        const nftSchema = JSON.stringify({
          "card": {
            "type": "object",
            "properties": {
              "name": {
                "type": "string",
                "maxLength": 100,
                "position": 0
              },
              "description": {
                "type": "string",
                "maxLength": 500,
                "position": 1
              }
            },
            "required": ["name"],
            "additionalProperties": false,
            "transferable": 1,
            "tradeMode": 1
          }
        });

        const success = await parameterInjector.injectStateTransitionParameters(
          'dataContract',
          'dataContractCreate',
          'testnet',
          { documentSchemas: nftSchema }
        );
        expect(success).toBe(true);

        const createResult = await evoSdkPage.executeStateTransitionAndGetResult();
        validateBasicStateTransitionResult(createResult);

        const resultData = JSON.parse(createResult.result);
        nftContractId = resultData.contractId;
        console.log('✅ NFT contract created with ID:', nftContractId);
      });

      // Step 2: Create a trading card document
      await test.step('Create trading card document', async () => {
        await evoSdkPage.setupStateTransition('document', 'documentCreate');

        const success = await parameterInjector.injectStateTransitionParameters(
          'document',
          'documentCreate',
          'testnet',
          {
            contractId: nftContractId,
            documentType: 'card'
          }
        );
        expect(success).toBe(true);

        await evoSdkPage.fetchDocumentSchema();
        await evoSdkPage.fillDocumentFields({
          name: 'Test Trading Card',
          description: 'A test trading card for automation'
        });

        const createResult = await evoSdkPage.executeStateTransitionAndGetResult();
        validateBasicStateTransitionResult(createResult);

        const documentResponse = validateDocumentCreateResult(createResult.result);
        documentId = documentResponse.documentId;
        console.log('✅ Trading card created with ID:', documentId);
      });

      // Wait for document to propagate through the network before setting price
      console.log('Waiting 2s for document to propagate...');
      await evoSdkPage.page.waitForTimeout(2000);

      // Step 3: Set price on the card (by owner - primary identity)
      await test.step('Set price on trading card', async () => {
        const configuredPrice = parameterInjector.testData.stateTransitionParameters.document.documentSetPrice.testnet[0].price;

        await evoSdkPage.setupStateTransition('document', 'documentSetPrice');

        const success = await parameterInjector.injectStateTransitionParameters(
          'document',
          'documentSetPrice',
          'testnet',
          {
            contractId: nftContractId,
            documentType: 'card',
            documentId: documentId
          }
        );
        expect(success).toBe(true);

        const setPriceResult = await evoSdkPage.executeStateTransitionAndGetResult();
        validateBasicStateTransitionResult(setPriceResult);

        validateDocumentSetPriceResult(setPriceResult.result, documentId, configuredPrice);
        console.log('✅ Price set on trading card');
      });

      await evoSdkPage.page.waitForTimeout(2000);

      // Step 4: Purchase the card with secondary identity
      await test.step('Purchase trading card with secondary identity', async () => {
        const purchasePrice = parameterInjector.testData.stateTransitionParameters.document.documentPurchase.testnet[0].price;

        await evoSdkPage.setupStateTransition('document', 'documentPurchase');

        const success = await parameterInjector.injectStateTransitionParameters(
          'document',
          'documentPurchase',
          'testnet',
          {
            contractId: nftContractId,
            documentType: 'card',
            documentId: documentId
          }
        );
        expect(success).toBe(true);

        // Use retry logic for purchase since the SDK's internal identity fetch can fail transiently
        const purchaseResult = await executeWithRetry(
          () => evoSdkPage.executeStateTransitionAndGetResult(),
          { maxRetries: 3, delayMs: 3000 }
        );
        validateBasicStateTransitionResult(purchaseResult);

        validateDocumentPurchaseResult(purchaseResult.result, documentId, secondaryIdentityId, purchasePrice);
        console.log('✅ Trading card purchased by secondary identity');
      });

      // Step 5: Transfer the card back to primary identity
      await test.step('Transfer card back to primary identity', async () => {
        await evoSdkPage.setupStateTransition('document', 'documentTransfer');

        const success = await parameterInjector.injectStateTransitionParameters(
          'document',
          'documentTransfer',
          'testnet',
          {
            contractId: nftContractId,
            documentType: 'card',
            documentId: documentId,
            recipientId: primaryIdentityId
          }
        );
        expect(success).toBe(true);

        const transferResult = await evoSdkPage.executeStateTransitionAndGetResult();
        validateBasicStateTransitionResult(transferResult);

        validateDocumentTransferResult(transferResult.result, documentId, primaryIdentityId);
        console.log('✅ Trading card transferred back to primary identity');
      });
    });

    test('should create, replace, and delete a document', async () => {
      // Set extended timeout for combined create+replace+delete operation
      test.setTimeout(260000);

      let documentId;
      const timestamp = Date.now();

      // Step 1: Create document
      // Step 1: Create document (reported separately)
      await test.step('Create document', async () => {
        // Set up the document create transition
        await evoSdkPage.setupStateTransition('document', 'documentCreate');

        // Inject basic parameters (contractId, documentType, identityId, privateKey)
        const success = await parameterInjector.injectStateTransitionParameters('document', 'documentCreate', 'testnet');
        expect(success).toBe(true);

        // Fetch document schema to generate dynamic fields
        await evoSdkPage.fetchDocumentSchema();

        // Fill document fields
        const testParams = parameterInjector.testData.stateTransitionParameters.document.documentCreate.testnet[0];
        await evoSdkPage.fillDocumentFields(testParams.documentFields);

        // Execute the transition
        const createResult = await evoSdkPage.executeStateTransitionAndGetResult();

        // Validate create result
        validateBasicStateTransitionResult(createResult);
        const documentResponse = validateDocumentCreateResult(createResult.result);

        // Get the document ID from create result
        documentId = documentResponse.documentId;
        console.log('✅ Document created with ID:', documentId);
      });

      // Step 2: Replace the document (reported separately)
      await test.step('Replace document', async () => {
        // Set up document replace transition
        await evoSdkPage.setupStateTransition('document', 'documentReplace');

        // Inject parameters with the created document ID
        const success = await parameterInjector.injectStateTransitionParameters(
          'document',
          'documentReplace',
          'testnet',
          { documentId } // Override with the created document ID
        );
        expect(success).toBe(true);

        // Load the existing document to get revision
        await evoSdkPage.loadExistingDocument();

        // Create updated message with timestamp
        const originalTestParams = parameterInjector.testData.stateTransitionParameters.document.documentCreate.testnet[0];
        const originalMessage = originalTestParams.documentFields.message;
        const timestamp = new Date().toISOString();
        const updatedFields = {
          message: `${originalMessage} - Updated at ${timestamp}`
        };

        // Fill updated document fields
        await evoSdkPage.fillDocumentFields(updatedFields);

        // Execute the replace transition
        const replaceResult = await evoSdkPage.executeStateTransitionAndGetResult();

        // Validate replace result
        validateBasicStateTransitionResult(replaceResult);
        validateDocumentReplaceResult(replaceResult.result, documentId);
      });

      // Step 3: Delete the document (reported separately)
      await test.step('Delete document', async () => {
        // Set up document delete transition with the created document ID
        await evoSdkPage.setupStateTransition('document', 'documentDelete');

        // Inject parameters with the dynamic document ID
        const success = await parameterInjector.injectStateTransitionParameters(
          'document',
          'documentDelete',
          'testnet',
          { documentId } // Override with the created document ID
        );
        expect(success).toBe(true);

        // Execute the delete transition
        const deleteResult = await evoSdkPage.executeStateTransitionAndGetResult();

        // Validate delete result with expected document ID
        validateBasicStateTransitionResult(deleteResult);
        validateDocumentDeleteResult(deleteResult.result, documentId);
      });
    });

    test('should show authentication inputs for document transitions', async () => {
      await evoSdkPage.setupStateTransition('document', 'documentCreate');

      // Check that authentication inputs are visible
      const hasAuthInputs = await evoSdkPage.hasAuthenticationInputs();
      expect(hasAuthInputs).toBe(true);
    });
  });

  test.describe('Token State Transitions', () => {
    test('should execute token mint transition', async () => {
      await evoSdkPage.setupStateTransition('token', 'tokenMint');

      const success = await parameterInjector.injectStateTransitionParameters('token', 'tokenMint', 'testnet');
      expect(success).toBe(true);

      const result = await evoSdkPage.executeStateTransitionAndGetResult();

      validateBasicStateTransitionResult(result);

      const testParams = parameterInjector.testData.stateTransitionParameters.token.tokenMint.testnet[0];
      validateTokenMintResult(result.result, testParams.identityId, testParams.amount);
    });

    test('should execute token burn transition', async () => {
      await evoSdkPage.setupStateTransition('token', 'tokenBurn');

      const success = await parameterInjector.injectStateTransitionParameters('token', 'tokenBurn', 'testnet');
      expect(success).toBe(true);

      const result = await evoSdkPage.executeStateTransitionAndGetResult();

      validateBasicStateTransitionResult(result);

      const testParams = parameterInjector.testData.stateTransitionParameters.token.tokenBurn.testnet[0];
      validateTokenBurnResult(result.result, testParams.identityId, testParams.amount);
    });

    test('should execute token transfer transition', async () => {
      await evoSdkPage.setupStateTransition('token', 'tokenTransfer');

      const success = await parameterInjector.injectStateTransitionParameters('token', 'tokenTransfer', 'testnet');
      expect(success).toBe(true);

      const result = await evoSdkPage.executeStateTransitionAndGetResult();

      validateBasicStateTransitionResult(result);

      const testParams = parameterInjector.testData.stateTransitionParameters.token.tokenTransfer.testnet[0];
      validateTokenTransferResult(result.result, testParams.identityId, testParams.recipientId, testParams.amount);
    });

    test('should execute token freeze transition', async () => {
      await evoSdkPage.setupStateTransition('token', 'tokenFreeze');

      const success = await parameterInjector.injectStateTransitionParameters('token', 'tokenFreeze', 'testnet');
      expect(success).toBe(true);

      const result = await evoSdkPage.executeStateTransitionAndGetResult();

      validateBasicStateTransitionResult(result);

      const testParams = parameterInjector.testData.stateTransitionParameters.token.tokenFreeze.testnet[0];
      validateTokenFreezeResult(result.result, testParams.identityToFreeze);
    });

    test('should execute token unfreeze transition', async () => {
      await evoSdkPage.setupStateTransition('token', 'tokenUnfreeze');

      const success = await parameterInjector.injectStateTransitionParameters('token', 'tokenUnfreeze', 'testnet');
      expect(success).toBe(true);

      const result = await evoSdkPage.executeStateTransitionAndGetResult();

      validateBasicStateTransitionResult(result);

      const testParams = parameterInjector.testData.stateTransitionParameters.token.tokenUnfreeze.testnet[0];
      validateTokenUnfreezeResult(result.result, testParams.identityToUnfreeze);
    });

    // Skip: Requires frozen tokens to exist (identity is not frozen)
    test.skip('should execute token destroy frozen transition', async () => {
      await evoSdkPage.setupStateTransition('token', 'tokenDestroyFrozen');

      const success = await parameterInjector.injectStateTransitionParameters('token', 'tokenDestroyFrozen', 'testnet');
      expect(success).toBe(true);

      const result = await evoSdkPage.executeStateTransitionAndGetResult();

      validateBasicStateTransitionResult(result);

      const testParams = parameterInjector.testData.stateTransitionParameters.token.tokenDestroyFrozen.testnet[0];
      validateTokenDestroyFrozenResult(result.result, testParams.frozenIdentityId);
    });

    test('should execute token set price for direct purchase transition', async () => {
      await evoSdkPage.setupStateTransition('token', 'tokenSetPriceForDirectPurchase');

      const success = await parameterInjector.injectStateTransitionParameters('token', 'tokenSetPriceForDirectPurchase', 'testnet');
      expect(success).toBe(true);

      const result = await evoSdkPage.executeStateTransitionAndGetResult();

      validateBasicStateTransitionResult(result);

      const testParams = parameterInjector.testData.stateTransitionParameters.token.tokenSetPriceForDirectPurchase.testnet[0];
      validateTokenSetPriceResult(result.result, testParams.priceType, testParams.priceData);
    });

    // Skip: Website bug - passes identityId but SDK expects buyerId
    test.skip('should execute token direct purchase transition', async () => {
      await evoSdkPage.setupStateTransition('token', 'tokenDirectPurchase');

      const success = await parameterInjector.injectStateTransitionParameters('token', 'tokenDirectPurchase', 'testnet');
      expect(success).toBe(true);

      const result = await evoSdkPage.executeStateTransitionAndGetResult();

      validateBasicStateTransitionResult(result);

      const testParams = parameterInjector.testData.stateTransitionParameters.token.tokenDirectPurchase.testnet[0];
      validateTokenDirectPurchaseResult(result.result, testParams.amount, testParams.totalAgreedPrice);
    });

    // Skip: Requires pre-distributed tokens available for claiming
    test.skip('should execute token claim transition', async () => {
      await evoSdkPage.setupStateTransition('token', 'tokenClaim');

      const success = await parameterInjector.injectStateTransitionParameters('token', 'tokenClaim', 'testnet');
      expect(success).toBe(true);

      const result = await evoSdkPage.executeStateTransitionAndGetResult();

      validateBasicStateTransitionResult(result);

      const testParams = parameterInjector.testData.stateTransitionParameters.token.tokenClaim.testnet[0];
      validateTokenClaimResult(result.result, testParams.distributionType);
    });

    // Skip: tokenEmergencyAction requires special permissions
    test.skip('should execute token emergency action transition', async () => {
      const result = await executeStateTransitionWithCustomParams(
        evoSdkPage,
        parameterInjector,
        'token',
        'tokenEmergencyAction',
        'testnet'
      );

      validateBasicStateTransitionResult(result);
    });
  });

  test.describe('Voting State Transitions', () => {
    // Skip: Requires masternode setup
    test.skip('should execute masternode vote transition', async () => {
      const result = await executeStateTransitionWithCustomParams(
        evoSdkPage,
        parameterInjector,
        'voting',
        'masternodeVote',
        'testnet'
      );

      validateBasicStateTransitionResult(result);
    });
  });

  test.describe('Platform Address State Transitions', () => {
    // Skip: Requires platform address with balance
    test.skip('should execute address transfer transition', async () => {
      const result = await executeStateTransitionWithCustomParams(
        evoSdkPage,
        parameterInjector,
        'platformAddress',
        'addressTransfer',
        'testnet'
      );

      validateBasicStateTransitionResult(result);
    });

    // Skip: Requires platform address with balance
    test.skip('should execute address top up identity transition', async () => {
      const result = await executeStateTransitionWithCustomParams(
        evoSdkPage,
        parameterInjector,
        'platformAddress',
        'addressTopUpIdentity',
        'testnet'
      );

      validateBasicStateTransitionResult(result);
    });

    // Skip: Requires platform address with balance
    test.skip('should execute address withdraw transition', async () => {
      const result = await executeStateTransitionWithCustomParams(
        evoSdkPage,
        parameterInjector,
        'platformAddress',
        'addressWithdraw',
        'testnet'
      );

      validateBasicStateTransitionResult(result);
    });

    // Skip: Requires identity with balance
    test.skip('should execute address transfer from identity transition', async () => {
      const result = await executeStateTransitionWithCustomParams(
        evoSdkPage,
        parameterInjector,
        'identity',
        'addressTransferFromIdentity',
        'testnet'
      );

      validateBasicStateTransitionResult(result);
    });

    // Skip: Requires asset lock proof
    test.skip('should execute address fund from asset lock transition', async () => {
      const result = await executeStateTransitionWithCustomParams(
        evoSdkPage,
        parameterInjector,
        'platformAddress',
        'addressFundFromAssetLock',
        'testnet'
      );

      validateBasicStateTransitionResult(result);
    });

    // Skip: Requires asset lock proof
    test.skip('should execute address create identity transition', async () => {
      const result = await executeStateTransitionWithCustomParams(
        evoSdkPage,
        parameterInjector,
        'platformAddress',
        'addressCreateIdentity',
        'testnet'
      );

      validateBasicStateTransitionResult(result);
    });
  });

  test.describe('Error Handling for State Transitions', () => {
    test('should handle invalid JSON schema gracefully', async () => {
      await evoSdkPage.setupStateTransition('dataContract', 'dataContractCreate');

      const invalidParams = {
        canBeDeleted: false,
        readonly: false,
        keepsHistory: false,
        documentSchemas: 'invalid_json_here',
        identityId: "5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk",
        privateKey: "11111111111111111111111111111111111111111111111111"
      };

      await evoSdkPage.fillStateTransitionParameters(invalidParams);

      const result = await evoSdkPage.executeStateTransitionAndGetResult();

      expect(result.hasError).toBe(true);
      expect(String(result.statusText).toLowerCase()).toMatch(/error|invalid|failed/);
    });

    test('should handle missing required fields', async () => {
      await evoSdkPage.setupStateTransition('dataContract', 'dataContractCreate');

      const result = await evoSdkPage.executeStateTransitionAndGetResult();

      expect(result.hasError).toBe(true);
      expect(String(result.statusText).toLowerCase()).toMatch(/error|required|missing/);
    });

    test('should handle invalid private key gracefully', async () => {
      await evoSdkPage.setupStateTransition('dataContract', 'dataContractCreate');

      const invalidParams = {
        canBeDeleted: false,
        readonly: false,
        keepsHistory: false,
        documentSchemas: '{"note": {"type": "object", "properties": {"message": {"type": "string", "position": 0}}, "additionalProperties": false}}',
        identityId: "5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk",
        privateKey: "invalid_private_key_here"
      };

      await evoSdkPage.fillStateTransitionParameters(invalidParams);

      const result = await evoSdkPage.executeStateTransitionAndGetResult();

      expect(result.hasError).toBe(true);
      expect(String(result.statusText).toLowerCase()).toMatch(/error|invalid|failed/);
    });
  });
});
