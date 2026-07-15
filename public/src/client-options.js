// Pure assembly of the EvoSDK constructor options from already-resolved inputs.
// Kept free of DOM/state/SDK imports so it can be unit-tested in plain Node;
// buildClientOptions in sdk-client.js reads the network/trusted/advancedOptions
// from the page and delegates here.
export function assembleClientOptions(network, trusted, advancedOptions = {}) {
  const opts = {
    network,
    trusted: !!trusted,
    proofs: true,
  };
  if (advancedOptions.platformVersion != null) {
    opts.version = advancedOptions.platformVersion;
  }
  const settings = {};
  if (advancedOptions.connectTimeout) settings.connectTimeoutMs = advancedOptions.connectTimeout;
  if (advancedOptions.requestTimeout) settings.timeoutMs = advancedOptions.requestTimeout;
  if (advancedOptions.retries) settings.retries = advancedOptions.retries;
  if (typeof advancedOptions.banFailedAddress === 'boolean') {
    settings.banFailedAddress = advancedOptions.banFailedAddress;
  }
  if (Object.keys(settings).length) {
    opts.settings = settings;
  }
  return opts;
}
