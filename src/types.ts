export type CueLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface CategoryItem {
  id: string;
  nameAr: string;
  dialectNameAr?: string; // e.g. "تشينة" or "بنان"
  nameFr?: string;
  phoneticAr?: string; // Syllabification e.g. "فـَ - رَا - وْ - لـَ - ة"
  firstSound: string; // e.g. "فـَ"
  articulatoryNote?: string; // e.g. "إطباق الشفتين" / "حركة شفوية أسنانية"
  image: string;
  videoUrl?: string; // Real video URL or local object URL
  videoPlaceholderUrl?: string;
  mouthShapeType?: 'bilabial' | 'labiodental' | 'open' | 'rounded' | 'alveolar' | 'velar' | 'dental';
  categoryKey: string;
  syllablesCount?: number;
}

export interface Category {
  id: string;
  key: string;
  titleAr: string;
  titleFr: string;
  descAr: string;
  descFr: string;
  icon: string;
  coverImage?: string;
  color: string;
  items: CategoryItem[];
}

export interface PracticeSessionResult {
  id: string;
  timestamp: number;
  itemId: string;
  itemNameAr: string;
  categoryKey: string;
  cueLevelUsed: CueLevel;
  outcome: 'independent' | 'assisted' | 'difficult';
  durationSeconds: number;
  hasAudioRecording?: boolean;
}

export interface FluencySessionResult {
  id: string;
  timestamp: number;
  type: 'semantic' | 'phonemic';
  targetCategoryOrLetter: string;
  wordsCount: number;
  wordsList: string[];
  durationSeconds: number;
}

export interface UserProgress {
  totalSessions: number;
  totalWordsProduced: number;
  independentWords: number;
  assistedWords: number;
  totalTrainingMinutes: number;
  sessionHistory: PracticeSessionResult[];
  fluencyHistory: FluencySessionResult[];
}

export interface PatientProfile {
  name: string;
  caseType: string; // e.g. "حبسة بروكا الحركية - بعد سكتة دماغية"
  speechRate: number; // 0.7x to 1.0x
  defaultCueLevel: CueLevel;
  autoPlayAudio: boolean;
  autoPlayMouthVideo: boolean;
  mirrorCameraEnabled: boolean;
}
