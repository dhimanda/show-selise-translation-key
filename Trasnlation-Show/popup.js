const toggle = document.getElementById("toggle");

async function init() {
  const { blocked } = await chrome.storage.local.get({ blocked: false });
  toggle.checked = !!blocked;
}

toggle.addEventListener("change", async () => {
  await chrome.storage.local.set({ blocked: toggle.checked });
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) chrome.tabs.reload(tab.id);
});

init();
