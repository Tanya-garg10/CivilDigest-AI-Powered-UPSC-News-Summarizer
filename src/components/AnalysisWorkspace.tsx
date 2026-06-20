import { useState } from 'react';
import { Bookmark, BookmarkCheck, FileText, Sparkles, HelpCircle, Copy, Check, ExternalLink, Calendar } from 'lucide-react';
import type { ArticleAnalysis } from '../types';
import QuizView from './QuizView';

interface AnalysisWorkspaceProps {
  analysis: ArticleAnalysis;
  onToggleBookmark: () => void;
  onAnswerQuiz: (isCorrect: boolean, selectedOption: number) => void;
  savedAnswer?: { answeredOption: number; isCorrect: boolean };
}

// Lightweight, resilient Markdown interpreter for React 19 to avoid version collisions
function StyledMarkdown({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div className="space-y-4 font-sans text-slate-800 dark:text-slate-300">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-2"></div>;

        // Headers
        if (trimmed.startsWith('# ')) {
          return <h1 key={idx} className="text-xl md:text-2xl font-bold font-display tracking-tight text-slate-900 dark:text-slate-50 mt-6 border-b border-slate-200 dark:border-slate-800 pb-2">{trimmed.slice(2)}</h1>;
        }
        if (trimmed.startsWith('## ')) {
          return <h2 key={idx} className="text-lg md:text-xl font-bold font-display tracking-tight text-slate-900 dark:text-slate-50 mt-5">{trimmed.slice(3)}</h2>;
        }
        if (trimmed.startsWith('### ')) {
          return <h3 key={idx} className="text-base md:text-lg font-semibold text-slate-800 dark:text-slate-200 mt-4">{trimmed.slice(4)}</h3>;
        }

        // Bullet points
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const text = trimmed.slice(2);
          return (
            <div key={idx} className="flex items-start gap-2.5 ml-1 md:ml-3">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-600 shrink-0 mt-2"></span>
              <p className="text-sm md:text-base leading-relaxed flex-1">
                {renderBoldText(text)}
              </p>
            </div>
          );
        }

        // Standalone numbers (e.g., 1. Syllabus)
        if (/^\d+\.\s/.test(trimmed)) {
          const match = trimmed.match(/^(\d+\.\s)(.*)/);
          if (match) {
            return (
              <div key={idx} className="flex items-start gap-2.5 ml-1 md:ml-3">
                <span className="font-mono text-xs font-bold text-slate-500 shrink-0 mt-0.5">{match[1]}</span>
                <p className="text-sm md:text-base leading-relaxed flex-1 font-medium">
                  {renderBoldText(match[2])}
                </p>
              </div>
            );
          }
        }

        // Regular paragraph
        return (
          <p key={idx} className="text-sm md:text-base leading-relaxed">
            {renderBoldText(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

// Auxiliary formatter to bold items wrapped in **
function renderBoldText(text: string) {
  const parts = text.split(/\*\*([\s\S]*?)\*\*/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => (
    i % 2 === 1 ? <strong key={i} className="font-bold text-slate-900 dark:text-slate-50">{part}</strong> : part
  ));
}

export default function AnalysisWorkspace({ analysis, onToggleBookmark, onAnswerQuiz, savedAnswer }: AnalysisWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'notes' | 'mcq'>('summary');
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyNotes = () => {
    const rawNotes = `CivilDigest Notes for UPSC: ${analysis.title}
Source: ${analysis.source} | Topic: ${analysis.category}
URL: ${analysis.url}

--- 5-POINT SUMMARY ---
${analysis.summary.map((pt, i) => `${i + 1}. ${pt}`).join('\n')}

--- DETAILED NOTES ---
${analysis.revisionSheet}`;

    navigator.clipboard.writeText(rawNotes).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Polity & Governance':
        return 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50';
      case 'Economy & Development':
        return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50';
      case 'Environment & Ecology':
        return 'bg-teal-50 dark:bg-teal-950/20 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-900/50';
      case 'International Relations':
        return 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50';
      case 'Science & Technology':
        return 'bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/50';
      default:
        return 'bg-slate-50 dark:bg-slate-950/20 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-850';
    }
  };

  return (
    <div id="analysis-workspace-root" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
      {/* Workspace Header */}
      <div className="p-5 md:p-6 border-b border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <span className={`px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded border ${getCategoryColor(analysis.category)}`}>
              {analysis.category}
            </span>
            <span className="flex items-center gap-1 text-xs font-mono text-slate-500 dark:text-slate-400">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(analysis.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyNotes}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 text-xs flex items-center gap-1.5 cursor-pointer transition-colors font-medium"
            >
              {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              {isCopied ? 'Copied' : 'Copy Study Notes'}
            </button>
            <button
              onClick={onToggleBookmark}
              className={`p-1.5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                analysis.isBookmarked
                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-600'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {analysis.isBookmarked ? <BookmarkCheck className="h-4.5 w-4.5" /> : <Bookmark className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>

        <h2 className="text-lg md:text-2xl font-bold font-display tracking-tight text-slate-900 dark:text-slate-50 mb-2 leading-tight">
          {analysis.title}
        </h2>

        <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 dark:text-slate-400">
          <span>Source: <span className="font-semibold text-slate-700 dark:text-slate-300">{analysis.source}</span></span>
          <span>•</span>
          <a
            href={analysis.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 inline-flex items-center gap-1 font-medium hover:underline"
          >
            Original Article <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Tabs list with beautiful styling */}
      <div className="flex border-b border-slate-150 dark:border-slate-800 px-4 md:px-6 bg-slate-50/20 dark:bg-slate-950/10">
        <button
          onClick={() => setActiveTab('summary')}
          className={`py-3 px-4 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'summary'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          } flex items-center gap-1.5`}
        >
          <Sparkles className="h-4 w-4" />
          5-Point Summary
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`py-3 px-4 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'notes'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          } flex items-center gap-1.5`}
        >
          <FileText className="h-4 w-4" />
          Daily Revision Sheet
        </button>
        <button
          onClick={() => setActiveTab('mcq')}
          className={`py-3 px-4 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'mcq'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          } flex items-center gap-1.5`}
        >
          <HelpCircle className="h-4 w-4" />
          Practice MCQ
        </button>
      </div>

      {/* Workspace Body */}
      <div className="p-5 md:p-6">
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
                Executive 5-Point Exam Digest
              </h3>
              <div className="space-y-3.5">
                {analysis.summary.map((point, index) => (
                  <div key={index} className="flex gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                    <span className="flex-shrink-0 w-6.5 h-6.5 rounded-full bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-bold flex items-center justify-center">
                      0{index + 1}
                    </span>
                    <p className="text-sm md:text-base leading-relaxed text-slate-600 dark:text-slate-300 font-sans">
                      {renderBoldText(point)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Keyword chips */}
            <div>
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
                High-Yield Vocabulary / Mains Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.keywords.map((word, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-slate-150/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-xs font-mono cursor-default hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium border border-slate-200/40 dark:border-slate-700"
                  >
                    #{word}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="prose dark:prose-invert max-w-none border border-slate-150 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 rounded-2xl p-5 md:p-6.5">
            <StyledMarkdown content={analysis.revisionSheet} />
          </div>
        )}

        {activeTab === 'mcq' && (
          <QuizView
            quiz={analysis.mcq}
            articleId={analysis.id}
            onAnswered={(isCorrect) => onAnswerQuiz(isCorrect, analysis.mcq.correctAnswer)}
            savedAnswer={savedAnswer}
          />
        )}
      </div>
    </div>
  );
}
