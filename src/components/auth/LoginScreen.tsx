import { useState, useCallback } from 'react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen bg-page-bg text-text flex flex-col justify-center items-center px-4 py-12 antialiased">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/25 mx-auto ring-4 ring-primary-tint">
            <span className="text-3xl font-black text-white tracking-tight">Y</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text">
            {mode === 'signin' ? 'Welcome back to Yusluv' : 'Create Merchant Account'}
          </h1>
          <p className="text-xs sm:text-sm text-muted">
            {mode === 'signin'
              ? 'Sign in to access your store inventory and sales register'
              : 'Start tracking inventory, debtors, and POS sales today'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm space-y-5">
          {/* Mode Switcher Tabs */}
          <div className="flex bg-page-bg p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-primary text-white shadow-xs'
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
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-muted hover:text-text'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Message */}
          {displayError && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-danger rounded-xl text-xs font-medium animate-fade-in">
              {displayError}
            </div>
          )}

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
              placeholder="name@store.com"
              autoComplete="email"
              required
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
              className="w-full mt-2 font-bold shadow-md shadow-primary/20"
              loading={isFirebaseLoading}
              icon={<ArrowRight size={16} />}
              iconPosition="right"
            >
              {mode === 'signin' ? 'Sign In to Register' : 'Complete Registration'}
            </Button>
          </form>

          {/* Offline support note */}
          <div className="pt-2 text-center">
            <p className="text-[11px] text-muted">
              Yusluv securely syncs your store database offline & in cloud.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
