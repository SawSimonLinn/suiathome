export const LEGAL_VERSION = '2026-04-14';
export const LEGAL_LAST_UPDATED = 'April 14, 2026';

export function createLegalConsentMetadata(
  acceptedAt = new Date().toISOString()
) {
  return {
    accepted_privacy_policy: true,
    accepted_terms_and_conditions: true,
    legal_version: LEGAL_VERSION,
    legal_accepted_at: acceptedAt,
  };
}
