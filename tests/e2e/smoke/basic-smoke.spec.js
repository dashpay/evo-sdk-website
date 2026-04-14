const { test, expect } = require('@playwright/test');
const { EvoSdkPage } = require('../utils/sdk-page');

/**
 * Filter out placeholder options from dropdown arrays
 * @param {string[]} options - Array of dropdown options
 * @returns {string[]} - Filtered array without placeholders
 */
function filterPlaceholderOptions(options) {
  return options.filter(option =>
    !option.toLowerCase().includes('select') &&
    option.trim() !== ''
  );
}

// Reusable comparator with clear diagnostics
function ensureExactOptions(actual, expected, label) {
  const missing = expected.filter(x => !actual.includes(x));
  const unexpected = actual.filter(x => !expected.includes(x));
  const duplicates = actual.filter((x, i, a) => a.indexOf(x) !== i);

  // Show explicit diffs when failing
  expect(missing, `${label} → Missing: ${JSON.stringify(missing)}`).toEqual([]);
  expect(unexpected, `${label} → Unexpected: ${JSON.stringify(unexpected)}`).toEqual([]);

  // Guard against dupes and count drift
  expect(new Set(actual).size, `${label} → Duplicates: ${JSON.stringify(duplicates)}`).toBe(expected.length);
  expect(actual.length, `${label} → Wrong count (actual ${actual.length} vs expected ${expected.length})`)
    .toBe(expected.length);
}

test.describe('Evo SDK Basic Smoke Tests', () => {
  let evoSdkPage;

  test.beforeEach(async ({ page }) => {
    evoSdkPage = new EvoSdkPage(page);
    await evoSdkPage.initialize('testnet');
  });

  test('should initialize SDK successfully', async () => {
    // Wait for SDK to be fully ready (with retry logic)
    let statusState;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      statusState = await evoSdkPage.getStatusBannerState();

      if (statusState === 'success') {
        break;
      }

      if (statusState === 'loading') {
        // Wait for loading to complete
        await evoSdkPage.waitForSdkReady();
        statusState = await evoSdkPage.getStatusBannerState();

        if (statusState === 'success') {
          break;
        }
      }

      attempts++;
      if (attempts < maxAttempts && statusState !== 'success') {
        // Wait for SDK state to change
        await evoSdkPage.waitForSdkReady();
      }
    }

    // Final check
    expect(statusState).toBe('success');
    
    // Verify network is set to testnet
    const networkIndicator = evoSdkPage.page.locator('#networkIndicator');
    await expect(networkIndicator).toContainText('TESTNET');
  });

  test('should load query categories', async () => {
    await evoSdkPage.setOperationType('queries');
    
    const categories = await evoSdkPage.getAvailableQueryCategories();
    
    // Check that we have the expected categories
    const expectedCategories = [
      'Identity Queries',
      'Data Contract Queries', 
      'Document Queries',
      'Voting & Contested Resources',
      'Protocol & Version',
      'Epoch & Block Queries',
      'Token Queries',
      'Group Queries',
      'System & Utility'
    ];
    
    for (const category of expectedCategories) {
      expect(categories).toContain(category);
    }
  });

  test('should switch between networks', async () => {
    // Test switching to mainnet
    await evoSdkPage.setNetwork('mainnet');
    const mainnetIndicator = evoSdkPage.page.locator('#networkIndicator');
    await expect(mainnetIndicator).toContainText('MAINNET');
    
    // Switch back to testnet
    await evoSdkPage.setNetwork('testnet');
    const testnetIndicator = evoSdkPage.page.locator('#networkIndicator');
    await expect(testnetIndicator).toContainText('TESTNET');
  });

  test('should show query types when category is selected', async () => {
    await evoSdkPage.setOperationType('queries');
    await evoSdkPage.setQueryCategory('identity');
    
    const queryTypes = await evoSdkPage.getAvailableQueryTypes();
    
    // Should have some identity query types
    expect(queryTypes.length).toBeGreaterThan(0);
    expect(queryTypes).toContain('Get Identity');
  });

  test('should show input fields when query type is selected', async () => {
    await evoSdkPage.setOperationType('queries');
    await evoSdkPage.setQueryCategory('identity');
    await evoSdkPage.setQueryType('getIdentity');
    
    // Should show query inputs container
    const queryInputs = evoSdkPage.page.locator('#queryInputs');
    await expect(queryInputs).toBeVisible();
    
    // Should show execute button
    const executeButton = evoSdkPage.page.locator('#executeQuery');
    await expect(executeButton).toBeVisible();
  });

  test('should enable/disable execute button based on form completion', async () => {
    await evoSdkPage.setOperationType('queries');
    await evoSdkPage.setQueryCategory('identity');
    await evoSdkPage.setQueryType('getIdentity');
    
    const executeButton = evoSdkPage.page.locator('#executeQuery');
    
    // Button should be enabled (even without required params for this test)
    await expect(executeButton).toBeVisible();
  });

  test('should clear results when clear button is clicked', async () => {
    await evoSdkPage.setOperationType('queries');
    await evoSdkPage.setQueryCategory('system');
    await evoSdkPage.setQueryType('getStatus');
    
    // Execute a simple query first
    await evoSdkPage.executeQuery();
    
    // Clear results
    await evoSdkPage.clearResults();
    
    // Verify results are cleared
    const resultContent = evoSdkPage.page.locator('#identityInfo');
    await expect(resultContent).toHaveClass(/empty/);
  });

  test('should toggle proof information', async () => {
    await evoSdkPage.setOperationType('queries');
    await evoSdkPage.setQueryCategory('identity');
    await evoSdkPage.setQueryType('getIdentity');

    // Check if proof toggle is available
    const proofContainer = evoSdkPage.page.locator('#proofToggleContainer');
    
    try {
      // Wait for container to potentially appear
      await proofContainer.waitFor({ state: 'visible', timeout: 5000 });
      
      // Test enabling proof info
      const enableSuccess = await evoSdkPage.enableProofInfo();
      if (enableSuccess) {
        const proofToggle = evoSdkPage.page.locator('#proofToggle');
        await expect(proofToggle).toBeChecked();
        
        // Test disabling proof info
        const disableSuccess = await evoSdkPage.disableProofInfo();
        if (disableSuccess) {
          await expect(proofToggle).not.toBeChecked();
        }
        
      } else {
      }
    } catch (error) {
      // Proof toggle not available for this query type - that's OK
    }
  });

  test('should show query description when available', async () => {
    await evoSdkPage.setOperationType('queries');
    await evoSdkPage.setQueryCategory('identity');
    await evoSdkPage.setQueryType('getIdentity');
    
    const description = await evoSdkPage.getQueryDescription();
    
    if (description) {
      expect(description.length).toBeGreaterThan(0);
    }
  });
});

