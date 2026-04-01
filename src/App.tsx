import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import LiveConsole from './components/LiveConsole';
import AudioPlayer from './components/AudioPlayer';
import SettingsOverlay from './components/SettingsOverlay';
import SplashScreen from './components/SplashScreen';
import { useSettingsStore } from './store/useSettingsStore';
import { ShieldCheck, AlertTriangle, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import clsx from 'clsx';

export default function App() {
  const { apiKey, setSidebarOpen, setSettingsOpen, activeTab, setActiveTab } = useSettingsStore();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={() => {}} />}
      </AnimatePresence>
      
      <div className="flex h-screen w-full overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent-primary)] selection:text-[var(--text-on-accent)]">
        <Sidebar />
        
        <main className="flex flex-1 flex-col relative w-full bg-[var(--bg-secondary)]">
          {/* Top Nav / Status Bar */}
          <header className="flex h-12 items-center justify-between px-4 lg:px-8 bg-[var(--bg-secondary)] z-10 shrink-0 border-b border-[var(--border-glass)]">
            <div className="flex items-center gap-3 lg:hidden">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <Menu size={20} />
              </button>
              <span className="font-bold text-[var(--accent-primary)] text-sm">MUTU</span>
            </div>

            <button 
              onClick={() => setSettingsOpen(true)}
              className="flex items-center justify-center rounded-full border border-[var(--border-glass)] bg-[var(--bg-surface)] w-8 h-8 ml-auto hover:bg-[var(--bg-hover)] transition-all cursor-pointer group"
            >
              {apiKey ? (
                <div className="text-[var(--accent-primary)] group-hover:scale-110 transition-transform shrink-0">
                  <ShieldCheck size={16} />
                </div>
              ) : (
                <div className="text-[var(--accent-primary)] opacity-50 group-hover:scale-110 transition-transform shrink-0">
                  <AlertTriangle size={16} />
                </div>
              )}
            </button>
          </header>

          {/* Main Content Area */}
          <div className="flex items-center justify-center gap-4 p-4 border-b border-[var(--border-glass)] bg-[var(--bg-secondary)]">
            <button
              onClick={() => setActiveTab('studio')}
              className={clsx(
                "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all",
                activeTab === 'studio' 
                  ? "bg-[var(--accent-primary)] text-[var(--text-on-accent)] shadow-[0_0_15px_var(--accent-dim)]" 
                  : "bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              Studio
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className={clsx(
                "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all",
                activeTab === 'live' 
                  ? "bg-[var(--accent-primary)] text-[var(--text-on-accent)] shadow-[0_0_15px_var(--accent-dim)]" 
                  : "bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              Live Console
            </button>
          </div>

          <div className="flex-1 overflow-hidden relative px-4 sm:px-6 lg:px-8">
            {activeTab === 'studio' ? <Editor /> : <LiveConsole />}
          </div>

          {/* Bottom Player */}
          <AudioPlayer />
          
          {/* Modals */}
          <SettingsOverlay />
        </main>
      </div>
    </>
  );
}
