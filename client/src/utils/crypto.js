// client/src/utils/crypto.js
export const cryptoUtils = {
  enc: new TextEncoder(),
  dec: new TextDecoder(),
  
  generateKey: async () => {
    const key = await window.crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]
    );
    return (await window.crypto.subtle.exportKey("jwk", key)).k;
  },

  importKey: async (k) => {
    return await window.crypto.subtle.importKey(
      "jwk", { k, kty: "oct", alg: "A256GCM", ext: true },
      { name: "AES-GCM" }, false, ["encrypt", "decrypt"]
    );
  },

  encryptData: async (text, keyStr) => {
    const key = await cryptoUtils.importKey(keyStr);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = cryptoUtils.enc.encode(text);
    const cipherBuffer = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
    
    const buffer = new Uint8Array(iv.byteLength + cipherBuffer.byteLength);
    buffer.set(iv);
    buffer.set(new Uint8Array(cipherBuffer), iv.byteLength);
    return btoa(String.fromCharCode(...buffer));
  },

  decryptData: async (base64Data, keyStr) => {
    const key = await cryptoUtils.importKey(keyStr);
    const binaryStr = atob(base64Data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
    
    const iv = bytes.slice(0, 12);
    const data = bytes.slice(12);
    const decryptedBuffer = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
    return cryptoUtils.dec.decode(decryptedBuffer);
  }
};