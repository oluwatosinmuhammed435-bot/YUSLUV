// ============================================
// Yusluv — Bottom Navigation
// ============================================

import { ShoppingCart, Package, Users, LayoutDashboard } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSales } from '../../context/SalesContext';

const tabs = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/pos', label: 'POS', icon: ShoppingCart },
  { path: '/inventory', label: 'Inventory', icon: Package },
  { path: '/debtors', label: 'Debtors', icon: Users },
] as const;

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItemCount } = useSales();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0f]/95 backdrop-blur-xl
      border-t border-white/5 safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`relative flex flex-col items-center justify-center gap-0.5 px-3 py-2
                rounded-xl transition-all duration-200 min-w-[60px]
                ${isActive
                  ? 'text-purple-400'
                  : 'text-white/35 hover:text-white/60'
                }`}
            >
              {/* Active glow */}
              {isActive && (
                <div className="absolute inset-0 bg-purple-500/10 rounded-xl" />
              )}

              <div className="relative">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                {/* Cart badge */}
                {path === '/pos' && cartItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-[16px]
                    bg-purple-500 text-white text-[9px] font-bold rounded-full
                    flex items-center justify-center px-1 shadow-lg shadow-purple-500/40">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </div>
              <span className={`text-[9px] font-medium ${isActive ? 'text-purple-400' : ''}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
