// ============================================
// Yusluv — OPay-Style PIN Lock Screen
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PinPad from './PinPad';

export default function PinLockScreen() {
  const {
    user,
    isPinSet,
    setupPin,
    unlockWithPin,
    pinError,
    clearPinError,
    resetPin,
    logOut,
  } = useAuth();

  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [setupStep, setSetupStep] = useState<'enter' | 'confirm'>('enter');
  const [shake, setShake] = useState(false);
  const [error, setError] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  // ── Helpers ──────────────────────────────────────────────────
  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  }, []);

  const clearError = useCallback(() => {
    setError('');
    clearPinError();
  }, [clearPinError]);

  // ── Submit logic (called by auto-submit effect via ref) ───────
  // We store the latest version in a ref so the effect never goes stale
  const submitRef = useRef<(pin: string) => Promise<void>>(async () => {});

  const submit = useCallback(async (currentPin: string) => {
    if (busy) return;

    if (isPinSet) {
      // Unlock mode
      setBusy(true);
      const ok = await unlockWithPin(currentPin);
      setBusy(false);
      if (!ok) {
        triggerShake();
        setTimeout(() => setPin(''), 500);
      } else {
        setSuccess(true);
      }
    } else {
      // Setup mode — first step: move to confirm
      if (setupStep === 'enter') {
        setConfirmPin('');
        setSetupStep('confirm');
        setError('');
      } else {
        // Second step: validate match
        if (currentPin !== pin) {
          setError("PINs don't match. Try again.");
          triggerShake();
          setTimeout(() => {
            setConfirmPin('');
            setPin('');
            setSetupStep('enter');
            setError('');
          }, 800);
        } else {
          setBusy(true);
          await setupPin(pin);
          setBusy(false);
          setSuccess(true);
        }
      }
    }
  }, [busy, isPinSet, setupStep, pin, unlockWithPin, setupPin, triggerShake]);

  // Keep the ref pointing to the latest submit
  useEffect(() => {
    submitRef.current = submit;
  }, [submit]);

  // ── Auto-submit when 4 digits are entered ─────────────────────
  useEffect(() => {
    const active = setupStep === 'confirm' ? confirmPin : pin;
    if (active.length === 4 && !busy) {
      // Small delay so the last dot animates before submission
      const t = setTimeout(() => submitRef.current(active), 140);
      return () => clearTimeout(t);
    }
  }, [pin, confirmPin, setupStep, busy]);

  // ── Event handlers ────────────────────────────────────────────
  const handleDigit = useCallback((digit: string) => {
    if (busy || success) return;
    clearError();
    if (isPinSet || setupStep === 'enter') {
      setPin((p) => (p.length < 4 ? p + digit : p));
    } else {
      setConfirmPin((p) => (p.length < 4 ? p + digit : p));
    }
  }, [busy, success, isPinSet, setupStep, clearError]);

  const handleDelete = useCallback(() => {
    if (busy || success) return;
    clearError();
    if (isPinSet || setupStep === 'enter') {
      setPin((p) => p.slice(0, -1));
    } else {
      setConfirmPin((p) => p.slice(0, -1));
    }
  }, [busy, success, isPinSet, setupStep, clearError]);

  // ── Derived display values ────────────────────────────────────
  const displayPin = setupStep === 'confirm' ? confirmPin : pin;
  const displayError = error || pinError;

  const heading = isPinSet
    ? 'Enter your PIN'
    : setupStep === 'enter'
    ? 'Create a PIN'
    : 'Confirm your PIN';

  const subText = isPinSet
    ? user?.email ?? ''
    : setupStep === 'enter'
    ? 'Set a 4-digit PIN to secure your account'
    : 'Re-enter your PIN to confirm';

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-between px-6 py-12 overflow-hidden">

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px]
          bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px]
          bg-purple-800/10 rounded-full blur-[100px]" />
      </div>

      {/* ── TOP: Brand ── */}
      <div className="relative flex flex-col items-center gap-3 pt-4">
        <div
          className={`w-20 h-20 rounded-[22px] bg-gradient-to-br from-purple-500 via-purple-600 to-purple-900
            flex items-center justify-center shadow-2xl shadow-purple-600/40
            ring-1 ring-purple-400/20 transition-all duration-500
            ${success ? 'scale-110 ring-purple-400/60 shadow-purple-400/50' : ''}`}
        >
          <span className="text-3xl font-black text-white select-none tracking-tighter">Y</span>
        </div>
        <p className="text-white/20 text-[11px] uppercase tracking-[0.2em] font-medium">
          Yusluv · Retail Manager
        </p>
      </div>

      {/* ── MIDDLE: Labels + Dots + Error ── */}
      <div className="relative flex flex-col items-center gap-5">

        <div className="text-center">
          <h2 className="text-white text-xl font-semibold tracking-tight">{heading}</h2>
          <p className="text-white/35 text-xs mt-1.5 leading-relaxed">{subText}</p>
        </div>

        {/* PIN dots */}
        <div className={`flex gap-5 my-2 ${shake ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((i) => {
            const filled = i < displayPin.length;
            return (
              <div
                key={i}
                className={`rounded-full transition-all duration-200 ${
                  filled
                    ? `w-4 h-4 shadow-lg ${
                        success
                          ? 'bg-emerald-400 shadow-emerald-400/50'
                          : 'bg-purple-500 shadow-purple-500/60'
                      }`
                    : 'w-3.5 h-3.5 border-2 border-white/20'
                }`}
                style={{ transform: filled ? 'scale(1.2)' : 'scale(1)' }}
              />
            );
          })}
        </div>

        {/* Error message — fixed height so layout doesn't jump */}
        <div className="h-5">
          {displayError && (
            <p className="text-red-400 text-xs animate-fade-in font-medium text-center">
              {displayError}
            </p>
          )}
        </div>

        {/* Setup step progress indicator */}
        {!isPinSet && (
          <div className="flex gap-1.5">
            <div className={`h-[3px] rounded-full transition-all duration-300
              ${setupStep === 'enter' ? 'w-7 bg-purple-500' : 'w-3 bg-white/15'}`} />
            <div className={`h-[3px] rounded-full transition-all duration-300
              ${setupStep === 'confirm' ? 'w-7 bg-purple-500' : 'w-3 bg-white/15'}`} />
          </div>
        )}
      </div>

      {/* ── BOTTOM: Numpad + Actions ── */}
      <div className="relative flex flex-col items-center gap-7 w-full">
        <PinPad
          onDigit={handleDigit}
          onDelete={handleDelete}
          disabled={busy || success}
        />

        <div className="flex flex-col items-center gap-2">
          {isPinSet && !showResetConfirm && (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-white/30 text-xs hover:text-purple-400 transition-colors px-4 py-1.5"
            >
              Forgot PIN?
            </button>
          )}

          {!isPinSet && setupStep === 'confirm' && (
            <button
              onClick={() => {
                setSetupStep('enter');
                setPin('');
                setConfirmPin('');
                setError('');
              }}
              className="text-white/30 text-xs hover:text-white/60 transition-colors px-4 py-1.5"
            >
              ← Start over
            </button>
          )}

          <button
            onClick={logOut}
            className="flex items-center gap-1.5 text-white/20 text-xs
              hover:text-white/45 transition-colors px-4 py-1.5"
          >
            <LogOut size={11} />
            Sign out
          </button>
        </div>
      </div>

      {/* ── Reset confirmation bottom sheet ── */}
      {showResetConfirm && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end
            justify-center pb-8 px-5 animate-fade-in"
          onClick={() => setShowResetConfirm(false)}
        >
          <div
            className="bg-[#16161e] border border-white/10 rounded-3xl p-6 w-full max-w-sm
              shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20
                flex items-center justify-center mx-auto mb-3 text-2xl">
                ⚠️
              </div>
              <h3 className="text-white font-semibold text-base">Reset your PIN?</h3>
              <p className="text-white/40 text-xs mt-2 leading-relaxed">
                Your PIN will be removed. Your cloud data stays safe and you'll be asked to create a new PIN.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3.5 rounded-2xl bg-white/5 border border-white/10
                  text-white/60 text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetPin();
                  setPin('');
                  setConfirmPin('');
                  setSetupStep('enter');
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-3.5 rounded-2xl bg-purple-600 text-white text-sm
                  font-semibold hover:bg-purple-500 transition-colors shadow-lg shadow-purple-600/25"
              >
                Reset PIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
