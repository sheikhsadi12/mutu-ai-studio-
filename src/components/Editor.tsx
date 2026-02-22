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
    <div className="flex h-full flex-col gap-6 p-4 lg:p-8 overflow-y-auto pb-32 bg-[var(--bg-primary)]">
      <Toast ref={toastRef} />
      
      {/* Style Instructions */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">
          <Sparkles size={16} />
          <span>Style Instructions</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={styleInstruction}
            onChange={(e) => setStyleInstruction(e.target.value)}
            placeholder="E.g., A calm, soothing voice..."
            className="w-full rounded-lg border border-[var(--border-glass)] bg-[var(--bg-surface)] px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-secondary)] transition-all focus:border-[var(--accent-primary)] focus:bg-[var(--bg-surface)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
          />
        </div>
      </div>

      {/* Main Text Area */}
      <div className="relative flex-1 min-h-[300px]">
        <div className={clsx(
          "relative flex h-full flex-col overflow-hidden rounded-lg border bg-[var(--bg-surface)] transition-all duration-500",
          isGenerating 
            ? "border-[var(--accent-primary)] shadow-[0_0_20px_rgba(167,139,250,0.2)]" 
            : "border-[var(--border-glass)]"
        )}>
          <div className="flex items-center justify-between border-b border-[var(--border-glass)] bg-black/20 px-4 py-2">
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              <Type size={14} />
              <span>Script</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-[var(--text-secondary)] font-mono">
                {text.length}
              </span>
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
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
            className="flex-1 resize-none bg-transparent p-6 text-lg leading-relaxed text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none font-sans"
            spellCheck={false}
          />
          
          {/* Action Bar */}
          <div className="border-t border-[var(--border-glass)] bg-black/20 p-2 flex justify-end items-center">
             <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center justify-center gap-2 rounded-lg bg-[var(--accent-primary)] px-5 py-3 font-bold text-[var(--text-on-accent)] transition-all hover:bg-violet-300 disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>SYNTHESIZING...</span>
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
