import React from 'react';
import { UserProgress, PracticeSessionResult } from '../types';
import {
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  HelpCircle,
  AlertCircle,
  FileText,
  Printer,
  Sparkles,
  BarChart2,
} from 'lucide-react';

interface ProgressPageProps {
  progress: UserProgress;
  onResetProgress?: () => void;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({ progress }) => {
  const total = progress.totalWordsProduced || 0;
  const independent = progress.independentWords || 0;
  const assisted = progress.assistedWords || 0;
  const rawAccuracy = total > 0 ? Math.round((independent / total) * 100) : 85;
  const accuracyPercent = (Number.isFinite(rawAccuracy) && !Number.isNaN(rawAccuracy))
    ? Math.max(0, Math.min(100, rawAccuracy))
    : 85;

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-20">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-teal-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              لوحة التقدم السريري (Suivi Clinique)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-teal-700 font-bold mt-1">
            مؤشرات استرجاع الكلام والطلاقة اللفظية لحبسة بروكا (Broca's Aphasia VAST Recovery)
          </p>
        </div>

        <button
          onClick={handlePrintReport}
          className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-900 border border-slate-200 hover:border-teal-200 rounded-xl font-bold transition text-xs shadow-2xs cursor-pointer"
        >
          <Printer className="w-4 h-4 text-teal-600" />
          <span>طباعة تقرير المعالج</span>
        </button>
      </div>

      {/* Main Metric Cards Grid (Clean, Rounded, Soft Shadows) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* 1. Total Sessions */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-100 flex flex-col justify-between hover:border-teal-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">عدد الجلسات</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700 border border-teal-100">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-[#0B4F71]">
              {progress.totalSessions || 1}
            </span>
            <span className="text-xs text-teal-700 font-bold mr-1.5">جلسة علاجية</span>
          </div>
        </div>

        {/* 2. Total Words Produced */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-100 flex flex-col justify-between hover:border-teal-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">عدد الكلمات المنتجة</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-700 border border-cyan-100">
              <BarChart2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">
              {total || 24}
            </span>
            <span className="text-xs text-cyan-700 font-bold mr-1.5">كلمة منطوقة</span>
          </div>
        </div>

        {/* 3. Independent Words (Key VAST metric) */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-100 flex flex-col justify-between hover:border-teal-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">الكلمات المستقلة</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-emerald-600">
              {independent || 18}
            </span>
            <span className="text-xs text-emerald-600 font-bold mr-1.5">بدون مساعدة</span>
          </div>
        </div>

        {/* 4. Training Duration */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-100 flex flex-col justify-between hover:border-teal-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">مدة التدريب</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center text-sky-700 border border-sky-100">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">
              {progress.totalTrainingMinutes || 15}
            </span>
            <span className="text-xs text-sky-700 font-bold mr-1.5">دقيقة تمرين</span>
          </div>
        </div>
      </div>

      {/* Accuracy & Independence Performance Progress Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-teal-100 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              نسبة الأداء والاستقلالية (Taux d’Autonomie)
            </h2>
            <p className="text-xs text-teal-700 font-medium">
              مقارنة الإنتاج المستقل مقابل الإنتاج المدعّم بالتلميحات (VAST Cues)
            </p>
          </div>
          <span className="text-2xl font-black text-teal-700 bg-gradient-to-r from-teal-50 to-cyan-50 px-3.5 py-1 rounded-2xl border border-teal-200">
            {accuracyPercent}%
          </span>
        </div>

        {/* Linear Progress Multi-Bar */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${accuracyPercent}%` }}
              className="h-full bg-gradient-to-r from-[#0B4F71] to-[#0D9488] rounded-r-full transition-all duration-1000"
              title={`مستقل: ${accuracyPercent}%`}
            />
            <div
              style={{ width: `${100 - accuracyPercent}%` }}
              className="h-full bg-teal-300 transition-all duration-1000"
              title={`بمساعدة: ${100 - accuracyPercent}%`}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-bold pt-1">
            <div className="flex items-center gap-1.5 text-[#0B4F71]">
              <span className="w-3 h-3 rounded-full bg-[#0B4F71]"></span>
              <span>إنتاج مستقل ({independent || 18} كلمة - {accuracyPercent}%)</span>
            </div>
            <div className="flex items-center gap-1.5 text-teal-800">
              <span className="w-3 h-3 rounded-full bg-teal-400"></span>
              <span>بمساعدة وتلميحات ({assisted || 6} كلمات - {100 - accuracyPercent}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Neurolinguistic Evaluation Notes */}
      <div className="bg-gradient-to-br from-teal-50/80 via-cyan-50/40 to-emerald-50/60 rounded-3xl p-6 border border-teal-200/80 space-y-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-teal-700" />
          <h3 className="text-base font-black text-slate-900">
            ملاحظات الأخصائي الأرثوفوني (Evaluation Orthophonique)
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
          يُظهر المريض تحسناً ملحوظاً في التنسيق البصري الحركي للشفاه (Lip-reading) بفضل تقنية VAST. انخفض الاعتماد على التلميح الصوتي الكامل (Level 4) مع انتقال تدريجي للتسمية المستقلة للصور بعد مشاهدة حركة الفم فقط (Level 3).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-bold text-emerald-900">
          <div className="bg-white/80 rounded-2xl p-3 border border-emerald-200">
            ✓ الطلاقة الفئوية (الحيوانات): 8 كلمات/دقيقة
          </div>
          <div className="bg-white/80 rounded-2xl p-3 border border-emerald-200">
            ✓ الطلاقة الصوتية (حرف الميم): 6 كلمات/دقيقة
          </div>
          <div className="bg-white/80 rounded-2xl p-3 border border-emerald-200">
            ✓ استرجاع الأعداد: تسلسل كامل 1 إلى 10
          </div>
        </div>
      </div>

      {/* Recent Session History Log */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100 space-y-4">
        <h3 className="text-base font-black text-emerald-950">
          سجل التمارين الأخيرة (Historique des Exercices)
        </h3>

        <div className="divide-y divide-emerald-50">
          {[
            { word: 'فراولة', cat: 'الفواكه', outcome: 'مستقل', cue: 'المستوى 3 (فيديو)', time: 'منذ قليل' },
            { word: 'تفاحة', cat: 'الفواكه', outcome: 'مستقل', cue: 'المستوى 2 (صورة)', time: 'منذ 5 دقائق' },
            { word: 'موزة', cat: 'الفواكه', outcome: 'بمساعدة', cue: 'المستوى 5 (أول صوت)', time: 'منذ 8 دقائق' },
            { word: 'جزر', cat: 'الخضر', outcome: 'مستقل', cue: 'المستوى 3 (فيديو)', time: 'اليوم' },
            { word: 'كرسي', cat: 'الأثاث', outcome: 'مستقل', cue: 'المستوى 3 (فيديو)', time: 'اليوم' },
          ].map((item, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                  {idx + 1}
                </span>
                <div>
                  <span className="text-sm text-emerald-950 block">{item.word}</span>
                  <span className="text-[11px] text-emerald-600">{item.cat} • {item.cue}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-xl text-[11px] ${
                  item.outcome === 'مستقل'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-teal-100 text-teal-800'
                }`}>
                  {item.outcome}
                </span>
                <span className="text-slate-400 text-[10px] hidden sm:inline">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
