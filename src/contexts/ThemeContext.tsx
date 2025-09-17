import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'default' | 'ocean' | 'forest' | 'sunset' | 'midnight' | 'purple';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: { id: Theme; name: string; description: string; colors: string[] }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const themes = [
  {
    id: 'default' as Theme,
    name: 'FinGuide Blue',
    description: 'Trust & Reliability',
    colors: ['#1e40af', '#059669', '#3b82f6']
  },
  {
    id: 'ocean' as Theme,
    name: 'Ocean Breeze',
    description: 'Calm & Refreshing',
    colors: ['#0891b2', '#0d9488', '#06b6d4']
  },
  {
    id: 'forest' as Theme,
    name: 'Forest Green',
    description: 'Growth & Prosperity',
    colors: ['#059669', '#16a34a', '#22c55e']
  },
  {
    id: 'sunset' as Theme,
    name: 'Warm Sunset',
    description: 'Energy & Optimism',
    colors: ['#ea580c', '#dc2626', '#f59e0b']
  },
  {
    id: 'midnight' as Theme,
    name: 'Midnight Pro',
    description: 'Professional & Modern',
    colors: ['#4f46e5', '#7c3aed', '#8b5cf6']
  },
  {
    id: 'purple' as Theme,
    name: 'Royal Purple',
    description: 'Luxury & Wisdom',
    colors: ['#7c3aed', '#a855f7', '#c084fc']
  }
];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('finguide-theme');
    return (saved as Theme) || 'default';
  });

  useEffect(() => {
    localStorage.setItem('finguide-theme', theme);
    
    // Remove all theme classes
    const root = document.documentElement;
    themes.forEach(t => root.classList.remove(`theme-${t.id}`));
    
    // Add current theme class
    root.classList.add(`theme-${theme}`);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
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