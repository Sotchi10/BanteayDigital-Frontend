const storageKey = "banteay-alert-read-ids";
const ALERT_READ_STATE_EVENT = "banteay-alert-read-state-changed";

function readAlertIds() {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return new Set(Array.isArray(value) ? value : []);
  } catch {
    return new Set();
  }
}

function saveAlertIds(alertIds) {
  localStorage.setItem(storageKey, JSON.stringify([...alertIds]));
  window.dispatchEvent(new Event(ALERT_READ_STATE_EVENT));
}

export { ALERT_READ_STATE_EVENT, readAlertIds, saveAlertIds };
