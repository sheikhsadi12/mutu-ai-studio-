import { GoogleGenAI, Modality } from "@google/genai";
import { useSettingsStore } from '../store/useSettingsStore';
import { storageService } from './StorageService';
import { Mp3Encoder } from 'lamejs';

class AudioEngine {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private chunkQueue: AudioBuffer[] = [];
  private accumulatedBytes: Uint8Array[] = [];
  private nextStartTime: number = 0;
  private isStreamFinished: boolean = false;
  private isBuffering: boolean = false;
  private isPlaying: boolean = false;
  private totalDurationScheduled: number = 0;
  private schedulerInterval: number | null = null;
  private abortController: AbortController | null = null;

  // Pre-roll threshold in seconds
  private readonly BUFFER_THRESHOLD = 5;
  // Micro-fade time in seconds
  private readonly FADE_TIME = 0.005;

  constructor() {}

  private initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000
      });
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  async generateAudio(text: string, styleInstruction: string): Promise<void> {
    const { apiKey, selectedVoice, setIsGenerating, setIsPlaying, setIsBuffering, setProgress } = useSettingsStore.getState();

    if (!apiKey) throw new Error("Neural Link Failed: Missing API Key");

    this.stop();
    this.initAudioContext();
    
    setIsGenerating(true);
    setIsBuffering(true);
    this.isBuffering = true;
    this.isPlaying = true;
    this.isStreamFinished = false;
    this.chunkQueue = [];
    this.accumulatedBytes = [];
    this.nextStartTime = this.audioContext!.currentTime + 0.1;
    this.totalDurationScheduled = 0;
    this.abortController = new AbortController();

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Read the following text. Style: ${styleInstruction || 'Natural and clear'}. Text: "${text}"`;
      
      const generateStream = async () => {
        return await ai.models.generateContentStream({
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ parts: [{ text: prompt }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: selectedVoice },
              },
            },
          },
        });
      };

      const stream = await this.retry(generateStream);
      this.startScheduler();

      for await (const chunk of stream) {
        if (this.abortController.signal.aborted) break;

        const base64Audio = chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          const bytes = this.base64ToUint8(base64Audio);
          this.accumulatedBytes.push(bytes);
          const buffer = await this.decodeBytes(bytes);
          
          if (buffer) {
            this.applyMicroFade(buffer);
            this.chunkQueue.push(buffer);
            
            const bufferedDuration = this.chunkQueue.reduce((acc, b) => acc + b.duration, 0);
            if (this.isBuffering && bufferedDuration >= this.BUFFER_THRESHOLD) {
              this.stopBuffering();
            }
          }
        }
      }

      this.isStreamFinished = true;
      if (this.isBuffering) this.stopBuffering();

      // Automatically save to library
      const blob = this.exportMp3();
      if (blob) {
        await storageService.saveAudio({
          id: crypto.randomUUID(),
          title: `Recording ${new Date().toLocaleTimeString()}`,
          voice: selectedVoice,
          style: styleInstruction || 'Custom',
          duration: this.totalDurationScheduled,
          timestamp: Date.now(),
          blob: blob,
        });
        window.dispatchEvent(new CustomEvent('library-updated'));
      }

    } catch (error) {
      console.error("[AudioEngine] Stream failed:", error);
      this.stop();
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }

  private async retry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
    let lastError: any;
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw lastError;
  }

  private base64ToUint8(base64: string): Uint8Array {
    const binaryString = window.atob(base64.replace(/\s/g, ''));
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  private async decodeBytes(bytes: Uint8Array): Promise<AudioBuffer | null> {
    if (!this.audioContext) return null;
    try {
      // Use a slice of the buffer to ensure we only decode the relevant part
      return await this.audioContext.decodeAudioData(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
    } catch (e) {
      // Fallback to raw PCM 16-bit 24kHz Mono
      // Ensure even length for Int16Array (2 bytes per sample)
      const evenLength = bytes.length - (bytes.length % 2);
      if (evenLength < 2) return null;
      
      const pcm16 = new Int16Array(bytes.buffer, bytes.byteOffset, evenLength / 2);
      const buffer = this.audioContext.createBuffer(1, pcm16.length, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < pcm16.length; i++) {
        channelData[i] = pcm16[i] / 32768.0;
      }
      return buffer;
    }
  }

  private applyMicroFade(buffer: AudioBuffer) {
    const sampleRate = buffer.sampleRate;
    const fadeSamples = Math.floor(this.FADE_TIME * sampleRate);

    for (let c = 0; c < buffer.numberOfChannels; c++) {
      const data = buffer.getChannelData(c);
      if (data.length < fadeSamples * 2) continue;
      for (let i = 0; i < fadeSamples; i++) {
        data[i] *= (i / fadeSamples);
        data[data.length - 1 - i] *= (i / fadeSamples);
      }
    }
  }

  private startScheduler() {
    if (this.schedulerInterval) return;
    this.schedulerInterval = window.setInterval(() => this.scheduleNextChunks(), 100);
  }

  private scheduleNextChunks() {
    if (!this.audioContext || !this.isPlaying || this.isBuffering) return;

    const lookAhead = 0.3;
    const now = this.audioContext.currentTime;

    while (this.chunkQueue.length > 0 && this.nextStartTime < now + lookAhead) {
      // Anti-Speed-up: If we fell behind, reset nextStartTime to now to prevent burst playback
      if (this.nextStartTime < now) {
        this.nextStartTime = now;
      }
      
      const chunk = this.chunkQueue.shift()!;
      this.playChunk(chunk, this.nextStartTime);
      this.nextStartTime += chunk.duration;
      this.totalDurationScheduled += chunk.duration;
    }

    if (this.chunkQueue.length === 0 && !this.isStreamFinished && this.nextStartTime < now + 0.1) {
      this.startBuffering();
    }

    if (this.isStreamFinished && this.chunkQueue.length === 0 && now > this.nextStartTime) {
      this.stop();
    }

    const played = Math.max(0, now - (this.nextStartTime - this.totalDurationScheduled));
    useSettingsStore.getState().setProgress(played);
  }

  private playChunk(buffer: AudioBuffer, time: number) {
    if (!this.audioContext || !this.gainNode) return;
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = 1.0;
    source.connect(this.gainNode);
    source.start(time);
  }

  private startBuffering() {
    if (this.isBuffering) return;
    this.isBuffering = true;
    useSettingsStore.getState().setIsBuffering(true);
  }

  private stopBuffering() {
    this.isBuffering = false;
    useSettingsStore.getState().setIsBuffering(false);
    if (this.audioContext) {
      this.nextStartTime = Math.max(this.nextStartTime, this.audioContext.currentTime + 0.1);
    }
  }

  play() {
    if (!this.audioContext) return;
    this.isPlaying = true;
    useSettingsStore.getState().setIsPlaying(true);
    if (this.audioContext.state === 'suspended') this.audioContext.resume();
    this.startScheduler();
  }

  pause() {
    this.isPlaying = false;
    useSettingsStore.getState().setIsPlaying(false);
    if (this.audioContext) this.audioContext.suspend();
  }

  stop() {
    this.isPlaying = false;
    this.isBuffering = false;
    this.isStreamFinished = true;
    this.chunkQueue = [];
    this.totalDurationScheduled = 0;
    this.abortController?.abort();
    
    if (this.schedulerInterval) {
      window.clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }

    const state = useSettingsStore.getState();
    state.setIsPlaying(false);
    state.setIsBuffering(false);
    state.setIsGenerating(false);
    state.setProgress(0);

    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
      this.accumulatedBytes = []; // Clear accumulated bytes when context is closed
    }
    
    // Memory Management: Clear accumulated bytes only when explicitly stopping or starting new
    // We keep them if the stream just finished so exportMp3 still works until next start
  }

  setSpeed(speed: number) {
    console.warn("Playback speed locked to 1.0 for Neural Integrity");
  }

  getAudioBuffer(): AudioBuffer | null {
    return null; 
  }

  async loadBlob(blob: Blob): Promise<void> {
    this.stop();
    this.initAudioContext();
    const arrayBuffer = await blob.arrayBuffer();
    try {
      const buffer = await this.audioContext!.decodeAudioData(arrayBuffer.slice(0));
      this.chunkQueue = [buffer];
      this.isStreamFinished = true;
      this.stopBuffering();
      this.play();
    } catch (error) {
      console.error("Unable to decode audio data, trying raw PCM fallback", error);
      try {
        // Ensure even length for Int16Array
        const evenLength = arrayBuffer.byteLength - (arrayBuffer.byteLength % 2);
        if (evenLength < 2) throw new Error("Buffer too small for PCM16");
        
        const pcm16 = new Int16Array(arrayBuffer, 0, evenLength / 2);
        const buffer = this.audioContext!.createBuffer(1, pcm16.length, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < pcm16.length; i++) {
          channelData[i] = pcm16[i] / 32768.0;
        }
        this.chunkQueue = [buffer];
        this.isStreamFinished = true;
        this.stopBuffering();
        this.play();
      } catch (fallbackError) {
        console.error("Fallback PCM decode also failed", fallbackError);
        throw new Error("Unable to decode audio data");
      }
    }
  }

  async trimAudio(blob: Blob, startTime: number, endTime: number): Promise<Blob | null> {
    this.initAudioContext();
    if (!this.audioContext) return null;

    try {
      const arrayBuffer = await blob.arrayBuffer();
      const originalBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      if (startTime < 0) startTime = 0;
      if (endTime > originalBuffer.duration) endTime = originalBuffer.duration;
      if (startTime >= endTime) throw new Error("Invalid trim times");

      const sampleRate = originalBuffer.sampleRate;
      const startSample = Math.floor(startTime * sampleRate);
      const endSample = Math.floor(endTime * sampleRate);
      const frameCount = endSample - startSample;

      const newBuffer = this.audioContext.createBuffer(
        originalBuffer.numberOfChannels,
        frameCount,
        sampleRate
      );

      for (let i = 0; i < originalBuffer.numberOfChannels; i++) {
        const channelData = originalBuffer.getChannelData(i);
        const newChannelData = newBuffer.getChannelData(i);
        for (let j = 0; j < frameCount; j++) {
            newChannelData[j] = channelData[startSample + j];
        }
      }
      
      this.applyMicroFade(newBuffer);
      return this.bufferToMp3(newBuffer);

    } catch (e) {
      console.error("Trim failed", e);
      return null;
    }
  }

  async mergeAudios(blobs: Blob[], transition: 'gap' | 'crossfade' = 'gap', transitionDuration: number = 0.5): Promise<Blob | null> {
    this.initAudioContext();
    if (!this.audioContext) return null;

    const buffers: AudioBuffer[] = [];
    for (const blob of blobs) {
      try {
        const arrayBuffer = await blob.arrayBuffer();
        const buffer = await this.audioContext.decodeAudioData(arrayBuffer.slice(0));
        buffers.push(buffer);
      } catch (e) {
        console.error("Error decoding blob for merge:", e);
      }
    }

    if (buffers.length === 0) return null;

    const sampleRate = 24000;
    let totalSamples = 0;
    
    if (transition === 'crossfade') {
        const overlapSamples = Math.floor(transitionDuration * sampleRate);
        totalSamples = buffers.reduce((acc, b) => acc + b.length, 0) - (buffers.length - 1) * overlapSamples;
    } else {
        const gapSamples = Math.floor(transitionDuration * sampleRate);
        totalSamples = buffers.reduce((acc, b) => acc + b.length, 0) + (buffers.length - 1) * gapSamples;
    }

    const mergedBuffer = this.audioContext.createBuffer(1, totalSamples, sampleRate);
    const channelData = mergedBuffer.getChannelData(0);

    let offset = 0;
    
    if (transition === 'crossfade') {
        const overlapSamples = Math.floor(transitionDuration * sampleRate);
        
        for (let i = 0; i < buffers.length; i++) {
            const b = buffers[i];
            const data = b.getChannelData(0);
            
            // Apply fades for crossfade
            if (i > 0) {
                // Fade in start
                for (let j = 0; j < overlapSamples && j < data.length; j++) {
                    data[j] *= (j / overlapSamples);
                }
            }
            if (i < buffers.length - 1) {
                // Fade out end
                for (let j = 0; j < overlapSamples && j < data.length; j++) {
                    data[data.length - 1 - j] *= (j / overlapSamples);
                }
            }
            
            // Add to merged buffer
            for (let j = 0; j < data.length; j++) {
                 if (offset + j < totalSamples) {
                     channelData[offset + j] += data[j];
                 }
            }
            
            offset += b.length - overlapSamples;
        }
    } else {
        const gapSamples = Math.floor(transitionDuration * sampleRate);
        for (let i = 0; i < buffers.length; i++) {
            const b = buffers[i];
            const data = b.getChannelData(0);
            this.applyMicroFade(b);
            channelData.set(data, offset);
            offset += b.length;
            if (i < buffers.length - 1) offset += gapSamples;
        }
    }

    return this.bufferToMp3(mergedBuffer);
  }

  private bufferToMp3(buffer: AudioBuffer): Blob {
    const samples = buffer.getChannelData(0);
    const int16Samples = new Int16Array(samples.length);
    for (let i = 0; i < samples.length; i++) {
      // PCM Normalization to Int16
      const s = Math.max(-1, Math.min(1, samples[i]));
      int16Samples[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }

    const mp3encoder = new Mp3Encoder(1, 24000, 128);
    const mp3Data: Int8Array[] = [];
    const sampleBlockSize = 1152;

    for (let i = 0; i < int16Samples.length; i += sampleBlockSize) {
      const sampleChunk = int16Samples.subarray(i, i + sampleBlockSize);
      const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
      if (mp3buf.length > 0) mp3Data.push(mp3buf);
    }

    const mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) mp3Data.push(mp3buf);

    return new Blob(mp3Data, { type: "audio/mp3" });
  }

  exportMp3(): Blob | null {
    if (this.accumulatedBytes.length === 0) return null;
    
    const totalLength = this.accumulatedBytes.reduce((acc, b) => acc + b.length, 0);
    // Ensure even length for 16-bit PCM data
    const evenTotalLength = totalLength - (totalLength % 2);
    const joined = new Uint8Array(evenTotalLength);
    
    let offset = 0;
    for (const b of this.accumulatedBytes) {
      const remaining = evenTotalLength - offset;
      if (remaining <= 0) break;
      const toCopy = Math.min(b.length, remaining);
      joined.set(b.subarray(0, toCopy), offset);
      offset += toCopy;
    }
    
    // Check if the data already has a WAV header (starts with 'RIFF')
    // If it does, we need to strip it before passing to MP3 encoder
    let pcmData = joined;
    if (joined.length >= 44 && joined[0] === 0x52 && joined[1] === 0x49 && joined[2] === 0x46 && joined[3] === 0x46) {
      // Assuming standard 44-byte WAV header
      pcmData = joined.subarray(44);
    }
    
    // Convert to Int16Array for lamejs
    const samples = new Int16Array(pcmData.buffer, pcmData.byteOffset, pcmData.byteLength / 2);
    
    // Initialize MP3 Encoder (Mono, 24kHz, 128kbps)
    const mp3encoder = new Mp3Encoder(1, 24000, 128);
    const mp3Data: Int8Array[] = [];
    
    const sampleBlockSize = 1152; // Multiple of 576
    for (let i = 0; i < samples.length; i += sampleBlockSize) {
      const sampleChunk = samples.subarray(i, i + sampleBlockSize);
      const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }
    }
    
    const mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }
    
    return new Blob(mp3Data, { type: "audio/mp3" });
  }

  private createWavHeader(dataLength: number, sampleRate: number, numChannels: number, bitsPerSample: number): ArrayBuffer {
    const header = new ArrayBuffer(44);
    const view = new DataView(header);
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
    };
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
    view.setUint16(32, numChannels * (bitsPerSample / 8), true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);
    return header;
  }
}

export const audioEngine = new AudioEngine();
