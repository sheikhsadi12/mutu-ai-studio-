import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

interface IdentityContextType {
  logoColor: string;
  setLogoColor: (color: string) => void;
  syncEnabled: boolean;
  setSyncEnabled: (enabled: boolean) => void;
  themeColor: string; // Alias for accentColor from store
  setThemeColor: (color: string) => void; // Alias for setAccentColor from store
}

const IdentityContext = createContext<IdentityContextType | undefined>(undefined);

export const useAppIdentity = () => {
  const context = useContext(IdentityContext);
  if (!context) {
    throw new Error('useAppIdentity must be used within an IdentityProvider');
  }
  return context;
};

interface IdentityProviderProps {
  children: ReactNode;
}

export const IdentityProvider: React.FC<IdentityProviderProps> = ({ children }) => {
  const { accentColor, setAccentColor } = useSettingsStore();
  
  // Initialize state from localStorage or defaults
  const [logoColor, setLogoColorState] = useState<string>(() => {
    return localStorage.getItem('currentLogoColor') || accentColor || '#00f3ff';
  });
  
  const [syncEnabled, setSyncEnabledState] = useState<boolean>(() => {
    const stored = localStorage.getItem('syncEnabled');
    return stored !== null ? stored === 'true' : true;
  });

  // Sync state setters with localStorage
  const setLogoColor = (color: string) => {
    setLogoColorState(color);
    localStorage.setItem('currentLogoColor', color);
  };

  const setSyncEnabled = (enabled: boolean) => {
    setSyncEnabledState(enabled);
    localStorage.setItem('syncEnabled', String(enabled));
    
    // If enabling sync, immediately sync logo to theme
    if (enabled) {
      setLogoColor(accentColor);
    }
  };

  // Effect: Handle Sync Logic
  useEffect(() => {
    if (syncEnabled && logoColor !== accentColor) {
      setLogoColor(accentColor);
    }
  }, [accentColor, syncEnabled, logoColor]);

  // Effect: Update Favicon
  useEffect(() => {
    updateFavicon(logoColor);
  }, [logoColor]);

  // Helper to update favicon
  const updateFavicon = (color: string) => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="${color}" />
        <path d="M30 50 L45 65 L70 35" stroke="white" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    `.trim();
    
    const encodedSvg = encodeURIComponent(svg);
    const dataUri = `data:image/svg+xml,${encodedSvg}`;

    // Update standard icon
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = dataUri;

    // Update apple-touch-icon
    let appleLink = document.querySelector("link[rel~='apple-touch-icon']") as HTMLLinkElement;
    if (!appleLink) {
      appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      document.head.appendChild(appleLink);
    }
    appleLink.href = dataUri;
  };

  const value = {
    logoColor,
    setLogoColor: (color: string) => {
      if (syncEnabled) return; // Prevent manual change if sync is on
      setLogoColor(color);
    },
    syncEnabled,
    setSyncEnabled,
    themeColor: accentColor,
    setThemeColor: setAccentColor
  };

  return (
    <IdentityContext.Provider value={value}>
      {children}
    </IdentityContext.Provider>
  );
};
