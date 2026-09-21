// ============================================
// Yusluv — PIN Hashing with Web Crypto API
// ============================================

const SALT = 'yusluv-pin-salt-v1';

export async function hashPin(pin: string): Promise<string> {
  // If Web Crypto is available (HTTPS or localhost)
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(SALT + pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback for non-secure contexts (e.g., testing on mobile via local IP)
  // This is a simple bitwise hash just to obscure the PIN locally when Web Crypto is blocked.
  let hash = 0;
  const str = SALT + pin;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return 'fallback_' + Math.abs(hash).toString(16);
}

export async function verifyPin(pin: string, storedHash: string): Promise<boolean> {
  const hash = await hashPin(pin);
  return hash === storedHash;
}
