// ============================================
// Yusluv — Header Component
// ============================================

import { useState, useRef } from 'react';
import { Settings, Download, Upload, LogOut, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { downloadJSON, downloadInventoryCSV, readJSONFile } from '../../lib/export';
import { importAllData } from '../../lib/db';

export default function Header() {
  const { logout, changePin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showChangePin, setShowChangePin] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [pinError, setPinError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = async () => {
    await downloadJSON();
    setMenuOpen(false);
  };

  const handleExportCSV = async () => {
    await downloadInventoryCSV();
    setMenuOpen(false);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const data = await readJSONFile(file);
      await importAllData(data as Parameters<typeof importAllData>[0]);
      window.location.reload();
    } catch {
      alert('Failed to import data. Make sure the file is a valid Yusluv backup.');
    } finally {
      setImporting(false);
      setMenuOpen(false);
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    if (oldPin.length !== 4 || newPin.length !== 4 || confirmNewPin.length !== 4) {
      setPinError('PINs must be exactly 4 digits');
      return;
    }
    if (newPin !== confirmNewPin) {
      setPinError('New PINs do not match');
      return;
    }
    const success = await changePin(oldPin, newPin);
    if (success) {
      setShowChangePin(false);
      setOldPin('');
      setNewPin('');
      setConfirmNewPin('');
      alert('PIN changed successfully!');
    } else {
      setPinError('Incorrect old PIN');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center justify-between px-4 h-14">
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-purple-200
          bg-clip-text text-transparent tracking-tight">
          Yusluv
        </h1>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center
            justify-center transition-all duration-150 active:scale-95"
        >
          {menuOpen ? <X size={18} className="text-white/60" /> : <Settings size={18} className="text-white/60" />}
        </button>
      </div>

      {/* Dropdown */}
      {menuOpen && (
        <div className="absolute right-4 top-14 w-56 bg-[#161622] border border-white/10
          rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-fade-in z-50">
          <button
            onClick={handleExportJSON}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/80
              hover:bg-white/5 transition-colors"
          >
            <Download size={16} className="text-purple-400" />
            Export Backup (JSON)
          </button>
          <button
            onClick={handleExportCSV}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/80
              hover:bg-white/5 transition-colors"
          >
            <Download size={16} className="text-purple-400" />
            Export Inventory (CSV)
          </button>
          <div className="border-t border-white/5" />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/80
              hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <Upload size={16} className="text-blue-400" />
            {importing ? 'Importing...' : 'Import Backup'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
          <div className="border-t border-white/5" />
          <button
            onClick={() => {
              setShowChangePin(true);
              setMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/80
              hover:bg-white/5 transition-colors"
          >
            <Settings size={16} className="text-white/50" />
            Change PIN
          </button>
          <div className="border-t border-white/5" />
          <button
            onClick={() => {
              logout();
              setMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400
              hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={16} />
            Lock App
          </button>
        </div>
      )}

      {/* Overlay to close menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      </header>

      {/* Change PIN Modal */}
      {showChangePin && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 pt-24 sm:pt-4 overflow-y-auto">
          <div className="bg-[#161622] border border-white/10 rounded-2xl p-5 w-full max-w-sm shadow-2xl my-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Change PIN</h3>
              <button onClick={() => setShowChangePin(false)} className="text-white/50 hover:text-white">
                <X size={20} />
              </button>
            </div>
            {pinError && <p className="text-red-400 text-sm mb-3">{pinError}</p>}
            <form onSubmit={handleChangePin} className="space-y-4">
              <div>
                <label className="block text-sm text-white/50 mb-1">Old PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white
                    focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                  placeholder="Enter current 4-digit PIN"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-white/50 mb-1">New PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white
                    focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                  placeholder="Enter new 4-digit PIN"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-white/50 mb-1">Confirm New PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={confirmNewPin}
                  onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white
                    focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                  placeholder="Re-enter new 4-digit PIN"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full h-12 bg-purple-600 hover:bg-purple-500 text-white font-semibold
                  rounded-xl transition-colors mt-2"
              >
                Update PIN
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
