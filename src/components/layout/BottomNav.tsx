import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Package,
  Users,
  LayoutDashboard,
  MoreHorizontal,
  Settings,
  Receipt,
  LogOut,
} from 'lucide-react';
import { useSales } from '../../context/SalesContext';
import { useDebtors } from '../../context/DebtorContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../ui/Modal';
import SettingsModal from './SettingsModal';

interface BottomNavProps {
  onOpenExpenses?: () => void;
}

export default function BottomNav({ onOpenExpenses }: BottomNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItemCount } = useSales();
  const { debtors } = useDebtors();
  const { logOut } = useAuth();

  const [moreOpen, setMoreOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const activeDebtorsCount = debtors.filter((d) => d.totalDebt > 0).length;

  const tabs = [
    {
      id: 'pos',
      label: 'POS',
      path: '/pos',
      icon: ShoppingCart,
      badge: cartItemCount > 0 ? (cartItemCount > 99 ? '99+' : `${cartItemCount}`) : null,
    },
    {
      id: 'products',
      label: 'Products',
      path: '/inventory',
      icon: Package,
    },
    {
      id: 'debtors',
      label: 'Debtors',
      path: '/debtors',
      icon: Users,
      badge: activeDebtorsCount > 0 ? `${activeDebtorsCount}` : null,
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
    },
  ];

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border safe-bottom shadow-lg">
        <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => navigate(tab.path)}
                className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1.5 px-2 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer ${
                  isActive ? 'text-primary font-semibold' : 'text-muted hover:text-text'
                }`}
              >
                <div className="relative">
                  <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
                  {tab.badge && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
              </button>
            );
          })}

          {/* 5th Tab: More */}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1.5 px-2 rounded-xl text-muted hover:text-text transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <MoreHorizontal size={20} strokeWidth={1.8} />
            <span className="text-[10px] tracking-tight mt-0.5">More</span>
          </button>
        </div>
      </nav>

      {/* More Options BottomSheet */}
      <Modal
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        variant="bottomSheet"
        title="More Actions & Tools"
        subtitle="Quick access to expenses, backup, and store settings"
      >
        <div className="space-y-2 py-2">
          <button
            onClick={() => {
              setMoreOpen(false);
              if (onOpenExpenses) onOpenExpenses();
              else navigate('/');
            }}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-border hover:bg-page-bg text-left transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-tint text-primary flex items-center justify-center">
              <Receipt size={20} />
            </div>
            <div>
              <div className="text-sm font-semibold text-text">Record Expense</div>
              <div className="text-xs text-muted">Log shop bills, transport, and restocking costs</div>
            </div>
          </button>

          <button
            onClick={() => {
              setMoreOpen(false);
              setSettingsOpen(true);
            }}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-border hover:bg-page-bg text-left transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-page-bg text-text flex items-center justify-center">
              <Settings size={20} />
            </div>
            <div>
              <div className="text-sm font-semibold text-text">Settings & Backup</div>
              <div className="text-xs text-muted">Export data, manage PIN, and spreadsheet files</div>
            </div>
          </button>

          <button
            onClick={() => {
              setMoreOpen(false);
              logOut();
            }}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-red-200 text-danger hover:bg-red-50 text-left transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-red-100 text-danger flex items-center justify-center">
              <LogOut size={20} />
            </div>
            <div>
              <div className="text-sm font-semibold text-danger">Sign Out</div>
              <div className="text-xs text-danger/70">Lock and sign out of terminal</div>
            </div>
          </button>
        </div>
      </Modal>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
