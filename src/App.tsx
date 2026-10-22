import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav, TabType } from './components/BottomNav';
import { CategoryGridPage } from './components/CategoryGridPage';
import { VastPracticeScreen } from './components/VastPracticeScreen';
import { SemanticFluencyModule } from './components/SemanticFluencyModule';
import { DefinitionMatchingModule } from './components/DefinitionMatchingModule';
import { ProgressPage } from './components/ProgressPage';
import { VideoLibraryPage } from './components/VideoLibraryPage';
import { VoiceRecordingPage } from './components/VoiceRecordingPage';
import { TherapistModal } from './components/TherapistModal';
import { CATEGORIES_DATA } from './data/categoriesData';
import vastPhoneImg from './assets/images/vast_phone_articulation_1790546845170.jpg';
import therapistSessionImg from './assets/images/therapist_patient_tablet_1790546854998.jpg';
import {
  Category,
  CategoryItem,
  UserProgress,
  PatientProfile,
  PracticeSessionResult,
  FluencySessionResult,
} from './types';
import { Play, Stethoscope, ChevronLeft, ArrowLeft, ArrowRight } from 'lucide-react';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [initialShowVideo, setInitialShowVideo] = useState<boolean>(false);
  const [currentLang, setCurrentLang] = useState<'ar' | 'fr'>('ar');
  const [heroImageTab, setHeroImageTab] = useState<'vast' | 'therapist'>('vast');

  // Patient Profile & Settings State
  const [patientProfile, setPatientProfile] = useState<PatientProfile>({
    name: 'أحمد مراد',
    caseType: 'حبسة بروكا الحركية (Broca’s Aphasia)',
    speechRate: 0.75,
    defaultCueLevel: 3,
    autoPlayAudio: true,
    autoPlayMouthVideo: true,
    mirrorCameraEnabled: true,
  });

  // Clinical Progress State
  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem('vast_progress');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      totalSessions: 3,
      totalWordsProduced: 28,
      independentWords: 21,
      assistedWords: 7,
      totalTrainingMinutes: 24,
      sessionHistory: [],
      fluencyHistory: [],
    };
  });

  // Save progress locally
  useEffect(() => {
    try {
      localStorage.setItem('vast_progress', JSON.stringify(userProgress));
    } catch {
      // ignore
    }
  }, [userProgress]);

  // Handle Recording of a Practice Result
  const handleRecordPracticeResult = (result: PracticeSessionResult) => {
    setUserProgress(prev => {
      const isInd = result.outcome === 'independent';
      return {
        ...prev,
        totalWordsProduced: prev.totalWordsProduced + 1,
        independentWords: isInd ? prev.independentWords + 1 : prev.independentWords,
        assistedWords: !isInd ? prev.assistedWords + 1 : prev.assistedWords,
        totalTrainingMinutes: prev.totalTrainingMinutes + Math.ceil(result.durationSeconds / 60),
        sessionHistory: [result, ...prev.sessionHistory],
      };
    });
  };

  // Handle Fluency Result
  const handleSaveFluencyResult = (result: FluencySessionResult) => {
    setUserProgress(prev => ({
      ...prev,
      totalWordsProduced: prev.totalWordsProduced + result.wordsCount,
      independentWords: prev.independentWords + result.wordsCount,
      totalTrainingMinutes: prev.totalTrainingMinutes + 1,
      fluencyHistory: [result, ...prev.fluencyHistory],
    }));
  };

  // Quick Start Session Hero CTA (Starts with first category: Numbers)
  const handleStartHeroSession = () => {
    const firstCat = CATEGORIES_DATA[0];
    setSelectedCategory(firstCat);
    setSelectedItemIndex(0); // Start with item 1
  };

  // Category click routing: shows items grid of the selected category
  const handleSelectCategory = (cat: Category) => {
    setSelectedCategory(cat);
    setSelectedItemIndex(null); // Shows the items grid first (e.g. all fruit boxes)
  };

  // Render the appropriate main content based on view state
  const renderContent = () => {
    // 1. If currently in a dedicated VAST item practice session
    if (selectedCategory && selectedItemIndex !== null) {
      return (
        <VastPracticeScreen
          items={selectedCategory.items}
          initialIndex={selectedItemIndex}
          initialShowVideo={initialShowVideo}
          categoryTitle={selectedCategory.titleAr}
          onBack={() => {
            // Return to the items grid of this category (e.g. Fruits list)
            setSelectedItemIndex(null);
            setInitialShowVideo(false);
          }}
          onRecordResult={handleRecordPracticeResult}
          defaultSpeechRate={patientProfile.speechRate}
        />
      );
    }

    // 2. If inside a category page (e.g. Fruits list, Numbers, Days)
    if (selectedCategory) {
      if (selectedCategory.key === 'semantic-cat') {
        return (
          <SemanticFluencyModule
            onSaveResult={handleSaveFluencyResult}
            onBack={() => setSelectedCategory(null)}
          />
        );
      }
      if (selectedCategory.key === 'definition-matching') {
        return (
          <DefinitionMatchingModule
            onSaveResult={(res) => {
              setUserProgress(prev => ({
                ...prev,
                totalSessions: prev.totalSessions + 1,
                totalWordsProduced: prev.totalWordsProduced + res.correctFirstTry,
                independentWords: prev.independentWords + res.correctFirstTry,
                totalTrainingMinutes: prev.totalTrainingMinutes + 2,
              }));
            }}
            onBack={() => setSelectedCategory(null)}
          />
        );
      }

      return (
        <CategoryGridPage
          category={selectedCategory}
          onSelectItem={(item, idx, openVideo = false) => {
            setSelectedItemIndex(idx);
            setInitialShowVideo(openVideo);
          }}
          onBack={() => setSelectedCategory(null)}
        />
      );
    }

    // 3. Bottom Nav Tabs
    switch (activeTab) {
      case 'videos':
        return <VideoLibraryPage />;
      case 'recording':
        return <VoiceRecordingPage />;
      case 'progress':
        return <ProgressPage progress={userProgress} />;
      case 'therapist':
        return (
          <TherapistModal
            profile={patientProfile}
            onUpdateProfile={setPatientProfile}
          />
        );
      case 'exercises':
      case 'home':
      default:
        return (
          <div className="space-y-6 pb-24">
            
            {/* HERO CARD - Medical Blue & Emerald Glossy Theme */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#0A2E4E] via-[#0C4E68] to-[#0D6E66] text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-teal-950/15 border border-teal-400/25 glossy-sheen">
              
              {/* Subtle Medical Geometric Background Accents */}
              <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -right-16 w-72 h-72 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/10 pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
                
                {/* Text Content */}
                <div className="flex-1 space-y-4 text-center lg:text-right max-w-xl">
                  
                  <div className="inline-flex items-center gap-2 bg-[#08223B]/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-teal-300/40 text-xs font-bold text-teal-200 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>بروتوكول VAST للحبسة الكلامية</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight text-white drop-shadow-xs">
                    تقنية النطق المدعم بالفيديو VAST في تحسين الطلاقة اللفظية لدى المصابين بحبسة بروكا
                  </h1>

                  <p className="text-xs sm:text-sm text-cyan-50 font-medium leading-relaxed">
                    إعادة تأهيل حركي بصري متقدم عبر مراقبة الشفاه ومخارج الأصوات لدعم التسمية والطلاقة اللفظية المستقلة.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                    <button
                      onClick={handleStartHeroSession}
                      className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 hover:from-emerald-300 hover:via-teal-200 hover:to-cyan-200 text-slate-950 rounded-2xl font-black text-base shadow-lg shadow-teal-500/20 hover:shadow-cyan-400/30 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer glossy-sheen border border-white/40"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      <span>ابدأ الجلسة</span>
                    </button>
                  </div>
                </div>

                {/* Hero Visual Showcase */}
                <div className="relative shrink-0 w-full lg:w-auto flex flex-col items-center">
                  {/* Image Selector Switcher */}
                  <div className="flex items-center gap-1.5 p-1 bg-[#061D32]/85 backdrop-blur-md rounded-xl border border-teal-300/35 mb-2.5 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setHeroImageTab('vast')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        heroImageTab === 'vast'
                          ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 text-slate-950 font-black shadow-xs'
                          : 'text-teal-200 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      📱 تقنية VAST بالفيديو
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroImageTab('therapist')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        heroImageTab === 'therapist'
                          ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 text-slate-950 font-black shadow-xs'
                          : 'text-teal-200 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      👩‍⚕️ الجلسة التأهيلية
                    </button>
                  </div>

                  {/* Main Image Frame */}
                  <div className="relative group rounded-2xl overflow-hidden border-2 border-teal-300/40 shadow-2xl bg-slate-900/60 backdrop-blur-xs w-full max-w-[280px] sm:w-72 h-52 sm:h-56">
                    <img
                      src={heroImageTab === 'vast' ? vastPhoneImg : therapistSessionImg}
                      alt={heroImageTab === 'vast' ? 'تقنية النطق بالفيديو VAST عبر الهاتف' : 'جلسة تأهيل المريض مع الأخصائي اللفظي'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* SECTION TITLE */}
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  فئات التمارين والتسمية
                </h2>
                <p className="text-xs text-teal-700 font-bold">
                  اختر الفئة للبدء في تمرين النطق والتصنيف الدلالي
                </p>
              </div>

              <span className="text-xs font-extrabold bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 text-teal-900 px-3 py-1 rounded-full shadow-2xs">
                {CATEGORIES_DATA.length} فئة علاجية
              </span>
            </div>

            {/* CATEGORIES GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {CATEGORIES_DATA.map((cat, index) => {
                // Get high quality real image for the category card preview
                const previewImg = cat.coverImage || cat.items[0]?.image;

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat)}
                    className="group bg-white rounded-3xl p-3 sm:p-4 shadow-xs hover:shadow-xl hover:shadow-teal-600/10 transition-all duration-300 border-2 border-slate-100 hover:border-teal-400 flex flex-col justify-between text-right cursor-pointer relative overflow-hidden"
                  >
                    <div className="space-y-2.5">
                      {/* Category Real Photo Header */}
                      <div className="relative w-full h-28 sm:h-32 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-2xs group-hover:shadow-sm transition">
                        {previewImg ? (
                          <img
                            src={previewImg}
                            alt={cat.titleAr}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 text-4xl">
                            {cat.icon}
                          </div>
                        )}
                      </div>

                      {/* Category Name & Description */}
                      <div className="pt-0.5">
                        <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-[#0B4F71] transition line-clamp-1">
                          {cat.titleAr}
                        </h3>
                        <p className="text-[11px] font-bold text-slate-500 group-hover:text-teal-800 mt-0.5 leading-snug line-clamp-2">
                          {cat.descAr}
                        </p>
                      </div>
                    </div>

                    {/* Interactive Footer Button Pill */}
                    <div className="pt-2.5 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-extrabold text-teal-800 group-hover:text-[#0B4F71]">
                      <span>
                        {cat.key === 'definition-matching'
                          ? '14 تمرين بالتعريف'
                          : cat.key === 'semantic-cat'
                          ? '3 مستويات تصنيف'
                          : `${cat.items.length} تمرين حقيقي`}
                      </span>
                      <span className="w-5 h-5 rounded-full bg-teal-50 group-hover:bg-gradient-to-r group-hover:from-[#0B4F71] group-hover:to-[#0D9488] group-hover:text-white flex items-center justify-center transition shadow-2xs">
                        <ChevronLeft className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F7FA] text-[#0A2540] flex flex-col font-['Tajawal']" dir="rtl">
      
      {/* Top Navigation */}
      <Navbar
        currentLang={currentLang}
        onToggleLang={() => setCurrentLang(prev => prev === 'ar' ? 'fr' : 'ar')}
        onOpenTherapist={() => setActiveTab('therapist')}
        patientName={patientProfile.name}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 pt-4 sm:pt-6">
        {renderContent()}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSelectedCategory(null);
          setSelectedItemIndex(null);
        }}
      />
    </div>
  );
}
