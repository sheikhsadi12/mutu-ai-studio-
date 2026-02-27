import { motion, AnimatePresence } from 'motion/react';
import { Library, Music, Settings, X, Archive, Loader2, DownloadCloud, Palette, Fingerprint, Sparkles, Zap, Disc, Waves, Mic } from 'lucide-react';
import AudioLibrary from './AudioLibrary';
import { useSettingsStore } from '../store/useSettingsStore';
import { useAppIdentity } from '../context/IdentityContext';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { storageService, AudioFile } from '../lib/StorageService';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

const LOGO_ICONS: Record<string, any> = {
  sparkles: Sparkles,
  music: Music,
  zap: Zap,
  disc: Disc,
  waves: Waves,
  mic: Mic,
};

const QUICK_COLORS = [
  { name: 'Cyan', value: '#00f3ff' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Gold', value: '#eab308' },
];

export default function Sidebar() {
  const { setSettingsOpen, isSidebarOpen, setSidebarOpen, accentColor, setAccentColor, setActiveSettingsPage } = useSettingsStore();
  const { setLogoColor, triggerPulse, logoDesign, currentLogoColor, syncEnabled } = useAppIdentity();
  const [hasAudios, setHasAudios] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const SelectedIcon = LOGO_ICONS[logoDesign] || Sparkles;
  const logoColor = syncEnabled ? 'var(--accent-primary)' : currentLogoColor;

  useEffect(() => {
    const checkAudios = async () => {
      const audios = await storageService.getAudios();
      setHasAudios(audios.length > 0);
    };
    checkAudios();
    
    window.addEventListener('library-updated', checkAudios);
    return () => window.removeEventListener('library-updated', checkAudios);
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleDownloadAll = async () => {
    const audios = await storageService.getAudios();
    if (audios.length === 0) return;
    
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      audios.forEach(audio => {
        zip.file(`${audio.title}.mp3`, audio.blob);
      });
      
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `Moto_Library_${Date.now()}.zip`);
    } finally {
      setIsDownloading(false);
    }
  };

  // Close sidebar on window resize if moving to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false); // Reset state, though desktop view ignores this
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[var(--color-cyber-black)]/95 backdrop-blur-2xl lg:bg-[var(--color-cyber-black)]/80 lg:backdrop-blur-md noise-overlay">
      {/* App Logo Section */}
      <div className="p-6 border-b border-[var(--color-glass-border)]">
        <div className="flex items-center gap-4">
          <div 
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-dim)] border border-[var(--accent-primary)]/30 shadow-[0_0_20px_var(--accent-dim)] transition-all"
            style={{ color: logoColor }}
          >
            <SelectedIcon size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] font-display italic leading-none">Moto Studio</h2>
            <p className="text-[8px] text-[var(--color-text-secondary)] uppercase tracking-[0.4em] mt-1">Studio Pro</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <AudioLibrary />
      </div>

      <div className="p-4 border-t border-[var(--color-glass-border)] bg-[var(--color-bg-surface)]/30">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[9px] font-bold text-[var(--color-text-secondary)] uppercase tracking-[0.3em]">Customization</h4>
          <button 
            onClick={() => {
              setActiveSettingsPage('identity');
              setSettingsOpen(true);
            }}
            className="text-[var(--color-text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
          >
            <Fingerprint size={14} />
          </button>
        </div>
        <div className="flex items-center justify-between gap-2">
          {QUICK_COLORS.map(color => (
            <button 
              key={color.value}
              onClick={() => {
                setAccentColor(color.value);
                setLogoColor(color.value);
                triggerPulse();
              }}
              className={clsx(
                "h-8 w-8 rounded-full border transition-all hover:scale-110 shadow-lg",
                accentColor === color.value ? "border-white scale-110 shadow-[0_0_10px_var(--accent-primary)]" : "border-transparent"
              )}
              style={{ backgroundColor: color.value }}
            />
          ))}
        </div>
      </div>

      {hasAudios && (
        <div className="p-2 space-y-2">
          <button
            onClick={handleDownloadAll}
            disabled={isDownloading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-bg-surface)] py-3 text-xs font-bold uppercase tracking-widest text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] hover:border-[var(--color-neon-cyan)] border border-transparent transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Archive size={16} />
            )}
            <span>{isDownloading ? 'Zipping...' : 'Download All (ZIP)'}</span>
          </button>
          
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-neon-cyan-dim)] py-3 text-xs font-bold uppercase tracking-widest text-[var(--color-neon-cyan)] hover:bg-[var(--color-neon-cyan)] hover:text-black border border-[var(--color-neon-cyan)]/30 transition-all active:scale-[0.98]"
            >
              <DownloadCloud size={16} />
              <span>Install App</span>
            </button>
          )}
        </div>
      )}
      
      {!hasAudios && deferredPrompt && (
        <div className="p-2">
          <button
            onClick={handleInstallClick}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-neon-cyan-dim)] py-3 text-xs font-bold uppercase tracking-widest text-[var(--color-neon-cyan)] hover:bg-[var(--color-neon-cyan)] hover:text-black border border-[var(--color-neon-cyan)]/30 transition-all active:scale-[0.98]"
          >
            <DownloadCloud size={16} />
            <span>Install App</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex h-full w-72 flex-col border-r border-[var(--color-glass-border)]">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-80 border-r border-[var(--color-glass-border)] lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
