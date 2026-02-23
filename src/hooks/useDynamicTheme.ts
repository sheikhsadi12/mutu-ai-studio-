import { useEffect, useRef } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export function useDynamicTheme() {
  const { accentColor, themeMode } = useSettingsStore();
  const prevColorRef = useRef(accentColor);

  useEffect(() => {
    // 1. Update CSS Variables for Global Theme Sync
    document.documentElement.setAttribute('data-theme', themeMode);
    document.documentElement.style.setProperty('--accent-primary', accentColor);
    
    // Add 10% opacity for the dim version
    const dimColor = accentColor.startsWith('#') ? `${accentColor}1a` : accentColor;
    document.documentElement.style.setProperty('--accent-dim', dimColor);
    
    // Set --accent-glow specifically for neon elements
    document.documentElement.style.setProperty('--accent-glow', accentColor);

    // 2. Dynamic Icon Swapping
    // Generate an SVG data URL with the current accent color
    const svgIcon = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${encodeURIComponent(accentColor)}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>`;
    
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = svgIcon;

    // 3. Pulse Animation Effect (only if color actually changed)
    if (prevColorRef.current !== accentColor) {
      const pulseElement = document.createElement('div');
      pulseElement.className = 'theme-pulse-effect';
      pulseElement.style.backgroundColor = accentColor;
      document.body.appendChild(pulseElement);
      
      setTimeout(() => {
        pulseElement.remove();
      }, 1000);
      
      prevColorRef.current = accentColor;
    }

  }, [accentColor, themeMode]);
}
