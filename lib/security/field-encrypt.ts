import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

function getKey(): Buffer {
  const raw = process.env.FIELD_ENCRYPT_KEY;
  if (!raw) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FIELD_ENCRYPT_KEY must be set in production');
    }
    return Buffer.alloc(32, 'dev'); // dev fallback only
  }
  return Buffer.from(raw, 'hex');
}

export function encryptField(plain: string): string {
  const key = getKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

export function decryptField(stored: string): string {
  try {
    const key = getKey();
    const buf = Buffer.from(stored, 'base64');
    const iv = buf.subarray(0, 16);
    const tag = buf.subarray(16, 32);
    const enc = buf.subarray(32);
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
  } catch {
    return stored; // return raw if not encrypted (migration path)
  }
}
