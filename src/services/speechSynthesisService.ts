// Speech Synthesis service for Arabic clinical neurolinguistic speech therapy

export const ACTION_VERBS_DIACRITICS: Record<string, string> = {
  eat: 'تَاكُلْ',
  drink: 'تَشْرَبْ',
  walk: 'تَمْشِي',
  sit: 'تَقْعُدْ',
  sleep: 'تَرْقُدْ',
  wash: 'تَغْسِلْ',
  write: 'تَكْتُبْ',
  read: 'تَقْرَأْ',
  open_door: 'تَفْتَحْ',
  pray: 'تُصَلِّي',
};

class SpeechSynthesisService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeakingActive = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      // Pre-warm voices
      this.getBestArabicVoice();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.getBestArabicVoice();
      }
    }
  }

  // Find the highest quality Arabic voice on the device
  public getBestArabicVoice(): SpeechSynthesisVoice | null {
    if (!this.synth) return null;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return null;

    // 1. Exact Arabic language matches
    const exactArabic = voices.find(
      (v) =>
        v.lang === 'ar-SA' ||
        v.lang === 'ar-DZ' ||
        v.lang === 'ar-EG' ||
        v.lang === 'ar-XA' ||
        v.lang === 'ar_SA' ||
        v.lang === 'ar_DZ'
    );
    if (exactArabic) return exactArabic;

    // 2. Any Arabic language code
    const anyArabic = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith('ar') ||
        v.lang.toLowerCase().includes('arabic')
    );
    if (anyArabic) return anyArabic;

    // 3. Named Arabic voices (e.g. Google Arabic, Maged, Laila, Tarik, Naayf)
    const namedArabic = voices.find((v) => {
      const name = v.name.toLowerCase();
      return (
        name.includes('arabic') ||
        name.includes('maged') ||
        name.includes('laila') ||
        name.includes('tarik') ||
        name.includes('shakir') ||
        name.includes('salma')
      );
    });
    return namedArabic || null;
  }

  // Clean and prepare Arabic text for vocalization
  public sanitizeArabicText(rawText: string, itemId?: string): string {
    if (itemId && ACTION_VERBS_DIACRITICS[itemId]) {
      return ACTION_VERBS_DIACRITICS[itemId];
    }

    // Strip bracketed text like "(يأكل)" or "(يجلس)" or "(يديه)"
    let cleaned = rawText.replace(/\s*\(.*?\)\s*/g, ' ').trim();

    // Map common action words to diacritized speech (feminine priority matching images)
    const lower = cleaned.replace(/\s+/g, ' ');
    if (lower === 'تاكل' || lower === 'تأكل') return 'تَاكُلْ';
    if (lower === 'ياكل' || lower === 'يأكل') return 'تَاكُلْ';
    if (lower === 'تشرب' || lower === 'يشرب') return 'تَشْرَبْ';
    if (lower === 'تمشي' || lower === 'يمشي') return 'تَمْشِي';
    if (lower === 'تقعد' || lower === 'تجلس' || lower === 'يقعد' || lower === 'يجلس') return 'تَقْعُدْ';
    if (lower === 'ترقد' || lower === 'تنام' || lower === 'يرقد' || lower === 'ينام') return 'تَرْقُدْ';
    if (lower === 'تغسل' || lower === 'يغسل') return 'تَغْسِلْ';
    if (lower === 'تكتب' || lower === 'يكتب') return 'تَكْتُبْ';
    if (lower === 'تقرا' || lower === 'تقرأ' || lower === 'يقرا' || lower === 'يقرأ') return 'تَقْرَأْ';
    if (lower === 'تفتح' || lower === 'يفتح') return 'تَفْتَحْ';
    if (lower === 'تصلي' || lower === 'يصلي') return 'تُصَلِّي';

    return cleaned;
  }

  public speak(
    text: string,
    options?: {
      rate?: number; // default 0.75 for aphasia patients
      pitch?: number;
      itemId?: string;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: unknown) => void;
    }
  ): Promise<void> {
    return new Promise((resolve) => {
      this.stop();

      const vocalText = this.sanitizeArabicText(text, options?.itemId);

      if (!this.synth) {
        if (options?.onStart) options.onStart();
        setTimeout(() => {
          if (options?.onEnd) options.onEnd();
          resolve();
        }, 800);
        return;
      }

      // Resume synth in case it was paused by browser policy
      if (this.synth.paused) {
        this.synth.resume();
      }

      const utterance = new SpeechSynthesisUtterance(vocalText);
      utterance.lang = 'ar-SA';
      utterance.rate = options?.rate || 0.75;
      utterance.pitch = options?.pitch || 1.0;

      const bestVoice = this.getBestArabicVoice();
      if (bestVoice) {
        utterance.voice = bestVoice;
        utterance.lang = bestVoice.lang || 'ar-SA';
      }

      this.currentUtterance = utterance;
      if (typeof window !== 'undefined') {
        (window as unknown as { __vastCurrentUtterance: SpeechSynthesisUtterance }).__vastCurrentUtterance = utterance;
      }

      this.isSpeakingActive = true;

      utterance.onstart = () => {
        this.isSpeakingActive = true;
        if (options?.onStart) options.onStart();
      };

      utterance.onend = () => {
        this.isSpeakingActive = false;
        this.currentUtterance = null;
        if (options?.onEnd) options.onEnd();
        resolve();
      };

      utterance.onerror = (err) => {
        this.isSpeakingActive = false;
        this.currentUtterance = null;
        if (options?.onError) options.onError(err);
        if (options?.onEnd) options.onEnd();
        resolve();
      };

      try {
        // Small 40ms timeout ensures Chrome resets speech queue cleanly
        setTimeout(() => {
          if (this.synth) {
            this.synth.speak(utterance);
          }
        }, 40);
      } catch (e) {
        console.warn('Speech synthesis error:', e);
        this.isSpeakingActive = false;
        if (options?.onEnd) options.onEnd();
        resolve();
      }
    });
  }

  public stop() {
    this.isSpeakingActive = false;
    this.currentUtterance = null;
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public isSpeaking(): boolean {
    return this.isSpeakingActive;
  }
}

export const speechService = new SpeechSynthesisService();

