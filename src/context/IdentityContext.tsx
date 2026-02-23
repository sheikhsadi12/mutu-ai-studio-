import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

interface IdentityContextType {
  currentLogoColor: string;
  syncEnabled: boolean;
  logoDesign: string;
  setLogoColor: (color: string) => void;
  setSyncEnabled: (enabled: boolean) => void;
  setLogoDesign: (design: string) => void;
  triggerPulse: () => void;
  isPulsing: boolean;
}

const IdentityContext = createContext<IdentityContextType | undefined>(undefined);

export const IdentityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { accentColor } = useSettingsStore();
  const [currentLogoColor, setCurrentLogoColor] = useState<string>(() => {
    return localStorage.getItem('currentLogoColor') || '#00f3ff';
  });
  const [syncEnabled, setSyncEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('syncEnabled');
    return saved === null ? true : saved === 'true';
  });
  const [logoDesign, setLogoDesignState] = useState<string>(() => {
    return localStorage.getItem('logoDesign') || 'sparkles';
  });
  const [isPulsing, setIsPulsing] = useState(false);

  const updateIdentity = useCallback((color: string) => {
    // Update CSS Variables
    document.documentElement.style.setProperty('--accent-glow', color);
    
    // Update Favicon
    const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    const appleLink: HTMLLinkElement | null = document.querySelector("link[rel*='apple-touch-icon']");
    
    let iconName = 'cyan';
    if (color === '#a855f7') iconName = 'purple';
    if (color === '#22c55e') iconName = 'green';
    if (color === '#eab308') iconName = 'gold';
    
    const iconPath = `/icons/${iconName}-icon.svg`;
    
    if (link) link.href = iconPath;
    if (appleLink) appleLink.href = iconPath;
  }, []);

  useEffect(() => {
    const colorToUse = syncEnabled ? accentColor : currentLogoColor;
    updateIdentity(colorToUse);
    
    localStorage.setItem('currentLogoColor', currentLogoColor);
    localStorage.setItem('syncEnabled', syncEnabled.toString());
    localStorage.setItem('logoDesign', logoDesign);
    localStorage.setItem('currentThemeColor', accentColor);
  }, [accentColor, currentLogoColor, syncEnabled, logoDesign, updateIdentity]);

  const triggerPulse = () => {
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 1000);
  };

  const setLogoColor = (color: string) => {
    setCurrentLogoColor(color);
    triggerPulse();
  };

  const handleSetSyncEnabled = (enabled: boolean) => {
    setSyncEnabled(enabled);
    triggerPulse();
  };

  const setLogoDesign = (design: string) => {
    setLogoDesignState(design);
    triggerPulse();
  };

  return (
    <IdentityContext.Provider value={{ 
      currentLogoColor, 
      syncEnabled, 
      logoDesign,
      setLogoColor, 
      setSyncEnabled: handleSetSyncEnabled,
      setLogoDesign,
      triggerPulse,
      isPulsing
    }}>
      {children}
      {isPulsing && <div className="pulse-effect" />}
    </IdentityContext.Provider>
  );
};

export const useAppIdentity = () => {
  const context = useContext(IdentityContext);
  if (context === undefined) {
    throw new Error('useAppIdentity must be used within an IdentityProvider');
  }
  return context;
};
