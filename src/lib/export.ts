// ============================================
// Yusluv — Data Export Utilities
// ============================================

import { exportAllData } from './db';
import { formatDate } from './utils';

/**
 * Export all app data as a JSON file download.
 */
export async function downloadJSON(): Promise<void> {
  const data = await exportAllData();
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `yusluv-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export inventory data as a CSV file download.
 */
export async function downloadInventoryCSV(): Promise<void> {
  const { products } = await exportAllData();
  const headers = ['Name', 'Category', 'Bulk Price', 'Piece Price', 'Pieces/Bulk', 'Stock (pieces)', 'Last Updated'];
  const rows = products.map((p) => [
    `"${p.name}"`,
    p.category,
    p.bulkPrice,
    p.piecePrice,
    p.piecesPerBulk,
    p.stockInPieces,
    formatDate(p.updatedAt),
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `yusluv-inventory-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import data from a JSON backup file.
 */
export function readJSONFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result as string));
      } catch {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Download a blank CSV template for bulk importing products.
 */
export function downloadCSVTemplate(): void {
  const headers = ['Product Name', 'Category', 'Bulk Price', 'Piece Price', 'Pieces per Bulk', 'Initial Stock', 'Low Stock Alert'];
  const sampleRow = ['"Indomie Super Pack"', 'Provisions', '5000', '150', '40', '120', '10'];
  const csv = [headers.join(','), sampleRow.join(',')].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'yusluv-bulk-import-template.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parse a CSV file and return raw row objects.
 */
export function parseCSVFile(file: File): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const rows = text
          .split('\n')
          .map((row) => {
            // Very simple CSV parser: split by comma but respect quotes
            const matches = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
            return matches ? matches.map((m) => m.replace(/^"|"$/g, '').trim()) : [];
          })
          .filter((row) => row.length > 0);
        // Remove header row
        if (rows.length > 0) rows.shift();
        resolve(rows);
      } catch {
        reject(new Error('Failed to parse CSV'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
