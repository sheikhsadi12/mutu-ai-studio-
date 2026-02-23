import { useState, useEffect, FormEvent, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Key, ShieldCheck, AlertCircle, Palette, Cpu, Moon, Sun, ChevronLeft, Settings2, Eye, EyeOff, Pipette, Plus, CheckCircle2, Fingerprint, Sparkles, Zap, Music, Disc, Waves, Mic } from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useAppIdentity } from '../context/IdentityContext';
import clsx from 'clsx';

const LOGO_DESIGNS = [
  { id: 'sparkles', icon: Sparkles, name: 'Sparkles' },
  { id: 'music', icon: Music, name: 'Audio' },
  { id: 'zap', icon: Zap, name: 'Energy' },
  { id: 'disc', icon: Disc, name: 'Vinyl' },
  { id: 'waves', icon: Waves, name: 'Waves' },
  { id: 'mic', icon: Mic, name: 'Studio' },
];

const ACCENT_COLORS = [
  { name: 'Neon Cyan', value: '#00f3ff' },
  { name: 'Cyber Purple', value: '#a855f7' },
  { name: 'Matrix Green', value: '#22c55e' },
  { name: 'Solar Orange', value: '#f97316' },
  { name: 'Plasma Pink', value: '#ec4899' },
  { name: 'Electric Blue', value: '#3b82f6' },
  { name: 'Crimson Red', value: '#ef4444' },
  { name: 'Golden Yellow', value: '#eab308' },
];

const IDENTITY_ICONS = [
  { name: 'Cyan', value: '#00f3ff', icon: 'cyan' },
  { name: 'Purple', value: '#a855f7', icon: 'purple' },
  { name: 'Green', value: '#22c55e', icon: 'green' },
  { name: 'Gold', value: '#eab308', icon: 'gold' },
];

