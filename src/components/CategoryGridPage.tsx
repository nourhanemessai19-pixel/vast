import React, { useState, useEffect } from 'react';
import { Category, CategoryItem } from '../types';
import { ArrowRight, Play, Volume2, Sparkles, ArrowDownUp, CheckCircle, ChevronRight, Video } from 'lucide-react';
import { speechService } from '../services/speechSynthesisService';
import { customVideoService } from '../services/customVideoService';

interface CategoryGridPageProps {
  category: Category;
  onSelectItem: (item: CategoryItem, index: number, openVideo?: boolean) => void;
  onBack: () => void;
}

export const CategoryGridPage: React.FC<CategoryGridPageProps> = ({
  category,
  onSelectItem,
  onBack,
}) => {
  const [activeNumberOrder, setActiveNumberOrder] = useState<'asc' | 'desc'>('asc');
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [itemsWithVideos, setItemsWithVideos] = useState<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;
    const checkVideos = async () => {
      const set = new Set<string>();
      for (const item of category.items) {
        if (item.videoUrl) {
          set.add(item.id);
        } else {
          const url = await customVideoService.getVideoUrl(item.id);
          if (url) {
            set.add(item.id);
          }
        }
      }
      if (isMounted) {
        setItemsWithVideos(set);
      }
    };

    checkVideos();

    const unsub = customVideoService.subscribe(() => {
      checkVideos();
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, [category.items]);

  // For numbers category: support 1->10 and 10->1
  const displayedItems =
    category.key === 'numbers' && activeNumberOrder === 'desc'
      ? [...category.items].reverse()
      : category.items;

  // Sequential Counting Playback for Numbers/Days/Months
  const handlePlaySequence = async () => {
    setIsPlayingSequence(true);
    for (const item of displayedItems) {
      await speechService.speak(item.nameAr, { rate: 0.8 });
      await new Promise(r => setTimeout(r, 600));
    }
    setIsPlayingSequence(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* Category Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-teal-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200/80 flex items-center justify-center text-3xl shadow-inner shrink-0">
            {category.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                {category.titleAr}
              </h1>
              <span className="text-xs font-bold bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                {category.items.length} عنصر
              </span>
            </div>
            <p className="text-sm font-bold text-teal-700 mt-0.5">
              اختر أي صورة لعرضها، ثم انقر عليها لمشاهدة حركة الفم وسماع النطق (VAST)
            </p>
          </div>
        </div>

        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-900 border border-slate-200 hover:border-teal-200 rounded-2xl font-bold transition shadow-2xs self-stretch sm:self-auto justify-center cursor-pointer"
        >
          <ChevronRight className="w-5 h-5 text-teal-700" />
          <span>الرئيسية</span>
        </button>
      </div>

      {/* Special Controls for Numbers (1 -> 10 and 10 -> 1) */}
      {category.key === 'numbers' && (
        <div className="bg-gradient-to-r from-[#0B4F71] via-[#0D7A75] to-[#0A6C5B] text-white rounded-3xl p-5 shadow-lg shadow-teal-950/10 border border-teal-300/30 flex flex-col sm:flex-row items-center justify-between gap-4 glossy-sheen">
          <div className="space-y-1 text-center sm:text-right">
            <h3 className="text-lg font-black">نشاط العد التتابعي</h3>
            <p className="text-xs text-cyan-100">
              تدريب استرجاع الأعداد التلقائي لمرضى فقدان القدرة الكلامية بروكا
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveNumberOrder('asc')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer ${
                activeNumberOrder === 'asc'
                  ? 'bg-white text-[#0B4F71] shadow-md font-black'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              عد من 1 إلى 10 ⬆
            </button>

            <button
              onClick={() => setActiveNumberOrder('desc')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer ${
                activeNumberOrder === 'desc'
                  ? 'bg-white text-[#0B4F71] shadow-md font-black'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              عد من 10 إلى 1 ⬇
            </button>

            <button
              onClick={handlePlaySequence}
              disabled={isPlayingSequence}
              className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 text-slate-950 transition shadow-md flex items-center gap-1.5 disabled:opacity-50 cursor-pointer glossy-sheen"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isPlayingSequence ? 'جارٍ العد...' : 'استمع للتتالي الكامل'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Special Sequential Playback for Days and Months */}
      {(category.key === 'days' || category.key === 'months' || category.key === 'seasons') && (
        <div className="bg-gradient-to-r from-teal-50 via-cyan-50/50 to-emerald-50 rounded-2xl p-4 border border-teal-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-900 text-xs sm:text-sm font-bold">
            <Sparkles className="w-5 h-5 text-teal-600 shrink-0" />
            <span>
              {category.key === 'days'
                ? 'أيام الأسبوع السبعة بالترتيب الصحيح (الأحد - السبت)'
                : category.key === 'months'
                ? 'أشهر السنة الاثنا عشر (جانفي - ديسمبر)'
                : 'فصول السنة الأربعة المتعاقبة'}
            </span>
          </div>

          <button
            onClick={handlePlaySequence}
            disabled={isPlayingSequence}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0B4F71] to-[#0D9488] hover:from-[#083A54] hover:to-[#0B7A70] text-white rounded-xl text-xs font-black shadow-sm transition disabled:opacity-50 cursor-pointer glossy-sheen"
          >
            <Volume2 className="w-4 h-4" />
            <span>{isPlayingSequence ? 'جارٍ القراءة بالتتابع...' : 'قراءة صوتية متتالية'}</span>
          </button>
        </div>
      )}

      {/* Items Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-5">
        {displayedItems.map((item, index) => {
          const hasVideo = itemsWithVideos.has(item.id) || !!item.videoUrl;
          return (
            <div
              key={item.id}
              className="group bg-white rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-xl hover:shadow-teal-600/10 transition-all duration-300 border-2 border-slate-100 hover:border-teal-400 flex flex-col items-center justify-between relative overflow-hidden hover:-translate-y-1 text-right"
            >
              {/* Clean Image Card - Clicking it opens the item image */}
              <div 
                onClick={() => onSelectItem(item, index, false)}
                className="w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-b from-slate-50 to-teal-50/30 border border-slate-100 relative group-hover:scale-102 transition-transform duration-300 flex items-center justify-center cursor-pointer"
                title={`انقر لعرض صورة ${item.dialectNameAr || item.nameAr}`}
              >
                <img
                  src={item.image}
                  alt={item.nameAr}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                
                {/* Uploaded Video Badge */}
                {itemsWithVideos.has(item.id) && (
                  <div className="absolute top-2.5 right-2.5 z-10 bg-emerald-600/95 backdrop-blur-xs text-white px-2.5 py-1 rounded-xl text-[10px] font-black shadow-md border border-emerald-300 flex items-center gap-1 animate-pulse">
                    <Video className="w-3 h-3" />
                    <span>فيديوك جاهز 🎥</span>
                  </div>
                )}

                {/* Picture prompt indicator */}
                <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white px-2 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 border border-white/20">
                  <span>🖼️</span>
                  <span>عرض الصورة</span>
                </div>
              </div>

              {/* Day / Item Name Underneath the Image */}
              <div 
                onClick={() => onSelectItem(item, index, false)}
                className="w-full mt-2.5 text-center space-y-1 cursor-pointer flex-1"
              >
                {category.key === 'days' ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-[11px] font-black text-teal-900 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                        اليوم {index + 1}
                      </span>
                      <span className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-teal-700 transition-colors">
                        {item.nameAr}
                      </span>
                    </div>
                    {item.nameFr && (
                      <span className="block text-xs font-bold text-slate-500">
                        {item.nameFr}
                      </span>
                    )}
                  </div>
                ) : category.key === 'actions' ? (
                  <div className="space-y-1">
                    <span className="block text-base sm:text-lg font-black text-slate-900 group-hover:text-teal-700 transition-colors">
                      {item.dialectNameAr || item.nameAr}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                      <Play className="w-2.5 h-2.5 fill-current text-teal-700" />
                      <span>فيديو الفم الناطق</span>
                    </span>
                  </div>
                ) : category.key === 'numbers' || category.key === 'months' ? (
                  <div className="space-y-0.5">
                    <span className="block text-base sm:text-lg font-black text-slate-900 group-hover:text-teal-700 transition-colors">
                      {item.nameAr}
                    </span>
                    {item.nameFr && (
                      <span className="block text-[11px] font-bold text-slate-500">
                        {item.nameFr}
                      </span>
                    )}
                  </div>
                ) : (
                  /* Fruits, Vegetables and Other General Categories */
                  <div className="space-y-1">
                    <span className="block text-base sm:text-lg font-black text-slate-900 group-hover:text-teal-700 transition-colors">
                      {item.dialectNameAr || item.nameAr}
                    </span>
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      {item.nameFr && (
                        <span className="text-[11px] font-bold text-slate-500">
                          {item.nameFr}
                        </span>
                      )}
                      {hasVideo && (
                        <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                          فيديو نطق
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Dedicated "مشاهدة الفيديو" Button - plays directly without YouTube play button */}
              <div className="w-full pt-2.5 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectItem(item, index, true);
                  }}
                  className="w-full py-2 px-2.5 bg-gradient-to-r from-[#0B4F71] via-[#0D8279] to-[#0D9488] hover:from-[#083A54] hover:to-[#0B7A70] text-white rounded-xl text-xs font-black shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer glossy-sheen"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>مشاهدة الفيديو 🎥</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
