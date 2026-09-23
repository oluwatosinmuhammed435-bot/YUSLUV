import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';
import SettingsModal from './SettingsModal';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import ExpenseForm from '../dashboard/ExpenseForm';

export default function AppShell() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);

  return (
    <div className="min-h-screen bg-page-bg text-text flex flex-col lg:flex-row antialiased">
      {/* Desktop Inset Sidebar */}
      <div className="hidden lg:block h-screen sticky top-0 p-3 shrink-0">
        <div className="h-full rounded-2xl overflow-hidden shadow-lg border border-border/20">
          <Sidebar
            onOpenSettings={() => setSettingsOpen(true)}
            onOpenHelp={() => setHelpOpen(true)}
            onOpenExpenses={() => setExpenseOpen(true)}
          />
        </div>
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer container */}
          <div className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl animate-fade-in">
            <Sidebar
              onCloseMobile={() => setMobileSidebarOpen(false)}
              onOpenSettings={() => setSettingsOpen(true)}
              onOpenHelp={() => setHelpOpen(true)}
              onOpenExpenses={() => setExpenseOpen(true)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* White Top Bar */}
        <Header onOpenMobileMenu={() => setMobileSidebarOpen(true)} />

        {/* Content Outlet */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Tab Navigation */}
      <BottomNav onOpenExpenses={() => setExpenseOpen(true)} />

      {/* Global Modals */}
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Expense Modal (Global Trigger) */}
      {expenseOpen && <ExpenseForm onClose={() => setExpenseOpen(false)} />}

      {/* Help & Shortcuts Modal */}
      <Modal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="Yusluv Merchant Help & Shortcuts"
        subtitle="Quick reference guide for daily shop management"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-page-bg rounded-xl border border-border space-y-1.5">
            <h4 className="font-semibold text-text text-sm">Dual Piece / Bulk Selling</h4>
            <p className="text-muted">
              In POS, click &ldquo;Piece&rdquo; to sell single items or &ldquo;Bulk&rdquo; to sell full cartons/packs. The app automatically calculates the correct pricing and deducts the appropriate number of pieces from inventory.
            </p>
          </div>

          <div className="p-3 bg-page-bg rounded-xl border border-border space-y-1.5">
            <h4 className="font-semibold text-text text-sm">Customer Debt Reminders</h4>
            <p className="text-muted">
              Open the Debtors tab, select any customer with an outstanding balance, and click &ldquo;WhatsApp Reminder&rdquo;. It pre-formats an itemized bill and opens WhatsApp directly.
            </p>
          </div>

          <div className="p-3 bg-page-bg rounded-xl border border-border space-y-1.5">
            <h4 className="font-semibold text-text text-sm">Offline Protection</h4>
            <p className="text-muted">
              Yusluv operates offline with Firestore and IndexedDB local caches. When internet reconnects, all transactions sync automatically to the cloud.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="primary" onClick={() => setHelpOpen(false)}>
              Got It
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
