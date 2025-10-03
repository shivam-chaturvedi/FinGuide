import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'creative-growth' | 'ocean' | 'forest' | 'sunset' | 'midnight' | 'purple' | 'default';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: { id: Theme; name: string; description: string; colors: string[] }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const themes = [
  {
    id: 'creative-growth' as Theme,
    name: 'Creative Growth',
    description: 'Creativity & Imagination',
    colors: ['#8B5CF6', '#FBBF24', '#F3F4F6']
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
  },
  {
    id: 'default' as Theme,
    name: 'FinGuide Blue',
    description: 'Trust & Reliability',
    colors: ['#1e40af', '#059669', '#3b82f6']
  }
];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('finguide-theme');
    return (saved as Theme) || 'creative-growth';
  });

  useEffect(() => {
    localStorage.setItem('finguide-theme', theme);
    
    // Remove all theme classes
    const root = document.documentElement;
    themes.forEach(t => root.classList.remove(`theme-${t.id}`));
    
    // Add current theme class (only if not creative-growth which is the default)
    if (theme !== 'creative-growth') {
      root.classList.add(`theme-${theme}`);
    }

    // Update CSS custom properties dynamically
    const currentTheme = themes.find(t => t.id === theme);
    if (currentTheme) {
      // Update primary colors
      root.style.setProperty('--primary', getHSLFromHex(currentTheme.colors[0]));
      root.style.setProperty('--primary-glow', getHSLFromHex(currentTheme.colors[0], 70));
      root.style.setProperty('--secondary', getHSLFromHex(currentTheme.colors[1]));
      root.style.setProperty('--secondary-glow', getHSLFromHex(currentTheme.colors[1], 70));
      
      // Update custom theme colors
      root.style.setProperty('--creative-purple', getHSLFromHex(currentTheme.colors[0]));
      root.style.setProperty('--creative-purple-light', getHSLFromHex(currentTheme.colors[0], 70));
      root.style.setProperty('--golden-yellow', getHSLFromHex(currentTheme.colors[1]));
      root.style.setProperty('--golden-yellow-light', getHSLFromHex(currentTheme.colors[1], 70));
      root.style.setProperty('--light-gray', getHSLFromHex(currentTheme.colors[2]));
      
      // Update gradients
      root.style.setProperty('--gradient-hero', `linear-gradient(135deg, ${currentTheme.colors[0]}, ${currentTheme.colors[0]}dd)`);
      root.style.setProperty('--gradient-feature', `linear-gradient(135deg, ${currentTheme.colors[1]}, ${currentTheme.colors[1]}dd)`);
      root.style.setProperty('--gradient-auth', `linear-gradient(135deg, ${currentTheme.colors[0]}, ${currentTheme.colors[0]}dd)`);
    }
  }, [theme]);

  // Helper function to convert hex to HSL
  const getHSLFromHex = (hex: string, lightness?: number) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    const hue = Math.round(h * 360);
    const saturation = Math.round(s * 100);
    const finalLightness = lightness || Math.round(l * 100);

    return `${hue} ${saturation}% ${finalLightness}%`;
  };

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