const EVENT_NAME = "banteay-scan-history-changed";
const storageKey = (userId) => `banteay-scan-history-seen-at:${userId}`;

function getSeenAt(userId) {
  if (!userId) return null;
  return localStorage.getItem(storageKey(userId));
}

function notifyChange() {
  window.dispatchEvent(new Event(EVENT_NAME));
}

function markScanHistorySeen(userId, scans) {
  if (!userId || !scans?.length) return;
  const newest = scans.reduce((latest, scan) =>
    !latest || new Date(scan.createdAt) > new Date(latest) ? scan.createdAt : latest,
  "");
  if (!newest) return;
  localStorage.setItem(storageKey(userId), newest);
  notifyChange();
}

function initializeScanHistorySeenAt(userId, scans) {
  if (getSeenAt(userId)) return;
  if (scans?.length) {
    markScanHistorySeen(userId, scans);
    return;
  }
  localStorage.setItem(storageKey(userId), new Date().toISOString());
  notifyChange();
}

function scanHistoryUnreadCount(userId, scans) {
  const seenAt = getSeenAt(userId);
  if (!seenAt) return 0;
  const seenTime = new Date(seenAt).getTime();
  return scans.filter((scan) => new Date(scan.createdAt).getTime() > seenTime).length;
}

function notifyScanCreated() {
  notifyChange();
}

export {
  EVENT_NAME,
  initializeScanHistorySeenAt,
  markScanHistorySeen,
  notifyScanCreated,
  scanHistoryUnreadCount,
};
