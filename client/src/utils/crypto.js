import { xchacha20poly1305 } from '@noble/ciphers/chacha';
import { pbkdf2Async } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha256';

// 1. Generador de aleatoriedad nativo
function randomBytes(length) {
  return window.crypto.getRandomValues(new Uint8Array(length));
}

// 2. Función auxiliar para convertir Bytes a Base64 (Sin usar Buffer de Node.js)
function bytesToBase64(bytes) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  // Convertimos a Base64 y lo hacemos seguro para URL (reemplazando + y /)
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

const enc = new TextEncoder();
const dec = new TextDecoder();

export const cryptoUtils = {
  // ✅ CORREGIDO: Usamos bytesToBase64 en vez de Buffer
  generateKey: () => {
    const keyBytes = randomBytes(32); 
    return Promise.resolve(bytesToBase64(keyBytes));
  },

  // Derivación de clave (PBKDF2)
  deriveKey: async (password, salt) => {
    return await pbkdf2Async(sha256, password, salt, { c: 100000, dkLen: 32 });
  },

  // Encriptar (XChaCha20)
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

    // Aquí usamos btoa directamente, que es nativo
    let binary = '';
    for (let i = 0; i < combined.length; i++) binary += String.fromCharCode(combined[i]);
    return btoa(binary);
  },

  // Desencriptar
  decryptData: async (base64Data, password) => {
    try {
      const binaryStr = atob(base64Data);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);

      const salt = bytes.slice(0, 16);
      const nonce = bytes.slice(16, 40);
      const cipherText = bytes.slice(40);

      const key = await cryptoUtils.deriveKey(password, salt);

      const decrypted = xchacha20poly1305(key, nonce).decrypt(cipherText);
      return dec.decode(decrypted);
    } catch (e) {
      throw new Error('Clave incorrecta o datos corruptos');
    }
  }
};