const SESSION_KEYS = ['activeAppId', 'onboarded'];

/** Clear persisted session keys so a new login never inherits the previous account's workspace. */
export function clearSessionCache() {
  SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
}
