import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Type, Trash2, Sparkles, Zap, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import VoiceSelector from './VoiceSelector';
import { audioEngine } from '../lib/AudioEngine';
import { useSettingsStore } from '../store/useSettingsStore';
import Toast, { ToastRef } from './Toast';

export default function Editor() {
  const [text, setText] = useState('');
  const [styleInstruction, setStyleInstruction] = useState('');
  const { isGenerating, apiKey } = useSettingsStore();
  const toastRef = useRef<ToastRef>(null);

  const handleClear = () => {
    setText('');
    setStyleInstruction('');
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      toastRef.current?.show("Please enter some text to synthesize.");
      return;
    }
    if (!apiKey) {
      toastRef.current?.show("Neural Link Failed: Missing API Key.");
      return;
    }

    try {
      await audioEngine.generateAudio(text, styleInstruction);
    } catch (error) {
      toastRef.current?.show("Synthesis Failed: Check API Key or Quota.");
    }
  };

  return (
    <div className="flex h-full flex-col gap-6 p-4 lg:p-8 overflow-y-auto pb-32">
      <Toast ref={toastRef} />
      
      {/* Style Instructions */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-neon-cyan)]">
          <Sparkles size={16} />
          <span>Style Instructions</span>
        </label>
        <div className="relative group">
          <input
            type="text"
            value={styleInstruction}
            onChange={(e) => setStyleInstruction(e.target.value)}
            placeholder="E.g., Speak like a news anchor, Expressive storyteller, খুব দ্রুত বলো..."
            className="w-full rounded-xl border border-[var(--color-glass-border)] bg-[var(--color-bg-hover)] px-4 py-3 text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] transition-all focus:border-[var(--color-neon-cyan)] focus:bg-[var(--color-bg-hover)] focus:outline-none focus:ring-1 focus:ring-[var(--color-neon-cyan)]"
          />
          <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-[var(--color-neon-cyan)] to-purple-600 opacity-0 blur transition-opacity duration-500 group-focus-within:opacity-20" />
        </div>
      </div>

      {/* Main Text Area */}
      <div className="relative flex-1 min-h-[300px]">
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-[var(--color-neon-cyan-dim)] to-transparent opacity-50 blur-sm" />
        <div className={clsx(
          "relative flex h-full flex-col overflow-hidden rounded-2xl border bg-[var(--color-cyber-black)]/40 backdrop-blur-md transition-all duration-500",
          isGenerating 
            ? "border-[var(--color-neon-cyan)] shadow-[0_0_30px_rgba(0,255,242,0.2)]" 
            : "border-[var(--color-glass-border)]"
        )}>
          <div className="flex items-center justify-between border-b border-[var(--color-glass-border)] bg-[var(--color-bg-hover)] px-4 py-2">
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-secondary)]">
              <Type size={14} />
              <span>SCRIPT EDITOR</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-[var(--color-text-secondary)]">
                {text.length} characters
              </span>
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <Trash2 size={14} />
                Clear
              </button>
            </div>
          </div>
          
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your script here..."
            className="flex-1 resize-none bg-transparent p-6 text-lg leading-relaxed text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none font-sans"
            spellCheck={false}
          />
          
          {/* Action Bar */}
          <div className="border-t border-[var(--color-glass-border)] bg-[var(--color-bg-hover)] p-2 flex justify-end">
             <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center gap-2 rounded-xl bg-[var(--color-neon-cyan)] px-4 py-2 font-bold text-[var(--color-text-on-accent)] transition-all hover:scale-105 hover:shadow-[0_0_20px_var(--color-neon-cyan)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>SYNCING...</span>
                  </>
                ) : (
                  <>
                    <Zap size={18} fill="currentColor" />
                    <span>SYNTHESIZE AUDIO</span>
                  </>
                )}
              </button>
          </div>
        </div>
      </div>

      {/* Voice Selector (Now at bottom) */}
      <VoiceSelector />
    </div>
  );
}
