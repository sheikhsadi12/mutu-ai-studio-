import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AudioFile } from '../lib/StorageService';

export type VoiceName = 'Kore' | 'Fenrir' | 'Puck' | 'Charon' | 'Zephyr';

interface SettingsState {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  
  selectedVoice: VoiceName;
  setSelectedVoice: (voice: VoiceName) => void;
  
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
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiKey: null,
      setApiKey: (key) => set({ apiKey: key }),
      clearApiKey: () => set({ apiKey: null }),
      
      selectedVoice: 'Kore',
      setSelectedVoice: (voice) => set({ selectedVoice: voice }),
      
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
    }),
    {
      name: 'mutu-settings-storage',
      partialize: (state) => ({ 
        apiKey: state.apiKey, 
        selectedVoice: state.selectedVoice,
        playbackSpeed: state.playbackSpeed,
        themeMode: state.themeMode,
        accentColor: state.accentColor
      }),
    }
  )
);
