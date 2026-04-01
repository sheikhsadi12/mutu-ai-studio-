import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mic, Square, Loader2, Activity, Cpu, Radio } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { useSettingsStore } from '../store/useSettingsStore';
import clsx from 'clsx';
import Toast, { ToastRef } from './Toast';

export default function LiveConsole() {
  const { apiKey } = useSettingsStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [cpuLoad, setCpuLoad] = useState(0);
  const [signalStrength, setSignalStrength] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [botResponse, setBotResponse] = useState('');
  
  const toastRef = useRef<ToastRef>(null);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  
  // Playback state
  const nextStartTimeRef = useRef<number>(0);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    // Simulate CPU load
    const interval = setInterval(() => {
      setCpuLoad(isConnected ? 40 + Math.random() * 40 : 5 + Math.random() * 10);
      setSignalStrength(isConnected ? 80 + Math.random() * 20 : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [isConnected]);

  const handleConnect = async () => {
    if (!apiKey) {
      toastRef.current?.show("Neural Link Failed: Missing API Key.");
      return;
    }

    setIsConnecting(true);
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
      nextStartTimeRef.current = audioContextRef.current.currentTime + 0.1;

      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
      
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      const ai = new GoogleGenAI({ apiKey });
      
      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are a highly advanced AI assistant in a cyber-minimalist interface. Keep responses concise and technical.",
          inputAudioTranscription: { model: "gemini-2.5-flash-native-audio-preview-12-2025" },
          outputAudioTranscription: { model: "gemini-2.5-flash-native-audio-preview-12-2025" }
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            
            processorRef.current!.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcm16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                const s = Math.max(-1, Math.min(1, inputData[i]));
                pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
              }
              
              const buffer = new ArrayBuffer(pcm16.length * 2);
              const view = new DataView(buffer);
              for (let i = 0; i < pcm16.length; i++) {
                view.setInt16(i * 2, pcm16[i], true);
              }
              
              const base64Data = btoa(String.fromCharCode(...new Uint8Array(buffer)));
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
                });
              });
            };
            
            source.connect(processorRef.current!);
            processorRef.current!.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.clientContent?.turnComplete) {
              // Handle transcription if available in clientContent
            }
            if ((message as any).serverContent?.modelTurn?.parts) {
              for (const part of (message as any).serverContent.modelTurn.parts) {
                if (part.text) {
                  setBotResponse(prev => prev + part.text);
                }
              }
            }
            // Handle transcriptions
            if ((message as any).serverContent?.interrupted) {
              nextStartTimeRef.current = audioContextRef.current!.currentTime;
            }
            if ((message as any).serverContent?.turnComplete) {
              setBotResponse(prev => prev + '\n');
            }
            
            // Handle input/output transcriptions if they exist
            if ((message as any).serverContent?.modelTurn?.parts) {
              for (const part of (message as any).serverContent.modelTurn.parts) {
                if (part.text) {
                  // If it's a text part, it could be transcription, but we already append it to botResponse.
                  // For a real implementation, we'd check the role or specific transcription fields.
                }
              }
            }
            
            if (message.serverContent?.modelTurn?.parts) {
              for (const part of message.serverContent.modelTurn.parts) {
                if (part.inlineData && part.inlineData.data) {
                  const base64Audio = part.inlineData.data;
                  const binaryString = window.atob(base64Audio);
                  const bytes = new Uint8Array(binaryString.length);
                  for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                  }
                  
                  const pcm16 = new Int16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 2);
                  const audioBuffer = audioContextRef.current!.createBuffer(1, pcm16.length, 16000);
                  const channelData = audioBuffer.getChannelData(0);
                  for (let i = 0; i < pcm16.length; i++) {
                    channelData[i] = pcm16[i] / 32768.0;
                  }
                  
                  const playSource = audioContextRef.current!.createBufferSource();
                  playSource.buffer = audioBuffer;
                  playSource.connect(gainNodeRef.current!);
                  
                  const now = audioContextRef.current!.currentTime;
                  if (nextStartTimeRef.current < now) {
                    nextStartTimeRef.current = now;
                  }
                  
                  playSource.start(nextStartTimeRef.current);
                  nextStartTimeRef.current += audioBuffer.duration;
                }
              }
            }
          },
          onclose: () => {
            handleDisconnect();
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            toastRef.current?.show("Connection error.");
            handleDisconnect();
          }
        }
      });
      
      sessionRef.current = await sessionPromise;
      
    } catch (error) {
      console.error("Failed to connect:", error);
      toastRef.current?.show("Failed to establish neural link.");
      setIsConnecting(false);
      handleDisconnect();
    }
  };

  const handleDisconnect = () => {
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch(e) {}
      sessionRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
  };

  return (
    <div className="flex h-full flex-col gap-4 p-4 lg:p-8 overflow-y-auto pb-32">
      <Toast ref={toastRef} />
      
      {/* Top Status Bar */}
      <div className="flex items-center justify-between rounded-2xl border border-[var(--color-glass-border)] bg-[var(--color-cyber-black)]/40 p-4 backdrop-blur-2xl noise-overlay">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className={clsx("h-3 w-3 rounded-full shadow-[0_0_10px_currentColor]", isConnected ? "bg-green-500 text-green-500" : "bg-red-500 text-red-500")} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">Live Link</span>
          </div>
          <div className="flex items-center gap-2">
            <Radio size={14} className={clsx(isConnected ? "text-[var(--color-neon-cyan)]" : "text-[var(--color-text-secondary)]")} />
            <span className="text-[10px] font-mono text-[var(--color-text-secondary)]">SIG: {signalStrength.toFixed(0)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-[var(--color-text-secondary)]" />
            <span className="text-[10px] font-mono text-[var(--color-text-secondary)]">CPU: {cpuLoad.toFixed(0)}%</span>
          </div>
        </div>
        
        <div>
          {isConnected ? (
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-2 rounded-lg bg-red-500/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-500/30 transition-colors"
            >
              <Square size={14} fill="currentColor" />
              Disconnect
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="flex items-center gap-2 rounded-lg bg-[var(--color-neon-cyan)]/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--color-neon-cyan)] hover:bg-[var(--color-neon-cyan)]/30 transition-colors disabled:opacity-50"
            >
              {isConnecting ? <Loader2 size={14} className="animate-spin" /> : <Mic size={14} />}
              {isConnecting ? "Connecting..." : "Establish Link"}
            </button>
          )}
        </div>
      </div>

      {/* Main Console Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* Visualizer & Status */}
        <div className="relative flex flex-col overflow-hidden rounded-2xl border border-[var(--color-glass-border)] bg-[var(--color-cyber-black)]/40 p-6 backdrop-blur-2xl noise-overlay">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-6">
            <Activity size={14} />
            <span>Neural Telemetry</span>
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            {isConnected ? (
              <div className="relative flex h-48 w-48 items-center justify-center rounded-full border border-[var(--color-neon-cyan)]/30 bg-[var(--color-neon-cyan-dim)] shadow-[0_0_60px_var(--color-neon-cyan-dim)]">
                <Mic size={48} className="text-[var(--color-neon-cyan)] animate-pulse" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full border border-[var(--color-neon-cyan)]/50"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-[var(--color-text-secondary)] opacity-50">
                <Mic size={48} />
                <span className="text-sm font-mono uppercase tracking-widest">Awaiting Connection</span>
              </div>
            )}
          </div>
        </div>

        {/* Deep Thought / Transcription */}
        <div className="relative flex flex-col overflow-hidden rounded-2xl border border-[var(--color-glass-border)] bg-[var(--color-cyber-black)]/40 p-6 backdrop-blur-2xl noise-overlay">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-4">
            <Cpu size={14} />
            <span>Deep Thought Processor</span>
          </div>
          
          <div className="flex-1 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-glass-border)] p-4 font-mono text-sm text-[var(--color-text-primary)] overflow-y-auto">
            {isConnected ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[var(--color-neon-cyan)]">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Processing audio stream...</span>
                </div>
                {transcription && (
                  <div className="text-[var(--color-text-secondary)]">
                    <span className="text-[var(--color-neon-cyan)]">USER &gt;</span> {transcription}
                  </div>
                )}
                {botResponse && (
                  <div className="text-[var(--color-text-primary)]">
                    <span className="text-[var(--color-cyber-purple)]">SYS &gt;</span> {botResponse}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-[var(--color-text-secondary)] opacity-50 uppercase tracking-widest">
                System Offline
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
