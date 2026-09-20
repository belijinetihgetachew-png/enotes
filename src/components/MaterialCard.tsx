import React from 'react';
import {
  Lock,
  Unlock,
  CheckCircle2,
  FileText,
  Video,
  BookMarked,
  BrainCircuit,
  GraduationCap,
  Download,
  Bookmark,
  Sparkles,
} from 'lucide-react';
import { Material, MaterialType } from '../types.ts';

interface MaterialCardProps {
  material: Material;
  onSelect: (material: Material) => void;
  onOpen: (material: Material) => void;
  onDownload: (material: Material) => void;
  onToggleSave?: (materialId: string) => void;
  onViewDetails?: (material: Material) => void;
  isSaved?: boolean;
}

const getTypeIcon = (type: MaterialType) => {
  switch (type) {
    case 'Notes':
      return <FileText className="w-3.5 h-3.5" />;
    case 'Worksheets':
      return <BookMarked className="w-3.5 h-3.5" />;
    case 'Videos':
      return <Video className="w-3.5 h-3.5" />;
    case 'Textbooks':
      return <BookMarked className="w-3.5 h-3.5" />;
    case 'Exercises':
      return <BrainCircuit className="w-3.5 h-3.5" />;
    case 'Exam Papers':
      return <GraduationCap className="w-3.5 h-3.5" />;
    default:
      return <FileText className="w-3.5 h-3.5" />;
  }
};

export const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  onSelect,
  onOpen,
  onDownload,
  onToggleSave,
  onViewDetails,
  isSaved,
}) => {
  const isFree = material.price === 0;
  const isPurchased = material.isPurchased || isFree;

  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails(material);
    } else if (isPurchased) {
      onOpen(material);
    } else {
      onSelect(material);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
      {/* Card Header with Badges */}
      <div onClick={handleCardClick} className="p-4 pb-2 cursor-pointer">
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-200/80 rounded-lg">
              {material.grade}
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded-lg">
              {material.subject}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded-lg">
              {getTypeIcon(material.type)}
              <span>{material.type}</span>
            </span>
          </div>

          {onToggleSave && (
            <button
              onClick={() => onToggleSave(material.id)}
              className={`p-1.5 rounded-xl transition ${
                isSaved
                  ? 'text-amber-500 bg-amber-50'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
              title="Save to favorites"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* Title and Unit */}
        <div className="text-[11px] font-semibold text-blue-600 mb-0.5">
          {material.unit} {material.chapter && `• ${material.chapter}`}
        </div>
        <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-700 transition line-clamp-2">
          {material.title}
        </h3>

        {/* Short Description */}
        <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
          {material.description || material.previewText}
        </p>

        {/* Creator badge */}
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <span className="truncate max-w-[170px]">By {material.authorName}</span>
          {material.fileSize && (
            <span className="text-slate-400 font-mono text-[10px]">{material.fileSize}</span>
          )}
        </div>
      </div>

      {/* Card Footer: Price & Action Buttons */}
      <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
        {/* Price display */}
        <div>
          {material.unlockedWithPoints ? (
            <div className="flex items-center gap-1">
              <span className="px-2 py-0.5 text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300 rounded-lg flex items-center gap-1 shadow-xs">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Unlocked with Points</span>
              </span>
            </div>
          ) : isFree ? (
            <div className="flex items-center gap-1">
              <span className="px-2 py-0.5 text-xs font-black bg-emerald-100 text-emerald-800 rounded-lg">
                FREE 🆓
              </span>
            </div>
          ) : isPurchased ? (
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
              <span>PURCHASED</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-slate-900">{material.price}</span>
              <span className="text-xs font-extrabold text-blue-700">Birr</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-1.5">
          {isPurchased ? (
            <>
              <button
                onClick={() => onOpen(material)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>OPEN NOTE</span>
              </button>
              <button
                onClick={() => onDownload(material)}
                className="p-2 bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-800 rounded-xl transition"
                title="Download study file"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => onSelect(material)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white text-xs font-extrabold rounded-xl shadow-xs shadow-blue-500/20 transition flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>SELECT</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
