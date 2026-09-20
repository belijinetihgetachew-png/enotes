import React, { useState } from 'react';
import {
  X,
  Lock,
  Unlock,
  CheckCircle2,
  Download,
  BookOpen,
  Video,
  FileText,
  BookMarked,
  BrainCircuit,
  GraduationCap,
  Bookmark,
  Share2,
  Clock,
  ShieldCheck,
  Sparkles,
  Play,
  ArrowRight,
} from 'lucide-react';
import { Material, StudentProfile, MaterialType } from '../types.ts';

interface MaterialDetailsModalProps {
  material: Material | null;
  student: StudentProfile | null;
  onClose: () => void;
  onSelectPayment: (material: Material) => void;
  onOpenNote: (material: Material) => void;
  onDownload: (material: Material) => void;
  onToggleSave?: (materialId: string) => void;
  isSaved?: boolean;
  isPendingPayment?: boolean;
  pendingTxNumber?: string;
}

const getTypeIcon = (type: MaterialType) => {
  switch (type) {
    case 'Notes':
      return <FileText className="w-4 h-4" />;
    case 'Worksheets':
      return <BookMarked className="w-4 h-4" />;
    case 'Videos':
      return <Video className="w-4 h-4" />;
    case 'Textbooks':
      return <BookOpen className="w-4 h-4" />;
    case 'Exercises':
      return <BrainCircuit className="w-4 h-4" />;
    case 'Exam Papers':
      return <GraduationCap className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

export const MaterialDetailsModal: React.FC<MaterialDetailsModalProps> = ({
  material,
  student,
  onClose,
  onSelectPayment,
  onOpenNote,
  onDownload,
  onToggleSave,
  isSaved,
  isPendingPayment,
  pendingTxNumber,
}) => {
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!material) return null;

  const isFree = material.price === 0;
  const isPurchased = material.isPurchased || isFree;
  const isVideo = material.type === 'Videos';

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `${material.title} (${material.grade} ${material.subject}) on eNotes: ${window.location.origin}`
      );
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-blue-600 text-white rounded-md tracking-wider">
              {material.grade}
            </span>
            <span className="text-xs font-semibold text-slate-300 truncate">
              {material.subject} • {material.unit}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onToggleSave && (
              <button
                onClick={() => onToggleSave(material.id)}
                className={`p-2 rounded-xl transition ${
                  isSaved ? 'text-amber-400 bg-amber-400/20' : 'text-slate-400 hover:bg-slate-800'
                }`}
                title="Save"
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            )}
            <button
              onClick={handleShare}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Thumbnail or Video Player Container */}
          <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900 border border-slate-200 shadow-xs">
            {isVideo && isPurchased && isPlayingVideo ? (
              <iframe
                src={material.videoUrl || 'https://www.youtube-nocookie.com/embed/1B6FmDqIq8g?autoplay=1'}
                title={material.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <>
                <img
                  src={
                    material.thumbnail ||
                    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=60'
                  }
                  alt={material.title}
                  className="w-full h-full object-cover brightness-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                {/* Overlaid Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-slate-900/80 backdrop-blur-md text-white rounded-lg border border-white/10">
                    {getTypeIcon(material.type)}
                    <span>{material.type}</span>
                  </span>
                </div>

                {/* Video Play Overlay */}
                {isVideo && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {isPurchased ? (
                      <button
                        onClick={() => setIsPlayingVideo(true)}
                        className="w-14 h-14 rounded-full bg-blue-600/90 hover:bg-blue-600 text-white flex items-center justify-center shadow-lg transition active:scale-95 group"
                      >
                        <Play className="w-6 h-6 fill-current ml-0.5 text-white" />
                      </button>
                    ) : (
                      <div className="p-3 bg-slate-900/90 backdrop-blur-md rounded-2xl text-center border border-white/10">
                        <Lock className="w-6 h-6 text-amber-400 mx-auto mb-1" />
                        <span className="text-[11px] font-bold text-white block">Video Locked</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom title inside thumbnail */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[11px] font-semibold text-blue-300 block">
                    {material.unit} {material.chapter && `• ${material.chapter}`}
                  </span>
                  <h3 className="font-extrabold text-base sm:text-lg leading-tight drop-shadow-xs">
                    {material.title}
                  </h3>
                </div>
              </>
            )}
          </div>

          {/* Status & Price Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                Access Status & Price
              </span>
              <div className="mt-0.5 flex items-center gap-2">
                {material.unlockedWithPoints ? (
                  <span className="px-2.5 py-1 text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 rounded-lg flex items-center gap-1.5 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>UNLOCKED WITH POINTS</span>
                  </span>
                ) : isFree ? (
                  <span className="px-2.5 py-1 text-xs font-black bg-emerald-100 text-emerald-800 rounded-lg flex items-center gap-1">
                    <span>🆓 FREE MATERIAL</span>
                  </span>
                ) : isPurchased ? (
                  <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-lg flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>PURCHASED & UNLOCKED</span>
                  </span>
                ) : (
                  <div className="flex items-baseline gap-1.5">
                    <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-100 text-amber-900 rounded-md flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-700" />
                      LOCKED
                    </span>
                    <span className="text-xl font-black text-slate-900">{material.price}</span>
                    <span className="text-xs font-extrabold text-blue-700">Birr</span>
                  </div>
                )}
              </div>
            </div>

            {/* Author / Size details */}
            <div className="text-right text-xs">
              <span className="text-slate-500 block">Curriculum Author</span>
              <span className="font-bold text-slate-800 truncate max-w-[140px] block">
                {material.authorName}
              </span>
              {material.fileSize && (
                <span className="text-[10px] text-slate-400 font-mono">{material.fileSize}</span>
              )}
            </div>
          </div>

          {/* Pending Payment Notification Banner (If student submitted Telebirr transaction) */}
          {isPendingPayment && !isPurchased && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-950">
                <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>Telebirr Payment Pending Verification</span>
              </div>
              <p className="text-[11px] text-amber-800">
                You submitted Telebirr transaction{' '}
                <span className="font-mono font-bold">{pendingTxNumber || 'under review'}</span>.
                Admin is verifying your payment. Your material will unlock automatically once approved!
              </p>
            </div>
          )}

          {/* Material Description & Objectives */}
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1.5">
              Description & Summary
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
              {material.description || material.previewText}
            </p>
          </div>

          {/* Curriculum Preview Snippet */}
          {material.previewText && (
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs text-blue-950">
              <div className="flex items-center gap-1.5 font-bold text-blue-900 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Curriculum Content Highlights</span>
              </div>
              <p className="text-[11px] text-blue-800/90 leading-relaxed">
                {material.previewText}
              </p>
            </div>
          )}

          {/* Official Telebirr Badge */}
          {!isPurchased && !isFree && (
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-600">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Official Telebirr Number: <strong className="text-slate-900 font-mono">0908170534</strong> (No CBE or other banks)</span>
            </div>
          )}
        </div>

        {/* Modal Action Buttons Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {/* If Paid & Not Purchased */}
            {!isPurchased && (
              <button
                onClick={() => {
                  onSelectPayment(material);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>SELECT • {material.price} Birr</span>
              </button>
            )}

            {/* If Free or Already Purchased */}
            {isPurchased && (
              <>
                {isVideo ? (
                  <button
                    onClick={() => {
                      setIsPlayingVideo(true);
                      // also optionally open NoteReaderModal if it contains reading notes
                      if (material.content) onOpenNote(material);
                    }}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-2"
                  >
                    <Video className="w-4 h-4" />
                    <span>WATCH VIDEO</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onOpenNote(material)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>OPEN NOTE</span>
                  </button>
                )}

                {/* Download PDF button (Requirement 11 & Material Details) */}
                <button
                  onClick={() => onDownload(material)}
                  className="px-3.5 py-2.5 bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                  title="Download PDF"
                >
                  <Download className="w-4 h-4" />
                  <span>DOWNLOAD PDF</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
