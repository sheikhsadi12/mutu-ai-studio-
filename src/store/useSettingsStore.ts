import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AudioFile } from '../lib/StorageService';

export type VoiceName = 'Kore' | 'Fenrir' | 'Puck' | 'Charon' | 'Zephyr';

export interface BatchItem {
  id: string;
  text: string;
  styleInstruction: string;
  voice: VoiceName;
  pitch: number;
  rate: number;
  emotion: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

interface SettingsState {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  
  selectedVoice: VoiceName;
  setSelectedVoice: (voice: VoiceName) => void;
  
  voicePitch: number;
  setVoicePitch: (pitch: number) => void;

  speakingRate: number;
  setSpeakingRate: (rate: number) => void;

  emotion: string;
  setEmotion: (emotion: string) => void;

  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;

  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;

  isBuffering: boolean;
  setIsBuffering: (isBuffering: boolean) => void;

  progress: number;
  setProgress: (progress: number) => void;

  isSettingsOpen: boolean;
  setSettingsOpen: (isOpen: boolean) => void;

  activeSettingsPage: 'api' | 'appearance' | 'model' | null;
  setActiveSettingsPage: (page: 'api' | 'appearance' | 'model' | null) => void;

  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;

  themeMode: 'dark' | 'light';
  setThemeMode: (mode: 'dark' | 'light') => void;

  accentColor: string;
  setAccentColor: (color: string) => void;

  currentAudioId: string | null;
  setCurrentAudioId: (id: string | null) => void;

  playlist: AudioFile[];
  setPlaylist: (list: AudioFile[]) => void;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  addAudioFile: (file: AudioFile) => void;

  clonedVoiceData: string | null;
  setClonedVoiceData: (data: string | null) => void;

  batchQueue: BatchItem[];
  setBatchQueue: (queue: BatchItem[]) => void;
  addBatchItem: (item: Omit<BatchItem, 'id' | 'status'>) => void;
  removeBatchItem: (id: string) => void;
  updateBatchItemStatus: (id: string, status: BatchItem['status'], error?: string) => void;
  isBatchProcessing: boolean;
  setIsBatchProcessing: (isProcessing: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiKey: null,
      setApiKey: (key) => set({ apiKey: key }),
      clearApiKey: () => set({ apiKey: null }),
      
      selectedVoice: 'Kore',
      setSelectedVoice: (voice) => set({ selectedVoice: voice }),
      
      voicePitch: 0,
      setVoicePitch: (pitch) => set({ voicePitch: pitch }),

      speakingRate: 1.0,
      setSpeakingRate: (rate) => set({ speakingRate: rate }),

      emotion: 'neutral',
      setEmotion: (emotion) => set({ emotion }),

      playbackSpeed: 1.0,
      setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

      isPlaying: false,
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      
      isGenerating: false,
      setIsGenerating: (isGenerating) => set({ isGenerating }),

      isBuffering: false,
      setIsBuffering: (isBuffering) => set({ isBuffering }),

      progress: 0,
      setProgress: (progress) => set({ progress }),

      isSettingsOpen: false,
      setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),

      activeSettingsPage: null,
      setActiveSettingsPage: (page) => set({ activeSettingsPage: page }),

      isSidebarOpen: false,
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

      themeMode: 'dark',
      setThemeMode: (mode) => set({ themeMode: mode }),

      accentColor: '#00f3ff', // Default Neon Cyan
      setAccentColor: (color) => set({ accentColor: color }),

      currentAudioId: null,
      setCurrentAudioId: (id) => set({ currentAudioId: id }),

      playlist: [],
      setPlaylist: (playlist) => set({ playlist }),
      currentIndex: -1,
      setCurrentIndex: (currentIndex) => set({ currentIndex }),
      addAudioFile: (file) => set((state) => ({
        playlist: [file, ...state.playlist]
      })),

      clonedVoiceData: null,
      setClonedVoiceData: (data) => set({ clonedVoiceData: data }),

      batchQueue: [],
      setBatchQueue: (queue) => set({ batchQueue: queue }),
      addBatchItem: (item) => set((state) => ({
        batchQueue: [...state.batchQueue, { ...item, id: crypto.randomUUID(), status: 'pending' }]
      })),
      removeBatchItem: (id) => set((state) => ({
        batchQueue: state.batchQueue.filter(item => item.id !== id)
      })),
      updateBatchItemStatus: (id, status, error) => set((state) => ({
        batchQueue: state.batchQueue.map(item => 
          item.id === id ? { ...item, status, error } : item
        )
      })),
      isBatchProcessing: false,
      setIsBatchProcessing: (isProcessing) => set({ isBatchProcessing: isProcessing }),
    }),
    {
      name: 'mutu-settings-storage',
      partialize: (state) => ({ 
        apiKey: state.apiKey, 
        selectedVoice: state.selectedVoice,
        voicePitch: state.voicePitch,
        speakingRate: state.speakingRate,
        emotion: state.emotion,
        themeMode: state.themeMode,
        accentColor: state.accentColor,
        clonedVoiceData: state.clonedVoiceData
      }),
    }
  )
);
