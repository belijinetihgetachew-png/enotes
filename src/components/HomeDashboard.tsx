import React from 'react';
import {
  Sparkles,
  BookOpen,
  FileText,
  Video,
  BookMarked,
  BrainCircuit,
  GraduationCap,
  Search,
  Gift,
  User,
  Flame,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  UploadCloud,
  ChevronRight,
} from 'lucide-react';
import { Material, StudentProfile, MaterialType, GradeLevel } from '../types.ts';
import { MaterialCard } from './MaterialCard.tsx';
import { TabType } from './BottomNav.tsx';

interface HomeDashboardProps {
  student: StudentProfile | null;
  currentGrade: GradeLevel;
  materials: Material[];
  onSelectMaterial: (material: Material) => void;
  onOpenMaterial: (material: Material) => void;
  onDownloadMaterial: (material: Material) => void;
  onToggleSaveMaterial: (materialId: string) => void;
  onViewDetails?: (material: Material) => void;
  onNavigateTab: (tab: TabType) => void;
  onSelectCategory: (type: MaterialType) => void;
  onOpenUpload: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  student,
  currentGrade,
  materials,
  onSelectMaterial,
  onOpenMaterial,
  onDownloadMaterial,
  onToggleSaveMaterial,
  onViewDetails,
  onNavigateTab,
  onSelectCategory,
  onOpenUpload,
}) => {
  // Find the initial featured material: Grade 9 Mathematics Further on Sets
  const featuredInitialMaterial = materials.find(
    (m) => m.id === 'mat-sets-gr9-math' || m.title.includes('Further on Sets')
  );

  const gradeMaterials = materials.filter((m) => m.grade === currentGrade);

  const purchasedMaterials = materials.filter((m) => m.isPurchased && m.price > 0);
  const recentlyAdded = [...gradeMaterials].reverse().slice(0, 4);
  const popularMaterials = gradeMaterials.slice(0, 4);
  const recommendedMaterials = gradeMaterials.filter((m) => m.price === 0).concat(gradeMaterials.filter((m) => m.price > 0)).slice(0, 4);

  const quickSections = [
    { label: 'Notes', type: 'Notes' as MaterialType, icon: FileText, color: 'from-blue-600 to-indigo-600' },
    { label: 'Worksheets', type: 'Worksheets' as MaterialType, icon: BookMarked, color: 'from-sky-600 to-blue-700' },
    { label: 'Videos', type: 'Videos' as MaterialType, icon: Video, color: 'from-purple-600 to-indigo-700' },
    { label: 'Textbooks', type: 'Textbooks' as MaterialType, icon: BookOpen, color: 'from-emerald-600 to-teal-700' },
    { label: 'Exercises', type: 'Exercises' as MaterialType, icon: BrainCircuit, color: 'from-amber-600 to-orange-700' },
    { label: 'Exam Prep', type: 'Exam Papers' as MaterialType, icon: GraduationCap, color: 'from-rose-600 to-red-700' },
    { label: 'Search', action: () => onNavigateTab('search'), icon: Search, color: 'from-slate-700 to-slate-900' },
    { label: 'Rewards', action: () => onNavigateTab('rewards'), icon: Gift, color: 'from-yellow-500 to-amber-600' },
    { label: 'Profile', action: () => onNavigateTab('profile'), icon: User, color: 'from-blue-800 to-blue-950' },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* 👋 Welcome Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white rounded-3xl p-5 sm:p-6 shadow-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold text-blue-100 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Ethiopian National Curriculum Platform</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
              👋 Welcome, {student?.fullName ? student.fullName.split(' ')[0] : 'Student'}!
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-md">
              Ready to excel in your {currentGrade} studies? Access verified short notes, chapter
              summaries, and entrance exam questions.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/10 shrink-0">
            <div className="text-center">
              <span className="text-[10px] text-blue-200 block uppercase font-bold">My Points</span>
              <span className="text-lg font-black text-amber-300 flex items-center justify-center gap-1">
                ⭐ {student?.points ?? 120}
              </span>
            </div>
            <div className="w-px h-8 bg-white/20 mx-1" />
            <button
              onClick={() => onNavigateTab('rewards')}
              className="px-2.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition active:scale-95"
            >
              Redeem
            </button>
          </div>
        </div>
      </div>

      {/* Quick Sections 9-Grid (Requirement 3) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <span>Quick Sections</span>
          </h2>
          <span className="text-xs text-slate-500 font-semibold">{currentGrade}</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2 sm:gap-2.5">
          {quickSections.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  if (item.action) item.action();
                  else if (item.type) onSelectCategory(item.type);
                }}
                className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-300 active:scale-95 transition group text-center"
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center shadow-xs mb-1.5 group-hover:scale-105 transition`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 tracking-tight leading-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured Initial Material Banner (Requirement 19: Grade 9 Math Unit 1 Sets) */}
      {featuredInitialMaterial && (
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-800 via-indigo-800 to-blue-900 rounded-3xl p-5 text-white shadow-md border border-blue-700/50">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase bg-blue-500 text-white rounded-md tracking-wider">
                  HOT MATERIAL
                </span>
                <span className="text-xs font-bold text-blue-200">
                  {featuredInitialMaterial.grade} • {featuredInitialMaterial.subject}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
                {featuredInitialMaterial.title}
              </h3>
              <p className="text-xs text-blue-100 mt-1.5 line-clamp-2 max-w-xl leading-relaxed">
                {featuredInitialMaterial.description}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-blue-200">
                <span>Unit 1: Further on Sets</span>
                <span>•</span>
                <span>De Morgan's Laws & Cartesian Product</span>
                <span>•</span>
                <span className="font-bold text-amber-300">
                  {featuredInitialMaterial.price} Birr
                </span>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              {featuredInitialMaterial.isPurchased ? (
                <>
                  <button
                    onClick={() => onOpenMaterial(featuredInitialMaterial)}
                    className="px-5 py-3 bg-white hover:bg-blue-50 text-blue-900 font-extrabold text-xs rounded-2xl shadow-lg transition active:scale-95 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>OPEN NOTE</span>
                  </button>
                  <button
                    onClick={() => onDownloadMaterial(featuredInitialMaterial)}
                    className="p-3 bg-blue-700/80 hover:bg-blue-600 text-white rounded-2xl transition"
                    title="Download note"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => onSelectMaterial(featuredInitialMaterial)}
                  className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/20 transition active:scale-95 flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>SELECT • 10 Birr</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* My Purchased Materials (Requirement 3 & 10) */}
      {purchasedMaterials.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>My Purchased Materials</span>
            </h2>
            <button
              onClick={() => onNavigateTab('profile')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {purchasedMaterials.map((mat) => (
              <MaterialCard
                key={mat.id}
                material={mat}
                onSelect={onSelectMaterial}
                onOpen={onOpenMaterial}
                onDownload={onDownloadMaterial}
                onToggleSave={onToggleSaveMaterial}
                isSaved={mat.isSaved}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recently Added Materials */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Recently Added Materials</span>
          </h2>
          <button
            onClick={() => onNavigateTab('curriculum')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
          >
            <span>See Curriculum</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {recentlyAdded.map((mat) => (
            <MaterialCard
              key={mat.id}
              material={mat}
              onSelect={onSelectMaterial}
              onOpen={onOpenMaterial}
              onDownload={onDownloadMaterial}
              onToggleSave={onToggleSaveMaterial}
              isSaved={mat.isSaved}
            />
          ))}
        </div>
      </div>

      {/* Popular Materials */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>Popular Materials</span>
          </h2>
          <span className="text-xs text-slate-500 font-semibold">{currentGrade} Top Picks</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {popularMaterials.map((mat) => (
            <MaterialCard
              key={mat.id}
              material={mat}
              onSelect={onSelectMaterial}
              onOpen={onOpenMaterial}
              onDownload={onDownloadMaterial}
              onToggleSave={onToggleSaveMaterial}
              onViewDetails={onViewDetails}
              isSaved={mat.isSaved}
            />
          ))}
        </div>
      </div>

      {/* Recommended Materials */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Recommended For You</span>
          </h2>
          <span className="text-xs text-slate-500 font-semibold">Free & Top Rated</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {recommendedMaterials.map((mat) => (
            <MaterialCard
              key={mat.id}
              material={mat}
              onSelect={onSelectMaterial}
              onOpen={onOpenMaterial}
              onDownload={onDownloadMaterial}
              onToggleSave={onToggleSaveMaterial}
              onViewDetails={onViewDetails}
              isSaved={mat.isSaved}
            />
          ))}
        </div>
      </div>

      {/* Student Upload Marketplace Banner (Requirement 17) */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
              Contribute & Earn Points! 🌟
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Have quality Grade 9–12 worksheets or summary notes? Submit your material. When
              approved by admin, you earn 50 reward points!
            </p>
          </div>
        </div>
        <button
          onClick={onOpenUpload}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 shrink-0"
        >
          Submit Material
        </button>
      </div>
    </div>
  );
};
