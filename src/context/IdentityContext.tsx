import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface IdentityContextType {
  currentLogoColor: string;
  syncEnabled: boolean;
  logoDesign: string;
  setLogoColor: (color: string) => void;
  setSyncEnabled: (enabled: boolean) => void;
  setLogoDesign: (design: string) => void;
  triggerPulse: () => void;
}

const IdentityContext = createContext<IdentityContextType | undefined>(undefined);

export function IdentityProvider({ children }: { children: ReactNode }) {
  const [currentLogoColor, setLogoColorState] = useState(() => {
    const saved = localStorage.getItem('mutu-identity-color');
    return saved || '#00f3ff';
  });
  const [syncEnabled, setSyncEnabledState] = useState(() => {
    const saved = localStorage.getItem('mutu-identity-sync');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [logoDesign, setLogoDesignState] = useState(() => {
    const saved = localStorage.getItem('mutu-identity-design');
    return saved || 'sparkles';
  });

  const setLogoColor = (color: string) => {
    setLogoColorState(color);
    localStorage.setItem('mutu-identity-color', color);
  };

  const setSyncEnabled = (enabled: boolean) => {
    setSyncEnabledState(enabled);
    localStorage.setItem('mutu-identity-sync', JSON.stringify(enabled));
  };

  const setLogoDesign = (design: string) => {
    setLogoDesignState(design);
    localStorage.setItem('mutu-identity-design', design);
  };

  const triggerPulse = () => {
    window.dispatchEvent(new CustomEvent('identity-pulse'));
  };

  return (
    <IdentityContext.Provider
      value={{
        currentLogoColor,
        syncEnabled,
        logoDesign,
        setLogoColor,
        setSyncEnabled,
        setLogoDesign,
        triggerPulse,
      }}
    >
      {children}
    </IdentityContext.Provider>
  );
}

export function useAppIdentity() {
  const context = useContext(IdentityContext);
  if (context === undefined) {
    throw new Error('useAppIdentity must be used within an IdentityProvider');
  }
  return context;
}
