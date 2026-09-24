// ============================================
// Yusluv — OPay-Style PIN Lock Screen (Emerald)
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { LogOut, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PinPad from './PinPad';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

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

  // ── Submit logic ─────────────────────────────────────────────
  const submitRef = useRef<(pin: string) => Promise<void>>(async () => {});

  const submit = useCallback(
    async (currentPin: string) => {
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
        // Setup mode
        if (setupStep === 'enter') {
          setConfirmPin('');
          setSetupStep('confirm');
          setError('');
        } else {
          // Validate match
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
    },
    [busy, isPinSet, setupStep, pin, unlockWithPin, setupPin, triggerShake]
  );

  useEffect(() => {
    submitRef.current = submit;
  }, [submit]);

  // ── Auto-submit when 4 digits are entered ─────────────────────
  useEffect(() => {
    const active = setupStep === 'confirm' ? confirmPin : pin;
    if (active.length === 4 && !busy) {
      const t = setTimeout(() => submitRef.current(active), 140);
      return () => clearTimeout(t);
    }
  }, [pin, confirmPin, setupStep, busy]);

  // ── Event handlers ────────────────────────────────────────────
  const handleDigit = useCallback(
    (digit: string) => {
      if (busy || success) return;
      clearError();
      if (isPinSet || setupStep === 'enter') {
        setPin((p) => (p.length < 4 ? p + digit : p));
      } else {
        setConfirmPin((p) => (p.length < 4 ? p + digit : p));
      }
    },
    [busy, success, isPinSet, setupStep, clearError]
  );

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
    ? 'Enter Terminal PIN'
    : setupStep === 'enter'
    ? 'Create Quick PIN'
    : 'Confirm Quick PIN';

  const subText = isPinSet
    ? user?.email ?? 'Quick unlock for counter register'
    : setupStep === 'enter'
    ? 'Set a 4-digit numeric code to secure your counter'
    : 'Re-enter your PIN to verify';

  return (
    <div className="min-h-screen bg-page-bg text-text flex flex-col items-center justify-between px-6 py-10 select-none antialiased">
      {/* ── TOP: Brand & Logo ── */}
      <div className="flex flex-col items-center gap-2 pt-2">
        <div
          className={`w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/25 ring-4 ring-primary-tint transition-all duration-500 ${
            success ? 'scale-110 bg-success ring-emerald-200' : ''
          }`}
        >
          <span className="text-2xl font-black text-white tracking-tight">Y</span>
        </div>
        <p className="text-muted text-[11px] uppercase tracking-wider font-semibold">
          Yusluv &bull; Retail Manager
        </p>
      </div>

      {/* ── MIDDLE: Labels + Dots + Error ── */}
      <div className="flex flex-col items-center gap-4 my-auto">
        <div className="text-center">
          <h2 className="text-text text-xl font-bold tracking-tight">{heading}</h2>
          <p className="text-muted text-xs mt-1 max-w-xs">{subText}</p>
        </div>

        {/* PIN dots */}
        <div className={`flex gap-4 my-2 ${shake ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((i) => {
            const filled = i < displayPin.length;
            return (
              <div
                key={i}
                className={`rounded-full transition-all duration-200 ${
                  filled
                    ? `w-4 h-4 shadow-sm ${
                        success
                          ? 'bg-success shadow-success/30'
                          : 'bg-primary shadow-primary/40'
                      }`
                    : 'w-3.5 h-3.5 border-2 border-border bg-white'
                }`}
                style={{ transform: filled ? 'scale(1.2)' : 'scale(1)' }}
              />
            );
          })}
        </div>

        {/* Error message */}
        <div className="h-5">
          {displayError && (
            <p className="text-danger text-xs font-semibold animate-fade-in text-center">
              {displayError}
            </p>
          )}
        </div>

        {/* Setup step progress indicator */}
        {!isPinSet && (
          <div className="flex gap-1.5">
            <div
              className={`h-1 rounded-full transition-all duration-300 ${
                setupStep === 'enter' ? 'w-8 bg-primary' : 'w-3 bg-border'
              }`}
            />
            <div
              className={`h-1 rounded-full transition-all duration-300 ${
                setupStep === 'confirm' ? 'w-8 bg-primary' : 'w-3 bg-border'
              }`}
            />
          </div>
        )}
      </div>

      {/* ── BOTTOM: Keypad + Actions ── */}
      <div className="flex flex-col items-center gap-6 w-full max-w-sm pb-4">
        <PinPad
          onDigit={handleDigit}
          onDelete={handleDelete}
          disabled={busy || success}
        />

        <div className="flex flex-col items-center gap-2">
          {isPinSet && !showResetConfirm && (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="text-xs text-primary font-semibold hover:underline px-4 py-1.5 cursor-pointer"
            >
              Forgot Terminal PIN?
            </button>
          )}

          {!isPinSet && setupStep === 'confirm' && (
            <button
              type="button"
              onClick={() => {
                setSetupStep('enter');
                setPin('');
                setConfirmPin('');
                setError('');
              }}
              className="text-xs text-muted hover:text-text font-medium px-4 py-1.5 cursor-pointer"
            >
              &larr; Start over
            </button>
          )}

          <button
            type="button"
            onClick={logOut}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-danger transition-colors px-4 py-1.5 cursor-pointer"
          >
            <LogOut size={13} />
            <span>Sign out of account</span>
          </button>
        </div>
      </div>

      {/* ── Reset confirmation dialog ── */}
      {showResetConfirm && (
        <Modal
          open={true}
          onClose={() => setShowResetConfirm(false)}
          title="Reset Terminal PIN"
          subtitle="Are you sure you want to remove this PIN?"
          maxWidth="sm"
        >
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-accent-amber border border-amber-200 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Your device PIN will be reset. All cloud data remains completely safe, and you will be prompted to set up a new PIN upon next sign in.
            </p>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  resetPin();
                  setPin('');
                  setConfirmPin('');
                  setSetupStep('enter');
                  setShowResetConfirm(false);
                }}
              >
                Reset PIN
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
