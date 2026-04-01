import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, X, ChevronDown, ChevronUp, Zap, Activity, Cpu } from 'lucide-react';
import clsx from 'clsx';

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'neural';
  message: string;
}

export default function LiveConsole() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleLog = (event: any) => {
      const { type, message } = event.detail;
      const newLog: LogEntry = {
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type,
        message
      };
      setLogs(prev => [...prev.slice(-49), newLog]);
    };

    window.addEventListener('mutu-log', handleLog);
    
    // Initial log
    if (logs.length === 0) {
      window.dispatchEvent(new CustomEvent('mutu-log', { 
        detail: { type: 'neural', message: 'Neural Core Initialized. Awaiting script input...' } 
      }));
    }

    return () => window.removeEventListener('mutu-log', handleLog);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isOpen]);

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2 pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-80 h-64 rounded-2xl border border-[var(--color-glass-border)] bg-[var(--color-cyber-black)]/80 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto noise-overlay"
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-glass-border)] bg-[var(--color-bg-hover)]">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-neon-cyan)]">
                <Terminal size={12} />
                <span>Neural Console</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-3 font-mono text-[10px] space-y-1.5 scrollbar-hide"
            >
              {logs.map((log) => (
                <div key={log.id} className="flex gap-2 animate-in fade-in slide-in-from-left-1 duration-300">
                  <span className="text-[var(--color-text-secondary)] shrink-0">[{log.timestamp}]</span>
                  <span className={clsx(
                    "font-bold shrink-0",
                    log.type === 'info' && "text-blue-400",
                    log.type === 'success' && "text-green-400",
                    log.type === 'warning' && "text-yellow-400",
                    log.type === 'error' && "text-red-400",
                    log.type === 'neural' && "text-[var(--color-neon-cyan)]"
                  )}>
                    {log.type.toUpperCase()}
                  </span>
                  <span className="text-[var(--color-text-primary)] break-words">{log.message}</span>
                </div>
              ))}
            </div>

            <div className="px-3 py-1.5 border-t border-[var(--color-glass-border)] bg-[var(--color-bg-hover)] flex items-center justify-between text-[8px] font-bold uppercase tracking-tighter text-[var(--color-text-secondary)]">
              <div className="flex items-center gap-2">
                <Activity size={10} className="text-green-400 animate-pulse" />
                <span>Core: Active</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu size={10} className="text-[var(--color-neon-cyan)]" />
                <span>Latency: 42ms</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto flex items-center gap-2 rounded-full border border-[var(--color-glass-border)] bg-[var(--color-bg-surface)]/80 backdrop-blur-md px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-primary)] shadow-lg transition-all hover:border-[var(--color-neon-cyan)] hover:scale-105 group"
      >
        <div className={clsx(
          "h-1.5 w-1.5 rounded-full",
          isOpen ? "bg-[var(--color-neon-cyan)] animate-pulse" : "bg-[var(--color-text-secondary)]"
        )} />
        <Terminal size={14} className="group-hover:text-[var(--color-neon-cyan)] transition-colors" />
        <span>Console</span>
        {isOpen ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
      </button>
    </div>
  );
}
