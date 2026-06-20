import { BookOpen, AlertCircle, Copy, Check, Calendar } from 'lucide-react';
import { useState } from 'react';
import type { ArticleAnalysis } from '../types';

interface RevisionCompilerProps {
  library: ArticleAnalysis[];
}

export default function RevisionCompiler({ library }: RevisionCompilerProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const bookmarked = library.filter(item => item.isBookmarked);

  const handleCopySingle = (content: string, index: number) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  const cleanHeader = (text: string) => {
    return text.replace(/#+\s/g, ''); // Simple cleanup for rendering
  };

  return (
    <div id="revision-compiler-root" className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-display mb-1 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-650 dark:text-indigo-400" />
          Master Revision Starred Booklets
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
          This compiled notepad collates all revision logs that you starred in the analysis hub. Use this unified binder to read contiguous topics, map cross-sector arguments, or bundle exam material.
        </p>
      </div>

      {bookmarked.length === 0 ? (
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center bg-white dark:bg-slate-900">
          <AlertCircle className="h-7 w-7 text-slate-400 mx-auto mb-2.5" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 font-sans">
            No Bookmarked Study Material
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
            Star relevant articles inside the optimizer workspace. They will automatically compile here into this unified revision desk.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookmarked.map((item, idx) => (
            <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              {/* Starred book headers */}
              <div className="px-5 py-4 bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-slate-200/60 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-md border border-slate-200/30">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono inline-flex items-center gap-0.5">
                      <Calendar className="h-2.5 w-2.5" />
                      {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h4 className="text-sm md:text-base font-bold text-slate-900 dark:text-slate-100 font-sans tracking-tight leading-snug">
                    {item.title}
                  </h4>
                </div>

                <button
                   onClick={() => handleCopySingle(item.revisionSheet, idx)}
                   className="px-2.5 py-1.5 rounded-lg border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 font-medium"
                >
                  {copiedIndex === idx ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  <span className="hidden sm:inline">{copiedIndex === idx ? 'Copied' : 'Copy Sheet'}</span>
                </button>
              </div>

              {/* Starred sheet notes */}
              <div className="p-5 md:p-6.5 overflow-y-auto max-h-[450px]">
                <div className="space-y-4 font-sans text-xs md:text-sm text-slate-800 dark:text-slate-300">
                  {item.revisionSheet.split('\n').map((line, lIdx) => {
                    const trimmed = line.trim();
                    if (!trimmed) return <div key={lIdx} className="h-1"></div>;

                    // Bullet points formatting
                    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                      return (
                        <div key={lIdx} className="flex items-start gap-2.5 ml-2">
                          <span className="h-1 w-1 rounded-full bg-slate-400 shrink-0 mt-2"></span>
                          <p className="flex-1 leading-relaxed">
                            {trimmed.slice(2).split(/\*\*([\s\S]*?)\*\*/g).map((part, i) => (
                              i % 2 === 1 ? <strong key={i} className="font-bold text-slate-900 dark:text-slate-50">{part}</strong> : part
                            ))}
                          </p>
                        </div>
                      );
                    }

                    // Section titles
                    if (trimmed.startsWith('#') || trimmed.startsWith('##') || trimmed.startsWith('###')) {
                      return (
                        <h5 key={lIdx} className="text-sm font-bold text-slate-900 dark:text-slate-100 font-display uppercase tracking-wider mt-4 mb-2 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                          {cleanHeader(trimmed)}
                        </h5>
                      );
                    }

                    // Content paragraph
                    return (
                      <p key={lIdx} className="leading-relaxed">
                        {trimmed.split(/\*\*([\s\S]*?)\*\*/g).map((part, i) => (
                          i % 2 === 1 ? <strong key={i} className="font-bold text-slate-900 dark:text-slate-50">{part}</strong> : part
                        ))}
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
