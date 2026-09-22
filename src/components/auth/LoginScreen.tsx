// ============================================
// Yusluv — Cloud Login Screen (Firebase Auth)
// ============================================

import { useState, useCallback } from 'react';
import { Shield, Mail, Lock, Eye, EyeOff, Wifi, WifiOff } from 'lucide-react';
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
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-6 py-12">

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px]
          bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px]
          bg-purple-800/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm">

        {/* Brand */}
        <div className="mb-10 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600 to-purple-900
            flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-purple-600/40
            ring-1 ring-purple-500/30">
            <Shield size={36} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-purple-100
            bg-clip-text text-transparent tracking-tight">
            Yusluv
          </h1>
          <p className="text-white/30 text-xs mt-1 tracking-widest uppercase">Retail Manager</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6
          backdrop-blur-sm shadow-2xl">

          {/* Sync badge */}
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20
            rounded-xl px-3 py-2 mb-6">
            <Wifi size={14} className="text-emerald-400 shrink-0" />
            <p className="text-emerald-400/80 text-xs">
              Cloud sync enabled — data syncs across all your devices
            </p>
          </div>

          {/* Tab toggle */}
          <div className="flex bg-white/5 rounded-2xl p-1 mb-6">
            {(['signin', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${mode === m
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-white/40 hover:text-white/60'
                  }`}
              >
                {m === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-white/50 text-xs mb-1.5 font-medium uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setLocalError(''); clearFirebaseError(); }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3
                    text-white text-sm placeholder-white/20 outline-none
                    focus:border-purple-500/60 focus:bg-white/[0.07] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-white/50 text-xs mb-1.5 font-medium uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setLocalError(''); clearFirebaseError(); }}
                  placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-11 py-3
                    text-white text-sm placeholder-white/20 outline-none
                    focus:border-purple-500/60 focus:bg-white/[0.07] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60
                    transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm password (signup only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-white/50 text-xs mb-1.5 font-medium uppercase tracking-wide">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    id="login-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setLocalError(''); }}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3
                      text-white text-sm placeholder-white/20 outline-none
                      focus:border-purple-500/60 focus:bg-white/[0.07] transition-all"
                  />
                </div>
              </div>
            )}

            {/* Error */}
            {displayError && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20
                rounded-xl px-3 py-2.5 animate-fade-in">
                <WifiOff size={14} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-400 text-xs">{displayError}</p>
              </div>
            )}

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={isFirebaseLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700
                text-white text-sm font-semibold shadow-lg shadow-purple-600/30
                hover:from-purple-500 hover:to-purple-600 active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200 mt-2"
            >
              {isFirebaseLoading
                ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white
                      rounded-full animate-spin" />
                    {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                  </span>
                )
                : mode === 'signin' ? 'Sign In' : 'Create Account'
              }
            </button>
          </form>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          Your data is encrypted and synced securely with your account.
        </p>
      </div>
    </div>
  );
}
