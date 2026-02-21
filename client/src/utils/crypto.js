import { xchacha20poly1305 } from '@noble/ciphers/chacha';
import { pbkdf2Async } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha256';

// 1. Generador de aleatoriedad nativo del navegador
function randomBytes(length) {
  return window.crypto.getRandomValues(new Uint8Array(length));
}

// 2. Conversión segura a Base64 para URLs (Sustituye + y / y maneja el padding)
function bytesToBase64(bytes) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// 3. Reversión de Base64 con FIX de Padding (Solo una versión, la buena)
function base64ToBytes(base64) {
  let normalized = base64.replace(/-/g, '+').replace(/_/g, '/');
  
  // Recomponer el padding para que atob() no falle
  while (normalized.length % 4 !== 0) {
    normalized += '=';
  }

  const binaryStr = atob(normalized);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes;
}

const enc = new TextEncoder();
const dec = new TextDecoder();

export const cryptoUtils = {
  // Genera la clave maestra para el link (#hash)
  generateKey: () => {
    const keyBytes = randomBytes(32); 
    return Promise.resolve(bytesToBase64(keyBytes));
  },

  // Derivación de clave con PBKDF2
  deriveKey: async (password, salt) => {
    return await pbkdf2Async(sha256, password, salt, { c: 100000, dkLen: 32 });
  },

  // Encriptación XChaCha20-Poly1305
  encryptData: async (text, password) => {
    const salt = randomBytes(16);
    const key = await cryptoUtils.deriveKey(password, salt);
    const nonce = randomBytes(24); 
    
    const contentBytes = enc.encode(text);
    const cipherText = xchacha20poly1305(key, nonce).encrypt(contentBytes);

    const combined = new Uint8Array(salt.length + nonce.length + cipherText.length);
    combined.set(salt);
    combined.set(nonce, salt.length);
    combined.set(cipherText, salt.length + nonce.length);

    return bytesToBase64(combined);
  },

  // Desencriptación con validación
  decryptData: async (base64Data, password) => {
    try {
      const bytes = base64ToBytes(base64Data);

      const salt = bytes.slice(0, 16);
      const nonce = bytes.slice(16, 40);
      const cipherText = bytes.slice(40);

      const key = await cryptoUtils.deriveKey(password, salt);

      const decrypted = xchacha20poly1305(key, nonce).decrypt(cipherText);
      return dec.decode(decrypted);
    } catch (e) {
      console.error("Error descifrando:", e);
      throw new Error('Clave incorrecta o datos corruptos');
    }
  }
};