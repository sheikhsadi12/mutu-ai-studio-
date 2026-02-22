import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import AudioPlayer from './components/AudioPlayer';
import SettingsOverlay from './components/SettingsOverlay';
import { useSettingsStore } from './store/useSettingsStore';
import { ShieldCheck, AlertTriangle, Menu } from 'lucide-react';

export default function App() {
  const { apiKey, setSidebarOpen, setSettingsOpen } = useSettingsStore();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent-primary)] selection:text-[var(--text-on-accent)]">
      <Sidebar />
      
      <main className="flex flex-1 flex-col relative w-full bg-[var(--bg-secondary)]">
        {/* Top Nav / Status Bar */}
        <header className="flex h-16 items-center justify-between px-4 lg:px-8 bg-[var(--bg-secondary)] z-10 shrink-0">
          <div className="flex items-center gap-3 lg:hidden">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <Menu size={24} />
            </button>
            <span className="font-bold text-[var(--accent-primary)]">MUTU</span>
          </div>

          <button 
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-3 rounded-full border border-[var(--border-glass)] bg-[var(--bg-surface)] px-4 py-1.5 ml-auto hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
          >
            <span className="hidden sm:inline text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              API Status:
            </span>
            {apiKey ? (
              <div className="flex items-center gap-1.5 text-[var(--accent-primary)]">
                <ShieldCheck size={14} />
                <span className="text-xs font-bold shadow-[0_0_10px_var(--accent-primary)]">ACTIVE</span>
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
        <div className="flex-1 overflow-hidden relative px-4 sm:px-6 lg:px-8">
          <Editor />
        </div>

        {/* Bottom Player */}
        <AudioPlayer />
        
        {/* Modals */}
        <SettingsOverlay />
      </main>
    </div>
  );
}
