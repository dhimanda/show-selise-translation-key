const MSG_TYPE = "UILM_KEYS_TOGGLE";

function notify(enabled) {
  window.postMessage({ type: MSG_TYPE, enabled: !!enabled }, "*");
}

chrome.storage.local.get({ blocked: false }, ({ blocked }) => {
  notify(blocked);
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local" || !changes.blocked) return;
  notify(changes.blocked.newValue);
});
