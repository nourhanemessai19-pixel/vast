import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Volume2,
  ChevronRight,
  Sparkles,
  RotateCcw,
  Check,
  Plus,
  Play,
  Pause,
  Mic,
  MicOff,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Trophy,
  ArrowRight,
  Shuffle,
  Radio,
  Layers,
  Headphones,
  Timer as TimerIcon,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Target,
  LayoutGrid,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CATEGORIES_DATA } from '../data/categoriesData';
import { CategoryItem, FluencySessionResult } from '../types';
import { speechService } from '../services/speechSynthesisService';
import semanticSortingCoverImg from '../assets/images/semantic_sorting_cover_1787864992467.jpg';
import fruitsCoverImg from '../assets/images/category_fruits_cover_1787743301410.jpg';
import veggiesCoverImg from '../assets/images/category_veggies_cover_1787743317675.jpg';
import animalsCoverImg from '../assets/images/category_animals_cover_1788962681618.jpg';
import transportCoverImg from '../assets/images/category_transport_cover_1788962694153.jpg';
import clothesCoverImg from '../assets/images/clothes_cover_modern_1789857342230.jpg';
import furnitureCoverImg from '../assets/images/category_furniture_cover_1788962721167.jpg';

interface SemanticFluencyModuleProps {
  onSaveResult: (result: FluencySessionResult) => void;
  onBack: () => void;
}

type LevelMode = 'level-1' | 'level-2' | 'level-3';

interface CategoryOption {
  key: string;
  titleAr: string;
  icon: string;
  image: string;
  colorClass: string;
  badgeClass: string;
}

const PRIMARY_3_CATEGORIES: CategoryOption[] = [
  {
    key: 'fruits',
    titleAr: 'الفواكه',
    icon: '🍎',
    image: fruitsCoverImg,
    colorClass: 'border-red-300 bg-red-50/40 hover:bg-red-50 text-red-900',
    badgeClass: 'bg-red-100 text-red-800 border-red-200',
  },
  {
    key: 'vegetables',
    titleAr: 'الخضر',
    icon: '🥕',
    image: veggiesCoverImg,
    colorClass: 'border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50 text-emerald-900',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    key: 'animals',
    titleAr: 'الحيوانات',
    icon: '🐶',
    image: animalsCoverImg,
    colorClass: 'border-amber-300 bg-amber-50/40 hover:bg-amber-50 text-amber-900',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
  },
];

