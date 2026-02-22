import { Home, Library, Settings, Plus } from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import clsx from 'clsx';

export default function BottomNav() {
  const { setSettingsOpen } = useSettingsStore();

  const scrollToTop = () => {
    // Scroll the main container or specific elements
    // Since we are using a flex col layout with overflow-hidden on the container, 
    // and specific overflow on children (Editor has scroll, Library has scroll),
    // "Scrolling to top" might mean focusing the Editor.
    // For now, let's just ensure we are in the "Studio" view context.
    // In the stacked layout, Studio (Editor) is always at the top.
    const editor = document.querySelector('textarea');
    if (editor) editor.focus();
  };

  const scrollToLibrary = () => {
     // In the stacked layout, Library is the bottom part.
     // We can't really "scroll" to it if it's fixed height, but we can focus it or maybe expand it?
     // For now, let's just assume it's visible.
  };

  const handleNewProject = () => {
      // Dispatch event to clear editor or similar
      window.dispatchEvent(new Event('new-project'));
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--color-cyber-black)]/90 backdrop-blur-xl border-t border-[var(--color-glass-border)] flex items-center justify-around z-40 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
      <button onClick={scrollToTop} className="flex flex-col items-center gap-1 text-gray-400 hover:text-[var(--color-neon-cyan)] active:scale-95 transition-transform">
        <Home size={20} />
        <span className="text-[10px] font-medium">Studio</span>
      </button>
      
      <button onClick={handleNewProject} className="flex flex-col items-center gap-1 text-gray-400 hover:text-[var(--color-neon-cyan)] active:scale-95 transition-transform">
        <Plus size={20} />
        <span className="text-[10px] font-medium">New</span>
      </button>

      <button onClick={scrollToLibrary} className="flex flex-col items-center gap-1 text-gray-400 hover:text-[var(--color-neon-cyan)] active:scale-95 transition-transform">
        <Library size={20} />
        <span className="text-[10px] font-medium">Library</span>
      </button>

      <button onClick={() => setSettingsOpen(true)} className="flex flex-col items-center gap-1 text-gray-400 hover:text-[var(--color-neon-cyan)] active:scale-95 transition-transform">
        <Settings size={20} />
        <span className="text-[10px] font-medium">Settings</span>
      </button>
    </div>
  );
}
