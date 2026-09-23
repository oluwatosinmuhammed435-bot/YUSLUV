import { useState, useRef } from 'react';
import { Download, Upload, KeyRound, LogOut, FileSpreadsheet, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { downloadJSON, downloadInventoryCSV, readJSONFile } from '../../lib/export';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { user, logOut, changePin } = useAuth();
  const [tab, setTab] = useState<'general' | 'pin'>('general');
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = async () => {
    await downloadJSON();
  };

  const handleExportCSV = async () => {
    await downloadInventoryCSV();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      await readJSONFile(file);
      alert('Import from backup is currently disabled in cloud sync mode. Please add records via the app.');
    } catch {
      alert('Failed to import data. Please ensure the file is a valid Yusluv backup.');
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    if (oldPin.length !== 4 || newPin.length !== 4 || confirmNewPin.length !== 4) {
      setPinError('All PINs must be exactly 4 digits');
      return;
    }
    if (newPin !== confirmNewPin) {
      setPinError('New PINs do not match');
      return;
    }
    const success = await changePin(oldPin, newPin);
    if (success) {
      setPinSuccess(true);
      setOldPin('');
      setNewPin('');
      setConfirmNewPin('');
      setTimeout(() => {
        setPinSuccess(false);
        setTab('general');
      }, 1500);
    } else {
      setPinError('Incorrect old PIN. Please try again.');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tab === 'pin' ? 'Security & PIN' : 'Settings & Data Backup'}
      subtitle={
        tab === 'pin'
          ? 'Update the 4-digit quick lock PIN for this terminal.'
          : 'Export backups, manage inventory spreadsheets, and account settings.'
      }
      maxWidth="md"
    >
      {tab === 'general' ? (
        <div className="space-y-4">
          {/* Account info card */}
          <div className="p-3.5 bg-page-bg rounded-xl border border-border flex items-center justify-between">
            <div>
              <p className="text-xs text-muted">Signed In As</p>
              <p className="text-sm font-semibold text-text truncate">
                {user?.email || 'Logged in user'}
              </p>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary-tint text-primary border border-primary/20">
              Verified Merchant
            </span>
          </div>

          {/* Backup & Export options */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">
              Data Management & Backups
            </p>

            <button
              onClick={handleExportJSON}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-border hover:border-primary/40 hover:bg-page-bg transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-tint text-primary flex items-center justify-center">
                  <Download size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-text">Export Full Backup (JSON)</div>
                  <div className="text-xs text-muted">Complete snapshot of products, sales & debtors</div>
                </div>
              </div>
            </button>

            <button
              onClick={handleExportCSV}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-border hover:border-primary/40 hover:bg-page-bg transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-success flex items-center justify-center">
                  <FileSpreadsheet size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-text">Export Inventory (CSV)</div>
                  <div className="text-xs text-muted">Spreadsheet of products, stock and prices</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => fileRef.current?.click()}
              disabled={importing}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-border hover:border-primary/40 hover:bg-page-bg transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Upload size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-text">Import JSON Backup</div>
                  <div className="text-xs text-muted">Restore data from a saved backup file</div>
                </div>
              </div>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
          </div>

          {/* Security & Terminal */}
          <div className="pt-2 border-t border-border space-y-2">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">
              Terminal Security
            </p>

            <button
              onClick={() => setTab('pin')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-border hover:border-primary/40 hover:bg-page-bg transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-50 text-accent-violet flex items-center justify-center">
                  <KeyRound size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-text">Change Quick PIN</div>
                  <div className="text-xs text-muted">Update your 4-digit device unlock code</div>
                </div>
              </div>
            </button>
          </div>

          {/* Sign Out */}
          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full text-danger border-red-200 hover:bg-red-50 hover:border-red-300"
              icon={<LogOut size={16} />}
              onClick={() => {
                onClose();
                logOut();
              }}
            >
              Sign Out of Account
            </Button>
          </div>
        </div>
      ) : (
        /* Change PIN subview */
        <form onSubmit={handleChangePin} className="space-y-4">
          {pinSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-success rounded-xl flex items-center gap-2 text-xs font-semibold">
              <Check size={16} /> PIN changed successfully!
            </div>
          )}

          {pinError && (
            <div className="p-3 bg-red-50 border border-red-200 text-danger rounded-xl text-xs font-semibold">
              {pinError}
            </div>
          )}

          <Input
            label="Current 4-Digit PIN"
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={oldPin}
            onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter current PIN"
            required
          />

          <Input
            label="New 4-Digit PIN"
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={newPin}
            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter new 4-digit PIN"
            required
          />

          <Input
            label="Confirm New PIN"
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={confirmNewPin}
            onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, ''))}
            placeholder="Re-enter new 4-digit PIN"
            required
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setTab('general')}
            >
              Back
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Save New PIN
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
