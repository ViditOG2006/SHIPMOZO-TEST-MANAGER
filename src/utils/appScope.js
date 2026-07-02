/** Only show Firestore records that belong to the user's active application. */
export function matchesActiveApp(item, activeAppId) {
  if (!activeAppId) return false;
  return item?.appId === activeAppId;
}

export function filterByActiveApp(items, activeAppId) {
  return (items || []).filter(item => matchesActiveApp(item, activeAppId));
}
