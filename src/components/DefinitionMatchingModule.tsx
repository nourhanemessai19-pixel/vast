import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Volume2,
  ChevronRight,
  Sparkles,
  RotateCcw,
  Check,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Trophy,
  ArrowRight,
  Layers,
  Headphones,
  FileText,
  Image as ImageIcon,
  Languages,
  Sliders,
  Play,
  Share2,
  Smile,
  ShieldCheck,
  Award,
  Mic,
  Square,
  Upload,
  Trash2,
  X,
  PlayCircle,
  Radio,
  CheckCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DEFINITION_QUESTIONS, DefinitionQuestion, DefinitionOption } from '../data/definitionsData';
import { speechService } from '../services/speechSynthesisService';
import { customAudioService } from '../services/customAudioService';
import definitionsCoverImg from '../assets/images/definitions_exercise_cover_1788122207430.jpg';

interface DefinitionMatchingModuleProps {
  onSaveResult?: (result: {
    totalQuestions: number;
    correctFirstTry: number;
    accuracyPercent: number;
  }) => void;
  onBack: () => void;
}

export type PresentationMode = 'multimodal' | 'audio-only' | 'text-only' | 'image-only';
export type DialectMode = 'standard' | 'dialect';
export type ChoiceCountMode = 2 | 3 | 4;

