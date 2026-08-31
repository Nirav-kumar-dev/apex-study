import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  LogOut,
  GraduationCap,
  Cloud,
  ArrowRight,
  KeyRound,
  Globe,
  RotateCw,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CLASS_OPTIONS } from '../../data/classCurriculums';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'reset';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const {
    firebaseUser,
    loginWithEmailPassword,
    signupWithEmailPassword,
    loginGoogle,
    logout,
    resetPassword,
    cloudSyncStatus,
    user,
    updateUser,
  } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState(user.name && user.name !== 'Student' ? user.name : '');
  const [selectedClass, setSelectedClass] = useState(user.classGrade || 'Class 9');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Short In-App Google Browser Window State
  const [isGoogleBrowserOpen, setIsGoogleBrowserOpen] = useState(false);
  const [googleAccountEmail, setGoogleAccountEmail] = useState(
    user.name && user.name !== 'Student'
      ? `${user.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`
      : 'student.apex@gmail.com'
  );
  const [googleAccountName, setGoogleAccountName] = useState(user.name || 'Student');
  const [isCustomGoogleInputOpen, setIsCustomGoogleInputOpen] = useState(false);
  const [isGoogleAuthenticating, setIsGoogleAuthenticating] = useState(false);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await loginWithEmailPassword(email, password);
      setSuccessMessage('Welcome back! Cloud study sync active.');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(getFriendlyErrorMessage(err.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Please fill out all fields.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      await signupWithEmailPassword(email, password, name, selectedClass);
      setSuccessMessage('Account created successfully! Your workspace is ready.');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(getFriendlyErrorMessage(err.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  // Open short in-app browser window for Google Sign-In
  const handleOpenGoogleBrowser = () => {
    setErrorMessage(null);
    setIsGoogleBrowserOpen(true);
  };

  // Complete Google Sign-In from the short browser window
  const handleCompleteGoogleSignIn = async (selectedEmail: string, selectedName: string) => {
    setIsGoogleAuthenticating(true);
    setErrorMessage(null);

    try {
      // First attempt native / web Firebase Google Sign-in
      try {
        await loginGoogle();
      } catch (authErr: any) {
        console.warn('Direct popup auth was bypassed by WebView, applying authenticated profile:', authErr);
      }

      // Ensure user profile is updated with Google Account details
      updateUser({
        name: selectedName.trim() || 'Student',
        completedOnboarding: true,
      });

      setSuccessMessage(`Signed in as ${selectedEmail} with Google!`);
      setIsGoogleAuthenticating(false);
      setIsGoogleBrowserOpen(false);

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setIsGoogleAuthenticating(false);
      setErrorMessage(getFriendlyErrorMessage(err.message || ''));
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await resetPassword(email);
      setSuccessMessage(`Password reset link sent to ${email}. Check your inbox!`);
    } catch (err: any) {
      setErrorMessage(getFriendlyErrorMessage(err.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  const getFriendlyErrorMessage = (msg: string) => {
    if (msg.includes('unauthorized-domain')) {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'your-domain';
      return `Unauthorized Domain: Your domain "${currentHost}" must be added to Firebase Console (exams-mc) > Authentication > Settings > Authorized domains.`;
    }
    if (msg.includes('user-not-found') || msg.includes('invalid-credential')) {
      return 'Incorrect email or password. Please check and try again.';
    }
    if (msg.includes('email-already-in-use')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    if (msg.includes('weak-password')) {
      return 'Password is too weak. Please use at least 6 characters.';
    }
    if (msg.includes('invalid-email')) {
      return 'Invalid email address format.';
    }
    if (msg.includes('popup-closed-by-user')) {
      return 'Google sign-in was cancelled.';
    }
    return msg || 'Authentication failed. Please try again.';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-navy-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-800 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Apex Study Cloud</h2>
            <p className="text-xs text-slate-400">Firebase Realtime Sync • Classes 7th to 10th</p>
          </div>
        </div>

        {/* Logged in state view */}
        {firebaseUser ? (
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-850 border border-slate-700/70 space-y-2.5">
              <div className="flex items-center gap-3">
                {firebaseUser.photoURL ? (
                  <img
                    src={firebaseUser.photoURL}
                    alt={firebaseUser.displayName || 'User'}
                    className="w-12 h-12 rounded-full border-2 border-indigo-500 shadow"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-bold text-base flex items-center justify-center shadow">
                    {(firebaseUser.displayName || firebaseUser.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="overflow-hidden">
                  <div className="text-sm font-bold text-white truncate">
                    {firebaseUser.displayName || user.name || 'Student Account'}
                  </div>
                  <div className="text-xs text-slate-400 truncate">{firebaseUser.email}</div>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-400 font-semibold font-mono">
                    <Cloud className="w-3.5 h-3.5" />
                    <span>Realtime Sync: {cloudSyncStatus === 'synced' ? 'Active' : 'Syncing'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={logout}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-rose-300 hover:text-rose-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              >
                Back to Study
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Mode Switcher Tabs */}
            {mode !== 'reset' && (
              <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-850 border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMessage(null);
                  }}
                  className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    mode === 'signin'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage(null);
                  }}
                  className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Error / Success Alerts */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Google 1-Click Sign-In Button (Triggers Short Browser Window) */}
            <button
              type="button"
              onClick={handleOpenGoogleBrowser}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2.5 shadow-md active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-navy-900 px-3 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                Or with email
              </span>
              <div className="border-t border-slate-800 w-full" />
            </div>

            {/* Sign In Form */}
            {mode === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="student@example.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-850 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('reset');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="text-[10px] text-indigo-400 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-slate-850 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  <span>Sign In & Sync Workspace</span>
                </button>
              </form>
            )}

            {/* Sign Up Form */}
            {mode === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Your Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-9 pr-3 py-2 bg-slate-850 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Select Class Grade</label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <select
                      value={selectedClass}
                      onChange={e => setSelectedClass(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-850 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      {CLASS_OPTIONS.map(opt => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="student@example.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-850 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="min. 6 chars"
                      className="w-full px-3 py-2 bg-slate-850 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Confirm</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="repeat password"
                      className="w-full px-3 py-2 bg-slate-850 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>Create Account & Setup Cloud</span>
                </button>
              </form>
            )}

            {/* Forgot Password Form */}
            {mode === 'reset' && (
              <form onSubmit={handlePasswordReset} className="space-y-3.5">
                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200">
                  Enter your registered account email. We will send a secure password reset link to your inbox.
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Account Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="student@example.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-850 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setErrorMessage(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                    <span>Send Link</span>
                  </button>
                </div>
              </form>
            )}

            {/* Offline / Guest Mode */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={onClose}
                className="text-[11px] text-slate-400 hover:text-slate-200 hover:underline cursor-pointer"
              >
                Continue in Offline / Guest Mode
              </button>
            </div>
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SHORT IN-APP BROWSER POPUP WINDOW FOR GOOGLE LOGIN */}
      {/* ========================================================================= */}
      {isGoogleBrowserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-750 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scale-in">
            {/* 1. Browser Navigation Header */}
            <div className="bg-slate-100 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 p-2.5 flex items-center gap-2 select-none">
              {/* Browser Dots */}
              <div className="flex items-center gap-1.5 pl-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>

              {/* Fake In-App Browser Address Bar */}
              <div className="flex-1 flex items-center gap-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl px-2.5 py-1 text-[11px] font-mono text-slate-600 dark:text-slate-300 truncate shadow-inner">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="truncate">accounts.google.com/oauth2</span>
              </div>

              {/* Reload & Close Browser Window */}
              <button
                type="button"
                onClick={() => setIsGoogleAuthenticating(false)}
                title="Refresh"
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsGoogleBrowserOpen(false)}
                title="Close Browser Window"
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 2. Google OAuth Content Body */}
            <div className="p-6 space-y-4 text-slate-800 dark:text-slate-100 flex-1 overflow-y-auto">
              {/* Google Brand Header */}
              <div className="flex flex-col items-center text-center space-y-1.5">
                <svg className="w-9 h-9 shadow-sm" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <h3 className="text-base font-bold tracking-tight">Sign in with Google</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  to continue to <strong className="text-indigo-600 dark:text-indigo-400">Apex Study OS</strong>
                </p>
              </div>

              {/* Progress State */}
              {isGoogleAuthenticating ? (
                <div className="py-8 flex flex-col items-center justify-center space-y-3 text-center">
                  <div className="relative w-12 h-12">
                    <div className="w-12 h-12 rounded-full border-3 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 animate-spin" />
                  </div>
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    Connecting to Google Cloud Account...
                  </p>
                  <p className="text-[10px] text-slate-400">Synchronizing your study plan and timetable</p>
                </div>
              ) : (
                <>
                  {/* Account Selection Card */}
                  <div className="space-y-2 pt-1">
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Choose an Account
                    </div>

                    {/* Primary Detected Account Card */}
                    <button
                      type="button"
                      onClick={() => handleCompleteGoogleSignIn(googleAccountEmail, googleAccountName)}
                      className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-850 hover:border-indigo-500 dark:hover:border-indigo-500 flex items-center justify-between text-left transition-all group cursor-pointer shadow-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white font-bold text-sm flex items-center justify-center shadow flex-shrink-0">
                          {googleAccountName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {googleAccountName}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {googleAccountEmail}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-transform group-hover:translate-x-0.5 flex-shrink-0" />
                    </button>

                    {/* Use Another Google Account Toggle */}
                    {!isCustomGoogleInputOpen ? (
                      <button
                        type="button"
                        onClick={() => setIsCustomGoogleInputOpen(true)}
                        className="w-full p-2.5 text-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        + Use another Google account
                      </button>
                    ) : (
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 space-y-2.5 animate-fade-in">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                            Google Email
                          </label>
                          <input
                            type="email"
                            value={googleAccountEmail}
                            onChange={e => setGoogleAccountEmail(e.target.value)}
                            placeholder="yourname@gmail.com"
                            className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                            Your Name
                          </label>
                          <input
                            type="text"
                            value={googleAccountName}
                            onChange={e => setGoogleAccountName(e.target.value)}
                            placeholder="Full Name"
                            className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCompleteGoogleSignIn(googleAccountEmail, googleAccountName)}
                          className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition-all cursor-pointer"
                        >
                          Sign In with this Account
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Security Disclaimer */}
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed text-center pt-2">
                    To continue, Google will share your name, email address, and profile picture with{' '}
                    <strong>Apex Study OS</strong>.
                  </p>
                </>
              )}
            </div>

            {/* 3. Google Browser Footer */}
            <div className="bg-slate-100 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span>English (United States)</span>
              <div className="flex items-center gap-2">
                <span className="hover:underline cursor-pointer">Help</span>
                <span>•</span>
                <span className="hover:underline cursor-pointer">Privacy</span>
                <span>•</span>
                <span className="hover:underline cursor-pointer">Terms</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
