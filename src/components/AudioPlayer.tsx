import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Square, SkipBack, SkipForward, Volume2, Mic2, Save, Check, Download, ChevronUp, ChevronDown } from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import { audioEngine } from '../lib/AudioEngine';
import { useEffect, useState, ChangeEvent } from 'react';
import { storageService } from '../lib/StorageService';
import { saveAs } from 'file-saver';
import clsx from 'clsx';

export default function AudioPlayer() {
  const { 
    isPlaying, isBuffering, progress, playbackSpeed, setPlaybackSpeed, 
    selectedVoice, currentAudioId, playlist, currentIndex, setCurrentIndex, setIsPlaying 
  } = useSettingsStore();
  const [visualizerBars, setVisualizerBars] = useState<number[]>(new Array(20).fill(10));
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false); // Track if current audio is already saved
  const [isExpanded, setIsExpanded] = useState(false); // For mobile expansion

  // Reset saved state when a new audio is generated
  useEffect(() => {
    setIsSaved(false);
  }, [currentAudioId]);

  // Simple visualizer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setVisualizerBars(prev => prev.map(() => Math.random() * 80 + 10));
      }, 100);
    } else {
      setVisualizerBars(new Array(20).fill(5));
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => {
    if (isPlaying) {
      audioEngine.pause();
    } else {
      audioEngine.play();
    }
  };

  const handleStop = () => {
    audioEngine.stop();
  };

  const handleNext = async () => {
    if (playlist.length === 0) return;
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentIndex(nextIndex);
    const audio = playlist[nextIndex];
    await audioEngine.loadBlob(audio.blob);
    audioEngine.play();
    setIsPlaying(true);
  };

  const handlePrevious = async () => {
    if (playlist.length === 0) return;
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentIndex(prevIndex);
    const audio = playlist[prevIndex];
    await audioEngine.loadBlob(audio.blob);
    audioEngine.play();
    setIsPlaying(true);
  };

  const handleSpeedChange = (e: ChangeEvent<HTMLInputElement>) => {
    const speed = parseFloat(e.target.value);
    setPlaybackSpeed(speed);
    audioEngine.setSpeed(speed);
  };

  const handleSave = async () => {
    if (isSaved) return; // Prevent double save

    const buffer = audioEngine.getAudioBuffer();
    if (!buffer) return;

    setIsSaving(true);
    
    // Simulate "Sealing" delay for effect
    await new Promise(resolve => setTimeout(resolve, 800));

    const blob = audioEngine.exportMp3();
    if (blob) {
      const id = crypto.randomUUID();
      const filename = `Mutu_Recording_${Date.now()}.mp3`;
      
      // 1. Save to Library
      await storageService.saveAudio({
        id,
        title: `Recording ${new Date().toLocaleTimeString()}`,
        voice: selectedVoice,
        style: 'Custom',
        duration: buffer.duration,
        timestamp: Date.now(),
        blob
      });
      
      // Trigger library refresh
      window.dispatchEvent(new Event('library-updated'));
      
      setIsSaving(false);
      setIsSaved(true);
    } else {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    const blob = audioEngine.exportMp3();
    if (blob) {
      saveAs(blob, `Mutu_Recording_${Date.now()}.mp3`);
    } else if (currentTrack) {
      saveAs(currentTrack.blob, `${currentTrack.title}.mp3`);
    }
  };

  const currentTrack = currentIndex >= 0 ? playlist[currentIndex] : null;

  return (
    <>
      <motion.div
        initial={{ y: 0 }}
        animate={{ 
          y: 0,
          height: isExpanded ? 'auto' : '5rem' // 80px default
        }}
        className={clsx(
          "border-t border-[var(--color-glass-border)] bg-[var(--color-cyber-black)]/95 backdrop-blur-xl z-40 relative transition-all duration-300 ease-in-out",
          "flex flex-col lg:flex-row lg:h-24 lg:items-center lg:justify-between lg:px-8",
          isExpanded ? "p-6 pb-8 h-auto fixed bottom-0 left-0 right-0 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]" : "h-20 px-4 justify-center"
        )}
      >
        {/* Mobile Expanded Header */}
        {isExpanded && (
          <div className="lg:hidden w-full flex justify-center mb-6" onClick={() => setIsExpanded(false)}>
             <div className="flex items-center gap-1 text-gray-500">
                <ChevronDown size={16} />
                <span className="text-xs uppercase tracking-widest">Collapse</span>
             </div>
          </div>
        )}

        {/* Left: Info & Visualizer */}
        <div className={clsx(
          "flex items-center gap-4",
          "lg:w-1/3",
          isExpanded ? "w-full mb-6 justify-center" : "w-full justify-between lg:justify-start"
        )}>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-12 w-12 rounded-lg bg-[var(--color-neon-cyan-dim)] flex items-center justify-center text-[var(--color-neon-cyan)] border border-[var(--color-glass-border)] shrink-0 relative overflow-hidden group hover:bg-[var(--color-neon-cyan)] hover:text-black transition-colors"
            >
              <Mic2 size={24} />
            </button>
            <div className="flex flex-col justify-center overflow-hidden">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-white truncate">
                  {currentTrack ? currentTrack.title : 'Capsule Player'}
                </h4>
                {isBuffering && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] font-bold text-[var(--color-neon-cyan)] animate-pulse"
                  >
                    SYNCHRONIZING...
                  </motion.span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-mono text-gray-500">
                  {Math.floor(progress / 60)}:{(progress % 60).toFixed(0).padStart(2, '0')}
                </span>
                <div className="flex items-end gap-0.5 h-4">
                  {visualizerBars.map((height, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: isBuffering ? '20%' : `${height}%` }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className={clsx(
                        "w-1 rounded-t-sm opacity-60",
                        isBuffering ? "bg-gray-600" : "bg-[var(--color-neon-cyan)]"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Play/Pause Mini Control (Only visible when collapsed) */}
          {!isExpanded && (
            <button 
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full bg-white text-black"
            >
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
            </button>
          )}
        </div>

        {/* Center: Controls */}
        <div className={clsx(
          "flex flex-col items-center gap-4",
          "lg:w-1/3 lg:gap-2",
          !isExpanded && "hidden lg:flex"
        )}>
          <div className="flex items-center gap-6 lg:gap-6 justify-center w-full">
            <button 
              onClick={handleStop}
              className="text-gray-400 hover:text-red-400 transition-colors p-2"
            >
              <Square size={18} fill="currentColor" />
            </button>
            
            <button 
              onClick={handlePrevious}
              className="text-gray-400 hover:text-white transition-colors p-2"
            >
              <SkipBack size={20} />
            </button>
            
            <button 
              onClick={togglePlay}
              className="flex h-14 w-14 lg:h-12 lg:w-12 items-center justify-center rounded-full bg-white text-black hover:scale-105 hover:shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-all"
            >
              {isPlaying ? (
                <Pause size={24} fill="currentColor" />
              ) : (
                <Play size={24} fill="currentColor" className="ml-0.5" />
              )}
            </button>
            
            <button 
              onClick={handleNext}
              className="text-gray-400 hover:text-white transition-colors p-2"
            >
              <SkipForward size={20} />
            </button>

            <button 
              onClick={handleSave}
              disabled={isSaving || isSaved}
              className={clsx(
                "transition-colors p-2",
                isSaved ? "text-green-400" : "text-gray-400 hover:text-[var(--color-neon-cyan)]"
              )}
              title="Save to Library"
            >
              {isSaving ? (
                 <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-[var(--color-neon-cyan)]" />
              ) : isSaved ? (
                <Check size={20} />
              ) : (
                <Save size={20} />
              )}
            </button>
          </div>
        </div>

        {/* Right: Speed & Volume */}
        <div className={clsx(
          "flex items-center justify-center lg:justify-end gap-6",
          "lg:w-1/3",
          !isExpanded && "hidden lg:flex",
          isExpanded && "mt-6 w-full"
        )}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-400">SPEED</span>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={playbackSpeed}
              onChange={handleSpeedChange}
              className="w-24 accent-[var(--color-neon-cyan)] h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs font-mono text-[var(--color-neon-cyan)] w-8 text-right">
              {playbackSpeed.toFixed(1)}x
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Volume2 size={18} className="text-gray-400" />
            <div className="w-20 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-gray-500" />
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
