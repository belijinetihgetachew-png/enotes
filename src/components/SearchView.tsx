import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen, Filter, ArrowRight } from 'lucide-react';
import { Material, GradeLevel, MaterialType } from '../types.ts';
import { MaterialCard } from './MaterialCard.tsx';

interface SearchViewProps {
  onSelectMaterial: (material: Material) => void;
  onOpenMaterial: (material: Material) => void;
  onDownloadMaterial: (material: Material) => void;
  onToggleSaveMaterial: (materialId: string) => void;
  onViewDetails?: (material: Material) => void;
  allMaterials: Material[];
}

export const SearchView: React.FC<SearchViewProps> = ({
  onSelectMaterial,
  onOpenMaterial,
  onDownloadMaterial,
  onToggleSaveMaterial,
  onViewDetails,
  allMaterials,
}) => {
  const [query, setQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  // Perform client & real-time search
  const filteredResults = allMaterials.filter((m) => {
    if (selectedGrade !== 'ALL' && m.grade !== selectedGrade) return false;
    if (selectedType !== 'ALL' && m.type !== selectedType) return false;

    if (!query.trim()) return true;

    const q = query.toLowerCase().trim();
    return (
      m.title.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.unit.toLowerCase().includes(q) ||
      (m.chapter && m.chapter.toLowerCase().includes(q)) ||
      m.grade.toLowerCase().includes(q) ||
      m.type.toLowerCase().includes(q)
    );
  });

  const popularSearches = ['Sets', 'Kinematics', 'Genetics', 'Solutions', 'Python', 'Grammar', 'Macroeconomics'];

  return (
    <div className="space-y-4 pb-20">
      {/* Search Input Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-blue-600 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search notes, worksheets, exams (e.g. "Sets", "Grade 9", "Physics")...'
            className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Popular Tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto mt-2.5 pt-2 border-t border-slate-100 text-xs no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 uppercase shrink-0">Popular:</span>
          {popularSearches.map((tag) => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              className="px-2.5 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-xs shrink-0 transition"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Chips (Grade & Type) */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Grade filter */}
        <select
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
          className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
        >
          <option value="ALL">All Grades (9–12)</option>
          <option value="Grade 9">Grade 9</option>
          <option value="Grade 10">Grade 10</option>
          <option value="Grade 11">Grade 11</option>
          <option value="Grade 12">Grade 12</option>
        </select>

        {/* Type filter */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
        >
          <option value="ALL">All Types</option>
          <option value="Notes">Notes</option>
          <option value="Worksheets">Worksheets</option>
          <option value="Videos">Videos</option>
          <option value="Textbooks">Textbooks</option>
          <option value="Exercises">Exercises</option>
          <option value="Exam Papers">Exam Papers</option>
        </select>

        <span className="text-xs text-slate-500 font-semibold ml-auto">
          {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'}
        </span>
      </div>

      {/* Results Grid */}
      {filteredResults.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center my-6">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h4 className="font-extrabold text-base text-slate-800">No results found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            We couldn't find materials matching "{query}". Try checking your spelling or searching
            by subject name like "Mathematics" or "Chemistry".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResults.map((mat) => (
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
  );
};
