// encryptionUtils.js
import * as SecureStore from 'expo-secure-store';
console.log('SecureStore:', SecureStore);
const KEY_NAME = 'encryption_key';

// Generate a random 32-byte key as hex string
function generateKey() {
  const array = new Uint8Array(32);
  if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(array);
  } else if (global.crypto && global.crypto.getRandomValues) {
    global.crypto.getRandomValues(array);
  } else {
    // Fallback: not as strong
    for (let i = 0; i < 32; i++) array[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function getEncryptionKey() {
  let key = await SecureStore.getItemAsync(KEY_NAME);
  if (!key) {
    key = generateKey();
    await SecureStore.setItemAsync(KEY_NAME, key);
  }
  return key;
}
