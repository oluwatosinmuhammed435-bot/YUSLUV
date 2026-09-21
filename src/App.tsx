// ============================================
// Yusluv — App Root
// ============================================

import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import { SalesProvider } from './context/SalesContext';
import { DebtorProvider } from './context/DebtorContext';
import { ExpenseProvider } from './context/ExpenseContext';
import PinLockScreen from './components/auth/PinLockScreen';
import AppShell from './components/layout/AppShell';
import POSScreen from './components/pos/POSScreen';
import InventoryScreen from './components/inventory/InventoryScreen';
import DebtorsScreen from './components/debtors/DebtorsScreen';
import DashboardScreen from './components/dashboard/DashboardScreen';

function AuthGate() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent
          rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <PinLockScreen />;
  }

  return (
    <InventoryProvider>
      <SalesProvider>
        <DebtorProvider>
          <ExpenseProvider>
            <Routes>
              <Route element={<AppShell />}>
                <Route path="/" element={<POSScreen />} />
                <Route path="/inventory" element={<InventoryScreen />} />
                <Route path="/debtors" element={<DebtorsScreen />} />
                <Route path="/dashboard" element={<DashboardScreen />} />
              </Route>
            </Routes>
          </ExpenseProvider>
        </DebtorProvider>
      </SalesProvider>
    </InventoryProvider>
  );
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
