import { motion, AnimatePresence } from 'motion/react';
import { useSettingsStore, VoiceName } from '../store/useSettingsStore';
import { Check, Mic, ChevronDown, ChevronUp, Smile } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';

const VOICES: { name: VoiceName; desc: string; gender: string }[] = [
  { name: 'Kore', desc: 'Natural Female', gender: 'Female' },
  { name: 'Fenrir', desc: 'Deep Male', gender: 'Male' },
  { name: 'Puck', desc: 'Playful / Young', gender: 'Male' },
  { name: 'Charon', desc: 'Professional', gender: 'Male' },
  { name: 'Zephyr', desc: 'Warm / Expressive', gender: 'Female' },
];

const EMOTIONS = [
  'Neutral', 'Happy', 'Sad', 'Angry', 'Excited', 'Calm', 'Serious', 'Whispering'
];

export default function VoiceSelector() {
  const { 
    selectedVoice, setSelectedVoice, 
    emotion, setEmotion
  } = useSettingsStore();
  const [isOpen, setIsOpen] = useState(false);

  const currentVoice = VOICES.find(v => v.name === selectedVoice) || VOICES[0];

  return (
    <div className="space-y-4">
      <div>
        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[var(--color-neon-cyan)]">
          <Mic size={12} />
          <span>Neural Voice Model</span>
        </label>
        
        <div className="relative mt-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex w-full items-center justify-between rounded-xl border border-[var(--color-glass-border)] bg-[var(--color-bg-hover)] px-4 py-3 text-left transition-colors hover:border-[var(--color-neon-cyan)] focus:outline-none"
          >
            <div className="flex flex-col">
              <span className="font-bold text-[var(--color-text-primary)]">{currentVoice.name}</span>
              <span className="text-xs text-[var(--color-text-secondary)]">{currentVoice.desc}</span>
            </div>
            {isOpen ? <ChevronUp size={20} className="text-[var(--color-text-secondary)]" /> : <ChevronDown size={20} className="text-[var(--color-text-secondary)]" />}
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-[var(--color-glass-border)] bg-[var(--color-cyber-black)] shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
              >
                <div className="max-h-60 overflow-y-auto p-1">
                  {VOICES.map((voice) => (
                    <button
                      key={voice.name}
                      onClick={() => {
                        setSelectedVoice(voice.name);
                        setIsOpen(false);
                      }}
                      className={clsx(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors",
                        selectedVoice === voice.name
                          ? "bg-[var(--color-neon-cyan)] text-[var(--color-text-on-accent)]"
                          : "text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]"
                      )}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{voice.name}</span>
                        <span className={clsx("text-xs", selectedVoice === voice.name ? "text-[var(--color-text-on-accent)]/70" : "text-[var(--color-text-secondary)]")}>
                          {voice.desc}
                        </span>
                      </div>
                      {selectedVoice === voice.name && <Check size={16} />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[var(--color-neon-cyan)] mb-2">
          <Smile size={12} />
          <span>Emotion / Tone</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {EMOTIONS.map(emo => (
            <button
              key={emo}
              onClick={() => setEmotion(emo)}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                emotion === emo 
                  ? "bg-[var(--color-neon-cyan)] border-[var(--color-neon-cyan)] text-[var(--color-text-on-accent)] shadow-[0_0_10px_rgba(0,255,242,0.3)]" 
                  : "bg-[var(--color-bg-hover)] border-[var(--color-glass-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-neon-cyan)] hover:text-[var(--color-text-primary)]"
              )}
            >
              {emo}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
