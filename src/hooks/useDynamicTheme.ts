import { useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export function useDynamicTheme() {
  const { themeMode, accentColor } = useSettingsStore();

  useEffect(() => {
    const root = document.documentElement;
    
    // Handle Theme Mode
    if (themeMode === 'dark') {
      root.removeAttribute('data-theme');
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.setAttribute('data-theme', 'light');
      root.classList.add('light');
      root.classList.remove('dark');
    }

    // Handle Accent Color
    if (accentColor) {
      root.style.setProperty('--accent-primary', accentColor);
      
      // Calculate dim version
      if (accentColor.startsWith('#')) {
        const dimColor = hexToRgba(accentColor, 0.1);
        root.style.setProperty('--accent-dim', dimColor);
        
        // Also update text-on-accent if needed, but usually black/white is fine
      }
    }
    
  }, [themeMode, accentColor]);
}

function hexToRgba(hex: string, alpha: number) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})` : hex;
}
