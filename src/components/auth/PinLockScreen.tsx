// ============================================
// Yusluv — PIN Lock Screen (Secondary / Local Lock)
// ============================================

import { useState, useCallback } from 'react';
import { Shield, Lock, LogOut } from 'lucide-react';
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
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [shake, setShake] = useState(false);
  const [localError, setLocalError] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  const handleDigit = useCallback(
    (digit: string) => {
      clearPinError();
      setLocalError('');
      if (step === 'confirm') {
        if (confirmPin.length < 4) setConfirmPin((p) => p + digit);
      } else {
        if (pin.length < 4) setPin((p) => p + digit);
      }
    },
    [pin, confirmPin, step, clearPinError]
  );

  const handleDelete = useCallback(() => {
    if (step === 'confirm') {
      setConfirmPin((p) => p.slice(0, -1));
    } else {
      setPin((p) => p.slice(0, -1));
    }
  }, [step]);

  const handleConfirm = useCallback(async () => {
    if (!isPinSet) {
      // Setup flow
      if (step === 'enter') {
        if (pin.length !== 4) {
          setLocalError('Enter 4 digits');
          triggerShake();
          return;
        }
        setStep('confirm');
      } else {
        if (confirmPin.length !== 4) {
          setLocalError('Enter 4 digits');
          triggerShake();
          return;
        }
        if (pin !== confirmPin) {
          setLocalError('PINs do not match. Try again.');
          setConfirmPin('');
          triggerShake();
          return;
        }
        await setupPin(pin);
      }
    } else {
      // Unlock flow
      if (pin.length !== 4) {
        setLocalError('Enter 4 digits');
        triggerShake();
        return;
      }
      const ok = await unlockWithPin(pin);
      if (!ok) {
        setPin('');
        triggerShake();
      }
    }
  }, [isPinSet, step, pin, confirmPin, setupPin, unlockWithPin, triggerShake]);

  const currentPin = step === 'confirm' ? confirmPin : pin;
  const displayError = localError || pinError;

  const title = !isPinSet
    ? step === 'enter'
      ? 'Create Your PIN'
      : 'Confirm Your PIN'
    : 'Enter PIN to Unlock';

  const subtitle = !isPinSet
    ? step === 'enter'
      ? 'Set a 4-digit PIN to protect your data'
      : 'Re-enter your PIN to confirm'
    : 'Your business data is protected';

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-6">

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px]
          bg-purple-900/20 rounded-full blur-[120px]" />
      </div>

      {/* Brand */}
      <div className="mb-8 text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600 to-purple-800
          flex items-center justify-center mx-auto mb-4 shadow-xl shadow-purple-600/30">
          {isPinSet ? <Lock size={36} className="text-white" /> : <Shield size={36} className="text-white" />}
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-200
          bg-clip-text text-transparent">
          Yusluv
        </h1>
        <p className="text-white/40 text-xs mt-1 tracking-widest uppercase">Retail Manager</p>
      </div>

      {/* Logged in as */}
      {user?.email && (
        <p className="text-white/30 text-xs mb-6 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
          {user.email}
        </p>
      )}

      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-white text-lg font-semibold">{title}</h2>
        <p className="text-white/40 text-sm mt-1">{subtitle}</p>
      </div>

      {/* PIN Dots */}
      <div className={`flex gap-4 mb-6 ${shake ? 'animate-shake' : ''}`}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all duration-200 ${
              i < currentPin.length
                ? 'bg-purple-500 shadow-lg shadow-purple-500/50 scale-110'
                : 'bg-white/10 border border-white/20'
            }`}
          />
        ))}
      </div>

      {/* Error */}
      {displayError && (
        <p className="text-red-400 text-sm mb-4 animate-fade-in">{displayError}</p>
      )}

      {/* Pin Pad */}
      <PinPad
        onDigit={handleDigit}
        onDelete={handleDelete}
        onConfirm={handleConfirm}
      />

      {/* Back button for confirm step */}
      {step === 'confirm' && !isPinSet && (
        <button
          onClick={() => {
            setStep('enter');
            setConfirmPin('');
            setPin('');
          }}
          className="mt-6 text-white/40 text-sm hover:text-white/60 transition-colors"
        >
          ← Go back
        </button>
      )}

      {/* Forgot PIN button (only on unlock screen) */}
      {isPinSet && !showResetConfirm && (
        <button
          onClick={() => setShowResetConfirm(true)}
          className="mt-8 text-white/25 text-xs hover:text-white/50 transition-colors"
        >
          Forgot PIN?
        </button>
      )}

      {/* Reset confirmation dialog */}
      {showResetConfirm && (
        <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-4
          max-w-[280px] w-full animate-fade-in">
          <p className="text-amber-400 text-sm font-medium mb-1">⚠️ Reset your PIN?</p>
          <p className="text-white/40 text-xs mb-4">
            This will clear your PIN. Your cloud data will remain safe.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowResetConfirm(false)}
              className="flex-1 py-2.5 rounded-xl bg-white/5 text-white/50 text-sm
                hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                resetPin();
                setPin('');
                setShowResetConfirm(false);
              }}
              className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-sm
                font-semibold hover:bg-purple-500 transition-colors shadow-lg
                shadow-purple-600/20"
            >
              Reset PIN
            </button>
          </div>
        </div>
      )}

      {/* Sign out link at bottom */}
      <button
        onClick={logOut}
        className="mt-10 flex items-center gap-1.5 text-white/20 text-xs
          hover:text-white/50 transition-colors"
      >
        <LogOut size={12} />
        Sign out of this account
      </button>
    </div>
  );
}
