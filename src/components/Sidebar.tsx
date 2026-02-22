import { motion, AnimatePresence } from 'motion/react';
import { Library, Music, Settings, X, Cpu, Palette, Sliders } from 'lucide-react';
import AudioLibrary from './AudioLibrary';
import { useSettingsStore } from '../store/useSettingsStore';
import clsx from 'clsx';
import { useEffect } from 'react';

export default function Sidebar() {
  const { setActiveSettingsPage, isSidebarOpen, setSidebarOpen } = useSettingsStore();

  const openPage = (page: 'api' | 'appearance' | 'model') => {
    setActiveSettingsPage(page);
    window.history.pushState({ settingsPage: page }, '');
    setSidebarOpen(false);
  };

  const GlassBar = ({ icon: Icon, label, onClick, color }: { icon: any, label: string, onClick: () => void, color: string }) => (
    <motion.button
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative flex w-full items-center gap-4 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10 hover:border-white/20"
    >
      <div className={clsx("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-lg", color)}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="flex flex-col items-start">
        <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-primary)]">{label}</span>
        <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-tighter">Configure System</span>
      </div>
      <div className="absolute right-4 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
      </div>
    </motion.button>
  );

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[var(--color-cyber-black)]/95 backdrop-blur-2xl lg:bg-[var(--color-cyber-black)]/80 lg:backdrop-blur-md noise-overlay">
      <div className="flex h-16 items-center justify-between px-6 border-b border-[var(--color-glass-border)] shrink-0">
        <div className="flex items-center gap-2 font-bold text-[var(--color-neon-cyan)]">
          <Music size={24} />
          <span className="tracking-tighter text-lg">MUTU AUDIO</span>
        </div>
        {/* Mobile Close Button */}
        <button 
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <AudioLibrary />
      </div>

      <div className="p-4 space-y-3 shrink-0 border-t border-[var(--color-glass-border)]">
        <h3 className="px-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-text-secondary)] mb-2">System Control</h3>
        
        <GlassBar 
          icon={Cpu} 
          label="API Config" 
          color="bg-blue-500"
          onClick={() => openPage('api')} 
        />
        <GlassBar 
          icon={Palette} 
          label="Appearance" 
          color="bg-purple-500"
          onClick={() => openPage('appearance')} 
        />
        <GlassBar 
          icon={Sliders} 
          label="Model Engine" 
          color="bg-emerald-500"
          onClick={() => openPage('model')} 
        />
        
        <div className="pt-4 px-3 text-center border-t border-white/5">
          <p className="text-[10px] font-medium text-[var(--color-text-secondary)] uppercase tracking-[0.2em] leading-relaxed">
            Architected by <br />
            <span className="text-[var(--color-text-primary)] font-bold">Sheikh Sadi</span>
          </p>
        </div>
      </div>
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
