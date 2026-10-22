import React, { useState } from 'react';
import { PatientProfile, CueLevel } from '../types';
import { Stethoscope, User, Sliders, Volume2, ShieldCheck, Check, Sparkles, BookOpen } from 'lucide-react';

interface TherapistModalProps {
  profile: PatientProfile;
  onUpdateProfile: (updated: PatientProfile) => void;
  onClose?: () => void;
}

export const TherapistModal: React.FC<TherapistModalProps> = ({
  profile,
  onUpdateProfile,
  onClose,
}) => {
  const [name, setName] = useState(profile.name);
  const [caseType, setCaseType] = useState(profile.caseType);
  const [speechRate, setSpeechRate] = useState(profile.speechRate);
  const [defaultCueLevel, setDefaultCueLevel] = useState<CueLevel>(profile.defaultCueLevel);
  const [mirrorCameraEnabled, setMirrorCameraEnabled] = useState(profile.mirrorCameraEnabled);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    onUpdateProfile({
      ...profile,
      name,
      caseType,
      speechRate,
      defaultCueLevel,
      mirrorCameraEnabled,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      if (onClose) onClose();
    }, 1200);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pb-20">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-3xl shadow-inner text-emerald-800">
            <Stethoscope className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-emerald-950">إعدادات المعالج الأرثوفوني</h1>
            <p className="text-xs text-emerald-700 font-bold">
              تخصيص البروتوكول العلاجي لمرضى الحبسة الكلامية (Neurolinguistic Therapy Protocol)
            </p>
          </div>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-emerald-100 space-y-6">
        
        {/* Patient Profile Information */}
        <div className="space-y-4">
          <h2 className="text-base font-black text-emerald-950 flex items-center gap-2 border-b border-emerald-100 pb-2">
            <User className="w-5 h-5 text-emerald-600" />
            <span>بيانات المريض والتشخيص العصبي اللغوي</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-900 block">اسم أو رمز المريض:</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 bg-emerald-50/50 rounded-2xl border border-emerald-200 text-sm font-bold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-900 block">نوع الحبسة / الحالة السريرية:</label>
              <input
                type="text"
                value={caseType}
                onChange={e => setCaseType(e.target.value)}
                className="w-full px-4 py-3 bg-emerald-50/50 rounded-2xl border border-emerald-200 text-sm font-bold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* VAST Protocol Configuration */}
        <div className="space-y-4 pt-2">
          <h2 className="text-base font-black text-emerald-950 flex items-center gap-2 border-b border-emerald-100 pb-2">
            <Sliders className="w-5 h-5 text-emerald-600" />
            <span>إعدادات بروتوكول النطق المدعّم بالفيديو (VAST Settings)</span>
          </h2>

          {/* Default Starting Cue Level */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-emerald-900 block">
              مستوى الدعم التدريجي الافتراضي (Default Cues Level):
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { lvl: 1, name: '1. مستقل' },
                { lvl: 2, name: '2. صورة' },
                { lvl: 3, name: '3. فيديو' },
                { lvl: 4, name: '4. صوت' },
                { lvl: 5, name: '5. مقطع' },
                { lvl: 6, name: '6. كلمة' },
              ].map(c => (
                <button
                  key={c.lvl}
                  onClick={() => setDefaultCueLevel(c.lvl as CueLevel)}
                  className={`p-3 rounded-2xl text-xs font-bold transition flex flex-col items-center justify-center ${
                    defaultCueLevel === c.lvl
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                  }`}
                >
                  <span className="text-base font-black">{c.lvl}</span>
                  <span className="text-[10px] mt-0.5">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Speech Rate Control */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-900">
                سرعة النطق الصوتي للكلمات الهدف:
              </label>
              <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                {speechRate}x
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.0"
              step="0.05"
              value={speechRate}
              onChange={e => setSpeechRate(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 h-2 bg-emerald-100 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-bold text-emerald-600">
              <span>بطيء جداً (0.5x)</span>
              <span>موصى به للحبسة (0.75x)</span>
              <span>عادي (1.0x)</span>
            </div>
          </div>
        </div>

        {/* Master's Project Clinical Neurolinguistics Overview */}
        <div className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-200 space-y-2 text-xs text-emerald-900">
          <div className="flex items-center gap-2 font-black text-emerald-950 text-sm">
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <span>مشروع ماستر في اللسانيات العصبية السريرية (Master’s Project in Clinical Neurolinguistics)</span>
          </div>
          <p className="leading-relaxed font-medium">
            يعتمد هذا النموذج الأولي على تقنية **Video-Assisted Speech Therapy (VAST)** لإعادة بناء المسارات العصبية الحركية في باحة بروكا، عبر تفعيل نظام الخلايا العصبية المرآتية (Mirror Neuron System) من خلال المراقبة الدقيقة لحركات الشفاه والفم.
          </p>
        </div>

        {/* Save button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSave}
            className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black shadow-lg active:scale-95 transition flex items-center gap-2 text-sm"
          >
            {savedSuccess ? <Check className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            <span>{savedSuccess ? 'تم حفظ الإعدادات بنجاح!' : 'حفظ التعديلات السريرية'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
