import { xchacha20poly1305 } from '@noble/ciphers/chacha';
import { pbkdf2Async } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha256';
import { randomBytes } from '@noble/ciphers/webcrypto';

// Utilidades de codificación texto <-> bytes
const enc = new TextEncoder();
const dec = new TextDecoder();

export const cryptoUtils = {
  // 1. Generar una clave aleatoria (semilla) para la URL
  generateKey: () => {
    const keyBytes = randomBytes(32); // 256 bits de entropía
    return Promise.resolve(Buffer.from(keyBytes).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ''));
  },

  // 2. Derivar la clave real usando PBKDF2 (Hardening)
  // Esto evita que ataques de fuerza bruta sean fáciles si alguien roba la URL
  deriveKey: async (password, salt) => {
    return await pbkdf2Async(sha256, password, salt, { c: 100000, dkLen: 32 });
  },

  // 3. Encriptar con XChaCha20-Poly1305
  encryptData: async (text, password) => {
    // Generamos un Salt aleatorio para PBKDF2
    const salt = randomBytes(16);
    // Derivamos la clave fuerte
    const key = await cryptoUtils.deriveKey(password, salt);
    // Generamos el Nonce extendido (24 bytes = 192 bits) -> LA JOYA DE LA CORONA
    const nonce = randomBytes(24);
    
    // Ciframos
    const contentBytes = enc.encode(text);
    const cipherText = xchacha20poly1305(key, nonce).encrypt(contentBytes);

    // Empaquetamos todo junto: Salt + Nonce + CipherText
    // Formato: base64(salt + nonce + ciphertext)
    const combined = new Uint8Array(salt.length + nonce.length + cipherText.length);
    combined.set(salt);
    combined.set(nonce, salt.length);
    combined.set(cipherText, salt.length + nonce.length);

    return btoa(String.fromCharCode(...combined));
  },

  // 4. Desencriptar
  decryptData: async (base64Data, password) => {
    try {
      const binaryStr = atob(base64Data);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);

      // Extraemos las partes
      const salt = bytes.slice(0, 16);
      const nonce = bytes.slice(16, 40); // 16 + 24 = 40
      const cipherText = bytes.slice(40);

      // Regeneramos la clave con el mismo Salt
      const key = await cryptoUtils.deriveKey(password, salt);

      // Intentamos descifrar
      const decrypted = xchacha20poly1305(key, nonce).decrypt(cipherText);
      return dec.decode(decrypted);
    } catch (e) {
      throw new Error('Clave incorrecta o datos corruptos');
    }
  }
};