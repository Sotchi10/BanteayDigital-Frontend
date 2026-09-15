const STORAGE_KEY = "banteay-theme";

export function getThemePreference() {
  const preference = localStorage.getItem(STORAGE_KEY);
  return ["light", "dark", "system"].includes(preference) ? preference : "system";
}

export function applyTheme(preference = getThemePreference()) {
  const resolved = preference === "system"
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : preference;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
}

export function setThemePreference(preference) {
  localStorage.setItem(STORAGE_KEY, preference);
  applyTheme(preference);
}

export function initializeTheme() {
  applyTheme();
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (getThemePreference() === "system") applyTheme();
  });
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY || event.key === null) applyTheme();
  });
}
