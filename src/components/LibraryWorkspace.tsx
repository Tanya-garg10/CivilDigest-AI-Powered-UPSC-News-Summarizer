import { useState } from 'react';
import { Search, Calendar, Tag, Trash2, Award, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { ArticleAnalysis, UpscCategory } from '../types';

interface LibraryWorkspaceProps {
  library: ArticleAnalysis[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const CATEGORIES: (UpscCategory | 'All Subjects')[] = [
  'All Subjects',
  'Polity & Governance',
  'Economy & Development',
  'Environment & Ecology',
  'International Relations',
  'Science & Technology',
  'General Studies'
];

export default function LibraryWorkspace({ library, activeId, onSelect, onDelete }: LibraryWorkspaceProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<UpscCategory | 'All Subjects'>('All Subjects');

  // Filter logic
  const filteredList = library.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.keywords.some(kw => kw.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = 
      activeCategory === 'All Subjects' || 
      item.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Polity & Governance':
        return 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 border-indigo-200';
      case 'Economy & Development':
        return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 border-emerald-200';
      case 'Environment & Ecology':
        return 'text-teal-600 bg-teal-50 dark:text-teal-400 border-teal-200';
      case 'International Relations':
        return 'text-amber-600 bg-amber-50 dark:text-amber-400 border-amber-200';
      case 'Science & Technology':
        return 'text-purple-600 bg-purple-50 dark:text-purple-400 border-purple-200';
      default:
        return 'text-slate-500 bg-slate-50 dark:text-slate-400 border-slate-200';
    }
  };

  return (
    <div id="library-workspace-root" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Search & Subject Selector Rail */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs">
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by topic, source or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500/30 text-sm font-sans"
            />
          </div>

          <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 px-1">
            UPSC Subjects / GS Units
          </h3>

          <div className="space-y-1.5 max-h-[290px] overflow-y-auto pr-1">
            {CATEGORIES.map((cat) => {
              const count = cat === 'All Subjects' 
                ? library.length 
                : library.filter(item => item.category === cat).length;
              
              const isActive = activeCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs md:text-sm transition-colors flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white dark:bg-indigo-500 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate font-sans font-medium">{cat}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${isActive ? 'bg-indigo-700 text-indigo-50 dark:bg-indigo-600 dark:text-indigo-100 font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Challenge tracker sidebar badge */}
        <div className="bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-start gap-3">
          <Award className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300">
              Exam Library Sync
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              All digitized notes are saved to secure cloud records so you can retrieve key details during active revisions.
            </p>
          </div>
        </div>
      </div>

      {/* Library Notes Card Feed */}
      <div className="lg:col-span-8">
        {filteredList.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center bg-white dark:bg-slate-900">
            <Tag className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 font-sans">
              No matching sheets in Library
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              {searchTerm 
                ? "Try checking your spelling or selecting an alternative UPSC Subject filter on the left."
                : "Enter news article URLs above to summarize them, save notes, and populate your customized revision desk."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
            {filteredList.map((item) => {
              const isActive = activeId === item.id;
              
              return (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden shadow-xs hover:shadow-sm transition-all flex flex-col justify-between ${
                    isActive 
                      ? 'border-indigo-600 dark:border-indigo-400 ring-1 ring-indigo-600 dark:ring-indigo-400' 
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="p-4.5 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`px-2.5 py-0.5 text-[9px] uppercase tracking-wider font-mono font-bold rounded-md border ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </span>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Do you wish to delete "${item.title}" from your library?`)) {
                            onDelete(item.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete notes"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-sans tracking-tight mb-2 line-clamp-2 leading-snug">
                      {item.title}
                    </h4>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 mb-2 font-medium">
                      <span className="text-slate-600 dark:text-slate-300">{item.source}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-sans mb-3">
                      {item.summary[0] || "No summary point available."}
                    </p>
                  </div>

                  <div className="px-4.5 py-3 bg-slate-50/70 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={() => onSelect(item.id)}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      Open Workspace <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    {item.isBookmarked && (
                      <span className="flex items-center text-[9px] uppercase tracking-wider font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 rounded-md">
                        ⭐️ Starred
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
