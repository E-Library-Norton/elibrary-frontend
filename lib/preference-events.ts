export const EDIT_READING_PREFERENCES_EVENT =
  "norton:edit-reading-preferences";

export function openReadingPreferences() {
  window.dispatchEvent(new Event(EDIT_READING_PREFERENCES_EVENT));
}
