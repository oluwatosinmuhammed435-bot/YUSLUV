import { useState, useCallback } from 'react';
import { Eye, EyeOff, ArrowRight, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';

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

  const switchMode = useCallback(
    (m: Mode) => {
      setMode(m);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setLocalError('');
      clearFirebaseError();
    },
    [clearFirebaseError]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
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
    },
    [mode, email, password, confirmPassword, signIn, signUp, clearFirebaseError]
  );

  return (
    <div className="min-h-screen w-full bg-page-bg text-text flex antialiased">
      {/* ── LEFT PANE: Visual Showcase (Hidden on small mobile, visible on lg+) ── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 relative bg-[#06382A] text-white flex-col justify-between p-8 xl:p-12 overflow-hidden select-none">
        {/* Background Image with Emerald Gradient Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1600&q=80')`,
          }}
        />

        {/* Deep emerald gradient overlays for high-contrast readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#06382A] via-[#06382A]/75 to-[#06382A]/40 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-[#06382A]/30 mix-blend-multiply" />

        {/* Top Header & Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white text-[#0B7A4B] font-black text-xl flex items-center justify-center shadow-lg shadow-black/20">
              Y
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Yusluv</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-semibold border border-emerald-400/30">
                  Retail POS
                </span>
              </div>
              <p className="text-xs text-white/70 font-medium">Smart Retail & Provisions Management</p>
            </div>
          </div>
        </div>

        {/* Center Headline & Tagline */}
        <div className="relative z-10 space-y-4 max-w-lg my-auto pt-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-emerald-300 text-xs font-semibold">
            <Zap size={14} className="text-accent-amber" />
            <span>Built for High-Speed Retail Counters</span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Manage inventory, record sales, and collect customer debts with ease.
          </h2>
          <p className="text-sm text-white/80 leading-relaxed">
            Designed specifically for Nigerian supermarkets and provision merchants. Fast counter transactions with dual bulk & piece pricing, automatic stock deduction, and WhatsApp debt reminders.
          </p>
        </div>

        {/* Bottom Footer: Only © 2026 Yusluv POS Suite */}
        <div className="relative z-10 pt-6 border-t border-white/15 text-xs text-white/60">
          <span>&copy; 2026 Yusluv POS Suite</span>
        </div>
      </div>

      {/* ── RIGHT PANE: Login / Signup Form ── */}
      <div className="w-full lg:w-1/2 xl:w-7/12 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 overflow-y-auto">
        {/* Mobile Header (Only visible on small screens) */}
        <div className="lg:hidden flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary text-white font-black text-lg flex items-center justify-center shadow-md">
            Y
          </div>
          <div>
            <span className="text-lg font-bold text-text">Yusluv</span>
            <span className="text-xs text-muted block">Retail & Provisions</span>
          </div>
        </div>

        {/* Center Content Form Box */}
        <div className="w-full max-w-md mx-auto my-auto space-y-6">
          {/* Welcome Text */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
              {mode === 'signin' ? 'Welcome back' : 'Create Merchant Account'}
            </h1>
            <p className="text-xs sm:text-sm text-muted">
              {mode === 'signin'
                ? 'Sign in to access your store inventory and sales register'
                : 'Enter your credentials to set up your retail shop in seconds'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-page-bg p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-primary text-white shadow-xs font-bold'
                  : 'text-muted hover:text-text'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-primary text-white shadow-xs font-bold'
                  : 'text-muted hover:text-text'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Message */}
          {displayError && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-danger rounded-xl text-xs font-semibold animate-fade-in flex items-center gap-2">
              <span>⚠️</span>
              <span>{displayError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setLocalError('');
                clearFirebaseError();
              }}
              placeholder="merchant@store.com"
              autoComplete="email"
              required
              autoFocus
            />

            <div>
              <label className="block text-xs font-medium text-text mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLocalError('');
                    clearFirebaseError();
                  }}
                  placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  className="w-full h-11 bg-white text-text text-sm rounded-xl border border-border pl-3.5 pr-11 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted/60"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text p-1 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setLocalError('');
                  clearFirebaseError();
                }}
                placeholder="Re-enter password"
                autoComplete="new-password"
                required
              />
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2 font-bold shadow-md shadow-primary/20 text-sm"
              loading={isFirebaseLoading}
              icon={<ArrowRight size={16} />}
              iconPosition="right"
            >
              {mode === 'signin' ? 'Sign In to Register' : 'Complete Registration'}
            </Button>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-muted/80 pt-6">
          <span>Need help? Contact support via WhatsApp or email.</span>
        </div>
      </div>
    </div>
  );
}
