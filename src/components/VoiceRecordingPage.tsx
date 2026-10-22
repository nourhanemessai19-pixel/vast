import React, { useState } from 'react';
import { Mic, MicOff, Volume2, Trash2, CheckCircle2, AlertCircle, RefreshCw, Lock } from 'lucide-react';
import { audioRecorderService, RecordingResult, AudioRecorderError } from '../services/audioRecorderService';
import { speechService } from '../services/speechSynthesisService';

interface SavedRecording {
  id: string;
  name: string;
  url: string;
  timestamp: string;
}

export const VoiceRecordingPage: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentRecordingUrl, setCurrentRecordingUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPermissionError, setIsPermissionError] = useState(false);
  const [savedRecordings, setSavedRecordings] = useState<SavedRecording[]>([
    {
      id: 'rec-1',
      name: 'محاولة نطق: فراولة',
      url: '',
      timestamp: 'اليوم، 10:30 صباحاً',
    },
  ]);
  const [targetWord, setTargetWord] = useState('فراولة');

  const handleToggleRecord = async () => {
    setErrorMessage(null);
    setIsPermissionError(false);

    if (isRecording) {
      try {
        const res: RecordingResult = await audioRecorderService.stopRecording();
        setIsRecording(false);
        setCurrentRecordingUrl(res.audioUrl);
      } catch (err) {
        setIsRecording(false);
        if (err instanceof AudioRecorderError) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage('تعذر إيقاف التسجيل الصوتي.');
        }
      }
    } else {
      try {
        setCurrentRecordingUrl(null);
        await audioRecorderService.startRecording();
        setIsRecording(true);
      } catch (err) {
        setIsRecording(false);
        if (err instanceof AudioRecorderError) {
          setErrorMessage(err.message);
          setIsPermissionError(err.code === 'PERMISSION_DENIED');
        } else {
          setErrorMessage('تعذر بدء التسجيل الصوتي. يرجى التأكد من توصيل الميكروفون ومنح الإذن.');
        }
      }
    }
  };

  const handleSaveCurrent = () => {
    if (!currentRecordingUrl) return;
    const newRec: SavedRecording = {
      id: `rec-${Date.now()}`,
      name: `تسجيل: ${targetWord}`,
      url: currentRecordingUrl,
      timestamp: 'الآن',
    };
    setSavedRecordings(prev => [newRec, ...prev]);
  };

  const handleDelete = (id: string) => {
    setSavedRecordings(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-3xl shadow-inner text-emerald-800">
            🎙️
          </div>
          <div>
            <h1 className="text-2xl font-black text-emerald-950">استوديو التسجيل والمقارنة الصوتية</h1>
            <p className="text-xs text-emerald-700 font-bold">
              تسجيل صوت المريض والمقارنة الذاتية مع النطق النموذجي (Auditory Feedback)
            </p>
          </div>
        </div>
      </div>

      {/* Main Recording Station */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-emerald-100 text-center space-y-6">
        {/* Target word selector */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-emerald-800">الكلمة المستهدفة للتسجيل:</span>
          <div className="flex flex-wrap justify-center gap-2">
            {['تشينة', 'بنان', 'فراولة', 'تفاحة', 'كرسي', 'سيارة', 'واحد', 'طماطم'].map(w => (
              <button
                key={w}
                onClick={() => setTargetWord(w)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  targetWord === w
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        {/* Big Word Card */}
        <div className="bg-emerald-50/70 rounded-3xl p-6 border border-emerald-200 flex flex-col items-center justify-center space-y-3">
          <h2 className="text-4xl sm:text-5xl font-black text-emerald-950">{targetWord}</h2>
          
          <button
            onClick={() => speechService.speak(targetWord, { rate: 0.75 })}
            className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-800 rounded-2xl font-bold border border-emerald-200 shadow-sm hover:bg-emerald-50 transition text-xs"
          >
            <Volume2 className="w-4 h-4 text-emerald-600" />
            <span>استمع للنموذج الصحيح أولاً</span>
          </button>
        </div>

        {/* Recording Button with Pulse Wave */}
        <div className="flex flex-col items-center justify-center py-4">
          <div className="relative">
            {isRecording && (
              <span className="absolute inset-0 rounded-full bg-rose-400 animate-ping opacity-75"></span>
            )}
            <button
              onClick={handleToggleRecord}
              className={`relative w-28 h-28 rounded-full flex flex-col items-center justify-center text-white font-black shadow-2xl transition-all duration-300 active:scale-95 cursor-pointer ${
                isRecording ? 'bg-rose-600 scale-110' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isRecording ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
              <span className="text-xs mt-1">{isRecording ? 'إيقاف' : 'اضغط للتسجيل'}</span>
            </button>
          </div>
          <p className="text-xs text-slate-500 font-bold mt-4">
            {isRecording ? 'جارٍ تسجيل صوتك... تحدث بوضوح' : 'اضغط الزر الأخضر وابدأ النطق'}
          </p>
        </div>

        {/* Error / Permission Guidance Banner */}
        {errorMessage && (
          <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 text-right space-y-2 animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 shrink-0 mt-0.5">
                {isPermissionError ? <Lock className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="text-sm font-black text-rose-950">
                  {isPermissionError ? 'إذن الميكروفون مطلوب للتسجيل' : 'تنبيه في التسجيل الصوتي'}
                </h4>
                <p className="text-xs font-bold text-rose-800 leading-relaxed">
                  {errorMessage}
                </p>
                {isPermissionError && (
                  <p className="text-[11px] font-medium text-rose-700 bg-rose-100/60 p-2.5 rounded-xl mt-2 border border-rose-200">
                    💡 <strong>كيفية تفعيل الميكروفون:</strong> انقر على أيقونة القفل أو الإعدادات 🔒 الموجودة بجانب رابط الموقع في شريط المتصفح، ثم اختر السماح للميكروفون (Allow Microphone)، أو افتح التطبيق في نافذة جديدة.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleToggleRecord}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إعادة المحاولة الآن</span>
              </button>
            </div>
          </div>
        )}

        {/* Current Recording Playback */}
        {currentRecordingUrl && (
          <div className="bg-emerald-100/60 border border-emerald-300 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              <span>تم تسجيل محاولتك بنجاح! استمع إليها:</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <audio src={currentRecordingUrl} controls className="h-9 flex-1" />
              <button
                onClick={handleSaveCurrent}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-sm transition whitespace-nowrap"
              >
                حفظ في السجل
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Saved Recordings List */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100 space-y-3">
        <h3 className="text-base font-black text-emerald-950">التسجيلات المحفوظة</h3>
        {savedRecordings.length === 0 ? (
          <p className="text-xs text-slate-400 font-medium">لا توجد تسجيلات سابقة</p>
        ) : (
          <div className="divide-y divide-emerald-50">
            {savedRecordings.map(r => (
              <div key={r.id} className="py-3 flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-emerald-950 block text-sm">{r.name}</span>
                    <span className="text-slate-400 text-[10px]">{r.timestamp}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {r.url && <audio src={r.url} controls className="h-7 w-36 sm:w-48" />}
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition rounded-lg"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
