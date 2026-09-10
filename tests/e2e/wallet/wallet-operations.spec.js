const { test, expect } = require('@playwright/test');
const { EvoSdkPage } = require('../utils/sdk-page');
const { testData } = require('../fixtures/test-data');

/**
 * Wallet helper operations: local wasm execution, no platform connection.
 *
 * All fixtures are throwaway, deliberately public key material (BIP39
 * reference vector + a key derived from a fixed hex private key) — never
 * usable for real funds.
 */

const wallet = testData.wallet;
const CATEGORY = 'keyGeneration';

async function runWalletOperation(evoSdkPage, operation, parameters = {}) {
  await evoSdkPage.setupQuery(CATEGORY, operation, parameters, { operationType: 'wallet' });
  return evoSdkPage.executeQueryAndGetResult();
}

test.describe('Wallet operations', () => {
  let evoSdkPage;

  test.beforeEach(async ({ page }) => {
    evoSdkPage = new EvoSdkPage(page);
    await evoSdkPage.initialize('testnet');
  });

  test('generateMnemonic returns a phrase with the selected word count', async () => {
    const { result, hasError } = await runWalletOperation(evoSdkPage, 'walletGenerateMnemonic', {
      wordCount: '24'
    });
    expect(hasError).toBe(false);
    const phrase = result.replace(/^"|"$/g, '').trim();
    expect(phrase.split(/\s+/)).toHaveLength(24);
  });

  test('validateMnemonic distinguishes valid and invalid phrases', async () => {
    const good = await runWalletOperation(evoSdkPage, 'walletValidateMnemonic', {
      mnemonic: wallet.mnemonic
    });
    expect(good.hasError).toBe(false);
    expect(good.result.trim()).toBe('true');

    const bad = await runWalletOperation(evoSdkPage, 'walletValidateMnemonic', {
      mnemonic: wallet.invalidMnemonic
    });
    expect(bad.hasError).toBe(false);
    expect(bad.result.trim()).toBe('false');
  });

  test('mnemonicToSeed matches the BIP39 reference vector', async () => {
    const { result, hasError } = await runWalletOperation(evoSdkPage, 'walletMnemonicToSeed', {
      mnemonic: wallet.mnemonic
    });
    expect(hasError).toBe(false);
    expect(result.replace(/^"|"$/g, '').trim()).toBe(wallet.seedHex);

    const withPassphrase = await runWalletOperation(evoSdkPage, 'walletMnemonicToSeed', {
      mnemonic: wallet.mnemonic,
      passphrase: 'TREZOR'
    });
    expect(withPassphrase.hasError).toBe(false);
    expect(withPassphrase.result.replace(/^"|"$/g, '').trim()).toBe(wallet.seedHexTrezor);

    // Passphrase whitespace is significant: ' TREZOR ' must reach the SDK
    // untrimmed and produce a different seed than 'TREZOR'.
    const paddedPassphrase = await runWalletOperation(evoSdkPage, 'walletMnemonicToSeed', {
      mnemonic: wallet.mnemonic,
      passphrase: ' TREZOR '
    });
    expect(paddedPassphrase.hasError).toBe(false);
    expect(paddedPassphrase.result.replace(/^"|"$/g, '').trim()).toBe(wallet.seedHexTrezorPadded);
  });

  test('generateKeyPair returns a key pair for the selected network', async () => {
    const { result, hasError } = await runWalletOperation(evoSdkPage, 'walletGenerateKeyPair');
    expect(hasError).toBe(false);
    const keyPair = JSON.parse(result);
    expect(Object.keys(keyPair).sort()).toEqual(
      ['address', 'network', 'privateKeyHex', 'privateKeyWif', 'publicKey']
    );
    expect(keyPair.network).toBe('testnet');
  });

  test('generateKeyPairs returns the requested number of key pairs', async () => {
    const { result, hasError } = await runWalletOperation(evoSdkPage, 'walletGenerateKeyPairs', {
      count: '3'
    });
    expect(hasError).toBe(false);
    const keyPairs = JSON.parse(result);
    expect(keyPairs).toHaveLength(3);
    for (const keyPair of keyPairs) {
      expect(keyPair.network).toBe('testnet');
      expect(keyPair.privateKeyWif).toBeTruthy();
    }
  });

  test('keyPairFromWif derives the expected key pair (network from the WIF prefix)', async () => {
    const { result, hasError } = await runWalletOperation(evoSdkPage, 'walletKeyPairFromWif', {
      privateKeyWif: wallet.testnet.privateKeyWif
    });
    expect(hasError).toBe(false);
    const keyPair = JSON.parse(result);
    expect(keyPair).toEqual({
      privateKeyWif: wallet.testnet.privateKeyWif,
      privateKeyHex: wallet.privateKeyHex,
      publicKey: wallet.publicKeyHex,
      address: wallet.testnet.address,
      network: 'testnet'
    });
  });

  test('keyPairFromHex derives per-network key pairs from the same hex key', async () => {
    const testnetRun = await runWalletOperation(evoSdkPage, 'walletKeyPairFromHex', {
      privateKeyHex: wallet.privateKeyHex
    });
    expect(testnetRun.hasError).toBe(false);
    const testnetKeyPair = JSON.parse(testnetRun.result);
    expect(testnetKeyPair.privateKeyWif).toBe(wallet.testnet.privateKeyWif);
    expect(testnetKeyPair.address).toBe(wallet.testnet.address);
    expect(testnetKeyPair.network).toBe('testnet');

    // Switching the network selector changes the injected network argument.
    await evoSdkPage.setNetwork('mainnet');
    const mainnetRun = await runWalletOperation(evoSdkPage, 'walletKeyPairFromHex', {
      privateKeyHex: wallet.privateKeyHex
    });
    expect(mainnetRun.hasError).toBe(false);
    const mainnetKeyPair = JSON.parse(mainnetRun.result);
    expect(mainnetKeyPair.privateKeyWif).toBe(wallet.mainnet.privateKeyWif);
    expect(mainnetKeyPair.address).toBe(wallet.mainnet.address);
    expect(mainnetKeyPair.network).toBe('mainnet');
  });

  test('pubkeyToAddress converts a public key to the fixture address', async () => {
    const { result, hasError } = await runWalletOperation(evoSdkPage, 'walletPubkeyToAddress', {
      pubkeyHex: wallet.publicKeyHex
    });
    expect(hasError).toBe(false);
    expect(result.replace(/^"|"$/g, '').trim()).toBe(wallet.testnet.address);
  });

  test('validateAddress accepts the right network and rejects the wrong one', async () => {
    const good = await runWalletOperation(evoSdkPage, 'walletValidateAddress', {
      address: wallet.testnet.address
    });
    expect(good.hasError).toBe(false);
    expect(good.result.trim()).toBe('true');

    const wrongNetwork = await runWalletOperation(evoSdkPage, 'walletValidateAddress', {
      address: wallet.mainnet.address
    });
    expect(wrongNetwork.hasError).toBe(false);
    expect(wrongNetwork.result.trim()).toBe('false');
  });

  test('signMessage produces the deterministic expected signature', async () => {
    const { result, hasError } = await runWalletOperation(evoSdkPage, 'walletSignMessage', {
      message: wallet.signMessage.message,
      privateKeyWif: wallet.testnet.privateKeyWif
    });
    expect(hasError).toBe(false);
    expect(result.replace(/^"|"$/g, '').trim()).toBe(wallet.signMessage.expectedSignature);
  });

  test('generateMnemonic and validateMnemonic honour a non-English wordlist', async () => {
    // The language dropdown's option values must match the codes the wasm
    // runtime accepts; an unsupported code is a hard error there, so this
    // guards the dropdown set against drift from the SDK.
    const generated = await runWalletOperation(evoSdkPage, 'walletGenerateMnemonic', {
      wordCount: '12',
      languageCode: wallet.spanish.languageCode
    });
    expect(generated.hasError).toBe(false);
    expect(generated.result.replace(/^"|"$/g, '').trim().split(/\s+/)).toHaveLength(12);

    // A known Spanish phrase validates under 'es' but not under 'en'.
    const asSpanish = await runWalletOperation(evoSdkPage, 'walletValidateMnemonic', {
      mnemonic: wallet.spanish.mnemonic,
      languageCode: wallet.spanish.languageCode
    });
    expect(asSpanish.hasError).toBe(false);
    expect(asSpanish.result.trim()).toBe('true');

    const asEnglish = await runWalletOperation(evoSdkPage, 'walletValidateMnemonic', {
      mnemonic: wallet.spanish.mnemonic,
      languageCode: 'en'
    });
    expect(asEnglish.hasError).toBe(false);
    expect(asEnglish.result.trim()).toBe('false');
  });

  test('signMessage signs surrounding whitespace as part of the message', async () => {
    // Proves the whole chain — textarea -> collectArgs -> callEvo -> wasm —
    // preserves whitespace: the padded message must produce a different,
    // specific signature rather than the trimmed message's.
    const { result, hasError } = await runWalletOperation(evoSdkPage, 'walletSignMessage', {
      message: wallet.signMessage.paddedMessage,
      privateKeyWif: wallet.testnet.privateKeyWif
    });
    expect(hasError).toBe(false);
    const signature = result.replace(/^"|"$/g, '').trim();
    expect(signature).toBe(wallet.signMessage.expectedPaddedSignature);
    expect(signature).not.toBe(wallet.signMessage.expectedSignature);
  });

  test('wallet UI shows no proof toggle and no authentication section', async ({ page }) => {
    await evoSdkPage.setupQuery(CATEGORY, 'walletGenerateKeyPair', {}, { operationType: 'wallet' });
    await expect(page.locator('#proofToggleContainer')).toBeHidden();
    await expect(page.locator('#authenticationInputs')).toBeHidden();
  });

  test('secret inputs are rendered as password fields', async ({ page }) => {
    await evoSdkPage.setupQuery(CATEGORY, 'walletKeyPairFromWif', {}, { operationType: 'wallet' });
    const wifInput = page.locator('[data-input-name="privateKeyWif"]');
    await expect(wifInput).toHaveAttribute('type', 'password');
  });

  test('wallet operations issue no external requests (offline guarantee)', async ({ page }) => {
    // Recording matched external requests (not just aborting them) proves
    // absence: a fire-and-forget request would still land in the list.
    const externalRequests = [];
    await page.route(/.*/, route => {
      const url = new URL(route.request().url());
      if (!['localhost', '127.0.0.1'].includes(url.hostname)) {
        externalRequests.push(url.href);
        return route.abort();
      }
      return route.continue();
    });

    // Select the operation first, then clear the list right before executing
    // so an unrelated page-level fetch cannot misattribute a failure.
    await evoSdkPage.setupQuery(CATEGORY, 'walletGenerateKeyPair', {}, { operationType: 'wallet' });
    externalRequests.length = 0;

    const { result, hasError } = await evoSdkPage.executeQueryAndGetResult();
    expect(hasError).toBe(false);
    expect(JSON.parse(result).network).toBe('testnet');
    expect(externalRequests).toEqual([]);
  });
});
