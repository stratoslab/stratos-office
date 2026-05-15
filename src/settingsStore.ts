import { AppSettings, DEFAULT_SETTINGS } from './types';

const STORAGE_KEY = 'stratos-settings';

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
  const current = loadSettings();
  current[key] = value;
  saveSettings(current);
}