test.describe('State Transitions UI Tests', () => {
  let evoSdkPage;

  test.beforeEach(async ({ page }) => {
    evoSdkPage = new EvoSdkPage(page);
    await evoSdkPage.initialize('testnet');
  });

  test('should switch to state transitions operation type correctly', async () => {
    // Start with queries, then switch to transitions
    await evoSdkPage.setOperationType('queries');
    await evoSdkPage.setOperationType('transitions');

    // Verify the operation type is set correctly
    const operationType = await evoSdkPage.page.locator('#operationType').inputValue();
    expect(operationType).toBe('transitions');
  });

  test('should populate transition categories correctly', async () => {
    await evoSdkPage.setOperationType('transitions');

    const categories = filterPlaceholderOptions(
      await evoSdkPage.getAvailableQueryCategories()
    );

    const expected = [
      'Identity Transitions',
      'Data Contract Transitions',
      'Document Transitions',
      'Token Transitions',
      'Voting Transitions',
      'Platform Address Transitions',
    ];

    const missing = expected.filter(cat => !categories.includes(cat));
    const unexpected = categories.filter(cat => !expected.includes(cat));

    expect(missing, `Missing: ${missing.join(', ')}`).toEqual([]);
    expect(unexpected, `Unexpected: ${unexpected.join(', ')}`).toEqual([]);
    expect(categories.length, 'Wrong number of categories').toBe(expected.length);
  });

  test('should populate identity transition types correctly', async () => {
    await evoSdkPage.setOperationType('transitions');
    await evoSdkPage.setQueryCategory('identity');

    const transitionTypes = filterPlaceholderOptions(
      await evoSdkPage.getAvailableQueryTypes()
    );

    const expected = [
      'Identity Create',
      'Identity Top Up',
      'Identity Update',
      'Identity Credit Transfer',
      'Identity Credit Withdrawal'
    ];

    expect(new Set(transitionTypes)).toEqual(new Set(expected));
    expect(transitionTypes.length).toBe(expected.length);
  });

  test('should populate data contract transition types correctly', async () => {
    await evoSdkPage.setOperationType('transitions');
    await evoSdkPage.setQueryCategory('dataContract');

    const transitionTypes = filterPlaceholderOptions(
      await evoSdkPage.getAvailableQueryTypes()
    );

    const expected = ['Data Contract Create', 'Data Contract Update'];

    expect(new Set(transitionTypes)).toEqual(new Set(expected));
    expect(transitionTypes.length).toBe(expected.length);
  });

  test('should populate document transition types correctly', async () => {
    await evoSdkPage.setOperationType('transitions');
    await evoSdkPage.setQueryCategory('document');

    const transitionTypes = filterPlaceholderOptions(
      await evoSdkPage.getAvailableQueryTypes()
    );

    const expected = [
      'Document Create',
      'Document Replace',
      'Document Delete',
      'Document Transfer',
      'Document Purchase',
      'Document Set Price',
    ];

    expect(new Set(transitionTypes)).toEqual(new Set(expected));
    expect(transitionTypes.length).toBe(expected.length);
  });

  test('should populate token transition types correctly', async () => {
    await evoSdkPage.setOperationType('transitions');
    await evoSdkPage.setQueryCategory('token');

    const transitionTypes = filterPlaceholderOptions(
      await evoSdkPage.getAvailableQueryTypes()
    );

    const expected = [
      'Token Burn',
      'Token Mint',
      'Token Claim',
      'Token Set Price',
      'Token Direct Purchase',
      // TODO: re-enable Token Config Update once it is added back into wasm-sdk
      // 'Token Config Update',
      'Token Emergency Action',
      'Token Transfer',
      'Token Freeze',
      'Token Unfreeze',
      'Token Destroy Frozen'
    ];

    expect(new Set(transitionTypes)).toEqual(new Set(expected));
    expect(transitionTypes.length).toBe(expected.length);
  });

  // TODO: re-enable once supported on the site
  test.skip('should populate voting transition types correctly', async () => {
    await evoSdkPage.setOperationType('transitions');
    await evoSdkPage.setQueryCategory('voting');

    const transitionTypes = filterPlaceholderOptions(
      await evoSdkPage.getAvailableQueryTypes()
    );

    const expected = ['DPNS Username', 'Contested Resource'];

    expect(new Set(transitionTypes)).toEqual(new Set(expected));
    expect(transitionTypes.length).toBe(expected.length);
  });
});

