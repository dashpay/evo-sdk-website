// Pure helper: turn the raw version-info.json payload into the strings the
// loadVersionInfo() DOM render needs. Kept side-effect-free and DOM-free so
// it can be unit-tested in node without jsdom; sdk-client.js owns the actual
// element construction (programmatic, no innerHTML — see CWE-79 hardening).
export function buildVersionDisplayModel(versionInfo) {
  const sdkVersion = versionInfo?.sdkVersion || 'unknown';
  const commitHash = versionInfo?.commitHash || 'unknown';
  const buildTime = versionInfo?.buildTime || '';

  let buildDisplay = '';
  if (buildTime) {
    const d = new Date(buildTime);
    buildDisplay = !Number.isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : '';
  }

  return {
    sdkLink: {
      href: 'https://www.npmjs.com/package/@dashevo/evo-sdk',
      text: `v${sdkVersion}↗`,
    },
    commitLink: {
      href: `https://github.com/dashpay/evo-sdk-website/commit/${commitHash}`,
      text: `${commitHash}↗`,
    },
    buildDisplay,
    title: `SDK Version: ${sdkVersion}\nWebsite Commit: ${commitHash}\nBuild Time: ${buildTime}`,
  };
}
