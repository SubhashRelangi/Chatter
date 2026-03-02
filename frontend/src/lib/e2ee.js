const KEY_ALGORITHM = { name: "ECDH", namedCurve: "P-256" };
const AES_ALGORITHM = { name: "AES-GCM", length: 256 };
const IV_LENGTH_BYTES = 12;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const storageKey = (userId) => `chatter:e2ee:${userId}`;

const ensureWebCrypto = () => {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto API is not available in this environment");
  }
};

const bytesToBase64 = (bytes) => {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

const base64ToBytes = (base64String) => {
  const binary = atob(base64String);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const parsePublicKey = (publicKey) => {
  if (!publicKey) {
    throw new Error("Missing peer encryption key");
  }

  if (typeof publicKey === "string") {
    return JSON.parse(publicKey);
  }

  return publicKey;
};

const importPrivateKey = async (privateJwk) => {
  ensureWebCrypto();
  return crypto.subtle.importKey("jwk", privateJwk, KEY_ALGORITHM, true, ["deriveKey"]);
};

const importPublicKey = async (publicJwk) => {
  ensureWebCrypto();
  return crypto.subtle.importKey("jwk", publicJwk, KEY_ALGORITHM, true, []);
};

const deriveConversationKey = async (myPrivateKey, peerPublicKey) => {
  ensureWebCrypto();
  return crypto.subtle.deriveKey(
    { name: "ECDH", public: peerPublicKey },
    myPrivateKey,
    AES_ALGORITHM,
    false,
    ["encrypt", "decrypt"]
  );
};

const readStoredKeyPair = (userId) => {
  const raw = localStorage.getItem(storageKey(userId));
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(storageKey(userId));
    return null;
  }
};

const writeStoredKeyPair = (userId, keyPair) => {
  localStorage.setItem(storageKey(userId), JSON.stringify(keyPair));
};

export const ensureUserKeyPair = async (userId) => {
  ensureWebCrypto();
  if (!userId) {
    throw new Error("Missing user ID for E2EE key generation");
  }

  const stored = readStoredKeyPair(userId);
  if (stored?.publicJwk && stored?.privateJwk) {
    return {
      publicKey: JSON.stringify(stored.publicJwk),
      publicJwk: stored.publicJwk,
      privateJwk: stored.privateJwk,
    };
  }

  const keyPair = await crypto.subtle.generateKey(KEY_ALGORITHM, true, ["deriveKey"]);
  const publicJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
  const privateJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);

  writeStoredKeyPair(userId, { publicJwk, privateJwk });

  return {
    publicKey: JSON.stringify(publicJwk),
    publicJwk,
    privateJwk,
  };
};

export const encryptTextForPeer = async ({ userId, peerPublicKey, plainText }) => {
  ensureWebCrypto();

  if (!plainText) {
    return { cipherText: "", iv: "" };
  }

  const { privateJwk, publicKey } = await ensureUserKeyPair(userId);
  const privateKey = await importPrivateKey(privateJwk);
  const peerKey = await importPublicKey(parsePublicKey(peerPublicKey));
  const conversationKey = await deriveConversationKey(privateKey, peerKey);

  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH_BYTES));
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    conversationKey,
    textEncoder.encode(plainText)
  );

  return {
    cipherText: bytesToBase64(new Uint8Array(encryptedBuffer)),
    iv: bytesToBase64(iv),
    senderPublicKey: publicKey,
  };
};

export const decryptTextFromPeer = async ({ userId, peerPublicKey, cipherText, iv }) => {
  ensureWebCrypto();

  if (!cipherText) {
    return "";
  }

  const { privateJwk } = await ensureUserKeyPair(userId);
  const privateKey = await importPrivateKey(privateJwk);
  const peerKey = await importPublicKey(parsePublicKey(peerPublicKey));
  const conversationKey = await deriveConversationKey(privateKey, peerKey);

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBytes(iv) },
    conversationKey,
    base64ToBytes(cipherText)
  );

  return textDecoder.decode(decryptedBuffer);
};
