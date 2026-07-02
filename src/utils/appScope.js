/** Active app only counts if the signed-in user is a member of that workspace. */
export function getScopedAppId(activeAppId, userAppIds = []) {
  if (!activeAppId || !userAppIds.length || !userAppIds.includes(activeAppId)) {
    return '';
  }
  return activeAppId;
}

/** Only show Firestore records that belong to the user's active application. */
export function matchesActiveApp(item, activeAppId) {
  if (!activeAppId) return false;
  return item?.appId === activeAppId;
}

export function filterByActiveApp(items, activeAppId, userAppIds = []) {
  const scopedId = getScopedAppId(activeAppId, userAppIds);
  return (items || []).filter((item) => matchesActiveApp(item, scopedId));
}
