// ============================================
// Yusluv — App Shell Layout
// ============================================

import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Header />
      <main className="pb-20 pt-1">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
