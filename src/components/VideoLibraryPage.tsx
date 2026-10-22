import React, { useState, useEffect } from 'react';
import { CATEGORIES_DATA } from '../data/categoriesData';
import { CategoryItem } from '../types';
import { VastVideoPlayer } from './VastVideoPlayer';
import { Play, Video, Sparkles, Volume2, Upload, CheckCircle2 } from 'lucide-react';
import { speechService } from '../services/speechSynthesisService';
import { customVideoService } from '../services/customVideoService';

export const VideoLibraryPage: React.FC = () => {
  // Flatten all items across categories that have articulatory data
  const allItems = CATEGORIES_DATA.flatMap((c) => c.items);
  const [selectedItem, setSelectedItem] = useState<CategoryItem>(() => {
    // Default to orange/tchina or banana if available
    const orange = allItems.find((i) => i.id === 'orange');
    return orange || allItems[0];
  });
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>('fruits');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [itemsWithVideos, setItemsWithVideos] = useState<Set<string>>(new Set());

  // Track which items have uploaded AI videos (including aliases)
  const refreshVideos = async () => {
    const set = new Set<string>();
    for (const item of allItems) {
      if (item.videoUrl) {
        set.add(item.id);
      } else {
        const url = await customVideoService.getVideoUrl(item.id);
        if (url) {
          set.add(item.id);
        }
      }
    }
    setItemsWithVideos(set);
  };

  useEffect(() => {
    refreshVideos();

    const unsubscribe = customVideoService.subscribe(() => {
      refreshVideos();
    });

    return () => unsubscribe();
  }, []);

  const filteredItems =
    selectedCategoryKey === 'all'
      ? allItems
      : selectedCategoryKey === 'custom_uploaded'
      ? allItems.filter((i) => itemsWithVideos.has(i.id))
      : allItems.filter((i) => i.categoryKey === selectedCategoryKey);

  const handlePlaySpeech = () => {
    speechService.stop();
    const hasCustom = itemsWithVideos.has(selectedItem.id) || !!selectedItem.videoUrl;
    if (hasCustom) {
      setIsPlayingAudio(true);
      return;
    }
    setIsPlayingAudio(true);
    speechService.speak(selectedItem.dialectNameAr || selectedItem.nameAr, {
      rate: 0.75,
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-3xl shadow-inner text-emerald-800">
            <Video className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-emerald-950">مكتبة فيديوهات النطق (VAST)</h1>
            <p className="text-xs text-emerald-700 font-bold">
              مشاهدة حركة الشفتين ومخارج الحروف وربط فيديوهات الذكاء الاصطناعي بكل كلمة
            </p>
          </div>
        </div>
      </div>

      {/* Featured Video Player Area */}
      <div className="bg-white rounded-3xl p-6 shadow-md border border-emerald-100 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-7">
          <VastVideoPlayer
            item={selectedItem}
            isPlayingAudio={isPlayingAudio}
            onPlaySpeech={handlePlaySpeech}
            speechRate={0.75}
          />
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 space-y-2">
            <span className="text-xs font-bold text-emerald-700">الكلمة المحددة حالياً:</span>
            <h2 className="text-2xl sm:text-3xl font-black text-emerald-950">{selectedItem.nameAr}</h2>
            {selectedItem.dialectNameAr && (
              <span className="inline-block px-2.5 py-0.5 bg-emerald-200/80 text-emerald-950 rounded-lg text-xs font-extrabold">
                بالدارجة: {selectedItem.dialectNameAr}
              </span>
            )}
            {selectedItem.phoneticAr && (
              <p className="text-sm font-bold text-emerald-600 tracking-wider">
                {selectedItem.phoneticAr}
              </p>
            )}
            {selectedItem.articulatoryNote && (
              <p className="text-xs text-emerald-800 font-medium pt-1 leading-relaxed">
                <span className="font-bold">المخرج الصوتي:</span> {selectedItem.articulatoryNote}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePlaySpeech}
              disabled={isPlayingAudio}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>تشغيل الصوت النموذجي</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategoryKey('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            selectedCategoryKey === 'all'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-emerald-900 border border-emerald-100 hover:bg-emerald-50'
          }`}
        >
          الكل ({allItems.length})
        </button>

        {/* Uploaded Videos Tab */}
        <button
          onClick={() => setSelectedCategoryKey('custom_uploaded')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            selectedCategoryKey === 'custom_uploaded'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          <span>🎥</span>
          <span>فيديوهاتي المرفوعة ({itemsWithVideos.size})</span>
        </button>

        {CATEGORIES_DATA.filter((c) => c.items.length > 0).map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategoryKey(cat.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
              selectedCategoryKey === cat.key
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-emerald-900 border border-emerald-100 hover:bg-emerald-50'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.titleAr}</span>
          </button>
        ))}
      </div>

      {/* Video Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center space-y-3 border border-emerald-100">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
            <Video className="w-6 h-6" />
          </div>
          <p className="font-bold text-slate-800">
            {selectedCategoryKey === 'custom_uploaded'
              ? 'لم تقم برفع فيديوهات بعد أو يمكنك رفع فيديو لأي عنصر مباشرة'
              : 'لا توجد عناصر في هذا القسم'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredItems.map((item) => {
            const hasCustomVideo = itemsWithVideos.has(item.id);
            const isSelected = selectedItem.id === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`p-3 rounded-2xl text-right transition border-2 flex flex-col items-center text-center space-y-2 bg-white cursor-pointer relative ${
                  isSelected
                    ? 'border-emerald-600 shadow-md bg-emerald-50/50'
                    : 'border-emerald-100 hover:border-emerald-300'
                }`}
              >
                {hasCustomVideo && (
                  <div className="absolute top-2 right-2 z-10 bg-emerald-600 text-white px-2 py-0.5 rounded-md text-[9px] font-black shadow-xs flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>فيديوك المرفوع</span>
                  </div>
                )}

                <div className="w-full aspect-video rounded-xl overflow-hidden bg-slate-900 relative">
                  <img
                    src={item.image}
                    alt={item.nameAr}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-85"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow">
                      <Play className="w-4 h-4 fill-current translate-x-[-1px]" />
                    </div>
                  </div>
                </div>
                <div className="w-full">
                  <span className="text-sm font-black text-emerald-950 block truncate">
                    {item.dialectNameAr || item.nameAr}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold block">
                    {item.firstSound}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
