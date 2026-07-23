export function getPreviewKeyId(rawPrivateKey, allowKeyId) {
  if (!allowKeyId || !rawPrivateKey) return undefined;
  const colonIndex = rawPrivateKey.lastIndexOf(':');
  if (colonIndex <= 0) return undefined;
  const suffix = rawPrivateKey.slice(colonIndex + 1).trim();
  if (!suffix) return undefined;
  const keyId = Number(suffix);
  return Number.isInteger(keyId) && keyId >= 0 ? keyId : undefined;
}
