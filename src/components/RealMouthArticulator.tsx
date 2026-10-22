import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Volume2, Sparkles, Mic, Play, Pause, RotateCcw } from 'lucide-react';
import { CategoryItem } from '../types';

import therapistMouthBase from '../assets/images/therapist_mouth_base_1788815071433.jpg';
import therapistMouthOpen from '../assets/images/therapist_mouth_open_1788815087711.jpg';
import therapistMouthRound from '../assets/images/therapist_mouth_round_1788815102446.jpg';
import therapistMouthTeeth from '../assets/images/therapist_mouth_teeth_1788815117305.jpg';
import therapistMouthF from '../assets/images/therapist_mouth_f_1788815129987.jpg';

export type MouthFrameType = 'closed' | 'open' | 'rounded' | 'teeth' | 'labiodental';

interface RealMouthArticulatorProps {
  item: CategoryItem;
  isPlayingAudio: boolean;
  isPlayingMotion: boolean;
  speechRate: number;
  currentPhonemeIndex: number;
  isLooping?: boolean;
  onPhonemeIndexChange?: (index: number) => void;
  onTogglePlay?: () => void;
  onCycleSpeech?: () => void;
  onStopMotion?: () => void;
}

// Map Arabic phonemes to physiological articulation mouth shapes
export function getMouthFrameForSyllable(syllable: string, fallbackType?: string): MouthFrameType {
  const clean = syllable.trim();

  // Labiodental (F / ف / ڤ)
  if (clean.includes('ف') || clean.includes('ڤ') || fallbackType === 'labiodental') {
    return 'labiodental';
  }

  // Rounded lips (O, U, W, Dammah / و / ُ )
  if (
    clean.includes('و') ||
    clean.includes('ُ') ||
    clean.includes('ۥ') ||
    fallbackType === 'rounded'
  ) {
    return 'rounded';
  }

  // Bilabial (B, M, P / ب / م) -> closes tightly, then opens
  if (
    clean.startsWith('ب') ||
    clean.startsWith('م') ||
    clean.startsWith('پ') ||
    fallbackType === 'bilabial'
  ) {
    return 'closed';
  }

  // Dental / Alveolar / Palatal / Smile (S, Z, T, D, N, L, R, Sh, J, Kasrah / س، ز، ت، د، ط، ض، ن، ل، ر، ش، ج، ي، ِ )
  if (
    clean.includes('س') ||
    clean.includes('ز') ||
    clean.includes('ت') ||
    clean.includes('د') ||
    clean.includes('ط') ||
    clean.includes('ض') ||
    clean.includes('ن') ||
    clean.includes('ل') ||
    clean.includes('ر') ||
    clean.includes('ش') ||
    clean.includes('ج') ||
    clean.includes('ي') ||
    clean.includes('ِ') ||
    fallbackType === 'alveolar' ||
    fallbackType === 'dental'
  ) {
    return 'teeth';
  }

  // Open Vowels & Pharyngeal / Guttural (A, AA, H, Kh, Gh, Q, K, Fathah / ا، ع، ح، خ، غ، ق، ك، َ )
  return 'open';
}

// Helper to guarantee finite numeric values for CSS and transform properties
const toFinite = (val: number, fallback = 0, min?: number, max?: number): number => {
  if (typeof val !== 'number' || !Number.isFinite(val) || Number.isNaN(val)) {
    return fallback;
  }
  let res = val;
  if (min !== undefined) res = Math.max(min, res);
  if (max !== undefined) res = Math.min(max, res);
  return res;
};

