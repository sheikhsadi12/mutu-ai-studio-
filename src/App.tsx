import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import AudioPlayer from './components/AudioPlayer';
import SettingsModal from './components/SettingsModal';
import { useSettingsStore } from './store/useSettingsStore';
import { ShieldCheck, AlertTriangle, Menu } from 'lucide-react';

export default function App() {
  const { apiKey, setSidebarOpen, setSettingsOpen } = useSettingsStore();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--color-cyber-black)] text-[var(--color-text-primary)] font-sans selection:bg-[var(--color-neon-cyan)] selection:text-[var(--color-text-on-accent)]">
      <Sidebar />
      
      <main className="flex flex-1 flex-col relative w-full">
        {/* Top Nav / Status Bar */}
        <header className="flex h-16 items-center justify-between px-4 lg:px-8 border-b border-[var(--color-glass-border)] bg-[var(--color-cyber-black)]/50 backdrop-blur-sm z-10 shrink-0">
          <div className="flex items-center gap-3 lg:hidden">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              <Menu size={24} />
            </button>
            <span className="font-bold text-[var(--color-neon-cyan)]">MUTU</span>
          </div>

          <button 
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-3 rounded-full border border-[var(--color-glass-border)] bg-[var(--color-bg-surface)] px-4 py-1.5 backdrop-blur-md ml-auto hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer"
          >
            <span className="hidden sm:inline text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
              API Status:
            </span>
            {apiKey ? (
              <div className="flex items-center gap-1.5 text-[var(--color-neon-cyan)]">
                <ShieldCheck size={14} />
                <span className="text-xs font-bold shadow-[0_0_10px_var(--color-neon-cyan)]">ACTIVE</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-red-500">
                <AlertTriangle size={14} />
                <span className="text-xs font-bold">MISSING</span>
              </div>
            )}
          </button>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden relative p-4 sm:p-6 lg:p-8">
          <Editor />
        </div>

        {/* Bottom Player */}
        <AudioPlayer />
        
        {/* Modals */}
        <SettingsModal />
      </main>
    </div>
  );
}
