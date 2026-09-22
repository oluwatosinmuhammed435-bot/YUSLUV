// ============================================
// Yusluv — OPay-Style Login / Sign-up Screen
// ============================================

import { useState, useCallback } from 'react';
import { Eye, EyeOff, ArrowRight, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type Mode = 'signin' | 'signup';

export default function LoginScreen() {
  const { signIn, signUp, firebaseError, clearFirebaseError, isFirebaseLoading } = useAuth();

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const displayError = localError || firebaseError;

  const switchMode = useCallback((m: Mode) => {
    setMode(m);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setLocalError('');
    clearFirebaseError();
  }, [clearFirebaseError]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearFirebaseError();

    if (!email.trim() || !password.trim()) {
      setLocalError('Please fill in all fields.');
      return;
    }
    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setLocalError('Password must be at least 6 characters.');
        return;
      }
      await signUp(email.trim(), password);
    } else {
      await signIn(email.trim(), password);
    }
  }, [mode, email, password, confirmPassword, signIn, signUp, clearFirebaseError]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col overflow-hidden">

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px]
          bg-purple-900/20 rounded-full blur-[130px]" />
        <div className="absolute -bottom-1/4 right-[-20%] w-[500px] h-[500px]
          bg-purple-800/10 rounded-full blur-[100px]" />
      </div>

      {/* ── HERO top section ── */}
      <div className="relative flex flex-col items-center justify-center pt-20 pb-10 px-8">
        {/* Logo */}
        <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-purple-500 via-purple-600 to-purple-900
          flex items-center justify-center shadow-2xl shadow-purple-600/40 ring-1 ring-purple-400/20 mb-6">
          <span className="text-3xl font-black text-white select-none tracking-tighter">Y</span>
        </div>

        <h1 className="text-white text-3xl font-bold tracking-tight mb-1">
          {mode === 'signin' ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="text-white/35 text-sm text-center leading-relaxed">
          {mode === 'signin'
            ? 'Sign in to continue to Yusluv'
            : 'Start managing your business today'}
        </p>
      </div>

      {/* ── FORM section ── */}
      <div className="relative flex-1 flex flex-col px-6 pb-10">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm mx-auto">

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-white/40 text-xs font-medium uppercase tracking-wider pl-1">
              Email address
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setLocalError(''); clearFirebaseError(); }}
              placeholder="you@example.com"
              autoComplete="email"
              autoCapitalize="none"
              className="w-full h-14 bg-white/[0.05] border border-white/[0.09] rounded-2xl
                px-4 text-white text-[15px] placeholder-white/20 outline-none
                focus:border-purple-500/60 focus:bg-white/[0.07] transition-all duration-200"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-white/40 text-xs font-medium uppercase tracking-wider pl-1">
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setLocalError(''); clearFirebaseError(); }}
                placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                className="w-full h-14 bg-white/[0.05] border border-white/[0.09] rounded-2xl
                  px-4 pr-12 text-white text-[15px] placeholder-white/20 outline-none
                  focus:border-purple-500/60 focus:bg-white/[0.07] transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30
                  hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm password (sign-up only) */}
          {mode === 'signup' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-white/40 text-xs font-medium uppercase tracking-wider pl-1">
                Confirm password
              </label>
              <input
                id="login-confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setLocalError(''); }}
                placeholder="Repeat your password"
                autoComplete="new-password"
                className="w-full h-14 bg-white/[0.05] border border-white/[0.09] rounded-2xl
                  px-4 text-white text-[15px] placeholder-white/20 outline-none
                  focus:border-purple-500/60 focus:bg-white/[0.07] transition-all duration-200"
              />
            </div>
          )}

          {/* Error */}
          {displayError && (
            <div className="flex items-center gap-2.5 bg-red-500/[0.08] border border-red-500/20
              rounded-2xl px-4 py-3 animate-fade-in">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              <p className="text-red-400 text-sm leading-snug">{displayError}</p>
            </div>
          )}

          {/* Submit */}
          <button
            id="login-submit"
            type="submit"
            disabled={isFirebaseLoading}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700
              text-white text-[15px] font-semibold shadow-xl shadow-purple-600/30
              hover:from-purple-500 hover:to-purple-600 active:scale-[0.98]
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200 flex items-center justify-center gap-2 mt-2"
          >
            {isFirebaseLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {mode === 'signin' ? 'Signing in…' : 'Creating account…'}
              </>
            ) : (
              <>
                {mode === 'signin' ? 'Sign in' : 'Create account'}
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* Switch mode */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {mode === 'signin' ? (
            <>
              <span className="text-white/30 text-sm">Don't have an account?</span>
              <button
                onClick={() => switchMode('signup')}
                className="text-purple-400 text-sm font-semibold hover:text-purple-300 transition-colors"
              >
                Create one
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => switchMode('signin')}
                className="flex items-center gap-1 text-white/30 text-sm hover:text-white/60
                  transition-colors"
              >
                <ChevronLeft size={15} />
                Back to sign in
              </button>
            </>
          )}
        </div>

        {/* Cloud sync badge */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="flex items-center gap-2 bg-emerald-500/8 border border-emerald-500/15
            rounded-full px-3.5 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-emerald-400/70 text-xs">Cloud sync · Data secured</p>
          </div>
        </div>
      </div>
    </div>
  );
}