export const RealMouthArticulator: React.FC<RealMouthArticulatorProps> = ({
  item,
  isPlayingAudio,
  isPlayingMotion,
  speechRate,
  currentPhonemeIndex,
  isLooping = true,
  onPhonemeIndexChange,
  onCycleSpeech,
  onStopMotion,
}) => {
  const [jawOffset, setJawOffset] = useState<number>(0);
  const [lipScaleX, setLipScaleX] = useState<number>(1);
  const [lipScaleY, setLipScaleY] = useState<number>(1);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [videoProgress, setVideoProgress] = useState<number>(0);

  // Opacities for smooth morph-like blending over the base face
  const [blendWeights, setBlendWeights] = useState<Record<MouthFrameType, number>>({
    closed: 1,
    open: 0,
    rounded: 0,
    teeth: 0,
    labiodental: 0,
  });

  // Breakdown syllables from phonetic text
  const syllables = useMemo(() => {
    if (item.phoneticAr && typeof item.phoneticAr === 'string') {
      const parts = item.phoneticAr.split(' - ').map((s) => s.trim()).filter(Boolean);
      if (parts.length > 0) return parts;
    }
    const fallback = (item.dialectNameAr || item.nameAr || '').trim();
    return fallback ? [fallback] : ['نطق'];
  }, [item.phoneticAr, item.nameAr, item.dialectNameAr]);

  // Preload all therapist mouth frames
  useEffect(() => {
    [
      therapistMouthBase,
      therapistMouthOpen,
      therapistMouthRound,
      therapistMouthTeeth,
      therapistMouthF,
    ].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Articulation animation engine running at 60 FPS
  useEffect(() => {
    let animationFrameId: number;
    let startTime = performance.now();
    const isSpeaking = isPlayingAudio || isPlayingMotion;

    const animateSpeech = (currentTime: number) => {
      if (!isSpeaking) {
        // Subtle living micro-motion (breathing at rest)
        const breathe = Math.sin(currentTime * 0.0018) * 0.8;
        setJawOffset(breathe);
        setLipScaleX(1);
        setLipScaleY(1);
        setAudioLevel(0);
        setVideoProgress(0);
        setBlendWeights({
          closed: 1,
          open: 0,
          rounded: 0,
          teeth: 0,
          labiodental: 0,
        });
        animationFrameId = requestAnimationFrame(animateSpeech);
        return;
      }

      const elapsed = Math.max(0, currentTime - startTime);
      const safeSpeechRate = (typeof speechRate === 'number' && Number.isFinite(speechRate) && speechRate > 0)
        ? speechRate
        : 0.75;
      const numSyllables = Math.max(1, syllables.length);
      const speechDuration = (numSyllables * 680) / safeSpeechRate;
      const pauseDuration = 800;
      const totalCycle = isLooping ? speechDuration + pauseDuration : speechDuration;

      if (elapsed >= totalCycle) {
        if (isLooping) {
          startTime = currentTime;
          if (onCycleSpeech) {
            onCycleSpeech();
          }
        } else {
          setJawOffset(0);
          setLipScaleX(1);
          setLipScaleY(1);
          setAudioLevel(0);
          setVideoProgress(100);
          setBlendWeights({
            closed: 1,
            open: 0,
            rounded: 0,
            teeth: 0,
            labiodental: 0,
          });
          if (onStopMotion) {
            onStopMotion();
          }
          return;
        }
      }

      if (elapsed < speechDuration) {
        const progress = Math.max(0, Math.min(1, elapsed / speechDuration));
        setVideoProgress(Math.min(100, Math.round(progress * 100)));

        const sylIndex = Math.min(
          Math.floor(progress * numSyllables),
          numSyllables - 1
        );
        if (onPhonemeIndexChange && currentPhonemeIndex !== sylIndex) {
          onPhonemeIndexChange(sylIndex);
        }

        const sylDuration = Math.max(1, speechDuration / numSyllables);
        const sylElapsed = elapsed % sylDuration;
        const sylProgress = Math.max(0, Math.min(1, sylElapsed / sylDuration));

        const currentSyllable = syllables[sylIndex] || '';
        const targetShape = getMouthFrameForSyllable(currentSyllable, item.mouthShapeType);

        // Smooth sinusoidal articulation envelope (strictly clamp to [0, 1] so Math.pow never receives negative or NaN)
        const envelope = Math.max(0, Math.min(1, Math.sin(sylProgress * Math.PI)));
        const rawIntensity = Math.pow(envelope, 0.85);
        const smoothIntensity = Number.isFinite(rawIntensity) ? Math.max(0, Math.min(1, rawIntensity)) : 0;

        // Calculate jaw movement & lip elastic deformation
        let maxJaw = 5;
        let scaleXMod = 1;
        let scaleYMod = 1;

        if (targetShape === 'open') {
          maxJaw = 7;
          scaleYMod = 1 + smoothIntensity * 0.05;
          scaleXMod = 1 - smoothIntensity * 0.02;
        } else if (targetShape === 'rounded') {
          maxJaw = 4;
          scaleXMod = 1 - smoothIntensity * 0.06;
          scaleYMod = 1 + smoothIntensity * 0.04;
        } else if (targetShape === 'teeth') {
          maxJaw = 3;
          scaleXMod = 1 + smoothIntensity * 0.05;
          scaleYMod = 1 - smoothIntensity * 0.02;
        } else if (targetShape === 'labiodental') {
          maxJaw = 3;
          scaleXMod = 1 + smoothIntensity * 0.02;
        } else if (targetShape === 'closed') {
          maxJaw = 1;
        }

        setJawOffset(smoothIntensity * maxJaw);
        setLipScaleX(scaleXMod);
        setLipScaleY(scaleYMod);
        setAudioLevel(smoothIntensity);

        // Update blending weights for natural morphing
        setBlendWeights({
          closed: Math.max(0, Math.min(1, 1 - smoothIntensity)),
          open: targetShape === 'open' ? smoothIntensity : 0,
          rounded: targetShape === 'rounded' ? smoothIntensity : 0,
          teeth: targetShape === 'teeth' ? smoothIntensity : 0,
          labiodental: targetShape === 'labiodental' ? smoothIntensity : 0,
        });
      } else {
        // Natural inter-syllable / pause relaxation
        setJawOffset(0);
        setLipScaleX(1);
        setLipScaleY(1);
        setAudioLevel(0);
        setVideoProgress(100);
        setBlendWeights({
          closed: 1,
          open: 0,
          rounded: 0,
          teeth: 0,
          labiodental: 0,
        });
      }

      animationFrameId = requestAnimationFrame(animateSpeech);
    };

    animationFrameId = requestAnimationFrame(animateSpeech);
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlayingAudio, isPlayingMotion, speechRate, syllables, item.mouthShapeType, isLooping, onCycleSpeech, onStopMotion]);

  // Feathered radial mask style to isolate the lips and oral cavity seamlessly over the stable face
  const mouthMaskStyle: React.CSSProperties = {
    WebkitMaskImage: 'radial-gradient(ellipse 46% 36% at 50% 54%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 90%)',
    maskImage: 'radial-gradient(ellipse 46% 36% at 50% 54%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 90%)',
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-slate-950 select-none">
      {/* 1. Master Stable Base Face (Always active & perfectly anchored) */}
      <div 
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        style={{
          transform: `translateY(${toFinite(jawOffset, 0) * 0.25}px)`,
          transition: 'transform 60ms linear',
        }}
      >
        <img
          src={therapistMouthBase}
          alt="وجه أخصائية النطق"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
        />

        {/* 2. Seamless Feathered Mouth Articulation Layers */}
        {/* Open Vowel (A / فـتـحـة) */}
        <div
          className="absolute inset-0 transition-opacity duration-100 ease-out pointer-events-none"
          style={{
            ...mouthMaskStyle,
            opacity: toFinite(blendWeights.open, 0, 0, 1),
            transform: `translateY(${toFinite(jawOffset, 0) * 0.45}px) scale(${toFinite(lipScaleX, 1, 0.2, 3)}, ${toFinite(lipScaleY, 1, 0.2, 3)})`,
          }}
        >
          <img
            src={therapistMouthOpen}
            alt="فم مفتوح - فتحة"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Rounded (U, O / ضـمـة) */}
        <div
          className="absolute inset-0 transition-opacity duration-100 ease-out pointer-events-none"
          style={{
            ...mouthMaskStyle,
            opacity: toFinite(blendWeights.rounded, 0, 0, 1),
            transform: `translateY(${toFinite(jawOffset, 0) * 0.35}px) scale(${toFinite(lipScaleX, 1, 0.2, 3)}, ${toFinite(lipScaleY, 1, 0.2, 3)})`,
          }}
        >
          <img
            src={therapistMouthRound}
            alt="فم مستدير - ضمة"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Teeth / Smile (S, T, I / كـسـرة) */}
        <div
          className="absolute inset-0 transition-opacity duration-100 ease-out pointer-events-none"
          style={{
            ...mouthMaskStyle,
            opacity: toFinite(blendWeights.teeth, 0, 0, 1),
            transform: `translateY(${toFinite(jawOffset, 0) * 0.3}px) scale(${toFinite(lipScaleX, 1, 0.2, 3)}, ${toFinite(lipScaleY, 1, 0.2, 3)})`,
          }}
        >
          <img
            src={therapistMouthTeeth}
            alt="حركة الأسنان والابتسامة"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Labiodental (F / فـاء) */}
        <div
          className="absolute inset-0 transition-opacity duration-100 ease-out pointer-events-none"
          style={{
            ...mouthMaskStyle,
            opacity: toFinite(blendWeights.labiodental, 0, 0, 1),
            transform: `translateY(${toFinite(jawOffset, 0) * 0.3}px) scale(${toFinite(lipScaleX, 1, 0.2, 3)}, ${toFinite(lipScaleY, 1, 0.2, 3)})`,
          }}
        >
          <img
            src={therapistMouthF}
            alt="حركة الفاء الشفوية السنية"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Live Audio Articulation Ripple / Indicator */}
        {(isPlayingAudio || isPlayingMotion) && (
          <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-teal-400/40 text-white shadow-lg animate-in fade-in">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div className="flex items-end gap-0.5 h-3.5 px-1">
              <span
                className="w-1 bg-teal-400 rounded-full transition-all duration-75"
                style={{ height: `${Math.max(4, toFinite(audioLevel, 0, 0, 1) * 14)}px` }}
              />
              <span
                className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                style={{ height: `${Math.max(6, (1 - toFinite(audioLevel, 0, 0, 1) * 0.5) * 14)}px` }}
              />
              <span
                className="w-1 bg-cyan-400 rounded-full transition-all duration-75"
                style={{ height: `${Math.max(4, toFinite(audioLevel, 0, 0, 1) * 12)}px` }}
              />
            </div>
            <span className="text-[11px] font-black text-teal-200">
              نطق وحركة فم حية
            </span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-teal-400/30 text-white shadow-md flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isPlayingAudio || isPlayingMotion ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
            <span className="text-[11px] font-black text-teal-200">فيديو حركة الفم الحقيقي</span>
          </div>

          <div className="bg-black/60 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20 text-white shadow-md flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span className="text-xs font-black text-teal-100">
              {syllables[currentPhonemeIndex] || item.nameAr}
            </span>
          </div>
        </div>

        {/* Video Progress Bar */}
        <div className="absolute bottom-0 inset-x-0 h-1.5 bg-black/40 z-30 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-300 transition-all duration-75"
            style={{ width: `${isPlayingMotion || isPlayingAudio ? toFinite(videoProgress, 0, 0, 100) : 0}%` }}
          />
        </div>
      </div>
    </div>
  );
};

