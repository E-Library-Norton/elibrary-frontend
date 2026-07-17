/**
 * AES-256-GCM cookie encryption
 * Uses COOKIE_SECRET (base64-encoded 32-byte key) from env.
 * Only runs server-side (Route Handlers / Server Actions).
 *
 * Format: base64(iv) : base64(authTag) : base64(ciphertext)
 */
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALG = "aes-256-gcm";

function getKey(): Buffer {
  const secret = process.env.COOKIE_SECRET;
  if (!secret) throw new Error("COOKIE_SECRET is not set");
  return Buffer.from(secret, "base64");
}

/** Encrypt a plaintext string → opaque cookie value */
export function encrypt(plaintext: string): string {
  const iv = randomBytes(12); // 96-bit IV recommended for GCM
  const key = getKey();
  const cipher = createCipheriv(ALG, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag(); // 16-byte GCM tag
  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
}

/** Decrypt a cookie value produced by encrypt() → original plaintext */
export function decrypt(ciphertext: string): string {
  const parts = ciphertext.split(":");
  if (parts.length !== 3) throw new Error("Invalid ciphertext format");
  const [ivB64, tagB64, dataB64] = parts;
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(tagB64, "base64");
  const data = Buffer.from(dataB64, "base64");
  const key = getKey();
  const decipher = createDecipheriv(ALG, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString(
    "utf8"
  );
}

/**
 * Safe decrypt — returns null instead of throwing if decryption fails.
 * Useful when migrating from unencrypted to encrypted cookies.
 */
export function safeDecrypt(value: string): string | null {
  try {
    return decrypt(value);
  } catch {
    return null;
  }
}
