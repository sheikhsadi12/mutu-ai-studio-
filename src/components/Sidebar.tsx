import { motion, AnimatePresence } from 'motion/react';
import { Library, Music, Settings, X } from 'lucide-react';
import AudioLibrary from './AudioLibrary';
import { useSettingsStore } from '../store/useSettingsStore';
import clsx from 'clsx';
import { useEffect } from 'react';

export default function Sidebar() {
  const { setSettingsOpen, isSidebarOpen, setSidebarOpen } = useSettingsStore();

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
    <div className="flex h-full flex-col bg-[var(--color-cyber-black)]/95 backdrop-blur-xl lg:bg-[var(--color-cyber-black)]/80 lg:backdrop-blur-md">
      <div className="flex h-12 items-center justify-between px-6 border-b border-[var(--color-glass-border)] shrink-0">
        <div className="flex items-center gap-2 font-bold text-[var(--color-neon-cyan)]">
          <Music size={20} />
          <span>MUTU AUDIO</span>
        </div>
        {/* Mobile Close Button */}
        <button 
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <AudioLibrary />
      </div>

      <div className="border-t border-[var(--color-glass-border)] p-4 shrink-0">
        <button 
          onClick={() => {
            setSettingsOpen(true);
            setSidebarOpen(false); // Close sidebar on mobile when settings clicked
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
        >
          <Settings size={16} />
          Settings
        </button>
        
        <div className="mt-2 px-3 text-center">
          <p className="text-[10px] font-medium text-gray-600 uppercase tracking-[0.2em] leading-relaxed">
            This app created by <br />
            <span className="text-gray-400 font-bold">Sheikh Sadi</span>
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
