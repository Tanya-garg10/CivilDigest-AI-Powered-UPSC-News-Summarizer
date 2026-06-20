import { Flame, BookOpen, CheckCircle, Award } from 'lucide-react';
import type { UserStats } from '../types';

interface StatsDashboardProps {
  stats: UserStats;
}

const UPSC_QUOTES = [
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Integrity, discipline, and systematic persistence are the cornerstones of a true civil servant.",
  "The structure of your preparation defines the calibre of your public administration.",
  "Mains answer writing is an art of condensing high-yield, structured arguments into crisp directives.",
  "Focus on Constitutional morals, Directive Principles, and economic inclusivity in every concept you study."
];

export default function StatsDashboard({ stats }: StatsDashboardProps) {
  // Get seed based on day or solved count
  const quoteIdx = (stats.solvedCount + stats.scannedCount) % UPSC_QUOTES.length;
  const quote = UPSC_QUOTES[quoteIdx];

  // Calculate accuracy
  const accuracy = stats.solvedCount > 0 
    ? Math.round((stats.correctCount / stats.solvedCount) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
      <div id="stat-streak" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center shadow-xs">
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 mr-4 shrink-0">
          <Flame className="h-5.5 w-5.5 animate-pulse" />
        </div>
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">Daily Streak</p>
          <p className="text-xl font-bold font-display text-slate-800 dark:text-slate-100">{stats.currentStreak} {stats.currentStreak === 1 ? 'Day' : 'Days'}</p>
        </div>
      </div>

      <div id="stat-scanned" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center shadow-xs">
        <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/20 text-sky-600 mr-4 shrink-0">
          <BookOpen className="h-5.5 w-5.5" />
        </div>
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">Articles Digested</p>
          <p className="text-xl font-bold font-display text-slate-800 dark:text-slate-100">{stats.scannedCount}</p>
        </div>
      </div>

      <div id="stat-solved" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center shadow-xs">
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 mr-4 shrink-0">
          <CheckCircle className="h-5.5 w-5.5" />
        </div>
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">MCQs Attempted</p>
          <p className="text-xl font-bold font-display text-slate-800 dark:text-slate-100">{stats.solvedCount}</p>
        </div>
      </div>

      <div id="stat-accuracy" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center shadow-xs">
        <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 mr-4 shrink-0">
          <Award className="h-5.5 w-5.5" />
        </div>
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">Prelims Accuracy</p>
          <p className="text-xl font-bold font-display text-slate-800 dark:text-slate-100">{accuracy}%</p>
        </div>
      </div>

      <div id="upsc-quote-banner" className="col-span-1 md:col-span-4 bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <span className="inline-block px-2.5 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[9px] rounded-md mb-1.5 uppercase font-bold tracking-wider">UPSC Study Booster</span>
          <p className="text-xs sm:text-sm italic text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
            "{quote}"
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 text-xs font-mono text-slate-400">
          <span>Active Session UTC:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">2026-06-20</span>
        </div>
      </div>
    </div>
  );
}
