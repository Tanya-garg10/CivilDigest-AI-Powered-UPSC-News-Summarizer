import { useState, useEffect, FormEvent } from 'react';
import { Newspaper, Sparkles, AlertCircle, Plus, Search, BookOpen, Trash2, Library, BookOpenCheck, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, ensureUserAuthenticated } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore';

import type { ArticleAnalysis, UserStats } from './types';
import { COMP_SAMPLES } from './data/samples';
import StatsDashboard from './components/StatsDashboard';
import AnalysisWorkspace from './components/AnalysisWorkspace';
import LibraryWorkspace from './components/LibraryWorkspace';
import RevisionCompiler from './components/RevisionCompiler';
import AuthBar from './components/AuthBar';

const LOADING_PRELIMS_TIPS = [
  "UPSC Mentor: Focus on Constitutional Articles, Statutory provisions, and Supreme court judgements...",
  "Syllabus Tip: GS Paper III loves facts on carbon capture, electrolyser margins, and industrial feedstocks.",
  "Mains Guide: Standard answer models must have an impact mapping, challenges column, and a positive Way Forward.",
  "Prelims Checklist: Keep an eye on global pacts, bi-lateral agreements, and nodal central ministries.",
  "Scraping active via Anakin Wire API: Normalizing raw text patterns. Sending contextual data feeds to Gemini...",
  "AI Analysis: Formulating challenging 4-choice questions to test your analytical reading boundaries."
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [inputUrl, setInputUrl] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [loadingTipsIdx, setLoadingTipsIdx] = useState(0);
  const [activeAnalysisId, setActiveAnalysisId] = useState<string | null>("sample-green-hydrogen");
  const [activeTab, setActiveTab] = useState<'optimizer' | 'library' | 'compiler'>('optimizer');
  const [errorMsg, setErrorMsg] = useState('');

  // Firestore & local arrays
  const [dbArticles, setDbArticles] = useState<ArticleAnalysis[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);
  
  // Sample MCQ Answers tracked locally in state/localStorage
  const [sampleAnswers, setSampleAnswers] = useState<{ [id: string]: { answeredOption: number; isCorrect: boolean } }>(() => {
    try {
      const saved = localStorage.getItem('civildigest_samples_mcqs');
      return saved ? JSON.parse(saved) : {};
    } catch (_) {
      return {};
    }
  });

  // Track User Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setCurrentUser(u);
      } else {
        try {
          const guestUser = await ensureUserAuthenticated();
          setCurrentUser(guestUser);
        } catch (_) {
          setCurrentUser(null);
        }
      }
    });
    return unsubscribe;
  }, []);

  // Sync Library with Firestore for the authenticated user
  useEffect(() => {
    if (!currentUser) return;

    setLoadingDb(true);
    const q = query(
      collection(db, "articles"),
      where("userId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const articles: ArticleAnalysis[] = [];
      snapshot.forEach((docSnap) => {
        articles.push({
          id: docSnap.id,
          ...docSnap.data()
        } as ArticleAnalysis);
      });
      // Sort in reverse order of creation
      articles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setDbArticles(articles);
      setLoadingDb(false);
    }, (error) => {
      console.error("Firestore sync fail:", error);
      setLoadingDb(false);
    });

    return unsubscribe;
  }, [currentUser]);

  // Rotate tips during analysis loading
  useEffect(() => {
    if (!isOptimizing) return;
    const interval = setInterval(() => {
      setLoadingTipsIdx((prev) => (prev + 1) % LOADING_PRELIMS_TIPS.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [isOptimizing]);

  // Combine DB articles with static default samples
  const library = [
    ...dbArticles,
    ...COMP_SAMPLES.filter(sample => !dbArticles.some(item => item.url === sample.url))
  ];

  // Active highlighted article
  const activeArticle = library.find(item => item.id === activeAnalysisId) || library[0] || null;

  // Sync local sample answer log with localStorage
  const saveSampleAnswer = (articleId: string, answeredOption: number, isCorrect: boolean) => {
    const updated = {
      ...sampleAnswers,
      [articleId]: { answeredOption, isCorrect }
    };
    setSampleAnswers(updated);
    try {
      localStorage.setItem('civildigest_samples_mcqs', JSON.stringify(updated));
    } catch (_) {}
  };

  // Submit article analysis request to backend scraper
  const handleOptimizeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    let trimmedUrl = inputUrl.trim();
    if (!trimmedUrl) return;

    let isUrl = false;
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      isUrl = true;
    } else if (trimmedUrl.includes('.') && !trimmedUrl.includes(' ') && trimmedUrl.length > 4) {
      trimmedUrl = 'https://' + trimmedUrl;
      isUrl = true;
    }

    if (isUrl) {
      try {
        new URL(trimmedUrl);
      } catch (_) {
        setErrorMsg("Please enter a valid HTTP or HTTPS news article URL.");
        return;
      }
    }

    setIsOptimizing(true);
    setLoadingTipsIdx(0);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: trimmedUrl })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "The AI system failed to digest the specified news link.");
      }

      const analyzedPayload = result.data;

      // Ensure user is authorized in Firebase (anonymously)
      const user = await ensureUserAuthenticated();
      const userId = user ? user.uid : "unauthenticated";

      // Append user identifiers
      const completeDocument = {
        ...analyzedPayload,
        userId: userId,
        isBookmarked: false,
        createdAt: new Date().toISOString()
      };

      // Add to firestore collection
      const docRef = await addDoc(collection(db, "articles"), completeDocument);

      // Auto focus on the newly processed sheet
      setActiveAnalysisId(docRef.id);
      setInputUrl('');
      // Set view focus
      setActiveTab('optimizer');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Scraping/AI analysis encountered a server network error. Please try again.");
    } finally {
      setIsOptimizing(false);
    }
  };

  // Handle Saved bookmarks toggling
  const handleToggleBookmark = async () => {
    if (!activeArticle) return;

    // Sample articles are local-only and mock bookmarking in simple memory
    if (activeArticle.id.startsWith("sample-")) {
      // Find actual element and toggle
      const index = COMP_SAMPLES.findIndex(s => s.id === activeArticle.id);
      if (index !== -1) {
        COMP_SAMPLES[index].isBookmarked = !COMP_SAMPLES[index].isBookmarked;
        // Trigger render update
        setActiveAnalysisId(activeArticle.id);
      }
      return;
    }

    // DB backed articles gets standard firestore updates
    try {
      const targetDoc = doc(db, "articles", activeArticle.id);
      await updateDoc(targetDoc, {
        isBookmarked: !activeArticle.isBookmarked
      });
    } catch (e) {
      console.error("Failed to star article: ", e);
    }
  };

  // Handle MCQ solve log
  const handleAnswerQuiz = async (isCorrect: boolean, selectedOption: number) => {
    if (!activeArticle) return;

    if (activeArticle.id.startsWith("sample-")) {
      saveSampleAnswer(activeArticle.id, selectedOption, isCorrect);
      return;
    }

    try {
      const targetDoc = doc(db, "articles", activeArticle.id);
      await updateDoc(targetDoc, {
        userAnswers: { answeredOption: selectedOption, isCorrect }
      });
    } catch (e) {
      console.error("Failed to record answer: ", e);
    }
  };

  // Handle custom sheet deletion
  const handleDeleteArticle = async (id: string) => {
    if (id.startsWith("sample-")) {
      alert("Sample UPSC articles cannot be deleted. They remain as reference cards.");
      return;
    }

    try {
      await deleteDoc(doc(db, "articles", id));
      if (activeAnalysisId === id) {
        setActiveAnalysisId("sample-green-hydrogen");
      }
    } catch (e) {
      console.error("Failed to delete article docs: ", e);
    }
  };

  // Calculate dynamic candidate metrics
  const getCalculatedStats = (): UserStats => {
    // 1. Scanned Count
    const scanned = library.length;

    // 2. Solved / Correct count
    let solved = 0;
    let correct = 0;

    library.forEach((item) => {
      if (item.id.startsWith("sample-")) {
        const localAns = sampleAnswers[item.id];
        if (localAns) {
          solved++;
          if (localAns.isCorrect) correct++;
        }
      } else {
        const docObj: any = item;
        if (docObj.userAnswers) {
          solved++;
          if (docObj.userAnswers.isCorrect) correct++;
        }
      }
    });

    // 3. Streak calculation
    let streak = 1; // Default
    try {
      const savedStreakVal = localStorage.getItem('civildigest_user_streak');
      const lastActiveDay = localStorage.getItem('civildigest_last_active_day');
      const todayString = new Date().toISOString().split('T')[0];

      if (lastActiveDay) {
        if (lastActiveDay === todayString) {
          streak = savedStreakVal ? parseInt(savedStreakVal) : 1;
        } else {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayString = yesterday.toISOString().split('T')[0];

          if (lastActiveDay === yesterdayString) {
            streak = savedStreakVal ? parseInt(savedStreakVal) + 1 : 1;
          } else {
            streak = 1;
          }
          localStorage.setItem('civildigest_user_streak', streak.toString());
        }
      } else {
        localStorage.setItem('civildigest_user_streak', '1');
      }
      localStorage.setItem('civildigest_last_active_day', todayString);
    } catch (_) {}

    return {
      scannedCount: scanned,
      solvedCount: solved,
      correctCount: correct,
      currentStreak: streak,
      lastActive: new Date().toISOString().split('T')[0]
    };
  };

  const calculatedStats = getCalculatedStats();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 selection:bg-slate-200 dark:selection:bg-slate-800">
      {/* Editorial Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold font-display text-lg">
              C
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold font-display tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-1.5 leading-none">
                CivilDigest
                <span className="hidden sm:inline-block px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-mono text-[9px] rounded font-bold border border-indigo-200/40">ANAKIN BLITZ 2026</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-wider mt-0.5 font-mono uppercase">
                UPSC Current Affairs Optimizer & MCQ Lab
              </p>
            </div>
          </div>

          <AuthBar />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Aspirant Metrics Grid */}
        <StatsDashboard stats={calculatedStats} />

        {/* Tab Selection Row */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 mb-6">
          <button
            onClick={() => setActiveTab('optimizer')}
            className={`py-2 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 leading-relaxed ${
              activeTab === 'optimizer'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-450 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Optimize Article URL
          </button>
          
          <button
            onClick={() => setActiveTab('library')}
            className={`py-2 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 leading-relaxed ${
              activeTab === 'library'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-450 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Library className="h-4 w-4" />
            UPSC Syllabus Library ({library.length})
          </button>

          <button
            onClick={() => setActiveTab('compiler')}
            className={`py-2 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 leading-relaxed ${
              activeTab === 'compiler'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-450 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <BookOpenCheck className="h-4 w-4" />
            Starred Revision Binder
          </button>
        </div>

        {/* Main tabs content */}
        <div id="workspace-tab-viewport">
          {activeTab === 'optimizer' && (
            <div className="space-y-6">
              {/* URL Submission Section */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-xs relative overflow-hidden">
                <div className="absolute right-0 top-0 h-40 w-40 bg-indigo-50/40 dark:bg-indigo-900/10 rounded-full blur-2xl pointer-events-none"></div>
                
                <h2 className="text-base sm:text-lg font-bold text-slate-950 dark:text-slate-50 font-display mb-1 flex items-center gap-2">
                  <Plus className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Digest New Current Affairs Source
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed font-sans max-w-2xl">
                  Paste any news URL (from The Hindu, Indian Express, PIB, LiveMint, etc.). CivilDigest will run the Anakin Wire scraper engine and compile UPSC notes, important terminology, and Challenge MCQs in seconds.
                </p>

                {errorMsg && (
                  <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200/40 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 text-xs sm:text-sm mb-4 font-sans flex items-start gap-2.5">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <p className="leading-relaxed font-medium">{errorMsg}</p>
                  </div>
                )}

                <form onSubmit={handleOptimizeSubmit} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    required
                    disabled={isOptimizing}
                    placeholder="https://www.thehindu.com/opinion/editorial/the-basic-structure-doctrine-at-50/article..."
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/30"
                  />
                  <button
                    type="submit"
                    disabled={isOptimizing || !inputUrl.trim()}
                    className="px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    {isOptimizing ? 'Analyzing Content...' : 'Optimize Links 🚀'}
                  </button>
                </form>

                {/* Loading skeleton screen */}
                <AnimatePresence>
                  {isOptimizing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 z-20 flex flex-col items-center justify-center p-6 text-center"
                    >
                      <div className="flex flex-col items-center space-y-4 max-w-md">
                        {/* Custom visual loop loader */}
                        <div className="relative h-12 w-12 flex items-center justify-center">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-600/20"></span>
                          <span className="relative inline-flex rounded-full h-8 w-8 bg-indigo-600"></span>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-display tracking-tight">
                            Digest Engine Running
                          </h4>
                          <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-bold tracking-widest uppercase mt-1">
                            Anakin Wire API Portal Scraper v2.6
                          </p>
                        </div>

                        {/* Staggered UPSC tip ticker */}
                        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mt-2 shadow-xs min-h-[90px] flex items-center justify-center">
                          <p className="text-xs text-slate-600 dark:text-slate-350 italic font-sans leading-relaxed max-w-sm">
                            "{LOADING_PRELIMS_TIPS[loadingTipsIdx]}"
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Active Workspace Block */}
              {activeArticle ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      Active Workspace Workspace
                    </h3>
                    <div className="text-xs text-slate-450 dark:text-slate-500 flex items-center gap-1">
                      <span>Focused ID:</span>
                      <span className="font-mono bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-md text-[10px] text-slate-700 dark:text-slate-350 font-bold border border-slate-200/30">
                        {activeArticle.id}
                      </span>
                    </div>
                  </div>

                  <AnalysisWorkspace
                    analysis={activeArticle}
                    onToggleBookmark={handleToggleBookmark}
                    onAnswerQuiz={(isCorrect, answeredIdx) => handleAnswerQuiz(isCorrect, answeredIdx)}
                    savedAnswer={
                      activeArticle.id.startsWith("sample-")
                        ? sampleAnswers[activeArticle.id]
                        : (activeArticle as any).userAnswers
                    }
                  />
                </div>
              ) : (
                <div className="text-center p-12 border-2 border-dashed rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <AlertCircle className="h-6 w-6 text-slate-400 mx-auto" />
                  <p className="text-sm font-semibold mt-2 text-slate-700 dark:text-slate-300">No active article loaded.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'library' && (
            <LibraryWorkspace
              library={library}
              activeId={activeAnalysisId}
              onSelect={(id) => {
                setActiveAnalysisId(id);
                setActiveTab('optimizer'); // Switch back to optimizer screen with selected item loaded
              }}
              onDelete={handleDeleteArticle}
            />
          )}

          {activeTab === 'compiler' && (
            <RevisionCompiler library={library} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 mt-12 text-center text-xs text-slate-500 dark:text-slate-400 font-sans tracking-wide">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-sans leading-relaxed">
            CivilDigest © 2026. Made with ❤️ for IAS & Civil Service Aspirants.
          </p>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Server Latency: OK</span>
            <span>•</span>
            <span>UPSC Syllabus mapped: GS I, II, III, IV</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
