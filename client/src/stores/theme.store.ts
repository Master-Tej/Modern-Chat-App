import { create } from 'zustand';

type Theme = 'dark' | 'light' | 'system';

interface ThemeState {
  theme: Theme;
  resolved: 'dark' | 'light';
  setTheme: (theme: Theme) => void;
}

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(resolved: 'dark' | 'light') {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.remove('dark', 'light');
  document.documentElement.classList.add(resolved);
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'dark',
  resolved: 'dark',

  setTheme: (theme) => {
    const resolved = theme === 'system' ? getSystemTheme() : theme;
    applyTheme(resolved);
    set({ theme, resolved });
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
  },
}));

if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('theme') as Theme | null;
  const initial = stored || 'dark';
  const resolved = initial === 'system' ? getSystemTheme() : initial;
  applyTheme(resolved);

  useThemeStore.setState({ theme: initial, resolved });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const state = useThemeStore.getState();
    if (state.theme === 'system') {
      const newResolved = getSystemTheme();
      applyTheme(newResolved);
      useThemeStore.setState({ resolved: newResolved });
    }
  });
}
