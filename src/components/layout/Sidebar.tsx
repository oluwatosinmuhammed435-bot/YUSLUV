import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Receipt,
  Settings,
  HelpCircle,
  PhoneCall,
  LogOut,
  ChevronDown,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import { useSales } from '../../context/SalesContext';
import { useDebtors } from '../../context/DebtorContext';

interface SidebarProps {
  onCloseMobile?: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onOpenExpenses?: () => void;
}

export default function Sidebar({
  onCloseMobile,
  onOpenSettings,
  onOpenHelp,
  onOpenExpenses,
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logOut, user } = useAuth();
  const { getLowStockProducts } = useInventory();
  const { cartItemCount } = useSales();
  const { debtors } = useDebtors();

  const [productsGroupOpen, setProductsGroupOpen] = useState(true);

  const lowStockCount = getLowStockProducts().length;
  const activeDebtorsCount = debtors.filter((d) => d.totalDebt > 0).length;

  const handleNav = (path: string) => {
    navigate(path);
    if (onCloseMobile) onCloseMobile();
  };

  const navItems = [
    {
      label: 'Overview',
      path: '/',
      icon: LayoutDashboard,
    },
    {
      label: 'Point of Sale',
      path: '/pos',
      icon: ShoppingCart,
      badge: cartItemCount > 0 ? `${cartItemCount}` : undefined,
    },
    {
      label: 'Inventory',
      path: '/inventory',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} low` : undefined,
      badgeVariant: 'amber',
      hasSubmenu: true,
    },
    {
      label: 'Debtors',
      path: '/debtors',
      icon: Users,
      badge: activeDebtorsCount > 0 ? `${activeDebtorsCount}` : undefined,
    },
  ];

  return (
    <aside className="w-64 h-full bg-[#06382A] text-white flex flex-col justify-between p-4 select-none">
      {/* Top Header & Brand */}
      <div>
        <div className="flex items-center justify-between px-3 py-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center font-bold text-white shadow-xs">
              <span className="text-lg font-black tracking-tight text-white">Y</span>
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>Yusluv</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[11px] text-white/60 font-medium">Retail & Provisions</p>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold text-white/40 uppercase tracking-wider">
            Main Menu
          </div>

          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <div key={item.path} className="space-y-0.5">
                <button
                  onClick={() => handleNav(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 relative cursor-pointer group ${
                    isActive
                      ? 'bg-white/15 text-white font-semibold shadow-xs'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {/* Left white indicator bar */}
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-white rounded-r-full" />
                  )}

                  <div className="flex items-center gap-3 pl-1">
                    <item.icon
                      size={18}
                      className={isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}
                    />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          item.badgeVariant === 'amber'
                            ? 'bg-accent-amber text-slate-900'
                            : 'bg-white/20 text-white'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {item.hasSubmenu && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setProductsGroupOpen(!productsGroupOpen);
                        }}
                        className="p-1 hover:bg-white/10 rounded-md"
                      >
                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-200 ${
                            productsGroupOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </span>
                    )}
                  </div>
                </button>

                {/* Submenu for Products/Inventory */}
                {item.hasSubmenu && productsGroupOpen && (
                  <div className="pl-9 pr-2 py-1 space-y-1">
                    <button
                      onClick={() => handleNav('/inventory')}
                      className={`w-full text-left py-1.5 px-2 rounded-lg text-xs flex items-center gap-2 transition-colors cursor-pointer ${
                        location.pathname === '/inventory'
                          ? 'text-white font-semibold'
                          : 'text-white/50 hover:text-white'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                      <span>All Products</span>
                    </button>
                    <button
                      onClick={() => {
                        handleNav('/inventory');
                      }}
                      className="w-full text-left py-1.5 px-2 rounded-lg text-xs flex items-center gap-2 text-white/50 hover:text-white transition-colors cursor-pointer"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-amber" />
                      <span>Low Stock Items</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Quick Expense Shortcut */}
          <button
            onClick={() => {
              if (onOpenExpenses) onOpenExpenses();
              else handleNav('/');
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3 pl-1">
              <Receipt size={18} className="text-white/70 group-hover:text-white" />
              <span>Record Expense</span>
            </div>
            <span className="text-[10px] text-white/40 font-mono">+ Log</span>
          </button>
        </div>
      </div>

      {/* Bottom Pinned Section */}
      <div className="border-t border-white/10 pt-3 space-y-1">
        <button
          onClick={() => {
            onOpenSettings();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <Settings size={16} />
          <span>Settings & Backup</span>
        </button>

        <button
          onClick={() => {
            onOpenHelp();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <HelpCircle size={16} />
          <span>Help & Shortcuts</span>
        </button>

        <button
          onClick={() => {
            window.open('https://wa.me/2348000000000?text=Hello%20Yusluv%20Support', '_blank');
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <PhoneCall size={16} />
          <span>Contact Us</span>
        </button>

        {/* User Card & Logout */}
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user?.email ? user.email.slice(0, 2).toUpperCase() : 'ME'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">
                {user?.email?.split('@')[0] || 'Store Owner'}
              </p>
              <p className="text-[10px] text-white/50 truncate">Shop Admin</p>
            </div>
          </div>

          <button
            onClick={() => logOut()}
            className="p-1.5 rounded-lg text-white/40 hover:text-red-300 hover:bg-red-500/20 transition-colors cursor-pointer"
            title="Log Out"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
