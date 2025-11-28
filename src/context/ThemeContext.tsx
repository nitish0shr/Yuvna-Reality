import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'day' | 'night';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Default to night mode, or use system preference
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recruiter-ai-theme') as Theme;
      if (saved) return saved;

      // Check system preference
      if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'day';
      }
    }
    return 'night';
  });

  // Apply theme class to document
  useEffect(() => {
    document.documentElement.classList.remove('theme-day', 'theme-night');
    document.documentElement.classList.add(`theme-${theme}`);
    document.body.classList.remove('theme-day', 'theme-night');
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem('recruiter-ai-theme', theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = (e: MediaQueryListEvent) => {
      const saved = localStorage.getItem('recruiter-ai-theme');
      if (!saved) {
        setThemeState(e.matches ? 'day' : 'night');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'day' ? 'night' : 'day');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      setTheme,
      isDark: theme === 'night'
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
