import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Play,
  Image as ImageIcon,
  RotateCcw,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Trash2,
  CheckCircle2,
  Video,
  Film,
  Sparkles,
  ZoomIn,
  X,
} from 'lucide-react';
import { CategoryItem, PracticeSessionResult } from '../types';
import { VastVideoPlayer } from './VastVideoPlayer';
import { UploadedVideosModal } from './UploadedVideosModal';
import { speechService } from '../services/speechSynthesisService';
import { customVideoService } from '../services/customVideoService';

interface VastPracticeScreenProps {
  items: CategoryItem[];
  initialIndex?: number;
  initialShowVideo?: boolean;
  categoryTitle: string;
  onBack: () => void;
  onRecordResult: (result: PracticeSessionResult) => void;
  defaultSpeechRate?: number;
}

export const VastPracticeScreen: React.FC<VastPracticeScreenProps> = ({
  items,
  initialIndex = 0,
  initialShowVideo = false,
  categoryTitle,
  onBack,
  onRecordResult,
  defaultSpeechRate = 0.75,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentItem = items[currentIndex] || items[0];
  const isActionCategory = currentItem?.categoryKey === 'actions';

  // Toggle between image confrontation view and mouth video articulation view
  const [showVideo, setShowVideo] = useState(initialShowVideo);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  // Custom video & audio state
  const [hasCustomVideo, setHasCustomVideo] = useState(false);
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);
  const [isUploadedVideosOpen, setIsUploadedVideosOpen] = useState(false);
  const [storedVideosCount, setStoredVideosCount] = useState(0);

  const refreshStoredVideosCount = async () => {
    try {
      const list = await customVideoService.getAllStoredVideos();
      setStoredVideosCount(list.length);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    refreshStoredVideosCount();
  }, []);

  // Clean up any legacy disabled AI voice flag so AI voice is active for items without custom video
  useEffect(() => {
    try {
      localStorage.removeItem('vast_disable_ai_voice');
    } catch {
      // Ignore
    }
  }, []);

  // Custom audio (therapist / user recorded voice)
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  const currentAudioElementRef = useRef<HTMLAudioElement | null>(null);

  const wordToSpeak = currentItem?.dialectNameAr || currentItem?.nameAr || '';
  const displayName = currentItem?.dialectNameAr 
    ? `${currentItem.dialectNameAr} (${currentItem.nameAr.replace(/\s*\(.*?\)\s*/g, '')})`
    : currentItem?.nameAr;

  // Load custom recorded voice for current item
  useEffect(() => {
    if (!currentItem) return;
    try {
      const saved = localStorage.getItem(`vast_custom_audio_${currentItem.id}`);
      setCustomAudioUrl(saved || null);
    } catch {
      setCustomAudioUrl(null);
    }
  }, [currentItem?.id]);

  // Check if current item has an uploaded or custom video
  useEffect(() => {
    let isMounted = true;
    if (!currentItem) return;

    // Check custom video
    customVideoService.getVideoUrl(currentItem.id).then((url) => {
      if (isMounted) {
        const vUrl = url || currentItem.videoUrl || null;
        setCustomVideoUrl(vUrl);
        setHasCustomVideo(!!vUrl);
        // Note: Do NOT auto-switch to video! Always show the item image first.
      }
    });

    const unsubscribe = customVideoService.subscribe(() => {
      refreshStoredVideosCount();
      if (isMounted && currentItem) {
        customVideoService.getVideoUrl(currentItem.id).then((url) => {
          if (isMounted) {
            const vUrl = url || currentItem.videoUrl || null;
            setCustomVideoUrl(vUrl);
            setHasCustomVideo(!!vUrl);
          }
        });
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [currentItem?.id, currentItem?.videoUrl]);

  const stopAllAudio = () => {
    if (currentAudioElementRef.current) {
      currentAudioElementRef.current.pause();
      currentAudioElementRef.current.currentTime = 0;
      currentAudioElementRef.current = null;
    }
    speechService.stop();
    setIsPlayingAudio(false);
  };

  // Sync initialIndex and initialShowVideo when they change externally
  useEffect(() => {
    setCurrentIndex(initialIndex);
    setShowVideo(initialShowVideo);
  }, [initialIndex, initialShowVideo]);

  // When switching items: stop audio, reset to image view (never show mouth video immediately), and set session start time
  useEffect(() => {
    stopAllAudio();
    setShowVideo(false);
    setSessionStartTime(Date.now());
  }, [currentIndex]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  if (!currentItem) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl shadow-sm max-w-lg mx-auto border border-teal-100">
        <p className="text-xl text-slate-900 font-black">لا توجد عناصر في هذه الفئة</p>
        <button
          onClick={onBack}
          className="mt-4 px-8 py-3 bg-gradient-to-r from-[#0B4F71] to-[#0D9488] text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition cursor-pointer"
        >
          العودة للقائمة
        </button>
      </div>
    );
  }

  // Play audio speech:
  // 1. If item has custom recorded voice -> ONLY user's recorded audio plays (NO AI voice)
  // 2. If item has custom uploaded video -> ONLY user's voice from the video plays (NO AI voice)
  // 3. For all other exercises (where no video or audio was uploaded) -> ALWAYS PLAY AI VOICE
  const handlePlaySpeech = (forceVideoPlay = false) => {
    stopAllAudio();

    // 1. If user recorded custom voice, play user's recording
    if (customAudioUrl) {
      setIsPlayingAudio(true);
      try {
        const audio = new Audio(customAudioUrl);
        currentAudioElementRef.current = audio;
        audio.playbackRate = defaultSpeechRate;
        audio.onended = () => {
          setIsPlayingAudio(false);
          currentAudioElementRef.current = null;
        };
        audio.onerror = () => {
          setIsPlayingAudio(false);
          currentAudioElementRef.current = null;
        };
        audio.play().catch(() => {
          setIsPlayingAudio(false);
          currentAudioElementRef.current = null;
        });
      } catch {
        setIsPlayingAudio(false);
      }
      return;
    }

    // 2. If item has uploaded video, ONLY play user's video audio (zero AI voice)
    if (customVideoUrl) {
      setShowVideo(true);
      setIsPlayingAudio(true);
      return;
    }

    // 3. ALL OTHER EXERCISES (no uploaded video and no custom audio):
    // ALWAYS play the AI speech synthesis voice clearly!
    setIsPlayingAudio(true);
    speechService.speak(wordToSpeak, {
      rate: defaultSpeechRate,
      itemId: currentItem.id,
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  // Voice recording handlers for therapist / user
  const startTherapistVoiceRecording = async () => {
    try {
      stopAllAudio();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          try {
            localStorage.setItem(`vast_custom_audio_${currentItem.id}`, base64Audio);
            setCustomAudioUrl(base64Audio);
          } catch (e) {
            console.warn('Failed to save to localStorage:', e);
          }
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setIsRecordingVoice(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone error:', err);
      alert('يرجى السماح بالوصول إلى الميكروفون لتسجيل صوتك للكلمة.');
    }
  };

  const stopTherapistVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecordingVoice) {
      mediaRecorderRef.current.stop();
      setIsRecordingVoice(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const handleDeleteCustomVoice = () => {
    stopAllAudio();
    try {
      localStorage.removeItem(`vast_custom_audio_${currentItem.id}`);
    } catch {
      // ignore
    }
    setCustomAudioUrl(null);
  };

  // Open mouth video and trigger speech/video playback
  const handleOpenVideo = () => {
    stopAllAudio();
    setShowVideo(true);
    handlePlaySpeech(true);

    // Log progress
    onRecordResult({
      id: `${Date.now()}-${currentItem.id}`,
      timestamp: Date.now(),
      itemId: currentItem.id,
      itemNameAr: currentItem.nameAr,
      categoryKey: currentItem.categoryKey,
      cueLevelUsed: 3,
      outcome: 'independent',
      durationSeconds: Math.round((Date.now() - sessionStartTime) / 1000),
    });
  };

  const handleNext = () => {
    stopAllAudio();
    setShowVideo(false);
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    stopAllAudio();
    setShowVideo(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleBack = () => {
    stopAllAudio();
    onBack();
  };

  return (
    <div className="w-full max-w-lg mx-auto pb-10 space-y-4 select-none animate-in fade-in duration-200">
      {/* Top Simple Bar */}
      <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 border border-teal-100 shadow-xs">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-950 font-black border border-slate-200/80 active:scale-95 transition text-xs sm:text-sm cursor-pointer"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-teal-700" />
          <span>رجوع</span>
        </button>

        <div className="text-center">
          <span className="text-base font-black text-slate-900 block">
            {categoryTitle}
          </span>
          <button
            onClick={() => setIsUploadedVideosOpen(true)}
            className="text-[11px] text-teal-700 hover:text-teal-900 font-bold underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
          >
            <Film className="w-3 h-3" />
            <span>فيديوهاتي المرفوعة ({storedVideosCount})</span>
          </button>
        </div>

        <span className="text-xs font-black text-teal-900 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 px-3 py-1.5 rounded-full shadow-2xs">
          {currentIndex + 1} / {items.length}
        </span>
      </div>

      {/* Prominent Custom Video Status Banner */}
      {hasCustomVideo ? (
        <div className="bg-emerald-500/10 border-2 border-emerald-500/30 rounded-2xl p-3 flex items-center justify-between text-emerald-950 font-bold text-xs shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-black text-emerald-900">
              🎥 فيديوك المرفوع يعمل بصوتك البشري وبدون أي تعديل!
            </span>
          </div>
          <button
            onClick={() => setIsUploadedVideosOpen(true)}
            className="text-xs text-emerald-800 hover:text-emerald-950 underline font-black cursor-pointer"
          >
            إدارة الفيديوهات
          </button>
        </div>
      ) : storedVideosCount > 0 ? (
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-2.5 flex items-center justify-between text-xs shadow-2xs">
          <span className="text-teal-900 font-bold">
            💡 لديك {storedVideosCount} فيديو محفوظ في متصفحك
          </span>
          <button
            onClick={() => setIsUploadedVideosOpen(true)}
            className="bg-white hover:bg-teal-100 text-teal-900 border border-teal-300 px-3 py-1 rounded-xl font-black transition cursor-pointer"
          >
            استعراضها أو ربطها
          </button>
        </div>
      ) : null}

      {/* Main Single Presentation Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-lg shadow-teal-950/5 border-2 border-teal-100/90 space-y-5">
        
        {/* Dual Mode Switcher: Talking Video vs Image */}
        <div className="flex items-center justify-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80">
          <button
            onClick={() => {
              setShowVideo(true);
              handlePlaySpeech();
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
              showVideo
                ? 'bg-gradient-to-r from-[#0B4F71] to-[#0D9488] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{hasCustomVideo ? 'فيديوك المرفوع 🎥' : 'فيديو الفم الناطق'}</span>
          </button>

          <button
            onClick={() => {
              speechService.stop();
              setShowVideo(false);
              setIsPlayingAudio(false);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
              !showVideo
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-teal-700" />
            <span>صورة {isActionCategory ? 'الفعل' : 'العنصر'}</span>
          </button>
        </div>

        {!showVideo ? (
          /* STATE 1: Pure Image Confrontation View -> Picture is displayed clearly with name and speech */
          <div className="space-y-4">
            {/* Center Image - Clear & High Quality, clicking it plays the pronunciation audio */}
            <div 
              onClick={() => handlePlaySpeech(false)}
              className="relative w-full aspect-square max-h-[350px] rounded-3xl overflow-hidden bg-gradient-to-b from-slate-50 to-teal-50/20 border-2 border-teal-100 flex items-center justify-center cursor-pointer group hover:border-teal-400 hover:shadow-lg transition duration-300 shadow-md"
              title="انقر للاستماع لنطق الكلمة بصوت واضح"
            >
              <img
                src={currentItem.image}
                alt={currentItem.nameAr || "تمرين"}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              />

              {/* Sound wave / playing indicator */}
              {isPlayingAudio && (
                <div className="absolute inset-0 bg-teal-950/30 backdrop-blur-2xs flex items-center justify-center animate-in fade-in">
                  <div className="bg-white/95 text-teal-950 px-4 py-2 rounded-2xl font-black text-sm shadow-xl border border-teal-200 flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-teal-600 animate-bounce" />
                    <span>جارٍ نطق: {currentItem.dialectNameAr || currentItem.nameAr}</span>
                  </div>
                </div>
              )}

              {/* Zoom Image Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsImageZoomed(true);
                }}
                className="absolute top-3 left-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition backdrop-blur-xs cursor-pointer shadow-sm"
                title="تكبير الصورة بحجم كامل"
              >
                <ZoomIn className="w-4 h-4" />
                <span className="hidden sm:inline">تكبير</span>
              </button>

              {/* Click to speak hint overlay */}
              <div className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-teal-900 border border-teal-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md backdrop-blur-xs">
                <Volume2 className="w-3.5 h-3.5 text-teal-700" />
                <span>انقر للاستماع</span>
              </div>
            </div>

            {/* Target Item Name & Phonetic Info */}
            <div className="text-center py-3 px-4 bg-gradient-to-r from-teal-50 via-cyan-50/60 to-emerald-50 rounded-2xl border border-teal-200/80 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                  {displayName}
                </span>
                {currentItem.nameFr && (
                  <span className="text-xs sm:text-sm font-bold text-teal-800 bg-white/80 border border-teal-200 px-2.5 py-0.5 rounded-full">
                    {currentItem.nameFr}
                  </span>
                )}
              </div>
              {currentItem.phoneticAr && (
                <p className="text-xs sm:text-sm font-bold text-teal-700">
                  التقطيع الصوتي: {currentItem.phoneticAr}
                </p>
              )}

              {/* Pronunciation voice audio button */}
              <div className="pt-1 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handlePlaySpeech(false)}
                  disabled={isPlayingAudio}
                  className="px-4 py-1.5 bg-white hover:bg-teal-50 text-teal-900 border border-teal-300 rounded-xl text-xs font-black shadow-2xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-60"
                >
                  <Volume2 className="w-4 h-4 text-teal-700" />
                  <span>{isPlayingAudio ? 'جارٍ نطق الكلمة...' : 'استمع للنطق الصوتي'}</span>
                </button>
              </div>
            </div>

            {/* Big Prominent 'مشاهدة الفيديو' Button - Starts directly without YouTube play button */}
            <button
              onClick={handleOpenVideo}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#0B4F71] via-[#0D8279] to-[#0D9488] hover:from-[#083A54] hover:to-[#0B7A70] active:scale-98 text-white font-black text-lg sm:text-xl shadow-lg shadow-teal-900/20 hover:shadow-xl transition-all duration-200 flex flex-col items-center justify-center gap-1 cursor-pointer glossy-sheen border border-white/20"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                  <Play className="w-5 h-5 fill-current translate-x-[-1px]" />
                </div>
                <span>مشاهدة الفيديو 🎥</span>
              </div>
              <span className="text-xs text-cyan-100 font-bold">
                (تشغيل مباشر لحركة الفم ومخارج الحروف دون الحاجة لضغط زر اليوتيوب)
              </span>
            </button>
          </div>
        ) : (
          /* STATE 2: Full Clear Video of Mouth Movement Speaking + Target Word Name Below It */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping" />
                فيديو حركة الفم والنطق المتزامن:
              </span>
              <button
                onClick={() => {
                  speechService.stop();
                  setShowVideo(false);
                  setIsPlayingAudio(false);
                }}
                className="px-4 py-2 bg-gradient-to-r from-teal-50 to-cyan-50 hover:bg-teal-100 text-teal-900 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer border border-teal-300 shadow-2xs"
              >
                <ImageIcon className="w-4 h-4 text-teal-700" />
                <span>عرض صورة {currentItem.dialectNameAr || currentItem.nameAr} 🖼️</span>
              </button>
            </div>

            {/* Video Box (Mouth Movement Speaking) */}
            <div className="w-full rounded-3xl overflow-hidden border-2 border-teal-200 shadow-sm">
              <VastVideoPlayer
                item={currentItem}
                isPlayingAudio={isPlayingAudio}
                onPlaySpeech={handlePlaySpeech}
                speechRate={defaultSpeechRate}
              />
            </div>

            {/* Visual Action Reference Banner */}
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-teal-50 via-cyan-50/40 to-emerald-50 rounded-2xl border border-teal-200/80 shadow-2xs">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-teal-200 shrink-0 shadow-xs">
                <img
                  src={currentItem.image}
                  alt={currentItem.nameAr}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-right flex-1">
                <div className="text-xs font-black text-teal-900">
                  {isActionCategory ? 'فعل الحركة المستهدف:' : 'الصورة التوضيحية:'}
                </div>
                <div className="text-base font-black text-slate-900">
                  {displayName}
                </div>
                {currentItem.phoneticAr && (
                  <div className="text-xs font-bold text-teal-700">
                    التقطيع الصوتي: {currentItem.phoneticAr}
                  </div>
                )}
              </div>
            </div>

            {/* Replay speech button */}
            <button
              onClick={handlePlaySpeech}
              disabled={isPlayingAudio}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-teal-50 via-cyan-50/50 to-emerald-50 hover:bg-teal-100/70 text-slate-900 font-black text-base border-2 border-teal-200 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              <RotateCcw className="w-5 h-5 text-teal-700" />
              <span>{isPlayingAudio ? 'جارٍ النطق الآن...' : 'إعادة الاستماع وحركة الفم'}</span>
            </button>
          </div>
        )}

        {/* Therapist Custom Voice Bar: Keep my voice only & Remove AI Voice */}
        <div className="p-3 bg-slate-50/90 border border-teal-100 rounded-2xl flex flex-col gap-2.5 text-xs shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-teal-700 shrink-0" />
              <span className="font-bold text-slate-800">
                {customAudioUrl ? (
                  'الصوت المعتمد: تسجيل صوتك الخاص'
                ) : customVideoUrl ? (
                  'الفيديو والصوت: فيديوك البشري المرفوع (بصوتك الخاص فقط)'
                ) : (
                  'الصوت المعتمد: صوت الذكاء الاصطناعي مفعّل'
                )}
              </span>
              {customAudioUrl || customVideoUrl ? (
                <span className="bg-emerald-100 text-emerald-900 font-black px-2.5 py-0.5 rounded-full text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  فيديوك الخاص مفعّل
                </span>
              ) : (
                <span className="bg-teal-100 text-teal-900 font-bold px-2.5 py-0.5 rounded-full text-[11px] flex items-center gap-1">
                  صوت الذكاء الاصطناعي
                </span>
              )}
            </div>

            {/* Test Voice Button */}
            <button
              onClick={() => handlePlaySpeech()}
              className="px-3 py-1.5 rounded-xl font-bold border border-teal-200 bg-white hover:bg-teal-50 text-teal-900 text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-2xs"
            >
              <Volume2 className="w-3.5 h-3.5 text-teal-700" />
              <span>استمع للنطق</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
            <span className="text-[11px] text-slate-600 font-medium">
              {customVideoUrl
                ? 'فيديوهاتك المرفوعة تعمل بصوتك البشري المباشر دون أي صوت اصطناعي.'
                : 'يمكنك تسجيل صوتك بدقة لكل كلمة ليتمرن المريض على نبرة صوتك.'}
            </span>

            <div className="flex items-center gap-2">
              {isRecordingVoice ? (
                <button
                  onClick={stopTherapistVoiceRecording}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black flex items-center gap-1.5 transition animate-pulse cursor-pointer shadow-xs"
                >
                  <MicOff className="w-3.5 h-3.5" />
                  <span>إيقاف التسجيل ({recordingSeconds} ثا)</span>
                </button>
              ) : (
                <button
                  onClick={startTherapistVoiceRecording}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-teal-50 text-slate-800 hover:text-teal-950 font-bold border border-slate-200 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                  title="تسجيل نطقك بصوتك الخاص بدلاً من النطق الآلي"
                >
                  <Mic className="w-3.5 h-3.5 text-teal-700" />
                  <span>{customAudioUrl ? 'إعادة تسجيل صوتي' : 'تسجيل صوتي لهذه الكلمة'}</span>
                </button>
              )}

              {customAudioUrl && !isRecordingVoice && (
                <button
                  onClick={handleDeleteCustomVoice}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                  title="حذف التسجيل الصوتي الخاص والعودة للنطق الافتراضي"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Clean Next / Previous Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-teal-100">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-sm transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
            <span>السابق</span>
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5 max-w-[140px] overflow-hidden">
            {items.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx
                    ? 'w-6 bg-gradient-to-r from-[#0B4F71] to-[#0D9488]'
                    : 'w-2.5 bg-teal-200 hover:bg-teal-300'
                }`}
                title={`الكلمة ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentIndex === items.length - 1}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#0B4F71] to-[#0D9488] hover:from-[#083A54] hover:to-[#0B7A70] text-white font-black text-sm shadow-md transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer glossy-sheen border border-white/20"
          >
            <span>التالي</span>
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* High-definition Image Zoom Modal */}
      {isImageZoomed && (
        <div 
          onClick={() => setIsImageZoomed(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl border-2 border-white/40 cursor-default"
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-slate-900">
                صورة: {displayName}
              </span>
              <button
                type="button"
                onClick={() => setIsImageZoomed(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 font-bold cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center shadow-inner">
              <img
                src={currentItem.image}
                alt={currentItem.nameAr}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handlePlaySpeech(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-teal-50 text-teal-900 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 border border-teal-200 transition cursor-pointer"
              >
                <Volume2 className="w-4 h-4 text-teal-700" />
                <span>استمع للنطق الصوتي</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsImageZoomed(false);
                  handleOpenVideo();
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-[#0B4F71] to-[#0D9488] text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>مشاهدة الفيديو</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Uploaded Videos Management Modal */}
      <UploadedVideosModal
        isOpen={isUploadedVideosOpen}
        onClose={() => setIsUploadedVideosOpen(false)}
        currentItem={currentItem}
        onVideoAssigned={(url) => {
          setCustomVideoUrl(url);
          setHasCustomVideo(true);
          setShowVideo(true);
        }}
      />
    </div>
  );
};