export const DefinitionMatchingModule: React.FC<DefinitionMatchingModuleProps> = ({
  onSaveResult,
  onBack,
}) => {
  // Settings State
  const [presentationMode, setPresentationMode] = useState<PresentationMode>('multimodal');
  const [dialectMode, setDialectMode] = useState<DialectMode>('standard');
  const [choicesCount, setChoicesCount] = useState<ChoiceCountMode>(4);
  const [autoSpeakPrompt, setAutoSpeakPrompt] = useState<boolean>(true);

  // Therapist Human Voice Audio State
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [customAudios, setCustomAudios] = useState<Record<string, string>>({});
  const [recordingSuccessNotice, setRecordingSuccessNotice] = useState<string | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioElementRef = useRef<HTMLAudioElement | null>(null);
  const recordingTimerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load custom audios from both IndexedDB and localStorage (for migration & reliability)
  useEffect(() => {
    const loadAllAudios = async () => {
      const merged: Record<string, string> = {};
      try {
        const saved = localStorage.getItem('aphasia_def_custom_audios');
        if (saved) {
          Object.assign(merged, JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to load localStorage audios', e);
      }

      // Check IndexedDB
      try {
        const keys = await customAudioService.getAllAudioKeys();
        for (const k of keys) {
          const url = await customAudioService.getAudioUrl(k);
          if (url) {
            merged[k] = url;
          }
        }
      } catch (e) {
        console.error('Failed to load IndexedDB audios', e);
      }

      setCustomAudios(merged);
    };

    loadAllAudios();
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudioElementRef.current) {
        currentAudioElementRef.current.pause();
        currentAudioElementRef.current = null;
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  // Question & Navigation State
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showActionClue, setShowActionClue] = useState<boolean>(false);

  // Session Statistics
  const [sessionStats, setSessionStats] = useState({
    attempts: 0,
    firstTryCorrect: 0,
    totalAnswered: 0,
  });
  const [isFirstAttemptForCurrent, setIsFirstAttemptForCurrent] = useState<boolean>(true);
  const [isSessionComplete, setIsSessionComplete] = useState<boolean>(false);

  // Current Question
  const currentQuestion: DefinitionQuestion = DEFINITION_QUESTIONS[currentIndex];

  // Active definition text based on dialect mode
  const activePromptText = useMemo(() => {
    if (!currentQuestion) return '';
    return dialectMode === 'dialect'
      ? currentQuestion.definitionDialectAr
      : currentQuestion.definitionAr;
  }, [currentQuestion, dialectMode]);

  // Key for the current question's human voice
  const currentAudioKey = useMemo(() => {
    if (!currentQuestion) return '';
    return `${currentQuestion.id}_${dialectMode}`;
  }, [currentQuestion, dialectMode]);

  // Active human voice URL (either custom user/therapist recorded or bundled in data)
  const activeHumanAudioUrl = useMemo(() => {
    if (!currentQuestion) return null;
    return (
      customAudios[currentAudioKey] ||
      (dialectMode === 'dialect' ? currentQuestion.audioDialectUrl : currentQuestion.audioUrl) ||
      null
    );
  }, [customAudios, currentAudioKey, dialectMode, currentQuestion]);

  // Options limited by choicesCount (always ensure correct option is included and shuffled)
  const currentOptions: DefinitionOption[] = useMemo(() => {
    if (!currentQuestion) return [];
    const correctOpt = currentQuestion.options.find(o => o.id === currentQuestion.correctOptionId)!;
    const incorrectOpts = currentQuestion.options.filter(o => o.id !== currentQuestion.correctOptionId);
    
    // Pick (choicesCount - 1) incorrect options
    const shuffledIncorrect = [...incorrectOpts].sort(() => 0.5 - Math.random());
    const pickedIncorrect = shuffledIncorrect.slice(0, choicesCount - 1);
    
    // Combine and shuffle
    const combined = [correctOpt, ...pickedIncorrect].sort(() => 0.5 - Math.random());
    return combined;
  }, [currentQuestion, choicesCount]);

  // Audio Playback of Prompt: prioritizes REAL human voice
  const speakCurrentPrompt = () => {
    // Stop any existing audio or speech
    if (currentAudioElementRef.current) {
      currentAudioElementRef.current.pause();
      currentAudioElementRef.current.currentTime = 0;
      currentAudioElementRef.current = null;
    }
    speechService.stop();

    if (activeHumanAudioUrl) {
      try {
        const audio = new Audio(activeHumanAudioUrl);
        currentAudioElementRef.current = audio;
        setIsPlayingAudio(true);

        audio.onended = () => {
          setIsPlayingAudio(false);
          currentAudioElementRef.current = null;
        };

        audio.onerror = () => {
          console.warn('Human audio failed to play, falling back to speech synthesis');
          setIsPlayingAudio(false);
          currentAudioElementRef.current = null;
          if (activePromptText) {
            speechService.speak(activePromptText, { rate: 0.8 });
          }
        };

        audio.play().catch(err => {
          console.warn('Audio play catch:', err);
          setIsPlayingAudio(false);
          currentAudioElementRef.current = null;
          if (activePromptText) {
            speechService.speak(activePromptText, { rate: 0.8 });
          }
        });
      } catch (err) {
        console.error('Audio initialization error:', err);
        setIsPlayingAudio(false);
        if (activePromptText) {
          speechService.speak(activePromptText, { rate: 0.8 });
        }
      }
    } else {
      if (!activePromptText) return;
      speechService.speak(activePromptText, { rate: 0.8 });
    }
  };

  // Recording Therapist / User Voice Handlers
  const startTherapistRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        try {
          // Save in IndexedDB
          const persistentUrl = await customAudioService.saveAudio(currentAudioKey, blob, 'audio/webm');
          
          // Also try saving base64 to localStorage for fallback if small enough
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Audio = reader.result as string;
            try {
              const saved = localStorage.getItem('aphasia_def_custom_audios');
              const parsed = saved ? JSON.parse(saved) : {};
              parsed[currentAudioKey] = base64Audio;
              localStorage.setItem('aphasia_def_custom_audios', JSON.stringify(parsed));
            } catch {
              // quota may exceed, indexedDB has it safe
            }
          };
          reader.readAsDataURL(blob);

          setCustomAudios(prev => ({ ...prev, [currentAudioKey]: persistentUrl }));
          setRecordingSuccessNotice('تم حفظ صوتك البشري بنجاح! سيتم استخدامه دائماً لهذا التعريف.');
          setTimeout(() => setRecordingSuccessNotice(null), 4000);
        } catch (err) {
          console.error('Error saving audio blob', err);
        }
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecordingVoice(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access error:', err);
      alert('يرجى السماح بالوصول إلى الميكروفون لتسجيل صوتك البشري للتعريف.');
    }
  };

  const stopTherapistRecording = () => {
    if (mediaRecorderRef.current && isRecordingVoice) {
      mediaRecorderRef.current.stop();
      setIsRecordingVoice(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const handleAudioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const persistentUrl = await customAudioService.saveAudio(currentAudioKey, file, file.type || 'audio/webm');
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        try {
          const saved = localStorage.getItem('aphasia_def_custom_audios');
          const parsed = saved ? JSON.parse(saved) : {};
          parsed[currentAudioKey] = base64;
          localStorage.setItem('aphasia_def_custom_audios', JSON.stringify(parsed));
        } catch {
          // ignore
        }
      };
      reader.readAsDataURL(file);

      setCustomAudios(prev => ({ ...prev, [currentAudioKey]: persistentUrl }));
      setRecordingSuccessNotice('تم رفع وحفظ ملفك الصوتي بنجاح!');
      setTimeout(() => setRecordingSuccessNotice(null), 4000);
    } catch (err) {
      console.error('Failed to save uploaded audio', err);
    }

    if (e.target) e.target.value = '';
  };

  const removeCustomAudio = async () => {
    await customAudioService.deleteAudio(currentAudioKey);
    setCustomAudios(prev => {
      const updated = { ...prev };
      delete updated[currentAudioKey];
      try {
        localStorage.setItem('aphasia_def_custom_audios', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save audio to localStorage', err);
      }
      return updated;
    });
    setRecordingSuccessNotice('تمت استعادة الصوت التلقائي الافتراضي.');
    setTimeout(() => setRecordingSuccessNotice(null), 3000);
  };

  // Play Sound Effects
  const playSoundEffect = (type: 'success' | 'mistake' | 'celebrate') => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.3); // G5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'mistake') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(180, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'celebrate') {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0D9488', '#0EA5E9', '#10B981', '#F59E0B'],
        });
      }
    } catch {
      // ignore
    }
  };

  // Trigger speech whenever question changes if autoSpeak is on
  useEffect(() => {
    if (autoSpeakPrompt && !isSessionComplete) {
      const timer = setTimeout(() => {
        speakCurrentPrompt();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, dialectMode, autoSpeakPrompt, isSessionComplete]);

  // Handle Option Click
  const handleOptionClick = (option: DefinitionOption) => {
    if (isAnswered && isCorrect) return; // Already solved

    setSelectedOptionId(option.id);
    const correct = option.id === currentQuestion.correctOptionId;

    if (correct) {
      setIsCorrect(true);
      setIsAnswered(true);
      playSoundEffect('success');

      // Speak option name + praise
      speechService.speak(`أحسنت! ${option.nameAr}`, { rate: 0.85 });

      if (isFirstAttemptForCurrent) {
        setSessionStats(prev => ({
          ...prev,
          firstTryCorrect: prev.firstTryCorrect + 1,
          totalAnswered: prev.totalAnswered + 1,
        }));
      }

      // Confetti celebration
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } else {
      setIsCorrect(false);
      setIsAnswered(true);
      setIsFirstAttemptForCurrent(false);
      playSoundEffect('mistake');
      speechService.speak('حاول مرة أخرى، ركز في استعمال الشيء المطلوب', { rate: 0.8 });
    }
  };

  // Next Question
  const handleNextQuestion = () => {
    if (currentIndex < DEFINITION_QUESTIONS.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
      setIsCorrect(false);
      setShowHint(false);
      setShowActionClue(false);
      setIsFirstAttemptForCurrent(true);
    } else {
      setIsSessionComplete(true);
      playSoundEffect('celebrate');
      if (onSaveResult) {
        onSaveResult({
          totalQuestions: DEFINITION_QUESTIONS.length,
          correctFirstTry: sessionStats.firstTryCorrect + (isCorrect && isFirstAttemptForCurrent ? 1 : 0),
          accuracyPercent: Math.round(
            ((sessionStats.firstTryCorrect + (isCorrect && isFirstAttemptForCurrent ? 1 : 0)) /
              DEFINITION_QUESTIONS.length) *
              100
          ),
        });
      }
    }
  };

  // Previous Question
  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
      setIsCorrect(false);
      setShowHint(false);
      setShowActionClue(false);
      setIsFirstAttemptForCurrent(true);
    }
  };

  // Reset Session
  const handleRestartSession = () => {
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setShowHint(false);
    setShowActionClue(false);
    setIsFirstAttemptForCurrent(true);
    setIsSessionComplete(false);
    setSessionStats({
      attempts: 0,
      firstTryCorrect: 0,
      totalAnswered: 0,
    });
  };

  // Find the correct option for articulation hint details
  const correctOptionObject = currentQuestion.options.find(
    o => o.id === currentQuestion.correctOptionId
  );

  return (
    <div className="space-y-6 pb-28" dir="rtl">
      {/* Top Header Card */}
      <div className="bg-gradient-to-br from-[#083344] via-[#0E7490] to-[#047857] text-white rounded-3xl p-5 sm:p-7 shadow-xl shadow-cyan-950/15 border border-cyan-300/30 relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-teal-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-56 h-56 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="space-y-2 text-right w-full md:w-auto">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={onBack}
                className="inline-flex items-center gap-1 bg-white/15 hover:bg-white/25 px-3 py-1 rounded-full text-xs font-bold transition border border-white/20 cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>العودة للرئيسية</span>
              </button>

              <span className="bg-emerald-400/25 border border-emerald-300/40 text-emerald-200 px-3 py-1 rounded-full text-xs font-black">
                ✨ تمرين التعيين بالتعريف والاستعمال
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              عرض التعريفات والاستعمالات
            </h1>
            <p className="text-xs sm:text-sm text-cyan-100 font-medium max-w-xl leading-relaxed">
              إعادة تأهيل الفهم والوصول الدلالي: الاستماع أو قراءة تعريف وظيفي للشيء (مثل: "أرني الشيء الذي نكتب به") واختيار الصورة الحقيقية المطابقة.
            </p>
          </div>

          {/* Real Photo Thumbnail */}
          <div className="relative w-36 h-24 sm:w-44 sm:h-28 rounded-2xl overflow-hidden border-2 border-cyan-200/40 shadow-lg shrink-0 hidden sm:block">
            <img
              src={definitionsCoverImg}
              alt="تمرين التعريفات"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <span className="absolute bottom-1.5 right-2 text-[10px] font-black text-cyan-200">
              دلالة وظيفية
            </span>
          </div>
        </div>
      </div>

      {/* Control Toolbar: Presentation Mode, Dialect, Choices Count */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-700" />
            <span className="text-xs font-black text-slate-800">
              إعدادات العرض وطريقة التمرين:
            </span>
          </div>

          {/* Dialect Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setDialectMode('standard')}
              className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
                dialectMode === 'standard'
                  ? 'bg-cyan-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              العربية الفصحى
            </button>
            <button
              onClick={() => setDialectMode('dialect')}
              className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
                dialectMode === 'dialect'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الدارجة الجزائرية
            </button>
          </div>
        </div>

        {/* 4 Presentation Modes as Requested */}
        <div>
          <div className="text-[11px] font-bold text-slate-500 mb-2">
            طريقة عرض التعريف للمريض:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => setPresentationMode('multimodal')}
              className={`p-2.5 rounded-2xl border-2 text-right transition flex items-center gap-2.5 cursor-pointer ${
                presentationMode === 'multimodal'
                  ? 'border-cyan-600 bg-cyan-50/80 text-cyan-950 font-black shadow-xs'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700 font-bold'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="text-xs">شامل (الكل معاً)</div>
                <div className="text-[10px] text-slate-500 font-normal">صوت + نص + تلميح</div>
              </div>
            </button>

            <button
              onClick={() => setPresentationMode('audio-only')}
              className={`p-2.5 rounded-2xl border-2 text-right transition flex items-center gap-2.5 cursor-pointer ${
                presentationMode === 'audio-only'
                  ? 'border-cyan-600 bg-cyan-50/80 text-cyan-950 font-black shadow-xs'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700 font-bold'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="text-xs">شفهي فقط (سمعي)</div>
                <div className="text-[10px] text-slate-500 font-normal">تدريب الفهم الشفهي</div>
              </div>
            </button>

            <button
              onClick={() => setPresentationMode('text-only')}
              className={`p-2.5 rounded-2xl border-2 text-right transition flex items-center gap-2.5 cursor-pointer ${
                presentationMode === 'text-only'
                  ? 'border-cyan-600 bg-cyan-50/80 text-cyan-950 font-black shadow-xs'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700 font-bold'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="text-xs">كتابي فقط (مقروء)</div>
                <div className="text-[10px] text-slate-500 font-normal">فهم القراءة النصية</div>
              </div>
            </button>

            <button
              onClick={() => setPresentationMode('image-only')}
              className={`p-2.5 rounded-2xl border-2 text-right transition flex items-center gap-2.5 cursor-pointer ${
                presentationMode === 'image-only'
                  ? 'border-cyan-600 bg-cyan-50/80 text-cyan-950 font-black shadow-xs'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700 font-bold'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="text-xs">تلميح بالصور</div>
                <div className="text-[10px] text-slate-500 font-normal">صورة الفعل الوظيفي</div>
              </div>
            </button>
          </div>
        </div>

        {/* Difficulty: Number of choices */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-600">
              عدد الخيارات المعروضة:
            </span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setChoicesCount(2)}
                className={`px-2.5 py-0.5 rounded-lg text-xs font-black transition cursor-pointer ${
                  choicesCount === 2 ? 'bg-cyan-700 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2 صور (سهل)
              </button>
              <button
                onClick={() => setChoicesCount(3)}
                className={`px-2.5 py-0.5 rounded-lg text-xs font-black transition cursor-pointer ${
                  choicesCount === 3 ? 'bg-cyan-700 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                3 صور
              </button>
              <button
                onClick={() => setChoicesCount(4)}
                className={`px-2.5 py-0.5 rounded-lg text-xs font-black transition cursor-pointer ${
                  choicesCount === 4 ? 'bg-cyan-700 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                4 صور (شامل)
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
            <input
              type="checkbox"
              checked={autoSpeakPrompt}
              onChange={e => setAutoSpeakPrompt(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
            />
            <span>نطق التعريف تلقائياً عند كل سؤال</span>
          </label>
        </div>
      </div>

      {/* If Session is Complete: Success View */}
      {isSessionComplete ? (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-emerald-200 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              ممتاز! تم إنهاء تمرين التعريفات والاستعمال بنجاح
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              أظهر المريض قدرة ممتازة على الفهم الدلالي وربط التعريف الوظيفي بالصورة الصحيحة.
            </p>
          </div>

          {/* Stats Badges */}
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200">
              <div className="text-2xl font-black text-cyan-800">
                {DEFINITION_QUESTIONS.length}
              </div>
              <div className="text-[11px] font-bold text-slate-500">إجمالي الأسئلة</div>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200">
              <div className="text-2xl font-black text-emerald-700">
                {sessionStats.firstTryCorrect}
              </div>
              <div className="text-[11px] font-bold text-emerald-800">من المحاولة الأولى</div>
            </div>

            <div className="bg-teal-50 rounded-2xl p-3 border border-teal-200">
              <div className="text-2xl font-black text-teal-700">
                {Math.round((sessionStats.firstTryCorrect / DEFINITION_QUESTIONS.length) * 100)}%
              </div>
              <div className="text-[11px] font-bold text-teal-800">دقة الاستجابة</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={handleRestartSession}
              className="px-6 py-3 bg-gradient-to-r from-cyan-700 to-teal-600 hover:from-cyan-600 hover:to-teal-500 text-white rounded-2xl font-black text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة التمرين من البداية</span>
            </button>

            <button
              onClick={onBack}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-sm transition cursor-pointer"
            >
              العودة للقائمة
            </button>
          </div>
        </div>
      ) : (
        /* ACTIVE QUESTION WORKSPACE */
        <div className="space-y-5">
          {/* Progress Header */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900">
                السؤال {currentIndex + 1} من {DEFINITION_QUESTIONS.length}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-bold">
                {currentQuestion.categoryNameAr} {currentQuestion.categoryIcon}
              </span>
            </div>

            <div className="text-xs font-bold text-slate-500">
              صحيح من أول مرة: <span className="font-black text-emerald-700">{sessionStats.firstTryCorrect}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300 rounded-full"
              style={{
                width: `${Math.min(100, Math.max(0, Math.round(((currentIndex + 1) / Math.max(1, DEFINITION_QUESTIONS.length)) * 100)))}%`,
              }}
            />
          </div>

          {/* MAIN PROMPT CARD (Visualized according to Presentation Mode) */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-cyan-100 shadow-md space-y-4">
            
            {/* Header with audio prompt button */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-xs font-black text-cyan-900 uppercase tracking-wide">
                  التعليمة الدلالية / التعريف الوظيفي:
                </span>
              </div>

              {/* Sound Playback Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={speakCurrentPrompt}
                  className={`px-4 py-2 text-white rounded-2xl font-black text-xs shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition ${
                    isPlayingAudio
                      ? 'bg-emerald-600 ring-4 ring-emerald-200 animate-pulse'
                      : activeHumanAudioUrl
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 shadow-emerald-600/20'
                      : 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 shadow-cyan-600/15'
                  }`}
                  title={activeHumanAudioUrl ? 'تشغيل الصوت البشري الحقيقي' : 'تشغيل الصوت'}
                >
                  <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
                  <span>
                    {isPlayingAudio
                      ? 'جاري الاستماع...'
                      : activeHumanAudioUrl
                      ? 'استمع للصوت البشري 🎙️'
                      : 'استمع للتعريف 🔊'}
                  </span>
                </button>
              </div>
            </div>

            {/* Success notification banner when recorded */}
            {recordingSuccessNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-2 text-emerald-900 text-xs font-bold animate-fadeIn">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{recordingSuccessNotice}</span>
                </div>
                <button
                  onClick={() => setRecordingSuccessNotice(null)}
                  className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Prominent Recording Studio Box for Human Voice */}
            <div className="bg-gradient-to-r from-amber-50/90 via-orange-50/60 to-rose-50/80 border-2 border-amber-200/80 rounded-2xl p-3.5 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                      <span>تسجيل صوتك البشري للتعريف</span>
                      {activeHumanAudioUrl ? (
                        <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] rounded-full font-black">
                          مسجل بصوت بشري ✓
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-[10px] rounded-full font-bold">
                          صوت آلي حالياً
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-amber-800 font-medium">
                      سجلي التعريف بصوتك الطبيعي بالدارجة أو الفصحى ليتدرب عليه المريض بدل الصوت الآلي
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Live Mic Recording Button */}
                  {!isRecordingVoice ? (
                    <button
                      type="button"
                      onClick={startTherapistRecording}
                      className="px-3.5 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-md active:scale-95"
                      title="سجّل هذا التعريف بصوتك الآن عبر الميكروفون"
                    >
                      <Mic className="w-4 h-4 animate-pulse" />
                      <span>سجّل صوتك الآن 🎙️</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopTherapistRecording}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black animate-pulse flex items-center gap-2 cursor-pointer shadow-md"
                      title="انقر لإنهاء التسجيل وحفظ صوتك"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      <span>إيقاف وحفظ ({recordingSeconds} ثا) ⏹️</span>
                    </button>
                  )}

                  {/* File Upload Button */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAudioFileUpload}
                    accept="audio/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 bg-white hover:bg-amber-50 text-slate-700 border border-amber-300 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                    title="رفع تسجيل صوتي جاهز من جهازك (MP3, WAV, M4A)"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-700" />
                    <span>رفع ملف صوتي 📁</span>
                  </button>

                  {/* If Human Audio exists, provide preview and delete */}
                  {activeHumanAudioUrl && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={speakCurrentPrompt}
                        className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                        title="تشغيل واستماع لصوتك المسجل"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>استمع لتسجيلك 🎧</span>
                      </button>

                      {customAudios[currentAudioKey] && (
                        <button
                          type="button"
                          onClick={removeCustomAudio}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer border border-transparent hover:border-rose-200"
                          title="حذف التسجيل الصوتي واستعادة الصوت الافتراضي"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Text cue to read while recording */}
              {isRecordingVoice && (
                <div className="mt-2 p-3 bg-white rounded-xl border-2 border-red-300 shadow-xs flex items-center justify-between gap-3 animate-pulse">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
                    <span className="text-xs font-black text-red-900">جاري التسجيل الآن... اقرئي هذا النص بصوت واضح:</span>
                  </div>
                  <div className="text-sm font-black text-slate-900 bg-red-50 px-3 py-1 rounded-lg">
                    "{activePromptText}"
                  </div>
                </div>
              )}
            </div>

            {/* Prompt Content according to selected mode */}
            {presentationMode !== 'image-only' && (
              <div className="p-4 sm:p-6 bg-gradient-to-r from-cyan-50/80 via-slate-50 to-teal-50/80 rounded-2xl border border-cyan-200/80 text-center">
                {presentationMode === 'audio-only' ? (
                  <div className="py-4 space-y-2">
                    <div className="w-14 h-14 mx-auto rounded-full bg-cyan-600 text-white flex items-center justify-center shadow-md animate-bounce">
                      <Headphones className="w-7 h-7" />
                    </div>
                    <div className="text-base font-black text-slate-800">
                      استمع جيداً للتعريف ثم اختر الصورة المناسبة
                    </div>
                    <button
                      type="button"
                      onClick={speakCurrentPrompt}
                      className="text-xs font-bold text-cyan-700 underline cursor-pointer"
                    >
                      انقر هنا للاستماع مجدداً 🔊
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="text-lg sm:text-2xl md:text-3xl font-black text-slate-900 leading-snug">
                      "{activePromptText}"
                    </div>
                    {dialectMode === 'dialect' && (
                      <div className="text-xs font-bold text-cyan-800">
                        بالفصحى: ({currentQuestion.definitionAr})
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* If in Multimodal or Image-Only Mode: Show Pictorial Action / Functional Clue */}
            {(presentationMode === 'multimodal' || presentationMode === 'image-only' || showActionClue) && (
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-cyan-600" />
                    <span>صورة التلميح الوظيفي (الفعل / السياق):</span>
                  </span>
                  <span className="text-[11px] font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                    {currentQuestion.actionClueLabel}
                  </span>
                </div>

                <div className="relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs group">
                  <img
                    src={currentQuestion.actionClueImage}
                    alt={currentQuestion.actionClueLabel}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-2 inset-x-3 text-white text-xs font-black drop-shadow-sm flex items-center justify-between">
                    <span>💡 انظر إلى ما يفعله الشخص في الصورة أعلاه</span>
                    <span className="text-cyan-300 text-[11px]">{currentQuestion.categoryNameAr}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Optional Hint Button if patient struggles */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowHint(prev => !prev)}
                className="text-xs font-bold text-cyan-800 hover:text-cyan-950 flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showHint ? 'إخفاء المساعدة' : 'هل تحتاج تلميحاً؟'}</span>
              </button>

              {!showActionClue && presentationMode !== 'multimodal' && presentationMode !== 'image-only' && (
                <button
                  type="button"
                  onClick={() => setShowActionClue(true)}
                  className="text-xs font-bold text-teal-800 hover:text-teal-950 underline cursor-pointer"
                >
                  إظهار صورة الفعل التوضيحي 🖼️
                </button>
              )}
            </div>

            {/* Hint Box */}
            {showHint && (
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 font-medium space-y-1">
                <div>
                  <span className="font-black">تلميح وظيفي: </span>
                  {currentQuestion.shortFunctionalHint}
                </div>
                {correctOptionObject && (
                  <div>
                    <span className="font-black">الصوت الأول للكلمة: </span>
                    <span className="text-amber-800 font-black text-sm">
                      {correctOptionObject.firstSound}
                    </span>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* CHOICES GRID (Real Photos with clear labels) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black text-slate-800">
                اختر الصورة الحقيقية التي تطابق التعريف ({currentOptions.length} خيارات):
              </span>
              <span className="text-[11px] text-slate-500 font-bold">
                انقر على الصورة للاختيار والاستماع
              </span>
            </div>

            <div
              className={`grid gap-3.5 ${
                choicesCount === 2
                  ? 'grid-cols-2'
                  : choicesCount === 3
                  ? 'grid-cols-3'
                  : 'grid-cols-2 sm:grid-cols-4'
              }`}
            >
              {currentOptions.map(option => {
                const isSelected = selectedOptionId === option.id;
                const isThisOptionCorrect = option.id === currentQuestion.correctOptionId;

                // Visual style based on answer state
                let cardStyle =
                  'bg-white border-2 border-slate-200 hover:border-cyan-400 hover:shadow-md active:scale-95';

                if (isAnswered) {
                  if (isSelected) {
                    if (isCorrect) {
                      cardStyle =
                        'bg-emerald-50/90 border-2 border-emerald-500 ring-4 ring-emerald-200 shadow-lg scale-102';
                    } else {
                      cardStyle =
                        'bg-rose-50/80 border-2 border-rose-400 ring-2 ring-rose-200 animate-shake';
                    }
                  } else if (isCorrect && isThisOptionCorrect) {
                    cardStyle = 'bg-emerald-50/40 border-2 border-emerald-400';
                  }
                }

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleOptionClick(option)}
                    className={`rounded-3xl p-3 sm:p-4 text-center flex flex-col items-center justify-between gap-2.5 transition-all duration-200 cursor-pointer relative shadow-xs group ${cardStyle}`}
                  >
                    {/* Status Badge */}
                    {isAnswered && isSelected && (
                      <div
                        className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full text-white flex items-center justify-center shadow-md ${
                          isCorrect ? 'bg-emerald-600' : 'bg-rose-500'
                        }`}
                      >
                        {isCorrect ? <Check className="w-4 h-4 stroke-[3]" /> : '✕'}
                      </div>
                    )}

                    {/* Real Image Container */}
                    <div className="w-full aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-2xs group-hover:shadow-xs transition">
                      <img
                        src={option.image}
                        alt={option.nameAr}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Labels */}
                    <div className="w-full space-y-0.5 pt-1">
                      <div className="text-sm sm:text-base font-black text-slate-900 truncate">
                        {option.nameAr}
                      </div>
                      <div className="text-[11px] font-bold text-slate-500 truncate">
                        {option.dialectNameAr}
                      </div>
                    </div>

                    {/* Action Pill */}
                    <div
                      className={`w-full py-1.5 rounded-xl text-[11px] font-black transition ${
                        isAnswered && isSelected && isCorrect
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 group-hover:bg-cyan-100 text-slate-700 group-hover:text-cyan-900'
                      }`}
                    >
                      {isAnswered && isSelected
                        ? isCorrect
                          ? '✓ إجابة صحيحة'
                          : '✕ غير مطابق'
                        : 'اختيار هذه الصورة'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SUCCESS FEEDBACK & VAST ARTICULATION DRILL */}
          {isAnswered && isCorrect && correctOptionObject && (
            <div className="bg-emerald-50 rounded-3xl p-5 sm:p-6 border-2 border-emerald-300 shadow-md space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-emerald-950">
                      إجابة صحيحة تماماً! ({correctOptionObject.nameAr})
                    </h3>
                    <p className="text-xs text-emerald-800 font-medium">
                      {currentQuestion.explanationAr}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-black text-sm shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition"
                >
                  <span>السؤال التالي</span>
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
              </div>

              {/* VAST Pronunciation & Syllable Drill */}
              <div className="p-4 bg-white rounded-2xl border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800">
                    🗣️ تدريب نطق الكلمة الصحيحة (VAST):
                  </span>
                  <button
                    type="button"
                    onClick={() => speechService.speak(correctOptionObject.nameAr, { rate: 0.75 })}
                    className="text-xs font-black text-emerald-700 bg-emerald-100/70 hover:bg-emerald-200 px-3 py-1 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>استمع لنطق: {correctOptionObject.nameAr}</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 flex-wrap pt-1">
                  <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                    <span className="font-bold text-slate-500">التقطيع الصوتي: </span>
                    <span className="font-black text-cyan-900 text-sm">
                      {correctOptionObject.phoneticAr}
                    </span>
                  </div>

                  <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                    <span className="font-bold text-slate-500">حركة الشفتين والمخرج: </span>
                    <span className="font-bold text-slate-800">
                      {correctOptionObject.articulatoryNote}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Navigation Buttons */}
          <div className="flex items-center justify-between pt-3">
            <button
              type="button"
              onClick={handlePrevQuestion}
              disabled={currentIndex === 0}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black border transition cursor-pointer flex items-center gap-1.5 ${
                currentIndex === 0
                  ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-100 bg-white'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
              <span>السؤال السابق</span>
            </button>

            <div className="text-xs font-bold text-slate-500">
              {currentIndex + 1} / {DEFINITION_QUESTIONS.length}
            </div>

            <button
              type="button"
              onClick={handleNextQuestion}
              className="px-5 py-2.5 rounded-2xl text-xs font-black bg-cyan-700 hover:bg-cyan-600 text-white shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <span>{currentIndex === DEFINITION_QUESTIONS.length - 1 ? 'إنهاء الجلسة' : 'التالي'}</span>
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