const SECONDARY_3_CATEGORIES: CategoryOption[] = [
  {
    key: 'transport',
    titleAr: 'وسائل النقل',
    icon: '🚗',
    image: transportCoverImg,
    colorClass: 'border-blue-300 bg-blue-50/40 hover:bg-blue-50 text-blue-900',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    key: 'clothes',
    titleAr: 'الملابس',
    icon: '👕',
    image: clothesCoverImg,
    colorClass: 'border-purple-300 bg-purple-50/40 hover:bg-purple-50 text-purple-900',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  {
    key: 'furniture',
    titleAr: 'الأثاث والأشياء',
    icon: '🪑',
    image: furnitureCoverImg,
    colorClass: 'border-orange-300 bg-orange-50/40 hover:bg-orange-50 text-orange-900',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-200',
  },
];

// Level 3 Categories with real photo
const LEVEL_3_CATEGORIES = [
  { key: 'fruits', nameAr: 'الفواكه', icon: '🍎', image: fruitsCoverImg, prompt: 'اذكر أكبر عدد ممكن من أسماء الفواكه التي تعرفها خلال 60 ثانية.' },
  { key: 'vegetables', nameAr: 'الخضر', icon: '🥕', image: veggiesCoverImg, prompt: 'اذكر أكبر عدد ممكن من أسماء الخضر التي تعرفها خلال 60 ثانية.' },
  { key: 'animals', nameAr: 'الحيوانات', icon: '🐶', image: animalsCoverImg, prompt: 'اذكر أكبر عدد ممكن من أسماء الحيوانات التي تعرفها خلال 60 ثانية.' },
  { key: 'transport', nameAr: 'وسائل النقل', icon: '🚗', image: transportCoverImg, prompt: 'اذكر أكبر عدد ممكن من أسماء وسائل النقل التي تعرفها خلال 60 ثانية.' },
  { key: 'clothes', nameAr: 'الملابس', icon: '👕', image: clothesCoverImg, prompt: 'اذكر أكبر عدد ممكن من أسماء الملابس التي تعرفها خلال 60 ثانية.' },
  { key: 'furniture', nameAr: 'الأثاث والأشياء', icon: '🪑', image: furnitureCoverImg, prompt: 'اذكر أكبر عدد ممكن من أسماء الأثاث والأشياء المنزلية خلال 60 ثانية.' },
];

export const SemanticFluencyModule: React.FC<SemanticFluencyModuleProps> = ({
  onSaveResult,
  onBack,
}) => {
  // Active Level Tab
  const [activeLevel, setActiveLevel] = useState<LevelMode>('level-1');

  // Chime sound generator for clinical biofeedback
  const playSoundEffect = (type: 'success' | 'error' | 'finish' | 'tick') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3
        osc.frequency.setValueAtTime(196, audioCtx.currentTime + 0.15); // G3
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else if (type === 'finish') {
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.15);
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.3);
        osc.frequency.setValueAtTime(1046.5, audioCtx.currentTime + 0.45);
        gain.gain.setValueAtTime(0.22, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.8);
      }
    } catch {
      // Audio context fallback
    }
  };

  // =========================================================================
  // LEVEL 1: تصنيف الصور (Visual Categorization with Drag/Click)
  // =========================================================================
  const [level1Set, setLevel1Set] = useState<'primary' | 'secondary'>('primary');
  const level1Categories = level1Set === 'primary' ? PRIMARY_3_CATEGORIES : SECONDARY_3_CATEGORIES;

  // Mixed items pool
  const [level1Pool, setLevel1Pool] = useState<CategoryItem[]>([]);
  // Placed items in each category: { [catKey]: CategoryItem[] }
  const [level1Placed, setLevel1Placed] = useState<Record<string, CategoryItem[]>>({
    fruits: [],
    vegetables: [],
    animals: [],
    transport: [],
    clothes: [],
    furniture: [],
  });
  // Selected item from pool (for click-to-sort on mobile/tablets)
  const [selectedPoolItemId, setSelectedPoolItemId] = useState<string | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [level1Feedback, setLevel1Feedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [level1Stats, setLevel1Stats] = useState({ correct: 0, mistakes: 0 });
  const [isLevel1Complete, setIsLevel1Complete] = useState(false);
  // View mode tailored for Broca's aphasia patients (focused card vs side-by-side)
  const [level1ViewMode, setLevel1ViewMode] = useState<'focused' | 'grid'>('focused');
  const [level1TotalCount, setLevel1TotalCount] = useState<number>(12);
  const [showLevel1Shelf, setShowLevel1Shelf] = useState<boolean>(false);

  // Current active item in focused view
  const currentLevel1Item = useMemo(() => {
    return level1Pool.find(i => i.id === selectedPoolItemId) || level1Pool[0] || null;
  }, [level1Pool, selectedPoolItemId]);

  const handleNextLevel1Item = () => {
    if (level1Pool.length <= 1) return;
    const currIdx = level1Pool.findIndex(i => i.id === currentLevel1Item?.id);
    const nextIdx = (currIdx + 1) % level1Pool.length;
    const nextItem = level1Pool[nextIdx];
    setSelectedPoolItemId(nextItem.id);
    speechService.speak(nextItem.nameAr, { rate: 0.85 });
  };

  const handlePrevLevel1Item = () => {
    if (level1Pool.length <= 1) return;
    const currIdx = level1Pool.findIndex(i => i.id === currentLevel1Item?.id);
    const prevIdx = (currIdx - 1 + level1Pool.length) % level1Pool.length;
    const prevItem = level1Pool[prevIdx];
    setSelectedPoolItemId(prevItem.id);
    speechService.speak(prevItem.nameAr, { rate: 0.85 });
  };

  // Quick Stimulus Item Tap in Level 3 (Real Photos helper)
  const handleLevel3RealPhotoTap = (item: CategoryItem) => {
    const rawName = item.nameAr.split('(')[0].trim();
    if (!producedWords.includes(rawName)) {
      setProducedWords(prev => [rawName, ...prev]);
      setTallyCount(prev => prev + 1);
      playSoundEffect('success');
      speechService.speak(rawName, { rate: 0.85 });
    }
  };

  // State to toggle real photo assistance in Level 3
  const [showLevel3Photos, setShowLevel3Photos] = useState<boolean>(true);

  // Initialize or re-shuffle Level 1 pool
  const initLevel1Pool = (setChoice: 'primary' | 'secondary' = level1Set) => {
    const targetCats = setChoice === 'primary' ? PRIMARY_3_CATEGORIES : SECONDARY_3_CATEGORIES;
    const initialPlaced: Record<string, CategoryItem[]> = {};
    targetCats.forEach(c => {
      initialPlaced[c.key] = [];
    });

    let mixedItems: CategoryItem[] = [];
    targetCats.forEach(cat => {
      const found = CATEGORIES_DATA.find(c => c.key === cat.key);
      if (found && found.items.length > 0) {
        // Pick 3-4 random distinct items per category with real photos
        const shuffled = [...found.items].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 4);
        mixedItems = [...mixedItems, ...selected];
      }
    });

    // Shuffle the entire mixed pool
    mixedItems.sort(() => 0.5 - Math.random());
    setLevel1Pool(mixedItems);
    setLevel1TotalCount(mixedItems.length);
    setLevel1Placed(initialPlaced);
    setSelectedPoolItemId(mixedItems.length > 0 ? mixedItems[0].id : null);
    setLevel1Feedback(null);
    setIsLevel1Complete(false);
    setLevel1Stats({ correct: 0, mistakes: 0 });
  };

  useEffect(() => {
    if (activeLevel === 'level-1') {
      initLevel1Pool(level1Set);
    }
  }, [activeLevel, level1Set]);

  // Handle Sort Item into Target Category
  const handleSortItem = (itemToPlace: CategoryItem, targetCatKey: string) => {
    const isCorrect = itemToPlace.categoryKey === targetCatKey;

    if (isCorrect) {
      // Success feedback
      playSoundEffect('success');
      speechService.speak('إجابة صحيحة، أحسنت!', { rate: 0.85 });
      setLevel1Feedback({
        text: 'إجابة صحيحة، أحسنت!',
        type: 'success',
      });

      // Update pool and placed items
      const newPool = level1Pool.filter(i => i.id !== itemToPlace.id);
      const newPlaced = {
        ...level1Placed,
        [targetCatKey]: [...(level1Placed[targetCatKey] || []), itemToPlace],
      };

      setLevel1Pool(newPool);
      setLevel1Placed(newPlaced);
      setLevel1Stats(prev => ({ ...prev, correct: prev.correct + 1 }));
      setSelectedPoolItemId(newPool.length > 0 ? newPool[0].id : null);

      if (newPool.length === 0) {
        setIsLevel1Complete(true);
        playSoundEffect('finish');
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    } else {
      // Error feedback
      playSoundEffect('error');
      speechService.speak('حاول مرة أخرى.', { rate: 0.85 });
      setLevel1Feedback({
        text: 'حاول مرة أخرى.',
        type: 'error',
      });
      setLevel1Stats(prev => ({ ...prev, mistakes: prev.mistakes + 1 }));
    }
  };

  // =========================================================================
  // LEVEL 2: التصنيف اعتمادًا على الكلمة المسموعة (Auditory-Semantic Categorization)
  // =========================================================================
  const [level2Questions, setLevel2Questions] = useState<CategoryItem[]>([]);
  const [level2CurrentIndex, setLevel2CurrentIndex] = useState<number>(0);
  const [level2Feedback, setLevel2Feedback] = useState<{
    text: string;
    type: 'success' | 'error';
    selectedCatKey?: string;
  } | null>(null);
  const [level2Score, setLevel2Score] = useState<number>(0);
  const [isLevel2Finished, setIsLevel2Finished] = useState<boolean>(false);

  // Initialize Level 2 questions pool
  const initLevel2Questions = () => {
    // Collect items from fruits, vegetables, animals, transport, clothes, furniture
    const allAvailableCats = ['fruits', 'vegetables', 'animals', 'transport', 'clothes', 'furniture'];
    let pool: CategoryItem[] = [];

    allAvailableCats.forEach(catKey => {
      const cat = CATEGORIES_DATA.find(c => c.key === catKey);
      if (cat && cat.items.length > 0) {
        const shuffled = [...cat.items].sort(() => 0.5 - Math.random()).slice(0, 2);
        pool = [...pool, ...shuffled];
      }
    });

    pool.sort(() => 0.5 - Math.random());
    const selectedQuestions = pool.slice(0, 8); // 8 questions
    setLevel2Questions(selectedQuestions);
    setLevel2CurrentIndex(0);
    setLevel2Feedback(null);
    setLevel2Score(0);
    setIsLevel2Finished(false);

    if (selectedQuestions.length > 0) {
      setTimeout(() => {
        speechService.speak(selectedQuestions[0].nameAr, { rate: 0.75 });
      }, 400);
    }
  };

  useEffect(() => {
    if (activeLevel === 'level-2') {
      initLevel2Questions();
    }
  }, [activeLevel]);

  const currentLevel2Item = level2Questions[level2CurrentIndex] || null;

  // Options for Level 2: always show 3 categories, including the correct one
  const level2CategoryChoices = useMemo(() => {
    if (!currentLevel2Item) return PRIMARY_3_CATEGORIES;
    const correctCatKey = currentLevel2Item.categoryKey;
    const allOptions = [...PRIMARY_3_CATEGORIES, ...SECONDARY_3_CATEGORIES];
    const correctOption = allOptions.find(o => o.key === correctCatKey) || PRIMARY_3_CATEGORIES[0];
    const otherOptions = allOptions.filter(o => o.key !== correctCatKey).sort(() => 0.5 - Math.random()).slice(0, 2);
    return [correctOption, ...otherOptions].sort(() => 0.5 - Math.random());
  }, [currentLevel2Item]);

  // Handle Level 2 Category Selection
  const handleLevel2Answer = (chosenCatKey: string) => {
    if (!currentLevel2Item || (level2Feedback && level2Feedback.type === 'success')) return;

    const isCorrect = currentLevel2Item.categoryKey === chosenCatKey;
    const chosenCat = [...PRIMARY_3_CATEGORIES, ...SECONDARY_3_CATEGORIES].find(c => c.key === chosenCatKey);
    const correctCat = [...PRIMARY_3_CATEGORIES, ...SECONDARY_3_CATEGORIES].find(c => c.key === currentLevel2Item.categoryKey);

    if (isCorrect) {
      playSoundEffect('success');
      const feedbackMsg = `صحيح! ${currentLevel2Item.nameAr} من ${correctCat?.titleAr || 'هذه الفئة'}.`;
      speechService.speak(feedbackMsg, { rate: 0.8 });
      setLevel2Feedback({
        text: feedbackMsg,
        type: 'success',
        selectedCatKey: chosenCatKey,
      });
      setLevel2Score(prev => prev + 1);

      // Auto advance after 2.2 seconds or user can click next
      setTimeout(() => {
        handleLevel2Next();
      }, 2300);
    } else {
      playSoundEffect('error');
      const errorMsg = 'إجابة غير صحيحة، حاول مرة أخرى.';
      speechService.speak(errorMsg, { rate: 0.8 });
      setLevel2Feedback({
        text: errorMsg,
        type: 'error',
        selectedCatKey: chosenCatKey,
      });
    }
  };

  const handleLevel2Next = () => {
    setLevel2Feedback(null);
    if (level2CurrentIndex + 1 < level2Questions.length) {
      const nextIdx = level2CurrentIndex + 1;
      setLevel2CurrentIndex(nextIdx);
      const nextItem = level2Questions[nextIdx];
      if (nextItem) {
        setTimeout(() => {
          speechService.speak(nextItem.nameAr, { rate: 0.75 });
        }, 300);
      }
    } else {
      setIsLevel2Finished(true);
      playSoundEffect('finish');
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  // Replay word sound
  const handleReplayLevel2Audio = () => {
    if (currentLevel2Item) {
      speechService.speak(currentLevel2Item.nameAr, { rate: 0.75 });
    }
  };

  // =========================================================================
  // LEVEL 3: الاستدعاء اللفظي والطلاقة الدلالية (60s Verbal Recall & Fluency)
  // =========================================================================
  const [selectedLevel3Cat, setSelectedLevel3Cat] = useState(LEVEL_3_CATEGORIES[0]);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isLevel3Finished, setIsLevel3Finished] = useState<boolean>(false);
  const [producedWords, setProducedWords] = useState<string[]>([]);
  const [manualInput, setManualInput] = useState<string>('');
  const [tallyCount, setTallyCount] = useState<number>(0);
  const [hasVoiceRecognition, setHasVoiceRecognition] = useState<boolean>(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition if supported in the browser
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setHasVoiceRecognition(true);
      }
    }
  }, []);

  // 60-second Timer Loop
  useEffect(() => {
    if (isRecording && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRecording) {
      handleStopRecording();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRecording, timeLeft]);

  // Start 60-second Recording Session
  const handleStartRecording = async () => {
    setIsRecording(true);
    setIsLevel3Finished(false);
    setTimeLeft(60);
    setProducedWords([]);
    setTallyCount(0);
    setRecordedAudioUrl(null);
    audioChunksRef.current = [];

    // Speak the category prompt
    speechService.speak(selectedLevel3Cat.prompt, { rate: 0.85 });

    // Start Audio Recording (MediaRecorder)
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = e => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(audioBlob);
          setRecordedAudioUrl(url);
          // Stop stream tracks
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
      }
    } catch (err) {
      console.warn('Microphone recording not available or permission denied:', err);
    }

    // Start Speech Recognition if available
    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'ar-SA';
        recognition.continuous = true;
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
          const resultsLength = event.results.length;
          const transcript = event.results[resultsLength - 1][0].transcript.trim();
          if (transcript) {
            const detectedWords = transcript.split(/\s+/).filter(Boolean);
            detectedWords.forEach((w: string) => {
              setProducedWords(prev => (prev.includes(w) ? prev : [...prev, w]));
            });
            setTallyCount(prev => prev + detectedWords.length);
          }
        };

        recognition.onerror = () => {};
        recognition.start();
        recognitionRef.current = recognition;
      }
    } catch (err) {
      console.warn('Speech Recognition error:', err);
    }
  };

  // Stop / Finish 60s Session
  const handleStopRecording = () => {
    setIsRecording(false);
    setIsLevel3Finished(true);
    playSoundEffect('finish');

    if (timerRef.current) clearTimeout(timerRef.current);

    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    // Stop SpeechRecognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    // Speak finishing feedback
    speechService.speak('انتهى الوقت، أحسنت!', { rate: 0.85 });

    const finalWordCount = Math.max(producedWords.length, tallyCount);

    onSaveResult({
      id: `semantic-fluency-${Date.now()}`,
      timestamp: Date.now(),
      type: 'semantic',
      targetCategoryOrLetter: selectedLevel3Cat.nameAr,
      wordsCount: finalWordCount,
      wordsList: producedWords,
      durationSeconds: 60 - timeLeft,
    });

    if (finalWordCount >= 3) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  // Reset Level 3
  const handleResetLevel3 = () => {
    setIsRecording(false);
    setIsLevel3Finished(false);
    setTimeLeft(60);
    setProducedWords([]);
    setTallyCount(0);
    setManualInput('');
    setRecordedAudioUrl(null);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
  };

  // Add word manually by therapist / patient
  const handleAddManualWord = () => {
    const trimmed = manualInput.trim();
    if (trimmed) {
      if (!producedWords.includes(trimmed)) {
        setProducedWords(prev => [trimmed, ...prev]);
        setTallyCount(prev => prev + 1);
        playSoundEffect('success');
      }
      setManualInput('');
    } else {
      setTallyCount(prev => prev + 1);
      playSoundEffect('success');
    }
  };

  const totalLevel3Count = Math.max(producedWords.length, tallyCount);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 pb-24 animate-in fade-in duration-300">
      
      {/* 1. TOP HEADER */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xs border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-emerald-200 shrink-0 shadow-sm">
            <img
              src={semanticSortingCoverImg}
              alt="التصنيف الدلالي"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                التصنيف الدلالي
              </h1>
              <span className="text-[11px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                3 مستويات متدرجة
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-600 mt-0.5">
              تأهيل القدرة على التصنيف البصري، السمعي، والاستدعاء اللفظي الدلالي
            </p>
          </div>
        </div>

        <button
          onClick={onBack}
          className="self-end sm:self-center flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 text-slate-800 rounded-xl font-bold hover:bg-slate-200 transition text-xs sm:text-sm shadow-2xs border border-slate-200"
        >
          <ChevronRight className="w-4 h-4" />
          <span>الرئيسية</span>
        </button>
      </div>

      {/* 2. THREE PROGRESSIVE LEVEL TABS */}
      <div className="bg-white rounded-3xl p-2.5 shadow-xs border border-emerald-100 grid grid-cols-1 sm:grid-cols-3 gap-2">
        {/* Level 1 Tab */}
        <button
          onClick={() => setActiveLevel('level-1')}
          className={`py-3 px-3.5 rounded-2xl font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-1 transition ${
            activeLevel === 'level-1'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md'
              : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 border border-slate-100'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4" />
            <span>المستوى 1: تصنيف الصور</span>
          </div>
          <span
            className={`text-[10px] font-bold ${
              activeLevel === 'level-1' ? 'text-emerald-100' : 'text-slate-500'
            }`}
          >
            تصنيف بصري وسحب وإفلات
          </span>
        </button>

        {/* Level 2 Tab */}
        <button
          onClick={() => setActiveLevel('level-2')}
          className={`py-3 px-3.5 rounded-2xl font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-1 transition ${
            activeLevel === 'level-2'
              ? 'bg-gradient-to-r from-teal-600 to-cyan-700 text-white shadow-md'
              : 'bg-slate-50 hover:bg-teal-50 text-slate-700 border border-slate-100'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Headphones className="w-4 h-4" />
            <span>المستوى 2: الكلمة المسموعة</span>
          </div>
          <span
            className={`text-[10px] font-bold ${
              activeLevel === 'level-2' ? 'text-teal-100' : 'text-slate-500'
            }`}
          >
            استماع ومعالجة دلالية
          </span>
        </button>

        {/* Level 3 Tab */}
        <button
          onClick={() => setActiveLevel('level-3')}
          className={`py-3 px-3.5 rounded-2xl font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-1 transition ${
            activeLevel === 'level-3'
              ? 'bg-gradient-to-r from-cyan-700 to-blue-700 text-white shadow-md'
              : 'bg-slate-50 hover:bg-cyan-50 text-slate-700 border border-slate-100'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <TimerIcon className="w-4 h-4" />
            <span>المستوى 3: الاستدعاء والطلاقة</span>
          </div>
          <span
            className={`text-[10px] font-bold ${
              activeLevel === 'level-3' ? 'text-cyan-100' : 'text-slate-500'
            }`}
          >
            توليد الكلمات ومؤقت 60 ثانية
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* LEVEL 1 VIEW: تصنيف الصور (سحب وإفلات / نقر وتصنيف) */}
      {/* ========================================================================= */}
      {activeLevel === 'level-1' && (
        <div className="space-y-4">
          
          {/* Instruction Card */}
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-emerald-100 space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl shrink-0 font-black">
                  1
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    تصنيف الصور الحقيقية في الفئات المناسبة
                  </h2>
                  <p className="text-xs font-bold text-slate-600 mt-0.5">
                    {level1ViewMode === 'focused'
                      ? 'طريقة البطاقة المباشرة: تظهر الصورة بحجم كبير وأزرار الفئات ملاصقة لها مباشرة لتسهيل التحديد والنقر لمرضى الحبسة.'
                      : 'طريقة اللوحة المتقاربة: الصور والفئات معروضة جنباً إلى جنب على مسافة قريبة دون الحاجة للتنقل الطويل.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => speechService.speak('صنّف كل صورة في الفئة المناسبة.', { rate: 0.85 })}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-black hover:bg-emerald-100 transition shadow-2xs cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-emerald-700" />
                  <span>استمع للتعليمات</span>
                </button>

                <button
                  onClick={() => initLevel1Pool(level1Set)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                  title="إعادة خلط الصور"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Set Picker & View Mode Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-100">
              {/* Group set */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-500">المجموعة:</span>
                <button
                  onClick={() => setLevel1Set('primary')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    level1Set === 'primary'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🍎 الفواكه – 🥕 الخضر – 🐶 الحيوانات
                </button>
                <button
                  onClick={() => setLevel1Set('secondary')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    level1Set === 'secondary'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🚗 وسائل النقل – 👕 الملابس – 🪑 الأثاث والأشياء
                </button>
              </div>

              {/* Ergonomic Mode Switcher */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
                <button
                  onClick={() => setLevel1ViewMode('focused')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    level1ViewMode === 'focused'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="طريقة البطاقة المركزة الأنسب لمرضى الحبسة"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>البطاقة المركزة (موصى بها)</span>
                </button>
                <button
                  onClick={() => setLevel1ViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    level1ViewMode === 'grid'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="عرض الصور والفئات جنباً إلى جنب"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>اللوحة المتقاربة</span>
                </button>
              </div>
            </div>

            {/* Feedback Message */}
            {level1Feedback && (
              <div
                className={`p-3 rounded-2xl text-center text-sm font-black flex items-center justify-center gap-2 transition animate-in fade-in ${
                  level1Feedback.type === 'success'
                    ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                    : 'bg-rose-100 text-rose-950 border border-rose-300'
                }`}
              >
                {level1Feedback.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600" />
                )}
                <span>{level1Feedback.text}</span>
              </div>
            )}
          </div>

          {/* ================================================================= */}
          {/* OPTION A: ERGONOMIC FOCUSED CARD VIEW (NO DISTANT SCROLLING) */}
          {/* ================================================================= */}
          {level1ViewMode === 'focused' ? (
            <div className="space-y-4">
              {currentLevel1Item ? (
                <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-emerald-200 shadow-sm max-w-2xl mx-auto space-y-5 animate-in fade-in">
                  
                  {/* Top Step & Progress Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-emerald-700 text-white font-black text-xs shadow-2xs">
                        الصورة {Math.min(level1TotalCount, level1TotalCount - level1Pool.length + 1)} من {level1TotalCount}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        (متبقي {level1Pool.length} صور للفرز)
                      </span>
                    </div>

                    {/* Prev / Next controls for quick cycling */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handlePrevLevel1Item}
                        disabled={level1Pool.length <= 1}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="الصورة السابقة"
                      >
                        <ChevronRight className="w-4 h-4" />
                        <span>السابق</span>
                      </button>
                      <button
                        onClick={handleNextLevel1Item}
                        disabled={level1Pool.length <= 1}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="الصورة التالية"
                      >
                        <span>التالي</span>
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, Math.max(0, Math.round(((Math.max(1, level1TotalCount || 1) - (level1Pool?.length || 0)) / Math.max(1, level1TotalCount || 1)) * 100)))}%`,
                      }}
                    />
                  </div>

                  {/* Central Stimulus: Clear Big Photo + Name + Audio */}
                  <div className="flex flex-col items-center text-center space-y-3 pt-1">
                    <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-3xl overflow-hidden bg-slate-100 border-4 border-emerald-100 shadow-xs flex items-center justify-center group">
                      {currentLevel1Item.image ? (
                        <img
                          src={currentLevel1Item.image}
                          alt={currentLevel1Item.nameAr}
                          className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-6xl">📦</span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                        {currentLevel1Item.nameAr}
                      </h3>
                      {currentLevel1Item.dialectNameAr && currentLevel1Item.dialectNameAr !== currentLevel1Item.nameAr && (
                        <p className="text-sm font-black text-emerald-700 bg-emerald-50 px-3 py-0.5 rounded-full inline-block mt-1">
                          ({currentLevel1Item.dialectNameAr})
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => speechService.speak(currentLevel1Item.nameAr, { rate: 0.85 })}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200 rounded-2xl text-xs font-black transition cursor-pointer active:scale-95 shadow-2xs"
                    >
                      <Volume2 className="w-4 h-4 text-emerald-700" />
                      <span>استمع لنطق الكلمة</span>
                    </button>
                  </div>

                  {/* Immediate Adjacent Category Target Buttons (Zero Distance) */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="text-center">
                      <p className="text-sm sm:text-base font-black text-slate-800">
                        👇 أين نضع هذه الصورة؟ اضغط على فئتها مباشرة:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {level1Categories.map(cat => {
                        const placedCount = (level1Placed[cat.key] || []).length;
                        return (
                          <button
                            key={cat.key}
                            onClick={() => handleSortItem(currentLevel1Item, cat.key)}
                            className={`p-3 sm:p-4 rounded-2xl border-2 transition transform active:scale-95 hover:scale-[1.02] shadow-xs flex flex-col items-center justify-center text-center gap-2 cursor-pointer ${cat.colorClass}`}
                          >
                            <div className="w-24 h-18 sm:w-28 sm:h-20 rounded-xl overflow-hidden border-2 border-white shadow-xs relative bg-white">
                              <img
                                src={cat.image}
                                alt={cat.titleAr}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <span className="absolute top-1 right-1 text-xs bg-white/90 rounded px-1 shadow-2xs font-bold">
                                {cat.icon}
                              </span>
                            </div>
                            <span className="text-base sm:text-lg font-black">{cat.titleAr}</span>
                            <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${cat.badgeClass}`}>
                              تم تصنيف {placedCount}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mini-queue Carousel for remaining items */}
                  {level1Pool.length > 1 && (
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>الصور المتبقية في هذه الجولة ({level1Pool.length}):</span>
                        <span className="text-[11px] text-emerald-700">اضغط على أي صورة لتصنيفها فوراً</span>
                      </div>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                        {level1Pool.map(item => {
                          const isSelected = item.id === currentLevel1Item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setSelectedPoolItemId(item.id);
                                speechService.speak(item.nameAr, { rate: 0.85 });
                              }}
                              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden shrink-0 border-2 transition cursor-pointer p-0.5 bg-white ${
                                isSelected
                                  ? 'border-emerald-600 ring-2 ring-emerald-400 scale-105 shadow-sm'
                                  : 'border-slate-200 hover:border-slate-400 opacity-75 hover:opacity-100'
                              }`}
                              title={item.nameAr}
                            >
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.nameAr}
                                  className="w-full h-full object-cover rounded-xl"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <span className="text-xs">📦</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="py-8 text-center text-emerald-800 font-black text-base bg-emerald-50 rounded-3xl border border-emerald-200 max-w-2xl mx-auto">
                  🎉 تم تصنيف جميع الصور بنجاح!
                </div>
              )}

              {/* Collapsible Shelf for Classified Items */}
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs max-w-2xl mx-auto">
                <button
                  onClick={() => setShowLevel1Shelf(prev => !prev)}
                  className="w-full p-4 flex items-center justify-between text-right bg-slate-50 hover:bg-slate-100 transition font-black text-xs sm:text-sm text-slate-800 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">📦</span>
                    <span>
                      سلال التصنيف والمحتوى المفروز (تم إنجاز {level1Stats.correct} صورة)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                    <span>{showLevel1Shelf ? 'إخفاء السلال' : 'عرض السلال'}</span>
                    {showLevel1Shelf ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {showLevel1Shelf && (
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-200 bg-slate-50/50 animate-in fade-in">
                    {level1Categories.map(cat => {
                      const placed = level1Placed[cat.key] || [];
                      return (
                        <div key={cat.key} className={`p-3 rounded-2xl border ${cat.colorClass}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 font-black text-xs">
                              <div className="w-7 h-7 rounded-lg overflow-hidden border border-white shrink-0 shadow-2xs bg-white">
                                <img
                                  src={cat.image}
                                  alt={cat.titleAr}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <span className="text-slate-900">{cat.titleAr}</span>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cat.badgeClass}`}>
                              {placed.length}
                            </span>
                          </div>
                          {placed.length > 0 ? (
                            <div className="grid grid-cols-3 gap-1.5">
                              {placed.map(item => (
                                <div key={item.id} className="bg-white p-1 rounded-xl border border-black/5 text-center flex flex-col items-center shadow-2xs">
                                  <div className="w-10 h-10 rounded-lg overflow-hidden mb-0.5">
                                    {item.image && (
                                      <img
                                        src={item.image}
                                        alt={item.nameAr}
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                      />
                                    )}
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-800 truncate w-full">
                                    {item.nameAr}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-400 py-3 text-center font-bold">
                              السلة فارغة بعد
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ================================================================= */
            /* OPTION B: SIDE-BY-SIDE COMPACT VIEW (ADJACENT COLUMNS)            */
            /* ================================================================= */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              
              {/* Left/Start Column: Unsorted pool list */}
              <div className="lg:col-span-4 bg-slate-50 rounded-3xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm text-slate-900">
                    <span>🔀</span>
                    <span>الصور للفرز ({level1Pool.length}):</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">
                    اضغط الصورة ثم الفئة
                  </span>
                </div>

                {level1Pool.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
                    {level1Pool.map(item => {
                      const isSelected = selectedPoolItemId === item.id;
                      return (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={() => setDraggedItemId(item.id)}
                          onClick={() => {
                            setSelectedPoolItemId(item.id);
                            speechService.speak(item.nameAr, { rate: 0.85 });
                          }}
                          className={`p-2.5 rounded-2xl bg-white border-2 cursor-pointer transition transform active:scale-95 text-center flex flex-col items-center justify-between gap-1.5 shadow-2xs group relative ${
                            isSelected
                              ? 'border-emerald-600 ring-3 ring-emerald-300 scale-105 shadow-md bg-emerald-50/40'
                              : 'border-slate-200 hover:border-emerald-400 hover:shadow-xs'
                          }`}
                        >
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center shrink-0 border border-slate-100">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.nameAr}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <span className="text-2xl">📦</span>
                            )}
                          </div>
                          <div className="w-full">
                            <span className="text-xs font-black text-slate-900 block truncate">
                              {item.nameAr}
                            </span>
                            {item.dialectNameAr && item.dialectNameAr !== item.nameAr && (
                              <span className="text-[10px] font-bold text-emerald-700 block truncate">
                                ({item.dialectNameAr})
                              </span>
                            )}
                          </div>
                          {isSelected && (
                            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-600 text-white text-[11px] font-black rounded-full flex items-center justify-center shadow-xs">
                              ✓
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 text-center text-emerald-800 font-black text-sm bg-emerald-50 rounded-2xl border border-emerald-200">
                    🎉 تم تصنيف جميع الصور!
                  </div>
                )}
              </div>

              {/* Right/End Column: The 3 Category Boxes directly adjacent */}
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-3">
                {level1Categories.map(cat => {
                  const placedItems = level1Placed[cat.key] || [];
                  const isDropActive = draggedItemId !== null;

                  return (
                    <div
                      key={cat.key}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => {
                        e.preventDefault();
                        if (draggedItemId) {
                          const item = level1Pool.find(i => i.id === draggedItemId);
                          if (item) {
                            handleSortItem(item, cat.key);
                          }
                          setDraggedItemId(null);
                        }
                      }}
                      onClick={() => {
                        if (selectedPoolItemId) {
                          const item = level1Pool.find(i => i.id === selectedPoolItemId);
                          if (item) {
                            handleSortItem(item, cat.key);
                          }
                        }
                      }}
                      className={`rounded-3xl p-4 border-2 transition min-h-[300px] flex flex-col justify-between shadow-xs cursor-pointer ${cat.colorClass} ${
                        isDropActive ? 'border-dashed border-emerald-500 scale-[1.01]' : ''
                      }`}
                    >
                      {/* Category Header with Real Photo */}
                      <div className="flex items-center justify-between border-b border-black/5 pb-3 gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-13 h-13 rounded-2xl overflow-hidden border-2 border-white shadow-xs shrink-0 bg-white relative">
                            <img
                              src={cat.image}
                              alt={cat.titleAr}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <span className="absolute bottom-0 right-0 text-[10px] bg-white/90 rounded-tl px-1 font-bold">
                              {cat.icon}
                            </span>
                          </div>
                          <div className="text-right">
                            <h3 className="text-base font-black text-slate-900 leading-tight">{cat.titleAr}</h3>
                            <span className="text-[10px] font-bold text-slate-500">فئة رئيسية</span>
                          </div>
                        </div>
                        <span className={`text-xs font-black px-2.5 py-1 rounded-full border shadow-2xs ${cat.badgeClass}`}>
                          {placedItems.length}
                        </span>
                      </div>

                      {/* Placed Items in this category */}
                      <div className="py-3 flex-1">
                        {placedItems.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2">
                            {placedItems.map(item => (
                              <div
                                key={item.id}
                                className="bg-white/95 rounded-2xl p-1.5 border border-black/5 text-center flex flex-col items-center shadow-2xs group"
                              >
                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 mb-1 border border-slate-100">
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.nameAr}
                                      className="w-full h-full object-cover group-hover:scale-105 transition"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <span className="text-base">✓</span>
                                  )}
                                </div>
                                <span className="text-[10px] font-black text-slate-900 truncate w-full">
                                  {item.nameAr}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-full min-h-[140px] flex flex-col items-center justify-center text-center p-3 rounded-2xl border-2 border-dashed border-black/10 text-slate-500 text-xs font-bold">
                            <span>اضغط هنا لوضع الصورة في</span>
                            <span className="font-black mt-0.5">({cat.titleAr})</span>
                          </div>
                        )}
                      </div>

                      {/* Bottom action button */}
                      <button
                        type="button"
                        className="w-full py-2.5 bg-white/90 hover:bg-white text-slate-800 rounded-xl font-extrabold text-xs border border-black/5 shadow-2xs transition cursor-pointer"
                      >
                        + وضع في {cat.titleAr}
                      </button>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* Level 1 Completed Card */}
          {isLevel1Complete && (
            <div className="bg-gradient-to-br from-emerald-100 via-teal-50 to-emerald-100 border-2 border-emerald-400 rounded-3xl p-6 text-center space-y-4 shadow-md animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center text-3xl shadow-lg">
                🏆
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  إجابة صحيحة، أحسنت!
                </h3>
                <p className="text-sm font-bold text-slate-700 mt-1">
                  تم تصنيف جميع الصور في فئاتها بنجاح وبدقة عالية.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  onClick={() => initLevel1Pool(level1Set)}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm shadow-md transition flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>تصنيف مجموعة صور جديدة</span>
                </button>
                <button
                  onClick={() => setActiveLevel('level-2')}
                  className="px-6 py-3 bg-teal-800 hover:bg-teal-900 text-white rounded-2xl font-black text-sm shadow-md transition flex items-center gap-2"
                >
                  <span>الانتقال للمستوى 2 (الكلمة المسموعة)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 2 VIEW: التصنيف اعتمادًا على الكلمة المسموعة */}
      {/* ========================================================================= */}
      {activeLevel === 'level-2' && (
        <div className="space-y-4">
          
          {/* Instruction Banner */}
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-teal-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center text-xl shrink-0 font-black">
                2
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  استمع إلى الكلمة، ثم اختر الفئة التي تنتمي إليها.
                </h2>
                <p className="text-xs font-bold text-slate-600 mt-0.5">
                  السؤال {level2CurrentIndex + 1} من {level2Questions.length} • النقاط: {level2Score}
                </p>
              </div>
            </div>

            <button
              onClick={() => speechService.speak('استمع إلى الكلمة، ثم اختر الفئة التي تنتمي إليها.', { rate: 0.85 })}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-50 text-teal-900 border border-teal-200 rounded-xl text-xs font-black hover:bg-teal-100 transition shadow-2xs shrink-0"
            >
              <Volume2 className="w-4 h-4 text-teal-700" />
              <span>استمع للتعليمات</span>
            </button>
          </div>

          {!isLevel2Finished && currentLevel2Item && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-teal-100 text-center space-y-6">
              
              {/* Stimulus Card (Photo + Word + Audio Trigger) */}
              <div className="max-w-md mx-auto bg-gradient-to-br from-slate-50 to-teal-50/40 rounded-3xl p-6 border-2 border-teal-200 shadow-sm space-y-4">
                
                <div className="w-36 h-36 sm:w-44 sm:h-44 mx-auto rounded-3xl overflow-hidden border-3 border-white shadow-md bg-white">
                  {currentLevel2Item.image ? (
                    <img
                      src={currentLevel2Item.image}
                      alt={currentLevel2Item.nameAr}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      🔊
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                    {currentLevel2Item.nameAr}
                  </h3>
                  {currentLevel2Item.dialectNameAr && (
                    <span className="text-xs font-bold text-slate-500 mt-1 block">
                      (بالدارجة: {currentLevel2Item.dialectNameAr})
                    </span>
                  )}
                </div>

                <button
                  onClick={handleReplayLevel2Audio}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl font-black text-xs sm:text-sm shadow-md active:scale-95 transition"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>🔊 أعد الاستماع للكلمة</span>
                </button>
              </div>

              {/* Feedback Message if any */}
              {level2Feedback && (
                <div
                  className={`p-4 rounded-2xl max-w-md mx-auto text-center text-sm font-black flex items-center justify-center gap-2 transition animate-in zoom-in-95 ${
                    level2Feedback.type === 'success'
                      ? 'bg-emerald-100 text-emerald-950 border-2 border-emerald-300'
                      : 'bg-rose-100 text-rose-950 border-2 border-rose-300'
                  }`}
                >
                  {level2Feedback.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <span>{level2Feedback.text}</span>
                </div>
              )}

              {/* Three Category Choice Options */}
              <div className="space-y-2 max-w-lg mx-auto">
                <span className="text-xs font-black text-slate-700 block">
                  اختر الفئة التي تنتمي إليها هذه الكلمة:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {level2CategoryChoices.map(cat => {
                    const isSelected = level2Feedback?.selectedCatKey === cat.key;
                    const isSuccess = isSelected && level2Feedback?.type === 'success';
                    const isError = isSelected && level2Feedback?.type === 'error';

                    return (
                      <button
                        key={cat.key}
                        onClick={() => handleLevel2Answer(cat.key)}
                        className={`p-3 sm:p-4 rounded-2xl border-2 text-center transition flex flex-col items-center justify-center gap-2 shadow-xs active:scale-95 cursor-pointer ${
                          isSuccess
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-md'
                            : isError
                            ? 'bg-rose-100 text-rose-900 border-rose-400'
                            : `${cat.colorClass} hover:shadow-md`
                        }`}
                      >
                        <div className="w-20 h-16 sm:w-24 sm:h-18 rounded-xl overflow-hidden border-2 border-white/90 shadow-xs relative bg-white">
                          <img
                            src={cat.image}
                            alt={cat.titleAr}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute top-1 right-1 text-xs bg-white/90 text-slate-800 rounded px-1 shadow-2xs font-bold">
                            {cat.icon}
                          </span>
                        </div>
                        <span className="text-sm sm:text-base font-black">{cat.titleAr}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Next Button */}
              {level2Feedback?.type === 'success' && (
                <div className="pt-2">
                  <button
                    onClick={handleLevel2Next}
                    className="px-8 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl font-black text-sm shadow-md transition flex items-center gap-2 mx-auto"
                  >
                    <span>الكلمة التالية</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>
          )}

          {/* Level 2 Completion Screen */}
          {isLevel2Finished && (
            <div className="bg-gradient-to-br from-teal-100 via-emerald-50 to-teal-100 border-2 border-teal-400 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-lg animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-teal-700 text-white mx-auto flex items-center justify-center text-3xl shadow-xl">
                🏆
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  أحسنت! اكتمل تمرين الكلمة المسموعة
                </h3>
                <p className="text-sm font-bold text-slate-700 mt-1">
                  النتيجة:{' '}
                  <span className="text-2xl font-black text-teal-950 bg-white px-3 py-0.5 rounded-xl border border-teal-300">
                    {level2Score} / {level2Questions.length}
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-3 pt-3">
                <button
                  onClick={initLevel2Questions}
                  className="px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl font-black text-sm shadow-md transition flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>إعادة التمرين بمفردات جديدة</span>
                </button>
                <button
                  onClick={() => setActiveLevel('level-3')}
                  className="px-6 py-3 bg-cyan-800 hover:bg-cyan-900 text-white rounded-2xl font-black text-sm shadow-md transition flex items-center gap-2"
                >
                  <span>الانتقال للمستوى 3 (الاستدعاء والطلاقة)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 3 VIEW: الاستدعاء اللفظي والطلاقة الدلالية (60 ثانية بدون صور) */}
      {/* ========================================================================= */}
      {activeLevel === 'level-3' && (
        <div className="space-y-4">
          
          {/* Category Picker Tabs (No images shown) */}
          <div className="bg-white rounded-3xl p-4 shadow-xs border border-cyan-100 space-y-2">
            <span className="text-xs font-black text-slate-800 block">
              اختر الفئة المستهدفة لجلسة الاستدعاء اللفظي:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {LEVEL_3_CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  disabled={isRecording}
                  onClick={() => {
                    setSelectedLevel3Cat(cat);
                    handleResetLevel3();
                  }}
                  className={`p-2 sm:p-2.5 rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer ${
                    selectedLevel3Cat.key === cat.key
                      ? 'bg-cyan-700 text-white shadow-md scale-105 ring-2 ring-cyan-500'
                      : 'bg-slate-50 text-slate-800 hover:bg-cyan-50 border border-slate-100'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-white shadow-2xs shrink-0 bg-white">
                    <img
                      src={cat.image}
                      alt={cat.nameAr}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="truncate">{cat.nameAr}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main 60s Fluency Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-cyan-100 text-center space-y-6">
            
            {/* Dynamic Instruction Banner (Strictly NO item images displayed) */}
            <div className="bg-gradient-to-r from-cyan-50 via-teal-50 to-cyan-50 rounded-3xl p-5 sm:p-6 border-2 border-cyan-200 space-y-3">
              <div className="flex items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-cyan-300 shadow-xs shrink-0 bg-white">
                  <img
                    src={selectedLevel3Cat.image}
                    alt={selectedLevel3Cat.nameAr}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-cyan-950 leading-tight">
                  {selectedLevel3Cat.prompt}
                </h2>
              </div>

              <p className="text-xs sm:text-sm font-bold text-cyan-900">
                المريض يذكر شفوياً أكبر عدد ممكن من الأسماء، والتطبيق يسجل الصوت ويحسب الكلمات!
              </p>

              <button
                onClick={() => speechService.speak(selectedLevel3Cat.prompt, { rate: 0.85 })}
                className="inline-flex items-center gap-2 text-xs font-black text-cyan-950 bg-white px-4 py-2 rounded-xl border border-cyan-300 hover:bg-cyan-100 transition shadow-xs"
              >
                <Volume2 className="w-4 h-4 text-cyan-700" />
                <span>استمع للتعليمات بصوت واضح</span>
              </button>
            </div>

            {/* 60-Second Circular Stopwatch */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    className="stroke-slate-100"
                    strokeWidth="7"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    className={`transition-all duration-1000 ${
                      timeLeft <= 10
                        ? 'stroke-rose-500 animate-pulse'
                        : timeLeft <= 25
                        ? 'stroke-amber-500'
                        : 'stroke-cyan-600'
                    }`}
                    strokeWidth="7"
                    strokeDasharray={276}
                    strokeDashoffset={276 - (276 * timeLeft) / 60}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span
                    className={`text-5xl font-black transition-colors ${
                      timeLeft <= 10 ? 'text-rose-600 animate-pulse' : 'text-slate-900'
                    }`}
                  >
                    {timeLeft}
                  </span>
                  <span className="text-xs font-black text-slate-500">ثانية</span>
                </div>
              </div>

              {isRecording && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-rose-100 text-rose-900 border border-rose-300 rounded-full text-xs font-black animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                  <span>جارٍ تسجيل الصوت الآن...</span>
                </div>
              )}
            </div>

            {/* Recording Controls */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {!isRecording ? (
                <button
                  onClick={handleStartRecording}
                  className="px-8 py-3.5 bg-gradient-to-r from-cyan-600 to-teal-700 hover:from-cyan-700 hover:to-teal-800 text-white rounded-2xl font-black shadow-lg hover:shadow-xl active:scale-95 transition flex items-center gap-2.5 text-base"
                >
                  <Mic className="w-5 h-5" />
                  <span>ابدأ التسجيل (60 ثانية)</span>
                </button>
              ) : (
                <button
                  onClick={handleStopRecording}
                  className="px-8 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black shadow-lg active:scale-95 transition flex items-center gap-2 text-base"
                >
                  <MicOff className="w-5 h-5" />
                  <span>إيقاف وإنهاء التسجيل</span>
                </button>
              )}

              <button
                onClick={handleResetLevel3}
                className="p-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition shadow-2xs"
                title="إعادة ضبط"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            {/* Tallying & Produced Words List */}
            <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200 space-y-4 text-right">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-extrabold text-slate-900 block">
                    عدد الكلمات المنتجة في 60 ثانية:
                  </span>
                  <span className="text-xs font-bold text-slate-500 block">
                    {hasVoiceRecognition
                      ? 'التحليل الصوتي التلقائي مفعّل مع إمكانية التسجيل اليدوي للأخصائي'
                      : 'التسجيل الصوتي مفعّل، ويمكن للأخصائي تسجيل الكلمات يدويًا'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-cyan-900 bg-white px-4 py-1 rounded-2xl border border-cyan-300 shadow-inner">
                    {totalLevel3Count}
                  </span>
                  <button
                    onClick={handleAddManualWord}
                    className="px-4 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-2xl font-black text-xs shadow-md active:scale-95 transition flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+1 كلمة</span>
                  </button>
                </div>
              </div>

              {/* Manual Word Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualInput}
                  onChange={e => setManualInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddManualWord()}
                  placeholder="اكتب الكلمة هنا واضغط إضافة..."
                  className="flex-1 px-4 py-3 bg-white rounded-2xl border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-2xs"
                />
                <button
                  onClick={handleAddManualWord}
                  className="px-5 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl font-black text-sm shadow-md active:scale-95 transition flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-5 h-5" />
                  <span>إضافة</span>
                </button>
              </div>

              {/* Produced words list */}
              {producedWords.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-xs font-black text-slate-600 block">
                    قائمة الكلمات المسجلة ({producedWords.length}):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {producedWords.map((w, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-900 border border-cyan-200 rounded-xl text-xs font-black shadow-2xs"
                      >
                        <span className="w-2 h-2 rounded-full bg-cyan-600" />
                        <span>{w}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Visual Real Photo Stimulus Helper Shelf for Therapist / Patient */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">📸</span>
                    <span className="text-xs font-black text-slate-800">
                      لوحة الصور الحقيقية المساعدة ({selectedLevel3Cat.nameAr}):
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowLevel3Photos(prev => !prev)}
                    className="text-[11px] font-bold text-cyan-800 hover:text-cyan-950 underline cursor-pointer"
                  >
                    {showLevel3Photos ? 'إخفاء الصور' : 'إظهار الصور الحقيقية'}
                  </button>
                </div>

                {showLevel3Photos && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
                    {(CATEGORIES_DATA.find(c => c.key === selectedLevel3Cat.key)?.items || []).map(item => {
                      const rawName = item.nameAr.split('(')[0].trim();
                      const isAlreadyProduced = producedWords.includes(rawName);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleLevel3RealPhotoTap(item)}
                          className={`p-2 rounded-2xl border text-center flex flex-col items-center justify-between gap-1 transition shadow-2xs group ${
                            isAlreadyProduced
                              ? 'bg-emerald-50 border-emerald-300 opacity-90'
                              : 'bg-white hover:bg-cyan-50 border-slate-200 hover:border-cyan-400 active:scale-95'
                          }`}
                        >
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center shrink-0 border border-slate-100">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.nameAr}
                                className="w-full h-full object-cover group-hover:scale-105 transition"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <span className="text-2xl">📸</span>
                            )}
                          </div>
                          <span className="text-[11px] font-black text-slate-900 truncate w-full">
                            {item.nameAr}
                          </span>
                          {isAlreadyProduced ? (
                            <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                              ✓ مسجلة
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-slate-400 group-hover:text-cyan-700">
                              + انقر للتسجيل
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Audio Playback of the recorded session */}
              {recordedAudioUrl && (
                <div className="pt-3 border-t border-slate-200">
                  <span className="text-xs font-black text-slate-700 block mb-1.5">
                    🔊 الاستماع إلى التسجيل الصوتي للمريض:
                  </span>
                  <audio src={recordedAudioUrl} controls className="w-full h-10 rounded-xl" />
                </div>
              )}
            </div>

            {/* Completion Modal */}
            {isLevel3Finished && (
              <div className="bg-gradient-to-br from-cyan-100 via-teal-50 to-cyan-100 border-2 border-cyan-400 rounded-3xl p-6 text-center space-y-4 shadow-lg animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-cyan-700 text-white mx-auto flex items-center justify-center shadow-xl text-3xl font-black">
                  🏆
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">
                    انتهى الوقت، أحسنت!
                  </h3>
                  <p className="text-sm font-bold text-slate-700 mt-1">
                    تم إنتاج{' '}
                    <span className="text-2xl font-black text-cyan-950 bg-white px-3 py-0.5 rounded-xl border border-cyan-300">
                      {totalLevel3Count}
                    </span>{' '}
                    كلمة في فئة ({selectedLevel3Cat.nameAr})
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <button
                    onClick={handleResetLevel3}
                    className="px-6 py-3 bg-cyan-700 hover:bg-cyan-800 text-white rounded-2xl font-black text-sm shadow-md transition flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>جلسة جديدة (60 ثانية أخرى)</span>
                  </button>
                  <button
                    onClick={onBack}
                    className="px-6 py-3 bg-white text-slate-800 border border-slate-300 rounded-2xl font-black text-sm hover:bg-slate-50 transition"
                  >
                    العودة للشاشة الرئيسية
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};