export default function SettingsOverlay() {
  const { 
    apiKey, setApiKey, 
    isSettingsOpen, setSettingsOpen,
    activeSettingsPage, setActiveSettingsPage,
    themeMode, setThemeMode,
    accentColor, setAccentColor
  } = useSettingsStore();

  const { 
    currentLogoColor, 
    syncEnabled, 
    logoDesign,
    setLogoColor, 
    setSyncEnabled,
    setLogoDesign,
    triggerPulse 
  } = useAppIdentity();

  const [inputValue, setInputValue] = useState(apiKey || '');
  const [error, setError] = useState('');
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSettingsOpen && !apiKey && !activeSettingsPage) {
      // Allow user to explore settings even without API key
    }
  }, [isSettingsOpen, apiKey, activeSettingsPage, setActiveSettingsPage]);

  // Apply Theme and Accent Color to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
    document.documentElement.style.setProperty('--accent-primary', accentColor);
    const dimColor = accentColor.startsWith('#') ? `${accentColor}1a` : accentColor;
    document.documentElement.style.setProperty('--accent-dim', dimColor);
  }, [themeMode, accentColor]);

  const closePage = () => {
    setActiveSettingsPage(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue.trim().length < 10) {
      setError('Invalid API Key format');
      return;
    }
    setApiKey(inputValue.trim());
    setError('');
  };

  const renderContent = () => {
    switch (activeSettingsPage) {
      case 'api':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-xl w-full"
          >
            <div className="mb-8 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-dim)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/30">
              <Key size={32} />
            </div>
            <h3 className="text-3xl font-bold text-[var(--color-text-primary)] mb-4 font-display italic">API Configuration</h3>
            <p className="text-[var(--color-text-secondary)] mb-8 leading-relaxed font-mono text-xs uppercase tracking-wider">
              Enter your Gemini API Key to activate the Neural Speech Engine. 
              The key is stored locally on your device and never leaves your browser.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <input
                  type="password"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter your Gemini API Key"
                  className="w-full rounded-2xl border border-[var(--color-glass-border)] bg-[var(--color-bg-surface)] px-6 py-4 pl-14 text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] transition-all font-mono"
                />
                <ShieldCheck className="absolute left-5 top-5 h-6 w-6 text-[var(--color-text-secondary)]" />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 p-4 rounded-xl border border-red-400/20">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setInputValue('');
                    setApiKey('');
                  }}
                  className="flex-1 rounded-2xl border border-red-500/30 px-6 py-4 font-bold text-red-400 hover:bg-red-500/10 transition-all uppercase tracking-widest text-[10px]"
                >
                  Clear Key
                </button>
                <button
                  type="submit"
                  className="flex-[2] rounded-2xl bg-[var(--accent-primary)] px-6 py-4 font-bold text-[var(--color-text-on-accent)] transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-[10px] shadow-[0_0_20px_var(--accent-dim)]"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </motion.div>
        );

      case 'appearance':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-2xl w-full space-y-12"
          >
            <div className="mb-8 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-dim)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/30">
              <Palette size={32} />
            </div>
            
            <section>
              <h4 className="mb-6 text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-[0.4em]">Theme Mode</h4>
              <div className="grid grid-cols-2 gap-6">
                <button
                  onClick={() => setThemeMode('dark')}
                  className={clsx(
                    "flex flex-col items-center justify-center gap-4 rounded-3xl border p-8 transition-all",
                    themeMode === 'dark'
                      ? "border-[var(--accent-primary)] bg-[var(--accent-dim)] text-[var(--color-text-primary)]"
                      : "border-[var(--color-glass-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
                  )}
                >
                  <Moon size={32} className="shrink-0" />
                  <span className="font-bold uppercase tracking-widest text-[10px]">Dark Mode</span>
                </button>
                <button
                  onClick={() => setThemeMode('light')}
                  className={clsx(
                    "flex flex-col items-center justify-center gap-4 rounded-3xl border p-8 transition-all",
                    themeMode === 'light'
                      ? "border-[var(--accent-primary)] bg-[var(--accent-dim)] text-[var(--color-text-primary)]"
                      : "border-[var(--color-glass-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
                  )}
                >
                  <Sun size={32} className="shrink-0" />
                  <span className="font-bold uppercase tracking-widest text-[10px]">Light Mode</span>
                </button>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-[0.4em]">Accent Color</h4>
                <div className="flex items-center gap-2 bg-[var(--accent-dim)] px-3 py-1 rounded-full border border-[var(--accent-primary)]/20">
                  <div 
                    className="h-2 w-2 rounded-full shadow-[0_0_8px_var(--accent-primary)]"
                    style={{ backgroundColor: accentColor }}
                  />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--accent-primary)]">
                    {ACCENT_COLORS.find(c => c.value === accentColor)?.name || 'Custom'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 p-6 rounded-3xl border border-[var(--color-glass-border)] bg-[var(--color-bg-surface)]">
                {ACCENT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => {
                      setAccentColor(color.value);
                      triggerPulse();
                    }}
                    className={clsx(
                      "group relative flex flex-col items-center gap-3 transition-all",
                      accentColor === color.value ? "scale-110" : "opacity-40 hover:opacity-100 hover:scale-105"
                    )}
                  >
                    <div 
                      className={clsx(
                        "h-10 w-10 rounded-full border-2 shadow-lg transition-all",
                        accentColor === color.value ? "border-[var(--color-text-primary)] scale-110 shadow-[0_0_15px_var(--accent-primary)]" : "border-transparent hover:scale-105"
                      )}
                      style={{ backgroundColor: color.value }}
                    />
                  </button>
                ))}
                
                <button
                  onClick={() => colorInputRef.current?.click()}
                  className={clsx(
                    "group relative flex flex-col items-center gap-3 transition-all",
                    !ACCENT_COLORS.some(c => c.value === accentColor) ? "scale-110" : "opacity-40 hover:opacity-100 hover:scale-105"
                  )}
                >
                  <div 
                    className={clsx(
                      "h-10 w-10 rounded-full border-2 border-dashed shadow-2xl transition-all flex items-center justify-center bg-[var(--color-bg-hover)]",
                      !ACCENT_COLORS.some(c => c.value === accentColor) ? "border-[var(--color-text-primary)]" : "border-[var(--color-text-secondary)]/20"
                    )}
                    style={!ACCENT_COLORS.some(c => c.value === accentColor) ? { backgroundColor: accentColor } : {}}
                  >
                    <Plus size={16} className="text-[var(--color-text-primary)]" />
                  </div>
                  <input 
                    ref={colorInputRef}
                    type="color" 
                    className="sr-only" 
                    value={accentColor}
                    onChange={(e) => {
                      setAccentColor(e.target.value);
                      triggerPulse();
                    }}
                  />
                </button>
              </div>
            </section>
          </motion.div>
        );

      case 'identity':
        const SelectedLogoIcon = LOGO_DESIGNS.find(d => d.id === logoDesign)?.icon || Sparkles;
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-4xl w-full space-y-12"
          >
            <div className="mb-8 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-dim)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/30">
              <Fingerprint size={32} />
            </div>

            <h3 className="text-3xl font-bold text-[var(--color-text-primary)] mb-4 font-display italic">Identity Studio</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Left Column: Preview & Designs */}
              <div className="lg:col-span-7 space-y-12">
                <section>
                  <h4 className="mb-6 text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-[0.4em]">Logo Design</h4>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                    {LOGO_DESIGNS.map((design) => (
                      <button
                        key={design.id}
                        onClick={() => setLogoDesign(design.id)}
                        className={clsx(
                          "flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all",
                          logoDesign === design.id 
                            ? "border-[var(--accent-primary)] bg-[var(--accent-dim)] text-[var(--accent-primary)] shadow-[0_0_15px_var(--accent-dim)]" 
                            : "border-[var(--color-glass-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
                        )}
                      >
                        <design.icon size={24} />
                        <span className="text-[8px] font-bold uppercase tracking-tighter">{design.name}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <h4 className="mb-6 text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-[0.4em]">Live Preview</h4>
                  <div className="aspect-[21/9] rounded-[2.5rem] bg-[var(--color-bg-surface)] border border-[var(--color-glass-border)] flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-dim)] to-transparent opacity-50" />
                    <div className="flex items-center gap-12 relative z-10">
                      {/* App Icon Preview */}
                      <motion.div 
                        key={`${currentLogoColor}-${logoDesign}`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-32 h-32 rounded-[2.5rem] shadow-[0_0_50px_var(--accent-dim)] flex items-center justify-center bg-[var(--color-cyber-black)] border border-[var(--accent-primary)]/30"
                      >
                        <div 
                          className="w-16 h-16 rounded-full blur-xl absolute"
                          style={{ backgroundColor: syncEnabled ? accentColor : currentLogoColor }}
                        />
                        <SelectedLogoIcon 
                          size={48} 
                          style={{ color: syncEnabled ? accentColor : currentLogoColor }}
                          className="relative z-10"
                        />
                      </motion.div>

                      {/* Text Preview */}
                      <div className="hidden sm:block">
                        <h2 className="text-4xl font-bold text-[var(--color-text-primary)] font-display italic leading-none mb-2">Moto Studio</h2>
                        <p className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-[0.5em]">Studio Pro</p>
                      </div>
                    </div>
                    <div className="absolute bottom-6 left-0 right-0 text-center">
                      <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--color-text-secondary)]">Identity System Preview</span>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column: Controls & Colors */}
              <div className="lg:col-span-5 space-y-12">
                <section>
                  <h4 className="mb-6 text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-[0.4em]">Color Sync</h4>
                  <button
                    onClick={() => setSyncEnabled(!syncEnabled)}
                    className={clsx(
                      "w-full flex items-center justify-between p-6 rounded-3xl border transition-all",
                      syncEnabled 
                        ? "border-[var(--accent-primary)] bg-[var(--accent-dim)]" 
                        : "border-[var(--color-glass-border)] bg-[var(--color-bg-surface)]"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <Zap size={20} className={syncEnabled ? "text-[var(--accent-primary)]" : "text-[var(--color-text-secondary)]"} />
                      <div className="text-left">
                        <h5 className="text-sm font-bold text-[var(--color-text-primary)]">Sync with Theme</h5>
                        <p className="text-[9px] text-[var(--color-text-secondary)] uppercase tracking-widest">Matches app accent color</p>
                      </div>
                    </div>
                    <div className={clsx(
                      "h-6 w-12 rounded-full relative transition-all",
                      syncEnabled ? "bg-[var(--accent-primary)]" : "bg-[var(--color-bg-hover)]"
                    )}>
                      <motion.div 
                        animate={{ x: syncEnabled ? 24 : 4 }}
                        className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-lg"
                      />
                    </div>
                  </button>
                </section>

                <section className={clsx("transition-all", syncEnabled && "opacity-30 pointer-events-none grayscale")}>
                  <h4 className="mb-6 text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-[0.4em]">Manual Color</h4>
                  <div className="grid grid-cols-4 gap-4 p-6 rounded-3xl border border-[var(--color-glass-border)] bg-[var(--color-bg-surface)]">
                    {IDENTITY_ICONS.map((icon) => (
                      <button
                        key={icon.icon}
                        onClick={() => setLogoColor(icon.value)}
                        className={clsx(
                          "group relative flex flex-col items-center transition-all",
                          currentLogoColor === icon.value ? "scale-110" : "opacity-40 hover:opacity-100"
                        )}
                      >
                        <div 
                          className={clsx(
                            "h-12 w-12 rounded-2xl border-2 transition-all flex items-center justify-center",
                            currentLogoColor === icon.value ? "border-[var(--color-text-primary)] shadow-[0_0_15px_var(--accent-primary)]" : "border-transparent"
                          )}
                          style={{ backgroundColor: icon.value }}
                        />
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        );

      default:
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <button
              onClick={() => setActiveSettingsPage('api')}
              className="group flex flex-col items-center justify-center gap-6 rounded-[2rem] border border-[var(--color-glass-border)] bg-[var(--color-bg-surface)] p-8 transition-all hover:border-[var(--accent-primary)]/50 hover:bg-[var(--accent-dim)]"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-dim)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/30 group-hover:scale-110 transition-transform shadow-[0_0_15px_var(--accent-dim)]">
                <Key size={28} />
              </div>
              <div className="text-center">
                <h4 className="text-[10px] font-bold text-[var(--color-text-primary)] uppercase tracking-widest mb-1">API Config</h4>
                <p className="text-[8px] text-[var(--color-text-secondary)] uppercase tracking-tighter">Neural Link</p>
              </div>
            </button>

            <button
              onClick={() => setActiveSettingsPage('appearance')}
              className="group flex flex-col items-center justify-center gap-6 rounded-[2rem] border border-[var(--color-glass-border)] bg-[var(--color-bg-surface)] p-8 transition-all hover:border-[var(--accent-primary)]/50 hover:bg-[var(--accent-dim)]"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-dim)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/30 group-hover:scale-110 transition-transform shadow-[0_0_15px_var(--accent-dim)]">
                <Palette size={28} />
              </div>
              <div className="text-center">
                <h4 className="text-[10px] font-bold text-[var(--color-text-primary)] uppercase tracking-widest mb-1">Appearance</h4>
                <p className="text-[8px] text-[var(--color-text-secondary)] uppercase tracking-tighter">UI Calibration</p>
              </div>
            </button>

            <button
              onClick={() => setActiveSettingsPage('identity')}
              className="group flex flex-col items-center justify-center gap-6 rounded-[2rem] border border-[var(--color-glass-border)] bg-[var(--color-bg-surface)] p-8 transition-all hover:border-[var(--accent-primary)]/50 hover:bg-[var(--accent-dim)]"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-dim)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/30 group-hover:scale-110 transition-transform shadow-[0_0_15px_var(--accent-dim)]">
                <Fingerprint size={28} />
              </div>
              <div className="text-center">
                <h4 className="text-[10px] font-bold text-[var(--color-text-primary)] uppercase tracking-widest mb-1">App Icon</h4>
                <p className="text-[8px] text-[var(--color-text-secondary)] uppercase tracking-tighter">Branding</p>
              </div>
            </button>

            <button
              onClick={() => setActiveSettingsPage('identity')}
              className="group flex flex-col items-center justify-center gap-6 rounded-[2rem] border border-[var(--color-glass-border)] bg-[var(--color-bg-surface)] p-8 transition-all hover:border-[var(--accent-primary)]/50 hover:bg-[var(--accent-dim)]"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-dim)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/30 group-hover:scale-110 transition-transform shadow-[0_0_15px_var(--accent-dim)]">
                <Cpu size={28} />
              </div>
              <div className="text-center">
                <h4 className="text-[10px] font-bold text-[var(--color-text-primary)] uppercase tracking-widest mb-1">Logo Select</h4>
                <p className="text-[8px] text-[var(--color-text-secondary)] uppercase tracking-tighter">Identity</p>
              </div>
            </button>
          </motion.div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[60] bg-[var(--color-cyber-black)] flex flex-col p-6 noise-overlay overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-12 relative">
            <div className="flex items-center">
              {activeSettingsPage && (
                <button 
                  onClick={closePage}
                  className="p-3 -ml-3 text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] rounded-full transition-all active:scale-90"
                >
                  <ChevronLeft size={24} />
                </button>
              )}
            </div>
            
            <div className="absolute left-1/2 -translate-x-1/2">
              {apiKey && (
                <div className="flex items-center gap-2.5 text-[var(--accent-primary)] bg-[var(--accent-dim)] px-4 py-1.5 rounded-full border border-[var(--accent-primary)]/30 shadow-[0_0_15px_var(--accent-dim)] whitespace-nowrap">
                  <CheckCircle2 size={14} className="shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em]">System Active</span>
                </div>
              )}
            </div>

            <button 
              onClick={() => setSettingsOpen(false)}
              className="p-2 text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] rounded-full transition-all active:scale-90"
            >
              <X size={20} />
            </button>
          </div>

          {/* Page Content */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 pb-20">
            {renderContent()}
          </div>

          {/* Footer Branding */}
          <div className="fixed bottom-8 left-0 right-0 text-center pointer-events-none opacity-20">
             <span className="text-[10px] font-bold uppercase tracking-[1em] text-[var(--color-text-primary)]">
               THIS APP CREATED BY SHEIKH SADI
             </span>
             <p className="text-[10px] text-[var(--color-text-secondary)] tracking-wider mt-2">
               MOTO ARCHITECTURE
             </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
