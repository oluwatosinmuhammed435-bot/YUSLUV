import { useState } from 'react';
import { Menu, Search, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import SearchBar from '../ui/SearchBar';
import GlobalSearchModal from './GlobalSearchModal';
import NotificationsModal from './NotificationsModal';
import SettingsModal from './SettingsModal';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export default function Header({ onOpenMobileMenu }: HeaderProps) {
  const { user } = useAuth();
  const { getLowStockProducts } = useInventory();

  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const lowStockCount = getLowStockProducts().length;
  const merchantName = user?.email?.split('@')[0] || 'Merchant';

  return (
    <>
      <header className="sticky top-0 z-30 bg-card border-b border-border h-16 px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button + Desktop Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          {/* Hamburger Menu on Mobile */}
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-muted hover:text-text hover:bg-page-bg transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu size={22} />
          </button>

          {/* Desktop Search Input (Clicking opens search modal or allows inline search) */}
          <div className="hidden sm:block w-full cursor-pointer" onClick={() => setSearchOpen(true)}>
            <SearchBar
              placeholder="Search for a product, customer, sale..."
              readOnly
              className="cursor-pointer"
            />
          </div>
        </div>

        {/* Right Side: Search Icon (Mobile), Notifications Bell, Avatar & Merchant Name */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search Trigger on Mobile */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="sm:hidden p-2 rounded-xl text-muted hover:text-text hover:bg-page-bg transition-colors"
            aria-label="Search"
          >
            <Search size={20} />
          </button>

          {/* Notifications Bell with Alert Dot */}
          <button
            type="button"
            onClick={() => setNotificationsOpen(true)}
            className="relative p-2 rounded-xl text-muted hover:text-text hover:bg-page-bg transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {lowStockCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-accent-amber rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Merchant Profile & Settings Trigger */}
          <div
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-3 pl-2 sm:border-l sm:border-border cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-primary-tint border border-primary/20 text-primary font-bold text-xs flex items-center justify-center group-hover:ring-2 group-hover:ring-primary/20 transition-all">
              {merchantName.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-text group-hover:text-primary transition-colors capitalize">
                {merchantName}
              </p>
              <p className="text-[11px] text-muted">Admin</p>
            </div>
          </div>
        </div>
      </header>

      {/* Global Modals */}
      <GlobalSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <NotificationsModal open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
