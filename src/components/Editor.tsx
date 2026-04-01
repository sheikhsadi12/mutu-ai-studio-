import { useState, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Type, Trash2, Sparkles, Zap, Loader2, Menu, Mic, Upload, X, Plus, Play, CheckCircle2, AlertCircle, Clock, Smile, Gauge } from 'lucide-react';
import clsx from 'clsx';
import VoiceSelector from './VoiceSelector';
import { audioEngine } from '../lib/AudioEngine';
import { useSettingsStore } from '../store/useSettingsStore';
import Toast, { ToastRef } from './Toast';

export default function Editor() {
  const [text, setText] = useState('');
  const [styleInstruction, setStyleInstruction] = useState('');
  const { 
    isGenerating, apiKey, clonedVoiceData, setClonedVoiceData,
    selectedVoice, voicePitch, speakingRate, emotion,
    batchQueue, addBatchItem, removeBatchItem, updateBatchItemStatus,
    isBatchProcessing, setIsBatchProcessing
  } = useSettingsStore();
  
  const toastRef = useRef<ToastRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    setText('');
    setStyleInstruction('');
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toastRef.current?.show("Please upload an audio file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setClonedVoiceData(base64);
      toastRef.current?.show("Voice sample uploaded successfully.");
    };
    reader.readAsDataURL(file);
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
      await audioEngine.generateAudio(text, styleInstruction, true, {
        voice: selectedVoice,
        pitch: voicePitch,
        rate: speakingRate,
        emotion: emotion
      });
      
      // Calculate and show quality metrics
      let score = 100;
      if (speakingRate > 1.5 || speakingRate < 0.8) score -= 15;
      if (Math.abs(voicePitch) > 5) score -= 10;
      if (text.length > 2000) score -= 5;
      
      let qualityText = score >= 90 ? "Excellent" : score >= 75 ? "Good" : "Fair";
      toastRef.current?.show(`Synthesis Complete. Est. Quality: ${qualityText} (${score}/100)`);
      
    } catch (error) {
      toastRef.current?.show("Synthesis Failed: Check API Key or Quota.");
    }
  };

  const handleAddToQueue = () => {
    if (!text.trim()) {
      toastRef.current?.show("Please enter some text to queue.");
      return;
    }
    
    addBatchItem({
      text,
      styleInstruction,
      voice: selectedVoice,
      pitch: voicePitch,
      rate: speakingRate,
      emotion: emotion
    });
    
    toastRef.current?.show("Added to batch queue.");
    handleClear();
  };

  const handleProcessQueue = async () => {
    if (batchQueue.length === 0) return;
    if (!apiKey) {
      toastRef.current?.show("Neural Link Failed: Missing API Key.");
      return;
    }

    setIsBatchProcessing(true);
    
    for (const item of batchQueue) {
      if (item.status === 'completed') continue;
      
      updateBatchItemStatus(item.id, 'processing');
      try {
        const blob = await audioEngine.generateAudio(item.text, item.styleInstruction, false, {
          voice: item.voice,
          pitch: item.pitch,
          rate: item.rate,
          emotion: item.emotion
        });
        
        if (blob) {
          // Calculate quality metrics
          let score = 100;
          if (item.rate > 1.5 || item.rate < 0.8) score -= 15;
          if (Math.abs(item.pitch) > 5) score -= 10;
          if (item.text.length > 2000) score -= 5;
          let qualityText = score >= 90 ? "Excellent" : score >= 75 ? "Good" : "Fair";
          
          // Add to library
          const newFile = {
            id: Date.now().toString() + Math.random().toString(36).substring(7),
            title: `Batch_${item.voice}_${new Date().toLocaleTimeString()} [${qualityText}]`,
            voice: item.voice,
            style: item.styleInstruction,
            blob,
            duration: 0, // Duration will be calculated when loaded
            timestamp: Date.now(),
          };
          useSettingsStore.getState().addAudioFile(newFile);
          updateBatchItemStatus(item.id, 'completed');
        } else {
          updateBatchItemStatus(item.id, 'failed', 'Failed to generate audio blob');
        }
      } catch (error) {
        updateBatchItemStatus(item.id, 'failed', error instanceof Error ? error.message : 'Unknown error');
      }
    }
    
    setIsBatchProcessing(false);
    toastRef.current?.show("Batch processing complete.");
  };

  return (
    <div className="flex h-full flex-col gap-4 p-4 lg:p-8 overflow-y-auto pb-32">
      <Toast ref={toastRef} />
      
      {/* Style Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[var(--color-neon-cyan)]">
            <Sparkles size={12} />
            <span>Style Instructions</span>
          </label>
          <div className="relative group">
            <input
              type="text"
              value={styleInstruction}
              onChange={(e) => setStyleInstruction(e.target.value)}
              placeholder="E.g., Speak like a news anchor..."
              className="w-full rounded-xl border border-[var(--color-glass-border)] bg-[var(--color-bg-hover)] px-4 py-3 text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] transition-all focus:border-[var(--color-neon-cyan)] focus:bg-[var(--color-bg-hover)] focus:outline-none focus:ring-1 focus:ring-[var(--color-neon-cyan)]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[var(--color-neon-cyan)]">
            <Mic size={12} />
            <span>AI Voice Cloning</span>
          </label>
          <div className="relative group">
            <div className={clsx(
              "flex items-center justify-between w-full rounded-xl border px-4 py-2.5 transition-all",
              clonedVoiceData ? "border-[var(--color-neon-cyan)] bg-[var(--color-neon-cyan-dim)]/10" : "border-[var(--color-glass-border)] bg-[var(--color-bg-hover)]"
            )}>
              <div className="flex items-center gap-3 overflow-hidden">
                {clonedVoiceData ? (
                  <>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-neon-cyan)] text-[var(--color-text-on-accent)]">
                      <Mic size={14} />
                    </div>
                    <span className="truncate text-xs font-medium text-[var(--color-text-primary)]">Voice Sample Active</span>
                  </>
                ) : (
                  <>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]">
                      <Upload size={14} />
                    </div>
                    <span className="text-xs text-[var(--color-text-secondary)]">Upload voice sample (MP3/WAV)</span>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                {clonedVoiceData ? (
                  <button 
                    onClick={() => setClonedVoiceData(null)}
                    className="p-1.5 text-[var(--color-text-secondary)] hover:text-red-400 transition-colors"
                  >
                    <X size={16} />
                  </button>
                ) : (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg bg-[var(--color-neon-cyan)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-on-accent)] hover:scale-105 transition-all"
                  >
                    Upload
                  </button>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="audio/*" 
                className="hidden" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Text Area */}
      <div className="relative flex-[2] min-h-[300px]">
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-[var(--color-neon-cyan-dim)] to-transparent opacity-50 blur-sm" />
        <div className={clsx(
          "relative flex h-full flex-col overflow-hidden rounded-2xl border bg-[var(--color-cyber-black)]/40 backdrop-blur-2xl transition-all duration-500 noise-overlay",
          isGenerating 
            ? "border-[var(--color-neon-cyan)] shadow-[0_0_30px_rgba(0,255,242,0.2)]" 
            : "border-[var(--color-glass-border)]"
        )}>
          <div className="flex items-center justify-between border-b border-[var(--color-glass-border)] bg-[var(--color-bg-hover)] px-4 py-1.5">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
              <Type size={12} />
              <span>SCRIPT EDITOR</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider">
                {text.length} chars
              </span>
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <Trash2 size={12} />
                Clear
              </button>
            </div>
          </div>
          
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your script here..."
            className="flex-1 resize-none bg-transparent p-6 text-base leading-relaxed text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none font-sans"
            spellCheck={false}
          />
          
          {/* Action Bar */}
          <div className="border-t border-[var(--color-glass-border)] bg-[var(--color-bg-hover)] p-2 flex justify-between items-center">
             <button
                onClick={handleAddToQueue}
                disabled={isGenerating || !text.trim()}
                className="flex items-center gap-2 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-glass-border)] px-4 py-2 font-bold text-[var(--color-text-primary)] transition-all hover:border-[var(--color-neon-cyan)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={18} />
                <span className="text-xs">ADD TO QUEUE</span>
              </button>
             <button
                onClick={handleGenerate}
                disabled={isGenerating || !text.trim()}
                className="flex items-center gap-2 rounded-xl bg-[var(--color-neon-cyan)] px-4 py-2 font-bold text-[var(--color-text-on-accent)] transition-all hover:scale-105 hover:shadow-[0_0_20px_var(--color-neon-cyan)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shimmer-button"
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

      <VoiceSelector />

      {/* Batch Queue Panel */}
      {batchQueue.length > 0 && (
        <div className="mt-4 rounded-2xl border border-[var(--color-glass-border)] bg-[var(--color-cyber-black)]/40 backdrop-blur-2xl overflow-hidden noise-overlay">
          <div className="flex items-center justify-between border-b border-[var(--color-glass-border)] bg-[var(--color-bg-hover)] px-4 py-3">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[var(--color-neon-cyan)]">
              <Menu size={14} />
              <span>Batch Queue ({batchQueue.length})</span>
            </div>
            <button
              onClick={handleProcessQueue}
              disabled={isBatchProcessing || batchQueue.every(item => item.status === 'completed')}
              className="flex items-center gap-2 rounded-lg bg-[var(--color-neon-cyan)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-on-accent)] transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isBatchProcessing ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>PROCESSING...</span>
                </>
              ) : (
                <>
                  <Play size={14} fill="currentColor" />
                  <span>PROCESS QUEUE</span>
                </>
              )}
            </button>
          </div>
          <div className="max-h-[300px] overflow-y-auto p-2 space-y-2">
            <AnimatePresence>
              {batchQueue.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center justify-between rounded-xl border border-[var(--color-glass-border)] bg-[var(--color-bg-surface)] p-3"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="truncate text-sm text-[var(--color-text-primary)] font-medium">
                      {item.text}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-text-secondary)]">
                      <span className="flex items-center gap-1"><Mic size={10}/> {item.voice}</span>
                      <span className="flex items-center gap-1"><Smile size={10}/> {item.emotion}</span>
                      <span className="flex items-center gap-1"><Gauge size={10}/> {item.rate}x</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.status === 'pending' && <Clock size={16} className="text-[var(--color-text-secondary)]" />}
                    {item.status === 'processing' && <Loader2 size={16} className="text-[var(--color-neon-cyan)] animate-spin" />}
                    {item.status === 'completed' && <CheckCircle2 size={16} className="text-green-400" />}
                    {item.status === 'failed' && (
                      <div className="group relative">
                        <AlertCircle size={16} className="text-red-400" />
                        <div className="absolute right-0 top-full mt-1 hidden w-48 rounded bg-red-500/10 border border-red-500/20 p-2 text-[10px] text-red-400 group-hover:block z-10">
                          {item.error}
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => removeBatchItem(item.id)}
                      disabled={item.status === 'processing'}
                      className="p-1.5 text-[var(--color-text-secondary)] hover:text-red-400 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
