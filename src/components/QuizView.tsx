import { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Info, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { MCQ } from '../types';

interface QuizViewProps {
  quiz: MCQ;
  articleId: string;
  onAnswered: (isCorrect: boolean) => void;
  savedAnswer?: { answeredOption: number; isCorrect: boolean };
}

export default function QuizView({ quiz, articleId, onAnswered, savedAnswer }: QuizViewProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(
    savedAnswer !== undefined ? savedAnswer.answeredOption : null
  );
  const [isSubmitted, setIsSubmitted] = useState<boolean>(savedAnswer !== undefined);

  const handleOptionSelect = (index: number) => {
    if (isSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null || isSubmitted) return;
    const correct = selectedOption === quiz.correctAnswer;
    setIsSubmitted(true);
    onAnswered(correct);
  };

  const handleReset = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div id={`quiz-container-${articleId}`} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center gap-2.5 mb-4">
        <HelpCircle className="h-5 w-5 text-indigo-600 shrink-0" />
        <h3 className="text-sm font-semibold font-display text-slate-800 dark:text-slate-100">
          UPSC Prelims Practice Simulator (Current Exam Level)
        </h3>
      </div>

      <p className="text-sm md:text-base text-slate-800 dark:text-slate-200 font-medium mb-5 leading-relaxed font-sans">
        {quiz.question}
      </p>

      <div className="space-y-3 mb-5">
        {quiz.options.map((option, index) => {
          const isSelected = selectedOption === index;
          const isCorrectOption = index === quiz.correctAnswer;
          
          let optionStyle = "border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-705 dark:text-slate-300";
          let labelStyle = "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";

          if (isSubmitted) {
            if (isCorrectOption) {
              optionStyle = "border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-300";
              labelStyle = "bg-emerald-500 text-white";
            } else if (isSelected) {
              optionStyle = "border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20 text-rose-950 dark:text-rose-300";
              labelStyle = "bg-rose-500 text-white";
            } else {
              optionStyle = "border-slate-150 dark:border-slate-800/60 opacity-50";
            }
          } else if (isSelected) {
            optionStyle = "border-indigo-600 dark:border-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/10 text-indigo-900 dark:text-indigo-300 ring-1 ring-indigo-600/30";
            labelStyle = "bg-indigo-600 text-white";
          }

          return (
            <button
              key={index}
              disabled={isSubmitted}
              onClick={() => handleOptionSelect(index)}
              className={`w-full text-left p-4 rounded-xl border flex items-start gap-3.5 transition-all text-sm font-sans ${optionStyle}`}
            >
              <span className={`h-6 w-6 font-mono text-xs font-bold rounded-full flex items-center justify-center shrink-0 ${labelStyle}`}>
                {optionLabels[index]}
              </span>
              <span className="leading-relaxed flex-1">{option}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-4">
        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={selectedOption === null}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-wide uppercase transition-colors flex items-center gap-1.5 ${
              selectedOption === null
                ? 'bg-slate-150 dark:bg-slate-855 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600'
            }`}
          >
            Submit Answer
          </button>
        ) : (
          <div className="flex items-center gap-3">
            {selectedOption === quiz.correctAnswer ? (
              <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/40 rounded-full">
                <CheckCircle2 className="h-4 w-4" /> Correct
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-200/40 rounded-full">
                <XCircle className="h-4 w-4" /> Incorrect
              </span>
            )}
            <button
              onClick={handleReset}
              className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs flex items-center gap-1 font-semibold transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Re-try
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden mt-5 border-t border-slate-150 dark:border-slate-800 pt-4"
          >
            <div className="bg-amber-50/40 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/30 p-4 rounded-xl flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[10px] font-mono font-bold text-amber-800 dark:text-amber-400 uppercase tracking-widest mb-1.5">
                  UPSC Editorial Explanation
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                  {quiz.explanation}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
