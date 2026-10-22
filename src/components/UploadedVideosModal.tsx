import React, { useState, useEffect, useRef } from 'react';
import { customVideoService, VideoInfo, extractYouTubeId } from '../services/customVideoService';
import { CategoryItem } from '../types';
import { 
  X, Video, Play, Pause, Trash2, CheckCircle2, Upload, Sparkles, 
  Download, ArrowRightLeft, Laptop, Smartphone, AlertCircle, Info, RefreshCw,
  Link2, ExternalLink
} from 'lucide-react';

interface UploadedVideosModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentItem: CategoryItem;
  onVideoAssigned: (url: string) => void;
}

export const UploadedVideosModal: React.FC<UploadedVideosModalProps> = ({
  isOpen,
  onClose,
  currentItem,
  onVideoAssigned,
}) => {
  const [videos, setVideos] = useState<VideoInfo[]>([]);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showSyncInfo, setShowSyncInfo] = useState(false);
  const [youtubeInputUrl, setYoutubeInputUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const refreshVideos = async () => {
    const list = await customVideoService.getAllStoredVideos();
    setVideos(list);
  };

  useEffect(() => {
    if (isOpen) {
      refreshVideos();
    }
  }, [isOpen]);

  useEffect(() => {
    const unsub = customVideoService.subscribe(() => {
      refreshVideos();
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const currentDisplayName = currentItem.dialectNameAr || currentItem.nameAr;

  const handleTogglePlay = (video: VideoInfo) => {
    const vidEl = videoRefs.current[video.itemId];
    if (!vidEl) return;

    if (playingVideoId === video.itemId) {
      vidEl.pause();
      setPlayingVideoId(null);
    } else {
      // Pause others
      (Object.values(videoRefs.current) as (HTMLVideoElement | null)[]).forEach((el) => {
        if (el && el !== vidEl) el.pause();
      });
      vidEl.currentTime = 0;
      vidEl.muted = false;
      vidEl.volume = 1.0;
      vidEl.play().catch(() => {});
      setPlayingVideoId(video.itemId);
    }
  };

  const handleAssign = async (video: VideoInfo) => {
    try {
      const newUrl = await customVideoService.assignExistingVideo(video.itemId, currentItem.id);
      if (newUrl) {
        setAssignSuccess(`تم ربط الفيديو بنجاح مع ${currentDisplayName}!`);
        onVideoAssigned(newUrl);
        setTimeout(() => {
          setAssignSuccess(null);
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to assign video:', err);
    }
  };

  const handleExportBackup = async () => {
    try {
      setIsExporting(true);
      const res = await customVideoService.exportBackup();
      setStatusMessage({
        type: 'success',
        text: `تم تصدير ملف النسخة الاحتياطية بنجاح (${res.count} فيديو). يمكنك الآن نقله إلى حاسوبك واستيراده هناك!`,
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'فشل تصدير الفيديوهات',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsImporting(true);
      const count = await customVideoService.importBackup(file);
      await refreshVideos();
      setStatusMessage({
        type: 'success',
        text: `تم استيراد ${count} فيديو بنجاح! أصبحت الآن تعمل على هذا الجهاز.`,
      });
      // Auto-assign to current item if available
      const itemUrl = await customVideoService.getVideoUrl(currentItem.id);
      if (itemUrl) {
        onVideoAssigned(itemUrl);
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'فشل استيراد ملف النسخة الاحتياطية',
      });
    } finally {
      setIsImporting(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleDelete = async (itemId: string) => {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا الفيديو؟')) {
      await customVideoService.deleteVideo(itemId);
      refreshVideos();
    }
  };

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await customVideoService.saveVideo(currentItem.id, file, file.name);
      onVideoAssigned(url);
      setAssignSuccess(`تم رفع الفيديو بنجاح لـ ${currentDisplayName}!`);
      setTimeout(() => {
        setAssignSuccess(null);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleAddYouTubeLink = async () => {
    const raw = youtubeInputUrl.trim();
    if (!raw) return;
    const ytId = extractYouTubeId(raw);
    if (!ytId) {
      setStatusMessage({
        type: 'error',
        text: 'رابط اليوتيوب غير صالح. يرجى إدخال رابط فيديو يوتيوب صحيح (مثل: https://youtu.be/OpYuVmoBb3Y)',
      });
      return;
    }
    const cleanEmbedUrl = `https://www.youtube.com/embed/${ytId}`;
    customVideoService.saveYouTubeUrl(currentItem.id, cleanEmbedUrl);
    onVideoAssigned(cleanEmbedUrl);
    setAssignSuccess(`تم ربط فيديو يوتيوب بنجاح مع ${currentDisplayName}!`);
    setYoutubeInputUrl('');
    await refreshVideos();
    setTimeout(() => {
      setAssignSuccess(null);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-teal-100 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-50/70 to-cyan-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                فيديوهاتك المرفوعة والمربوطة
              </h3>
              <p className="text-xs text-teal-800 font-bold">
                ربط، استعراض ونقل فيديوهات نطق الكلمات بين أجهزتك أو عبر يوتيوب
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current target item info */}
        <div className="bg-teal-50/50 px-5 py-3 border-b border-teal-100 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700">
            العنصر المستهدف للربط حالياً:
          </span>
          <span className="font-black text-teal-900 bg-teal-100 px-3 py-1 rounded-full border border-teal-200">
            {currentDisplayName}
          </span>
        </div>

        {/* Direct YouTube Link Integration Box */}
        <div className="bg-gradient-to-r from-red-50/70 via-rose-50/40 to-slate-50 border-b border-red-100 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
              <span className="w-5 h-5 rounded-md bg-red-600 text-white flex items-center justify-center text-[10px] font-black">▶</span>
              <span>ربط فيديو يوتيوب (YouTube) مباشرة:</span>
            </div>
            <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold">
              يعمل على جميع الأجهزة فوراً
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="url"
              value={youtubeInputUrl}
              onChange={(e) => setYoutubeInputUrl(e.target.value)}
              placeholder="الصق رابط فيديو اليوتيوب هنا (مثل: https://youtu.be/...)"
              dir="ltr"
              className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none font-mono"
            />
            <button
              onClick={handleAddYouTubeLink}
              disabled={!youtubeInputUrl.trim()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>ربط بـ ({currentDisplayName})</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-500">
            فيديوهات اليوتيوب تعمل تلقائياً على الحاسوب والهاتف معاً ولا تتطلب نقلاً محلياً.
          </p>
        </div>

        {/* Cross-device transfer info box */}
        <div className="bg-amber-50/80 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-900 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-amber-700 shrink-0" />
              <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600" />
              <Laptop className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="font-bold">
                نقل الفيديوهات بين هاتفك وحاسوبك:
              </span>
            </div>
            <button
              onClick={() => setShowSyncInfo(!showSyncInfo)}
              className="text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer"
            >
              {showSyncInfo ? 'إخفاء الشرح' : 'لماذا لا تظهر تلقائياً؟'}
            </button>
          </div>

          {showSyncInfo && (
            <div className="bg-white/80 p-3 rounded-xl border border-amber-200 space-y-1.5 text-[11px] leading-relaxed text-amber-950">
              <p className="font-bold text-amber-900 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-700" />
                لماذا لا تنتقل الفيديوهات من الهاتف للحاسوب فوراً؟
              </p>
              <p>
                تُحفظ الفيديوهات محلياً في ذاكرة متصفح جهازك الحالي لضمان أعلى خصوصية وسرعة بدون استهلاك باقة الإنترنت. المتصفحات تحمي بيانات كل جهاز على حدة.
              </p>
              <p className="font-semibold text-teal-800">
                ✨ للحل السريع: يمكنك الضغط على «تصدير حزمة الفيديوهات» من الهاتف وإرسال الملف لحاسوبك ثم الضغط على «استيراد»، أو رفع الفيديو مباشرة من حاسوبك!
              </p>
            </div>
          )}

          {/* Transfer buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleExportBackup}
              disabled={isExporting || videos.length === 0}
              className="flex-1 py-1.5 px-2.5 bg-white hover:bg-amber-100 disabled:opacity-50 border border-amber-300 text-amber-900 rounded-lg font-bold text-[11px] transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-700" />
              <span>{isExporting ? 'جاري التصدير...' : 'تصدير نسخة الفيديوهات من هذا الجهاز'}</span>
            </button>

            <button
              onClick={() => backupInputRef.current?.click()}
              disabled={isImporting}
              className="flex-1 py-1.5 px-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg font-bold text-[11px] transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isImporting ? 'جاري الاستيراد...' : 'استيراد فيديوهات من جهاز آخر'}</span>
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        {assignSuccess && (
          <div className="m-3 bg-emerald-50 border border-emerald-300 text-emerald-900 p-2.5 rounded-2xl flex items-center gap-2 text-xs font-black animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{assignSuccess}</span>
          </div>
        )}

        {statusMessage && (
          <div className={`m-3 p-2.5 rounded-2xl flex items-center justify-between gap-2 text-xs font-bold animate-in fade-in ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-50 border border-emerald-300 text-emerald-900' 
              : 'bg-rose-50 border border-rose-300 text-rose-900'
          }`}>
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Content list */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {videos.length === 0 ? (
            <div className="py-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Video className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="font-black text-slate-800 text-base">
                  لم يتم العثور على فيديوهات محفوظة في هذا المتصفح
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  إذا رفعت الفيديو من هاتفك، يمكنك إما رفعه هنا مباشرة، أو الضغط على «استيراد فيديوهات من جهاز آخر» إذا قمت بتصدير النسخة الاحتياطية من هاتفك.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-sm transition shadow-md inline-flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>رفع فيديو ({currentDisplayName}) الآن</span>
                </button>

                <button
                  onClick={() => backupInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs transition inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-amber-700" />
                  <span>استيراد ملف من الهاتف</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600 font-bold px-1">
                <span>الفيديوهات المتوفرة في جهازك ({videos.length}):</span>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-teal-700 hover:text-teal-900 font-black flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>+ رفع فيديو إضافي</span>
                </button>
              </div>

              {videos.map((vid) => {
                const isPlaying = playingVideoId === vid.itemId;
                const isCurrentLinked = vid.itemId === currentItem.id;
                const ytId = extractYouTubeId(vid.url);

                return (
                  <div
                    key={vid.itemId}
                    className={`p-3.5 rounded-2xl border-2 transition flex flex-col sm:flex-row items-center gap-3.5 ${
                      isCurrentLinked
                        ? 'bg-emerald-50/60 border-emerald-400 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-teal-300'
                    }`}
                  >
                    {/* Video player box */}
                    {ytId ? (
                      <div className="w-full sm:w-36 aspect-video rounded-xl bg-black overflow-hidden relative flex items-center justify-center shrink-0 shadow-inner group">
                        <img
                          src={`https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`}
                          alt={vid.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center transition">
                          <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow">
                            <Play className="w-4 h-4 fill-current translate-x-[-1px]" />
                          </div>
                        </div>
                        <span className="absolute bottom-1 right-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs">
                          YouTube
                        </span>
                      </div>
                    ) : (
                      <div 
                        onClick={() => handleTogglePlay(vid)}
                        className="w-full sm:w-36 aspect-video rounded-xl bg-black overflow-hidden relative flex items-center justify-center shrink-0 cursor-pointer shadow-inner group"
                      >
                        <video
                          ref={(el) => (videoRefs.current[vid.itemId] = el)}
                          src={vid.url}
                          playsInline
                          onEnded={() => setPlayingVideoId(null)}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/25 group-hover:bg-black/40 flex items-center justify-center transition">
                          <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center shadow">
                            {isPlaying ? (
                              <Pause className="w-4 h-4 fill-current" />
                            ) : (
                              <Play className="w-4 h-4 fill-current translate-x-[-1px]" />
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Info and Actions */}
                    <div className="flex-1 w-full space-y-2 text-right">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-sm font-black text-slate-900 block">
                            {vid.name}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            المعرف: {vid.itemId} • {ytId ? 'رابط يوتيوب سحابي' : `${(vid.size / (1024 * 1024)).toFixed(1)} MB`}
                          </span>
                        </div>

                        {isCurrentLinked && (
                          <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 shadow-2xs">
                            <CheckCircle2 className="w-3 h-3" />
                            مرتبط حالياً
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleAssign(vid)}
                          className="flex-1 py-2 px-3 bg-gradient-to-r from-[#0B4F71] to-[#0D9488] hover:from-[#083A54] hover:to-[#0B7A70] text-white rounded-xl text-xs font-black shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>تفعيل هذا الفيديو مع ({currentDisplayName})</span>
                        </button>

                        <button
                          onClick={() => handleDelete(vid.itemId)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                          title="حذف الفيديو"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Hidden video file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
          onChange={handleDirectUpload}
          className="hidden"
        />

        {/* Hidden backup JSON file input */}
        <input
          ref={backupInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImportBackup}
          className="hidden"
        />

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-white hover:bg-teal-50 border border-teal-200 text-teal-900 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-teal-700" />
              <span>رفع ملف فيديو</span>
            </button>
            <button
              onClick={refreshVideos}
              className="p-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
              title="تحديث القائمة"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};

