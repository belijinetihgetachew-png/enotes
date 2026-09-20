import React, { useState } from 'react';
import {
  GraduationCap,
  ChevronRight,
  BookOpen,
  Filter,
  Calculator,
  Atom,
  Dna,
  FlaskConical,
  TrendingUp,
  Landmark,
  HeartPulse,
  Languages,
  Laptop,
  BookA,
  Scroll,
  Globe,
  ArrowLeft,
} from 'lucide-react';
import { GradeLevel, SubjectName, Material, MaterialType } from '../types.ts';
import { MaterialCard } from './MaterialCard.tsx';

interface CurriculumViewProps {
  currentGrade: GradeLevel;
  onGradeChange: (grade: GradeLevel) => void;
  materials: Material[];
  onSelectMaterial: (material: Material) => void;
  onOpenMaterial: (material: Material) => void;
  onDownloadMaterial: (material: Material) => void;
  onToggleSaveMaterial: (materialId: string) => void;
  onViewDetails?: (material: Material) => void;
  selectedCategoryFilter?: MaterialType | null;
  onClearCategoryFilter?: () => void;
}

const SUBJECT_CONFIG: { name: SubjectName; icon: any; color: string; bg: string }[] = [
  { name: 'Mathematics', icon: Calculator, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  { name: 'Physics', icon: Atom, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
  { name: 'Biology', icon: Dna, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  { name: 'Chemistry', icon: FlaskConical, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  { name: 'Economics', icon: TrendingUp, color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-200' },
  { name: 'Citizenship', icon: Landmark, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  { name: 'HPE', icon: HeartPulse, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
  { name: 'Amharic', icon: Languages, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  { name: 'IT', icon: Laptop, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200' },
  { name: 'English', icon: BookA, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200' },
  { name: 'History', icon: Scroll, color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
  { name: 'Geography', icon: Globe, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
];

export const CurriculumView: React.FC<CurriculumViewProps> = ({
  currentGrade,
  onGradeChange,
  materials,
  onSelectMaterial,
  onOpenMaterial,
  onDownloadMaterial,
  onToggleSaveMaterial,
  onViewDetails,
  selectedCategoryFilter,
  onClearCategoryFilter,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectName | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<MaterialType | 'ALL'>(
    selectedCategoryFilter || 'ALL'
  );

  const grades: GradeLevel[] = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

  // Filter materials based on current selections
  const filteredMaterials = materials.filter((m) => {
    if (m.grade !== currentGrade) return false;
    if (selectedSubject && m.subject !== selectedSubject) return false;
    if (selectedUnit && m.unit !== selectedUnit) return false;
    if (activeType !== 'ALL' && m.type !== activeType) return false;
    return true;
  });

  // Extract units for selected subject
  const availableUnits = Array.from(
    new Set(
      materials
        .filter((m) => m.grade === currentGrade && (!selectedSubject || m.subject === selectedSubject))
        .map((m) => m.unit)
    )
  );

  return (
    <div className="space-y-5 pb-20">
      {/* Grade Selector Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between gap-1">
        {grades.map((grade) => (
          <button
            key={grade}
            onClick={() => {
              onGradeChange(grade);
              setSelectedUnit(null);
            }}
            className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition active:scale-95 ${
              currentGrade === grade
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {grade}
          </button>
        ))}
      </div>

      {/* Breadcrumb Navigation Flow: Grade -> Subject -> Unit -> Material */}
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 overflow-x-auto py-1">
        <button
          onClick={() => {
            setSelectedSubject(null);
            setSelectedUnit(null);
          }}
          className="hover:text-blue-600 transition flex items-center gap-1 shrink-0"
        >
          <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
          <span>{currentGrade}</span>
        </button>

        {selectedSubject && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <button
              onClick={() => setSelectedUnit(null)}
              className="text-blue-600 hover:underline shrink-0"
            >
              {selectedSubject}
            </button>
          </>
        )}

        {selectedUnit && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <span className="text-slate-900 shrink-0 font-extrabold">{selectedUnit}</span>
          </>
        )}
      </div>

      {/* Step 1: If No Subject Selected -> Show 12 Ethiopian Subjects Grid */}
      {!selectedSubject ? (
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Select Subject ({currentGrade})
            </h3>
            <span className="text-xs text-slate-500 font-semibold">12 Subjects Available</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {SUBJECT_CONFIG.map((subj) => {
              const Icon = subj.icon;
              const count = materials.filter(
                (m) => m.grade === currentGrade && m.subject === subj.name
              ).length;

              return (
                <button
                  key={subj.name}
                  onClick={() => {
                    setSelectedSubject(subj.name);
                    setSelectedUnit(null);
                  }}
                  className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-400 active:scale-95 transition text-left group flex flex-col justify-between h-32"
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${subj.bg} border flex items-center justify-center ${subj.color} group-hover:scale-110 transition`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition">
                      {subj.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {count} {count === 1 ? 'material' : 'materials'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Step 2: Subject Selected -> Show Units and Materials */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setSelectedSubject(null);
                setSelectedUnit(null);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Subjects</span>
            </button>

            <div className="text-xs text-slate-500 font-semibold">
              Showing {filteredMaterials.length} results
            </div>
          </div>

          {/* Unit / Chapter Filter Pills */}
          {availableUnits.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setSelectedUnit(null)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition active:scale-95 ${
                  selectedUnit === null
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Units
              </button>
              {availableUnits.map((u) => (
                <button
                  key={u}
                  onClick={() => setSelectedUnit(u)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition active:scale-95 ${
                    selectedUnit === u
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          )}

          {/* Type Filter Pills (Notes, Worksheets, etc.) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {(['ALL', 'Notes', 'Worksheets', 'Videos', 'Textbooks', 'Exercises', 'Exam Papers'] as const).map(
              (type) => (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg whitespace-nowrap transition ${
                    activeType === type
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {type === 'ALL' ? 'All Types' : type}
                </button>
              )
            )}
          </div>

          {/* Materials Grid */}
          {filteredMaterials.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="font-bold text-sm text-slate-800">No materials found</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No materials currently match this filter. Try selecting "All Units" or "All Types".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMaterials.map((mat) => (
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
          )}
        </div>
      )}
    </div>
  );
};
