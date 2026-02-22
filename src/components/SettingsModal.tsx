import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Key, ShieldCheck, AlertCircle, Settings, Palette, Cpu, Moon, Sun } from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import clsx from 'clsx';

type Tab = 'api' | 'appearance' | 'ai';

const ACCENT_COLORS = [
  { name: 'Neon Cyan', value: '#00f3ff' },
  { name: 'Cyber Purple', value: '#a855f7' },
  { name: 'Matrix Green', value: '#22c55e' },
  { name: 'Solar Orange', value: '#f97316' },
  { name: 'Plasma Pink', value: '#ec4899' },
  { name: 'Electric Blue', value: '#3b82f6' },
  { name: 'Crimson Red', value: '#ef4444' },
  { name: 'Golden Yellow', value: '#eab308' },
  { name: 'Mint Frost', value: '#2dd4bf' },
  { name: 'Lavender Haze', value: '#818cf8' },
  { name: 'Rose Gold', value: '#fb7185' },
  { name: 'Deep Sea', value: '#0369a1' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Amber', value: '#d97706' },
  { name: 'Slate', value: '#475569' },
  { name: 'Midnight', value: '#1e293b' },
  { name: 'Iridescent Black', value: '#1a1a1a' },
  { name: 'Royal Indigo', value: '#4338ca' },
  { name: 'Sunset Rose', value: '#be123c' },
  { name: 'Forest Moss', value: '#166534' },
  { name: 'Oceanic Teal', value: '#0f766e' },
  { name: 'Volcanic Ash', value: '#334155' },
  { name: 'Stellar White', value: '#f8fafc' },
];

export default function SettingsModal() {
  const { 
    apiKey, setApiKey, 
    isSettingsOpen, setSettingsOpen,
    themeMode, setThemeMode,
    accentColor, setAccentColor
  } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<Tab>('api');
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [showAllColors, setShowAllColors] = useState(false);

  // Sync local state with store
  useEffect(() => {
    if (apiKey) {
      setInputValue(apiKey);
    }
  }, [apiKey]);

  // Apply theme and accent color to root
  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'dark') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', 'light');
    }
    
    // Update accent color variable dynamically
    // Note: In a real Tailwind setup with @theme, we might need a different approach 
    // if variables are static, but since we used CSS vars in index.css, this works.
    root.style.setProperty('--accent-primary', accentColor);
    root.style.setProperty('--accent-dim', `${accentColor}1A`); // 10% opacity
  }, [themeMode, accentColor]);

  // Force open if no API key
  useEffect(() => {
    if (!apiKey && !isSettingsOpen) {
      setSettingsOpen(true);
      setActiveTab('api');
    }
  }, [apiKey, isSettingsOpen, setSettingsOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue.trim().length < 10) {
      setError('Invalid API Key format');
      return;
    }
    setApiKey(inputValue.trim());
    setError('');
    // Don't close immediately, show success feedback or just stay open
  };

  const handleClose = () => {
    if (apiKey) {
      setSettingsOpen(false);
    } else {
      setError("API Key is required to use the app.");
    }
  };

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="flex h-[600px] w-full max-w-4xl overflow-hidden rounded-2xl border border-[var(--color-glass-border)] bg-[var(--color-cyber-black)] shadow-2xl shadow-[var(--color-neon-cyan-dim)]"
          >
            {/* Sidebar Navigation */}
            <div className="w-64 border-r border-[var(--color-glass-border)] bg-black/20 p-6 hidden md:block">
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-neon-cyan-dim)] text-[var(--color-neon-cyan)]">
                  <Settings size={18} />
                </div>
                <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Settings</h2>
              </div>
              
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('api')}
                  className={clsx(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    activeTab === 'api' 
                      ? "bg-[var(--color-neon-cyan-dim)] text-[var(--color-neon-cyan)]" 
                      : "text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-[var(--color-text-primary)]"
                  )}
                >
                  <Key size={16} />
                  API Configuration
                </button>
                <button
                  onClick={() => setActiveTab('appearance')}
                  className={clsx(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    activeTab === 'appearance' 
                      ? "bg-[var(--color-neon-cyan-dim)] text-[var(--color-neon-cyan)]" 
                      : "text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-[var(--color-text-primary)]"
                  )}
                >
                  <Palette size={16} />
                  Appearance
                </button>
                <button
                  onClick={() => setActiveTab('ai')}
                  className={clsx(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    activeTab === 'ai' 
                      ? "bg-[var(--color-neon-cyan-dim)] text-[var(--color-neon-cyan)]" 
                      : "text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-[var(--color-text-primary)]"
                  )}
                >
                  <Cpu size={16} />
                  AI Model
                </button>
              </nav>
            </div>

            {/* Mobile Nav (Top) */}
            <div className="md:hidden absolute top-0 left-0 right-0 h-16 border-b border-[var(--color-glass-border)] bg-[var(--color-cyber-black)] flex items-center px-4 gap-4 overflow-x-auto z-10">
               <button onClick={() => setActiveTab('api')} className={clsx("whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium", activeTab === 'api' ? "bg-[var(--color-neon-cyan)] text-black" : "text-gray-400")}>API Config</button>
               <button onClick={() => setActiveTab('appearance')} className={clsx("whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium", activeTab === 'appearance' ? "bg-[var(--color-neon-cyan)] text-black" : "text-gray-400")}>Appearance</button>
               <button onClick={() => setActiveTab('ai')} className={clsx("whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium", activeTab === 'ai' ? "bg-[var(--color-neon-cyan)] text-black" : "text-gray-400")}>AI Model</button>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col relative md:static mt-16 md:mt-0">
              {/* Header with Close */}
              <div className="flex items-center justify-between p-6 border-b border-[var(--color-glass-border)]">
                <h3 className="text-xl font-semibold text-[var(--color-text-primary)] capitalize">
                  {activeTab === 'api' ? 'API Configuration' : activeTab}
                </h3>
                {apiKey && (
                  <button
                    onClick={handleClose}
                    className="rounded-full p-2 text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-[var(--color-text-primary)]"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'api' && (
                  <div className="max-w-lg">
                    <div className="mb-6">
                      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                        Enter your Gemini API Key to activate the Neural Speech Engine. 
                        The key is stored locally on your device.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="relative">
                        <input
                          type="password"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder="Enter your Gemini API Key"
                          className="w-full rounded-xl border border-[var(--color-glass-border)] bg-white/5 px-4 py-3 pl-11 text-[var(--color-text-primary)] placeholder-gray-500 focus:border-[var(--color-neon-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--color-neon-cyan)]"
                        />
                        <ShieldCheck className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
                      </div>

                      {error && (
                        <div className="flex items-center gap-2 text-sm text-red-400">
                          <AlertCircle size={16} />
                          <span>{error}</span>
                        </div>
                      )}

                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setInputValue('');
                            setApiKey('');
                          }}
                          className="flex-1 rounded-xl border border-red-500/30 px-4 py-3 font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          Clear Key
                        </button>
                        <button
                          type="submit"
                          className="flex-[2] rounded-xl bg-[var(--color-neon-cyan)] px-4 py-3 font-medium text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          Save Configuration
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeTab === 'appearance' && (
                  <div className="space-y-8">
                    {/* Theme Mode */}
                    <section>
                      <h4 className="mb-4 text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Theme Mode</h4>
                      <div className="grid grid-cols-2 gap-4 max-w-md">
                        <button
                          onClick={() => setThemeMode('dark')}
                          className={clsx(
                            "flex items-center justify-center gap-2 rounded-xl border p-3 transition-all",
                            themeMode === 'dark'
                              ? "border-[var(--color-neon-cyan)] bg-[var(--color-neon-cyan-dim)] text-[var(--color-text-primary)]"
                              : "border-[var(--color-glass-border)] bg-white/5 text-[var(--color-text-secondary)] hover:bg-white/10"
                          )}
                        >
                          <Moon size={18} />
                          <span className="font-medium text-sm">Dark Mode</span>
                        </button>
                        <button
                          onClick={() => setThemeMode('light')}
                          className={clsx(
                            "flex items-center justify-center gap-2 rounded-xl border p-3 transition-all",
                            themeMode === 'light'
                              ? "border-[var(--color-neon-cyan)] bg-[var(--color-neon-cyan-dim)] text-[var(--color-text-primary)]"
                              : "border-[var(--color-glass-border)] bg-white/5 text-[var(--color-text-secondary)] hover:bg-white/10"
                          )}
                        >
                          <Sun size={18} />
                          <span className="font-medium text-sm">Light Mode</span>
                        </button>
                      </div>
                    </section>

                    {/* Accent Color */}
                    <section>
                      <h4 className="mb-4 text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Accent Color</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                        {/* Current/Selected Color Spot */}
                        <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-neon-cyan)] bg-[var(--color-neon-cyan-dim)]">
                          <div
                            className="h-10 w-10 rounded-full border-2 border-white shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                            style={{ backgroundColor: accentColor }}
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-tight">
                              {ACCENT_COLORS.find(c => c.value === accentColor)?.name || 'Custom'}
                            </span>
                            <span className="text-[10px] font-medium text-[var(--color-text-secondary)] uppercase">Active Color</span>
                          </div>
                        </div>

                        {/* More Colors Trigger */}
                        <button
                          onClick={() => setShowAllColors(!showAllColors)}
                          className={clsx(
                            "flex items-center justify-center gap-2 rounded-xl border p-3 transition-all",
                            showAllColors 
                              ? "border-[var(--color-neon-cyan)] bg-white/10" 
                              : "border-[var(--color-glass-border)] bg-white/5 hover:bg-white/10"
                          )}
                        >
                          <Palette size={18} className={showAllColors ? "text-[var(--color-neon-cyan)]" : "text-gray-400"} />
                          <span className="font-bold text-xs uppercase tracking-widest">More Colors</span>
                        </button>
                      </div>

                      {/* Color Grid (Collapsible) */}
                      <AnimatePresence>
                        {showAllColors && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mt-4"
                          >
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 p-4 rounded-2xl border border-[var(--color-glass-border)] bg-black/40 backdrop-blur-md">
                              {ACCENT_COLORS.map((color) => (
                                <button
                                  key={color.value}
                                  onClick={() => {
                                    setAccentColor(color.value);
                                    setShowAllColors(false);
                                  }}
                                  className={clsx(
                                    "group relative flex flex-col items-center gap-2 transition-all hover:scale-110",
                                    accentColor === color.value ? "scale-110" : "opacity-60 hover:opacity-100"
                                  )}
                                  title={color.name}
                                >
                                  <div 
                                    className={clsx(
                                      "h-8 w-8 rounded-full border-2 shadow-lg transition-all",
                                      accentColor === color.value ? "border-white scale-110" : "border-transparent"
                                    )}
                                    style={{ backgroundColor: color.value }}
                                  />
                                  <span className="text-[8px] font-bold uppercase tracking-tighter text-center w-full truncate">
                                    {color.name}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </section>
                  </div>
                )}

                {activeTab === 'ai' && (
                  <div className="text-center py-12">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-neon-cyan-dim)] text-[var(--color-neon-cyan)] mb-4">
                      <Cpu size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-[var(--color-text-primary)]">Advanced AI Settings</h3>
                    <p className="text-[var(--color-text-secondary)] mt-2 max-w-md mx-auto">
                      Configuration for temperature, top-k, and custom system prompts will be available in the next update.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