test.describe('Query Categories and Types UI Tests', () => {
  let evoSdkPage;

  test.beforeEach(async ({ page }) => {
    evoSdkPage = new EvoSdkPage(page);
    await evoSdkPage.initialize('testnet');
  });

  test('should populate all query categories correctly', async () => {
    await evoSdkPage.setOperationType('queries');

    const categories = filterPlaceholderOptions(
      await evoSdkPage.getAvailableQueryCategories()
    );

    const expected = [
      'Identity Queries',
      'Data Contract Queries',
      'Document Queries',
      'Voting & Contested Resources',
      'Protocol & Version',
      'Epoch & Block Queries',
      'Token Queries',
      'Group Queries',
      'System & Utility',
      'Platform Address Queries'
    ];

    ensureExactOptions(categories, expected, 'Query categories');
  });

  test('should populate identity query types correctly', async () => {
    await evoSdkPage.setOperationType('queries');
    await evoSdkPage.setQueryCategory('identity');

    const queryTypes = filterPlaceholderOptions(
      await evoSdkPage.getAvailableQueryTypes()
    );

    const expected = [
      'Get Identity',
      'Get Identity (Unproved)',
      'Get Identity Keys',
      'Get Contract Keys for Identities',
      'Get Identity Nonce',
      'Get Identity Contract Nonce',
      'Get Identity Balance',
      'Get Multiple Identity Balances',
      'Get Identity Balance & Revision',
      'Get Identity by Unique Public Key Hash',
      'Get Identity by Non-Unique Public Key Hash',
      'Get Identity Token Balances',
      'Get Token Balances for Identities',
      'Get Identity Token Info',
      'Get Token Info for Identities'
    ];

    ensureExactOptions(queryTypes, expected, 'Identity query types');
  });

  test('should populate data contract query types correctly', async () => {
    await evoSdkPage.setOperationType('queries');
    await evoSdkPage.setQueryCategory('dataContract');

    const queryTypes = filterPlaceholderOptions(
      await evoSdkPage.getAvailableQueryTypes()
    );

    const expected = [
      'Get Data Contract',
      'Get Data Contracts',
      'Get Data Contract History'
    ];

    ensureExactOptions(queryTypes, expected, 'Data Contract query types');
  });

  test('should populate document query types correctly', async () => {
    await evoSdkPage.setOperationType('queries');
    await evoSdkPage.setQueryCategory('document');

    const queryTypes = filterPlaceholderOptions(
      await evoSdkPage.getAvailableQueryTypes()
    );

    const expected = [
      'Get Documents',
      'Get Document'
    ];

    ensureExactOptions(queryTypes, expected, 'Document query types');
  });

  test('should populate DPNS categories correctly', async () => {
    await evoSdkPage.setOperationType('dpns');

    const categories = filterPlaceholderOptions(
      await evoSdkPage.getAvailableQueryCategories()
    );

    const expected = [
      'Lookup & Resolve',
      'Validation & Safety',
      'Registration',
    ];

    ensureExactOptions(categories, expected, 'DPNS categories');
  });

  test('should populate DPNS lookup operations correctly', async () => {
    await evoSdkPage.setOperationType('dpns');
    await evoSdkPage.setQueryCategory('lookup');

    const operations = filterPlaceholderOptions(
      await evoSdkPage.getAvailableQueryTypes()
    );

    const expected = [
      'Get Primary Username',
      'Get All Usernames',
      'Get Username By Label',
      'Resolve Name',
    ];

    ensureExactOptions(operations, expected, 'DPNS lookup operations');
  });

  test('should populate DPNS validation operations correctly', async () => {
    await evoSdkPage.setOperationType('dpns');
    await evoSdkPage.setQueryCategory('validation');

    const operations = filterPlaceholderOptions(
      await evoSdkPage.getAvailableQueryTypes()
    );

    const expected = [
      'Is Name Available',
      'Convert To Homograph Safe',
      'Validate Username Format',
      'Is Contested Username',
    ];

    ensureExactOptions(operations, expected, 'DPNS validation operations');
  });

  test('should populate DPNS registration operations correctly', async () => {
    await evoSdkPage.setOperationType('dpns');
    await evoSdkPage.setQueryCategory('registration');

    const operations = filterPlaceholderOptions(
      await evoSdkPage.getAvailableQueryTypes()
    );

    const expected = ['Register DPNS Name'];

    ensureExactOptions(operations, expected, 'DPNS registration operations');
  });

  test('should populate system query types correctly', async () => {
    await evoSdkPage.setOperationType('queries');
    await evoSdkPage.setQueryCategory('system');

    const queryTypes = filterPlaceholderOptions(
      await evoSdkPage.getAvailableQueryTypes()
    );

    const expected = [
      'Get Platform Status',
      'Get Current Quorums Info',
      'Get Prefunded Specialized Balance',
      'Get Total Credits in Platform',
      'Get Path Elements',
      'Wait for State Transition Result'
    ];

    ensureExactOptions(queryTypes, expected, 'System query types');
  });

  test('should populate protocol query types correctly', async () => {
    await evoSdkPage.setOperationType('queries');
    await evoSdkPage.setQueryCategory('protocol');

    const queryTypes = filterPlaceholderOptions(
      await evoSdkPage.getAvailableQueryTypes()
    );

    const expected = [
      'Get Protocol Version Upgrade State',
      'Get Protocol Version Vote Status'
    ];

    ensureExactOptions(queryTypes, expected, 'Protocol query types');
  });

  test('should populate epoch query types correctly', async () => {
    await evoSdkPage.setOperationType('queries');
    await evoSdkPage.setQueryCategory('epoch');

    const queryTypes = filterPlaceholderOptions(
      await evoSdkPage.getAvailableQueryTypes()
    );

    const expected = [
      'Get Epochs Info',
      'Get Current Epoch',
      'Get Finalized Epoch Infos',
      'Get Epoch Blocks by Evonode IDs',
      'Get Epoch Blocks by Range'
    ];

    const missing = expected.filter(type => !queryTypes.includes(type));
    const unexpected = queryTypes.filter(type => !expected.includes(type));

    expect(missing, `Missing: ${missing.join(', ')}`).toEqual([]);
    expect(unexpected, `Unexpected: ${unexpected.join(', ')}`).toEqual([]);
    expect(queryTypes.length, 'Wrong number of query types').toBe(expected.length);
  });

  test('should populate token query types correctly', async () => {
    await evoSdkPage.setOperationType('queries');
    await evoSdkPage.setQueryCategory('token');

    const queryTypes = filterPlaceholderOptions(
      await evoSdkPage.getAvailableQueryTypes()
    );

    const expected = [
      'Get Token Statuses',
      'Get Direct Purchase Prices',
      'Get Token Contract Info',
      'Get Token Distribution Last Claim',
      'Get Token Total Supply',
      'Get Token Price by Contract'
    ];

    const missing = expected.filter(type => !queryTypes.includes(type));
    const unexpected = queryTypes.filter(type => !expected.includes(type));

    expect(missing, `Missing: ${missing.join(', ')}`).toEqual([]);
    expect(unexpected, `Unexpected: ${unexpected.join(', ')}`).toEqual([]);
    expect(queryTypes.length, 'Wrong number of query types').toBe(expected.length);
  });

  test('should populate group query types correctly', async () => {
    await evoSdkPage.setOperationType('queries');
    await evoSdkPage.setQueryCategory('group');

    const queryTypes = filterPlaceholderOptions(
      await evoSdkPage.getAvailableQueryTypes()
    );

    const expected = [
      'Get Group Info',
      'List Group Infos',
      'Get Group Members',
      'Get Group Actions',
      'Get Group Action Signers',
      'Get Identity Groups',
      'Get Groups Data Contracts'
    ];

    const missing = expected.filter(type => !queryTypes.includes(type));
    const unexpected = queryTypes.filter(type => !expected.includes(type));

    expect(missing, `Missing: ${missing.join(', ')}`).toEqual([]);
    expect(unexpected, `Unexpected: ${unexpected.join(', ')}`).toEqual([]);
    expect(queryTypes.length, 'Wrong number of query types').toBe(expected.length);
  });

  test('should populate voting query types correctly', async () => {
    await evoSdkPage.setOperationType('queries');
    await evoSdkPage.setQueryCategory('voting');

    const queryTypes = filterPlaceholderOptions(
      await evoSdkPage.getAvailableQueryTypes()
    );

    const expected = [
      'Get Contested Resources',
      'Get Contested Resource Vote State',
      'Get Voters for Identity',
      'Get Identity Votes',
      'Get Vote Polls by End Date'
    ];

    const missing = expected.filter(type => !queryTypes.includes(type));
    const unexpected = queryTypes.filter(type => !expected.includes(type));

    expect(missing, `Missing: ${missing.join(', ')}`).toEqual([]);
    expect(unexpected, `Unexpected: ${unexpected.join(', ')}`).toEqual([]);
    expect(queryTypes.length, 'Wrong number of query types').toBe(expected.length);
  });

  test('should populate platform address query types correctly', async () => {
    await evoSdkPage.setOperationType('queries');
    await evoSdkPage.setQueryCategory('address');

    const queryTypes = filterPlaceholderOptions(
      await evoSdkPage.getAvailableQueryTypes()
    );

    const expected = [
      'Get Platform Address',
      'Get Multiple Platform Addresses'
    ];

    const missing = expected.filter(type => !queryTypes.includes(type));
    const unexpected = queryTypes.filter(type => !expected.includes(type));

    expect(missing, `Missing: ${missing.join(', ')}`).toEqual([]);
    expect(unexpected, `Unexpected: ${unexpected.join(', ')}`).toEqual([]);
    expect(queryTypes.length, 'Wrong number of query types').toBe(expected.length);
  });

  test('should populate platform address transition types correctly', async () => {
    await evoSdkPage.setOperationType('transitions');
    await evoSdkPage.setQueryCategory('address');

    const transitionTypes = filterPlaceholderOptions(
      await evoSdkPage.getAvailableQueryTypes()
    );

    const expected = [
      'Address Transfer',
      'Top Up Identity from Address',
      'Withdraw to Core',
      'Transfer from Identity to Address',
      'Fund Address from Asset Lock',
      'Create Identity from Address'
    ];

    const missing = expected.filter(type => !transitionTypes.includes(type));
    const unexpected = transitionTypes.filter(type => !expected.includes(type));

    expect(missing, `Missing: ${missing.join(', ')}`).toEqual([]);
    expect(unexpected, `Unexpected: ${unexpected.join(', ')}`).toEqual([]);
    expect(transitionTypes.length, 'Wrong number of transition types').toBe(expected.length);
  });
});
