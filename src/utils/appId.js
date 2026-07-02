/** Generate a unique application / workspace ID stored in Firestore. */
export function generateAppId() {
  return `APP-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
