import React, { useState } from 'react';
import { Globe, UserCheck, Stethoscope, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentLang: 'ar' | 'fr';
  onToggleLang: () => void;
  onOpenTherapist: () => void;
  patientName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  onToggleLang,
  onOpenTherapist,
  patientName,
}) => {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-teal-100/80 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          
          {/* Logo + App Name */}
          <div className="flex items-center gap-3">
            {/* Glossy V logo combining deep medical blue and luminous emerald/cyan */}
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0B4F71] via-[#0D7C75] to-[#10B981] flex items-center justify-center text-white font-black text-xl shadow-md shadow-teal-700/20 border border-white/60 select-none glossy-sheen">
              <span className="drop-shadow-xs">V</span>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent via-white/10 to-white/30 pointer-events-none" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  فاست سبيتش
                </span>
                <span className="text-[10px] font-extrabold bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200/80 text-teal-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                  VAST
                </span>
              </div>
              <p className="text-[10px] text-teal-700 font-bold hidden sm:block">
                النطق المدعّم بالفيديو لحبسة بروكا
              </p>
            </div>
          </div>

          {/* Action Buttons: Language + Login */}
          <div className="flex items-center gap-2">
            {/* Language Toggle Button */}
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-teal-50/70 text-slate-700 hover:text-teal-900 text-xs font-bold transition border border-slate-200/80 hover:border-teal-200 shadow-2xs cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-teal-600" />
              <span>{currentLang === 'ar' ? 'Français' : 'العربية'}</span>
            </button>

            {/* Login / Patient Button */}
            <button
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#0B4F71] to-[#0D9488] hover:from-[#083A54] hover:to-[#0B7A70] text-white text-xs font-black shadow-md shadow-teal-900/15 transition active:scale-95 cursor-pointer glossy-sheen border border-white/20"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>دخول</span>
            </button>
          </div>
        </div>
      </header>

      {/* Simple Clean Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-teal-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0B4F71] to-[#0D9488] text-white flex items-center justify-center mx-auto text-2xl font-black shadow-md border border-white/40">
              V
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900">تسجيل دخول الجلسة</h3>
              <p className="text-xs text-teal-700 font-medium">
                تطبيق VAST المخصص لإعادة التأهيل العصبي واللغوي
              </p>
            </div>

            <div className="bg-gradient-to-br from-teal-50/70 to-cyan-50/50 rounded-2xl p-3 border border-teal-200/80 text-xs font-bold text-slate-800 space-y-1 shadow-2xs">
              <p>👤 المريض الحالي: <span className="font-black text-[#0B4F71]">{patientName}</span></p>
              <p>🩺 الحالة: حبسة بروكا الحركية (Broca's Aphasia)</p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  onOpenTherapist();
                }}
                className="w-full py-3 bg-gradient-to-r from-[#0B4F71] via-[#0D8279] to-[#0D9488] hover:opacity-95 text-white rounded-2xl font-bold text-xs shadow-md shadow-teal-900/20 transition flex items-center justify-center gap-2 cursor-pointer glossy-sheen border border-white/20"
              >
                <Stethoscope className="w-4 h-4" />
                <span>دخول كأخصائي معالج (Orthophoniste)</span>
              </button>

              <button
                onClick={() => setShowLoginModal(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs transition cursor-pointer"
              >
                متابعة كمريض
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
