// ============================================
// Yusluv — App Root
// ============================================

import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import { SalesProvider } from './context/SalesContext';
import { DebtorProvider } from './context/DebtorContext';
import { ExpenseProvider } from './context/ExpenseContext';
import LoginScreen from './components/auth/LoginScreen';
import PinLockScreen from './components/auth/PinLockScreen';
import AppShell from './components/layout/AppShell';
import POSScreen from './components/pos/POSScreen';
import InventoryScreen from './components/inventory/InventoryScreen';
import DebtorsScreen from './components/debtors/DebtorsScreen';
import DashboardScreen from './components/dashboard/DashboardScreen';

function AuthGate() {
  const { user, isFirebaseLoading, isPinSet, isPinUnlocked, isAuthenticated } = useAuth();

  // 1. Waiting for Firebase to resolve auth state
  if (isFirebaseLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent
            rounded-full animate-spin" />
          <p className="text-white/30 text-xs">Loading...</p>
        </div>
      </div>
    );
  }

  // 2. Not signed in to Firebase → show email/password login
  if (!user) {
    return <LoginScreen />;
  }

  // 3. Signed in but PIN lock is active → show PIN screen
  if (isPinSet && !isPinUnlocked) {
    return <PinLockScreen />;
  }

  // 4. First-time PIN setup (only if they chose PIN, isPinSet = false means we skip directly through)
  // PinLockScreen handles this case when isPinSet = false too — but since we auto-unlock on no PIN,
  // users go straight to the app unless they want to set one.

  // 5. Fully authenticated → show the app
  if (isAuthenticated) {
    return (
      <InventoryProvider>
        <SalesProvider>
          <DebtorProvider>
            <ExpenseProvider>
              <Routes>
                <Route element={<AppShell />}>
                  <Route path="/" element={<DashboardScreen />} />
                  <Route path="/pos" element={<POSScreen />} />
                  <Route path="/inventory" element={<InventoryScreen />} />
                  <Route path="/debtors" element={<DebtorsScreen />} />
                </Route>
              </Routes>
            </ExpenseProvider>
          </DebtorProvider>
        </SalesProvider>
      </InventoryProvider>
    );
  }

  // Fallback (shouldn't normally reach here)
  return <LoginScreen />;
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </HashRouter>
  );
}
