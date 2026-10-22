import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Camera,
  Sparkles,
  Eye,
  Info,
  Upload,
  Video as VideoIcon,
  Trash2,
  Sliders,
  CheckCircle,
} from 'lucide-react';
import { CategoryItem } from '../types';
import { customVideoService, extractYouTubeId } from '../services/customVideoService';
import { speechService } from '../services/speechSynthesisService';
import { RealMouthArticulator } from './RealMouthArticulator';

interface VastVideoPlayerProps {
  item: CategoryItem;
  isPlayingAudio: boolean;
  onPlaySpeech: () => void;
  speechRate: number;
  onUploadCustomVideo?: (itemId: string, file: File) => void;
}

export const VastVideoPlayer: React.FC<VastVideoPlayerProps> = ({
  item,
  isPlayingAudio,
  onPlaySpeech,
  speechRate,
}) => {
  const realVideoRef = useRef<HTMLVideoElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const mirrorVideoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // State
  const [isPlayingMotion, setIsPlayingMotion] = useState(false);
  const [currentPhonemeIndex, setCurrentPhonemeIndex] = useState(0);
  const [showMirror, setShowMirror] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(item.videoUrl || null);
  const [useRealVideoMode, setUseRealVideoMode] = useState<boolean>(true);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isLooping, setIsLooping] = useState(true);

  // Phonetics syllables
  const syllables = item.phoneticAr ? item.phoneticAr.split(' - ') : [item.nameAr];
  const youtubeId = extractYouTubeId(customVideoUrl);
  const isYouTube = !!youtubeId;

  // Fetch custom video from IndexedDB on item change
  useEffect(() => {
    let isMounted = true;
    setIsVideoLoading(true);

    customVideoService.getVideoUrl(item.id).then((url) => {
      if (isMounted) {
        const finalUrl = url || item.videoUrl || null;
        setCustomVideoUrl(finalUrl);
        setUseRealVideoMode(!!finalUrl);
        setIsVideoLoading(false);
      }
    });

    const unsubscribe = customVideoService.subscribe((changedItemId, url) => {
      if (changedItemId === item.id && isMounted) {
        const finalUrl = url || item.videoUrl || null;
        setCustomVideoUrl(finalUrl);
        setUseRealVideoMode(!!finalUrl);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [item.id, item.videoUrl]);

  // Auto-play video when isPlayingAudio changes
  useEffect(() => {
    if (isPlayingAudio) {
      setIsPlayingMotion(true);
      if (useRealVideoMode && customVideoUrl) {
        speechService.stop();
        if (isYouTube) {
          iframeRef.current?.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        } else if (realVideoRef.current) {
          realVideoRef.current.currentTime = 0;
          realVideoRef.current.muted = false;
          realVideoRef.current.volume = 1.0;
          realVideoRef.current.play().catch(() => {});
        }
      }
    } else {
      setIsPlayingMotion(false);
      if (useRealVideoMode && customVideoUrl) {
        if (isYouTube) {
          iframeRef.current?.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        } else if (realVideoRef.current) {
          realVideoRef.current.pause();
        }
      }
    }
  }, [isPlayingAudio, useRealVideoMode, customVideoUrl, isYouTube]);

  // Ensure YouTube video starts playing immediately on mount/load without requiring click on YouTube red button
  useEffect(() => {
    if (useRealVideoMode && isYouTube && customVideoUrl) {
      setIsPlayingMotion(true);
      const timer1 = setTimeout(() => {
        iframeRef.current?.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      }, 350);
      const timer2 = setTimeout(() => {
        iframeRef.current?.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      }, 900);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [youtubeId, useRealVideoMode, isYouTube, customVideoUrl]);

  // Adjust video playback rate whenever speechRate changes
  useEffect(() => {
    if (realVideoRef.current) {
      realVideoRef.current.playbackRate = speechRate;
    }
  }, [speechRate, customVideoUrl]);

  // Stop TTS and video ONLY when item actually changes to a different item
  const prevItemIdRef = useRef<string>(item.id);
  useEffect(() => {
    if (prevItemIdRef.current !== item.id) {
      prevItemIdRef.current = item.id;
      speechService.stop();
      if (realVideoRef.current) {
        realVideoRef.current.pause();
        realVideoRef.current.currentTime = 0;
      }
      if (isYouTube) {
        iframeRef.current?.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      }
      setIsPlayingMotion(false);
    }
  }, [item.id, isYouTube]);

  // Handle Video File Upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsVideoLoading(true);
      speechService.stop();
      const url = await customVideoService.saveVideo(item.id, file, file.name);
      setCustomVideoUrl(url);
      setUseRealVideoMode(true);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save video:', err);
    } finally {
      setIsVideoLoading(false);
    }
  };

  const handleDeleteCustomVideo = async () => {
    speechService.stop();
    await customVideoService.deleteVideo(item.id);
    setCustomVideoUrl(null);
    setUseRealVideoMode(false);
  };

  // Toggle Patient Mirror Camera
  const toggleMirrorCamera = async () => {
    if (showMirror) {
      setShowMirror(false);
      if (mirrorVideoRef.current && mirrorVideoRef.current.srcObject) {
        const tracks = (mirrorVideoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
        mirrorVideoRef.current.srcObject = null;
      }
    } else {
      try {
        setCameraError(null);
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        setShowMirror(true);
        setTimeout(() => {
          if (mirrorVideoRef.current) {
            mirrorVideoRef.current.srcObject = stream;
          }
        }, 100);
      } catch {
        setCameraError('تعذر فتح الكاميرا (يرجى التحقق من إذن الكاميرا)');
      }
    }
  };

  // Master Play / Pause Handler
  const handleTogglePlay = () => {
    if (useRealVideoMode && customVideoUrl) {
      speechService.stop();
      if (isYouTube) {
        if (isPlayingMotion) {
          iframeRef.current?.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
          setIsPlayingMotion(false);
        } else {
          iframeRef.current?.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
          setIsPlayingMotion(true);
        }
      } else if (realVideoRef.current) {
        if (realVideoRef.current.paused) {
          realVideoRef.current.currentTime = 0;
          realVideoRef.current.muted = false;
          realVideoRef.current.volume = 1.0;
          realVideoRef.current.play().catch(() => {});
          setIsPlayingMotion(true);
        } else {
          realVideoRef.current.pause();
          setIsPlayingMotion(false);
        }
      }
    } else {
      if (isPlayingMotion) {
        setIsPlayingMotion(false);
        speechService.stop();
      } else {
        setIsPlayingMotion(true);
        onPlaySpeech();
      }
    }
  };

  const handleRestart = () => {
    speechService.stop();
    if (useRealVideoMode && customVideoUrl) {
      if (isYouTube) {
        iframeRef.current?.contentWindow?.postMessage('{"event":"command","func":"seekTo","args":[0, true]}', '*');
        iframeRef.current?.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        setIsPlayingMotion(true);
      } else if (realVideoRef.current) {
        realVideoRef.current.currentTime = 0;
        realVideoRef.current.muted = false;
        realVideoRef.current.volume = 1.0;
        realVideoRef.current.play().catch(() => {});
        setIsPlayingMotion(true);
      }
    } else {
      setIsPlayingMotion(true);
      onPlaySpeech();
    }
  };

  return (
    <div className="w-full flex flex-col items-center space-y-2">
      {/* Hidden input for uploading video files */}
      <input
        type="file"
        ref={fileInputRef}
        accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Mode Switcher & Upload Pill Bar */}
      <div className="w-full flex items-center justify-between gap-2 px-1 text-xs">
        <div className="flex items-center gap-1.5">
          {customVideoUrl ? (
            <button
              onClick={() => setUseRealVideoMode(!useRealVideoMode)}
              className={`px-3 py-1.5 rounded-xl font-black transition flex items-center gap-1.5 border cursor-pointer ${
                useRealVideoMode
                  ? 'bg-gradient-to-r from-[#0B4F71] to-[#0D9488] text-white border-teal-600 shadow-xs'
                  : 'bg-white text-slate-800 border-slate-200 hover:bg-teal-50/60'
              }`}
            >
              <VideoIcon className="w-3.5 h-3.5" />
              <span>
                {useRealVideoMode 
                  ? (isYouTube ? 'فيديو يوتيوب مدمج 🎥' : 'فيديو مخصص مرفوع')
                  : 'محاكي الفم الواقعي'}
              </span>
            </button>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200/80 text-teal-800 font-bold flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>محاكي حركة الفم والشفتين الواقعي (VAST)</span>
            </span>
          )}
        </div>

        {/* Upload / Replace Action */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-900 border border-slate-200 font-bold flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
            title="إرفاق فيديو نطق مخصص لهذه الكلمة"
          >
            <Upload className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">{customVideoUrl ? 'تغيير الفيديو المرفوع' : 'رفع فيديو الكلمة'}</span>
            <span className="sm:hidden">رفع</span>
          </button>

          {customVideoUrl && (
            <button
              onClick={handleDeleteCustomVideo}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
              title="حذف الفيديو المخصص"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {uploadSuccess && (
        <div className="w-full bg-teal-50 border border-teal-300 rounded-xl px-3 py-1.5 flex items-center justify-center gap-1.5 text-xs text-teal-950 font-bold animate-in fade-in shadow-2xs">
          <CheckCircle className="w-4 h-4 text-teal-700" />
          <span>تم إدراج فيديو النطق بنجاح لهذه الكلمة!</span>
        </div>
      )}

      {/* Main Video Screen Box - 100% Real Authentic Human Mouth Articulator */}
      <div 
        onClick={isYouTube ? undefined : handleTogglePlay}
        className="relative w-full aspect-[4/3] max-h-[360px] sm:max-h-[400px] bg-slate-950 rounded-3xl overflow-hidden shadow-xl border-4 border-white flex items-center justify-center select-none"
      >
        {/* Case A1: Real YouTube Video Embed */}
        {useRealVideoMode && customVideoUrl && isYouTube ? (
          <div className="w-full h-full relative bg-black flex items-center justify-center">
            <iframe
              ref={iframeRef}
              key={youtubeId}
              src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&autoplay=1&mute=0&rel=0&playsinline=1&modestbranding=1&loop=1&playlist=${youtubeId}`}
              title={item.dialectNameAr || item.nameAr}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={() => {
                setTimeout(() => {
                  iframeRef.current?.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                }, 200);
              }}
            />
          </div>
        ) : useRealVideoMode && customVideoUrl ? (
          /* Case A2: Standard Direct MP4 / Blob Video */
          <video
            ref={realVideoRef}
            src={customVideoUrl}
            playsInline
            loop={false}
            controls={false}
            onPlay={() => {
              speechService.stop();
              setIsPlayingMotion(true);
              if (realVideoRef.current) {
                realVideoRef.current.muted = false;
                realVideoRef.current.volume = 1.0;
              }
            }}
            onPause={() => setIsPlayingMotion(false)}
            onEnded={() => {
              if (isLooping) {
                if (realVideoRef.current) {
                  realVideoRef.current.currentTime = 0;
                  realVideoRef.current.muted = false;
                  realVideoRef.current.volume = 1.0;
                  realVideoRef.current.play().catch(() => {});
                }
              } else {
                setIsPlayingMotion(false);
              }
            }}
            onError={() => {
              console.warn('Custom video failed to load, falling back to mouth simulation');
              setUseRealVideoMode(false);
            }}
            className="w-full h-full object-cover select-none pointer-events-none"
          />
        ) : (
          /* Case B: Real Photographic Human Mouth Speech Engine */
          <RealMouthArticulator
            item={item}
            isPlayingAudio={isPlayingAudio}
            isPlayingMotion={isPlayingMotion}
            speechRate={speechRate}
            currentPhonemeIndex={currentPhonemeIndex}
            isLooping={isLooping}
            onPhonemeIndexChange={setCurrentPhonemeIndex}
            onCycleSpeech={onPlaySpeech}
            onStopMotion={() => setIsPlayingMotion(false)}
          />
        )}

        {/* Play Icon Overlay ONLY when paused and NOT YouTube (YouTube has its own player) */}
        {!isYouTube && !isPlayingMotion && !isPlayingAudio && (
          <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#0B4F71] via-[#0D8279] to-[#0D9488] text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition duration-300 border-2 border-white/60">
              <Play className="w-8 h-8 fill-current translate-x-[-2px]" />
            </div>
          </div>
        )}
      </div>

      {/* Syllable Synchronization & Playback Controls Bar (Placed OUTSIDE beneath the video) */}
      <div className="w-full bg-slate-900 text-white rounded-2xl p-3 shadow-md border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        {/* Syllables list */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto justify-center sm:justify-start py-0.5">
          {syllables.map((syl, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentPhonemeIndex(i);
                speechService.stop();
                if (useRealVideoMode && customVideoUrl && realVideoRef.current) {
                  realVideoRef.current.currentTime = 0;
                  realVideoRef.current.play().catch(() => {});
                  setIsPlayingMotion(true);
                } else {
                  setIsPlayingMotion(true);
                  speechService.speak(syl, {
                    rate: Math.max(0.5, speechRate * 0.8),
                    onEnd: () => setIsPlayingMotion(false),
                    onError: () => setIsPlayingMotion(false),
                  });
                }
              }}
              className={`px-3 py-1 rounded-xl text-sm sm:text-base font-black transition-all duration-200 cursor-pointer ${
                (isPlayingMotion || isPlayingAudio) && currentPhonemeIndex === i
                  ? 'bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 shadow-md scale-105 ring-2 ring-white/50'
                  : 'bg-white/10 text-white/90 border border-white/10 hover:bg-white/20'
              }`}
            >
              {syl}
            </button>
          ))}
        </div>

        {/* Action Controls: Play/Pause, Restart, Mirror */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleTogglePlay}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            {isPlayingMotion || isPlayingAudio ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>إيقاف مؤقت</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>تشغيل ونطق</span>
              </>
            )}
          </button>

          <button
            onClick={handleRestart}
            className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            title="إعادة التشغيل من البداية"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={toggleMirrorCamera}
            className={`p-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer ${
              showMirror
                ? 'bg-teal-500 text-slate-950 font-black'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
            title="مرآة فم المريض للمقارنة الحركية"
          >
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">{showMirror ? 'إخفاء المرآة' : 'مرآة الفم'}</span>
          </button>
        </div>
      </div>

      {/* Patient Mirror Camera (Positioned cleanly outside below when active) */}
      {showMirror && (
        <div className="w-full bg-slate-900 rounded-2xl p-3 border border-teal-500/40 shadow-lg flex flex-col sm:flex-row items-center gap-3 animate-in fade-in zoom-in-95">
          <div className="w-28 sm:w-32 aspect-square rounded-xl overflow-hidden border-2 border-teal-400 bg-black shrink-0">
            <video
              ref={mirrorVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />
          </div>
          <div className="text-right space-y-1">
            <div className="flex items-center gap-1.5 text-teal-400 font-bold text-xs">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
              <span>كاميرا مرآة فم المريض</span>
            </div>
            <p className="text-xs text-slate-300">
              راقب حركة فمك وقارنها مع حركة الشفتين الحقيقية في الشاشة للتدريب على مخارج الحروف.
            </p>
          </div>
        </div>
      )}

      {cameraError && (
        <p className="text-xs text-rose-600 mt-1 font-medium">{cameraError}</p>
      )}

      {/* Clinical Guidance Footer */}
      <div className="w-full bg-gradient-to-r from-teal-50 via-cyan-50/50 to-emerald-50 border border-teal-200/80 rounded-2xl p-2.5 flex items-center justify-between text-xs text-slate-800 font-medium shadow-2xs">
        <div className="flex items-center gap-1.5">
          <Eye className="w-4 h-4 text-teal-700 shrink-0" />
          <span>حركة فم وشفتين حقيقية متزامنة مع المقاطع الصوتية</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] bg-white text-teal-900 border border-teal-200 px-2 py-0.5 rounded-lg font-bold shadow-2xs">
          <Sparkles className="w-3 h-3 text-teal-700" />
          <span>السرعة: {speechRate}x</span>
        </div>
      </div>
    </div>
  );
};
