/** What the API returns in place of a stored secret, and what the client sends back to keep it. */
export const SECRET_MASK = '••••••••';

type Metadata = Record<string, string>;

/** Hides secret settings in a response. Empty values stay empty, so the UI can tell "not set". */
export const maskSecrets = (metadata: Metadata, secretFields: readonly string[]): Metadata =>
  Object.fromEntries(
    Object.entries(metadata).map(([key, value]) => [
      key,
      secretFields.includes(key) && value ? SECRET_MASK : value,
    ]),
  );

/**
 * Puts the stored secret back where the mask came back unchanged.
 * Returns the key of a masked field with nothing stored behind it, or the restored metadata.
 */
export function restoreSecrets(
  incoming: Metadata,
  secretFields: readonly string[],
  stored: Metadata | undefined,
): { metadata: Metadata } | { missing: string } {
  const metadata = { ...incoming };
  for (const key of secretFields) {
    if (metadata[key] !== SECRET_MASK) continue;
    const previous = stored?.[key];
    if (!previous) return { missing: key };
    metadata[key] = previous;
  }
  return { metadata };
}
