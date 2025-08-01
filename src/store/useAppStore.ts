import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  radarEnabled: boolean;
  weatherEnabled: boolean;
  alertSoundEnabled: boolean;
  language: string;
  isInitialized: boolean;
}

interface AppActions {
  setRadarEnabled: (enabled: boolean) => void;
  setWeatherEnabled: (enabled: boolean) => void;
  setAlertSoundEnabled: (enabled: boolean) => void;
  setLanguage: (language: string) => void;
  setIsInitialized: (initialized: boolean) => void;
}

type AppStore = AppState & AppActions;

// Zustand store with persist middleware
const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      // 초기 상태
      radarEnabled: true,
      weatherEnabled: true,
      alertSoundEnabled: true,
      language: 'ko',
      isInitialized: false,

      // 액션들
      setRadarEnabled: (enabled: boolean) => set({ radarEnabled: enabled }),

      setWeatherEnabled: (enabled: boolean) => set({ weatherEnabled: enabled }),

      setAlertSoundEnabled: (enabled: boolean) =>
        set({ alertSoundEnabled: enabled }),

      setLanguage: (language: string) => set({ language }),

      setIsInitialized: (initialized: boolean) =>
        set({ isInitialized: initialized }),
    }),
    {
      name: 'aiacs-settings', // 로컬 스토리지 키
      // isInitialized는 persist하지 않음 (매번 false로 시작)
      partialize: (state) => ({
        radarEnabled: state.radarEnabled,
        weatherEnabled: state.weatherEnabled,
        alertSoundEnabled: state.alertSoundEnabled,
        language: state.language,
      }),
      onRehydrateStorage: () => (state) => {
        // 스토어가 rehydrate된 후 초기화 완료 표시
        if (state) {
          state.setIsInitialized(true);
        }
      },
    }
  )
);

export default useAppStore;
