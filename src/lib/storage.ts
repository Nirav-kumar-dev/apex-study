import { INITIAL_STATE, DEFAULT_BOOKS } from '../data/defaultData';
import { AppState } from '../types';
import { DEFAULT_NVIDIA_MODEL, DEFAULT_NVIDIA_API_KEY } from './nvidiaApi';

const STORAGE_KEY = 'apex_study_os_state_v1';

export const storage = {
  loadState(): AppState {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (!serialized) {
        return INITIAL_STATE;
      }
      const parsed = JSON.parse(serialized);
      // Validate structure
      if (!parsed.user || !parsed.subjects || !parsed.chapters) {
        return INITIAL_STATE;
      }

      // Ensure latest default API key, active model and books are present
      if (!parsed.user.nvidiaApiKey) {
        parsed.user.nvidiaApiKey = DEFAULT_NVIDIA_API_KEY;
      }

      // Auto-migrate old/deprecated or non-functional model names
      const deprecatedOrInvalidModels = [
        'nvidia/nemotron-3-ultra-550b-a55b',
        'nvidia/llama-3.1-nemotron-70b-instruct',
        'nvidia/nemotron-4-340b-instruct',
        'meta/llama-3.3-70b-instruct',
        'deepseek-ai/deepseek-r1',
        'mistralai/mistral-large-2-instruct',
        'qwen/qwen2.5-coder-32b-instruct',
      ];

      if (!parsed.user.nvidiaModel || deprecatedOrInvalidModels.includes(parsed.user.nvidiaModel)) {
        parsed.user.nvidiaModel = DEFAULT_NVIDIA_MODEL;
      }
      if (
        !parsed.books ||
        parsed.books.length === 0 ||
        !parsed.books[0]?.chapterFiles ||
        !parsed.books[0]?.fileUrl?.includes('/book/class 9th/')
      ) {
        parsed.books = DEFAULT_BOOKS;
      }

      return parsed as AppState;
    } catch (err) {
      console.error('Failed to load state from localStorage:', err);
      return INITIAL_STATE;
    }
  },

  saveState(state: AppState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error('Failed to save state to localStorage:', err);
    }
  },

  resetState(): AppState {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error('Failed to reset state:', err);
    }
    return INITIAL_STATE;
  },

  exportBackup(state: AppState): string {
    return JSON.stringify(state, null, 2);
  },

  importBackup(jsonString: string): AppState {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.user || !parsed.subjects) {
        throw new Error('Invalid Study OS backup format');
      }
      storage.saveState(parsed);
      return parsed;
    } catch (err) {
      throw new Error(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  },
};

// Supabase Cloud Sync Adapter Architecture
export interface CloudSyncAdapter {
  isConfigured: boolean;
  syncPush(state: AppState): Promise<boolean>;
  syncPull(): Promise<AppState | null>;
}
