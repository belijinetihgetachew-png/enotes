import React, { useState } from 'react';
import {
  X,
  Download,
  BookOpen,
  Share2,
  CheckCircle2,
  Bookmark,
  Printer,
  FileCheck,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { Material, StudentProfile } from '../types.ts';

interface NoteReaderModalProps {
  material: Material | null;
  student: StudentProfile | null;
  onClose: () => void;
  onDownload: (material: Material) => void;
  onToggleSave?: (materialId: string) => void;
  isSaved?: boolean;
}

export const NoteReaderModal: React.FC<NoteReaderModalProps> = ({
  material,
  student,
  onClose,
  onDownload,
  onToggleSave,
  isSaved,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');

  if (!material) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[94vh]">
        {/* Top Header Bar */}
        <div className="bg-slate-900 text-white p-3.5 sm:px-6 flex items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 text-[10px] font-black bg-blue-500/30 text-blue-300 rounded-md">
                  {material.grade}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold truncate">
                  {material.subject} • {material.unit}
                </span>
              </div>
              <h2 className="font-extrabold text-sm sm:text-base text-white truncate">
                {material.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Font size toggle */}
            <button
              onClick={() => setFontSize(fontSize === 'normal' ? 'large' : 'normal')}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition"
              title="Toggle font size"
            >
              {fontSize === 'normal' ? 'A+' : 'A-'}
            </button>

            {/* Favorite */}
            {onToggleSave && (
              <button
                onClick={() => onToggleSave(material.id)}
                className={`p-2 rounded-xl transition ${
                  isSaved ? 'text-amber-400 bg-amber-400/20' : 'text-slate-300 hover:bg-slate-800'
                }`}
                title="Save"
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            )}

            {/* Download */}
            <button
              onClick={() => onDownload(material)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">DOWNLOAD PDF</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Reader Meta Banner */}
        <div className="bg-blue-50/80 px-4 py-2 border-b border-blue-100/80 flex flex-wrap items-center justify-between text-xs text-blue-900 gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-bold">
              {material.price === 0 ? 'Free Curriculum Material' : 'Verified Purchased Content'}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">By {material.authorName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-mono">
              Student: {student?.fullName || 'Active Student'}
            </span>
          </div>
        </div>

        {/* Reader Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-8">
            {material.videoUrl && (
              <div className="mb-6 rounded-2xl overflow-hidden aspect-video bg-black shadow-md border border-slate-200">
                <iframe
                  src={material.videoUrl}
                  title={material.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            <article
              className={`prose prose-slate max-w-none ${
                fontSize === 'large' ? 'text-base leading-relaxed' : 'text-sm leading-relaxed'
              }`}
            >
              {/* Formatted study rendering */}
              <div className="space-y-4 text-slate-800 whitespace-pre-wrap font-sans">
                {material.content || (
                  <div className="text-center py-12 text-slate-400">
                    <p className="font-semibold">Loading material content...</p>
                  </div>
                )}
              </div>
            </article>

            {/* Bottom Actions inside note */}
            <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <FileCheck className="w-4 h-4 text-blue-600" />
                <span>eNotes Curriculum Standard • Ministry of Education Aligned</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => onDownload(material)}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Study File (PDF)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
