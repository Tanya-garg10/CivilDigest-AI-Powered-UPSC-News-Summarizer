import { useState, useEffect, FormEvent } from 'react';
import { User, LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { auth, ensureUserAuthenticated } from '../lib/firebase';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function AuthBar() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setCurrentUser(u);
      } else {
        // Automatically authenticate anonymously to ensure persistent storage is immediately ready
        try {
          const guestUser = await ensureUserAuthenticated();
          setCurrentUser(guestUser);
        } catch (_) {
          setCurrentUser(null);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // It will auto-trigger onAuthStateChanged and log in as standard anonymous user, keeping a clean desk
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setShowAuthModal(false);
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  if (loading) {
    return (
      <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg"></div>
    );
  }

  const isAnonymous = currentUser?.isAnonymous;

  return (
    <div className="flex items-center gap-3">
      {/* Current badge */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono select-none font-semibold">
        <User className="h-4 w-4 text-slate-400" />
        <span className="text-slate-600 dark:text-slate-300 truncate max-w-[120px] sm:max-w-[160px]">
          {isAnonymous ? 'Guest Aspirant' : currentUser?.email}
        </span>
      </div>

      {isAnonymous ? (
        <button
          onClick={() => setShowAuthModal(true)}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:text-white dark:hover:bg-indigo-600 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 transition-colors"
        >
          <LogIn className="h-3.5 w-3.5" />
          <span>Save Account</span>
        </button>
      ) : (
        <button
          onClick={handleSignOut}
          className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
          title="Sign Out"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      )}

      {/* Auth Modal Modal */}
      {showAuthModal && (
        <div id="auth-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 relative shadow-lg">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-display mb-1.5">
              {isSignUp ? 'Sync with New Account' : 'Login to UPSC Sync Profile'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed font-sans">
              Enter your credentials to link your UPSC Revision sheets. This allows your saved history to be securely accessed from any tablet or laptop.
            </p>

            {errorMsg && (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200/40 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 text-xs p-3 rounded-xl mb-4 font-sans">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aspirant@civilservices.in"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500/30 font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-1">
                  Cabinet Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500/30 font-sans"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-650 transition-colors font-bold rounded-xl text-sm uppercase tracking-wider"
              >
                {isSignUp ? 'Create & Sync Profile' : 'Login Desk'}
              </button>
            </form>

            <div className="mt-4 border-t border-slate-200 dark:border-slate-850 pt-3 flex items-center justify-between">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-sans font-semibold hover:underline cursor-pointer"
              >
                {isSignUp ? 'Already have an account? Sign In' : 'No account? Create Civil account'}
              </button>
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  setErrorMsg('');
                }}
                className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 font-sans font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
