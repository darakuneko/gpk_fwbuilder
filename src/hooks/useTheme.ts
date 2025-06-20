import { useState, useEffect } from 'react';

interface UseThemeReturn {
  theme: string;
  isLight: boolean;
  isDark: boolean;
}

export const useTheme = (): UseThemeReturn => {
  const [theme, setTheme] = useState<string>((): string => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return 'light';
    
    // Always follow system preference (auto mode)
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });

  useEffect((): void => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('light', 'dark', 'high-contrast');
    
    // Add current theme class
    if (theme !== 'light') {
      root.classList.add(theme);
    }
  }, [theme]);

  useEffect((): (() => void) => {
    // Listen for system theme changes and auto-update
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent): void => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return (): void => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return {
    theme,
    isLight: theme === 'light',
    isDark: theme === 'dark',
  };
};