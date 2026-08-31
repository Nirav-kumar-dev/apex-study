import { INITIAL_STATE, DEFAULT_BOOKS, DEFAULT_CHAPTERS } from '../data/defaultData';
import { AppState, BookDocument } from '../types';
import { DEFAULT_NVIDIA_MODEL, DEFAULT_NVIDIA_API_KEY, NCERT_CODEBOOK_MAP } from './nvidiaApi';

const STORAGE_KEY = 'apex_study_os_state_v1';

/**
 * Normalizes and automatically renames any raw PDF codes into official NCERT chapter titles,
 * arranging them cleanly under their respective subjects.
 */
export function autoArrangeAndIdentifyBookChapters(books: BookDocument[]): BookDocument[] {
  return books.map(book => {
    if (!book.chapterFiles || book.chapterFiles.length === 0) return book;

    const cleanedChapters = book.chapterFiles.map((ch, idx) => {
      const baseCode = (ch.name || '').toLowerCase().replace(/\.pdf$/i, '').trim();
      const pathCode = (ch.pdfPath || '').split('/').pop()?.toLowerCase().replace(/\.pdf$/i, '').trim() || '';

      const match = NCERT_CODEBOOK_MAP[baseCode] || NCERT_CODEBOOK_MAP[pathCode];
      if (match) {
        return {
          ...ch,
          name: match.chapterTitle,
          chapterNumber: match.chapterNumber || idx + 1,
        };
      }

      // If chapter name is generic or contains raw file name
      if (/^(iemh|iesc|iebe|ihga|iest|ch|doc|file)[\d_]+/i.test(ch.name)) {
        const numMatch = ch.name.match(/(\d+)/);
        const num = numMatch ? parseInt(numMatch[1], 10) : idx + 1;
        return {
          ...ch,
          name: `Chapter ${num}: ${ch.name.replace(/\.pdf$/i, '').replace(/[_\-]+/g, ' ')}`,
          chapterNumber: num,
        };
      }

      return ch;
    });

    return {
      ...book,
      chapterFiles: cleanedChapters,
    };
  });
}

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
        'nvidia/nemotron-4-340b-instruct',
      ];

      if (!parsed.user.nvidiaModel || deprecatedOrInvalidModels.includes(parsed.user.nvidiaModel)) {
        parsed.user.nvidiaModel = DEFAULT_NVIDIA_MODEL;
      }

      // Auto-migrate chapters to full CBSE NCERT syllabus if missing or outdated
      if (!parsed.chapters || parsed.chapters.length < 30) {
        parsed.chapters = DEFAULT_CHAPTERS;
      }

      // Synchronize currentDate to real device date
      const now = new Date();
      const localTodayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      if (!parsed.currentDate || parsed.currentDate === '2026-08-30') {
        parsed.currentDate = localTodayStr;
      }

      // Auto-arrange & identify existing book chapters
      if (!parsed.books) {
        parsed.books = DEFAULT_BOOKS;
      } else {
        parsed.books = autoArrangeAndIdentifyBookChapters(parsed.books);
      }

      // Save the sanitized state permanently back to storage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));

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
