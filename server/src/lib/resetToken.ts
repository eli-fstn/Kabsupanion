// Password-reset token helpers.
//
// The raw token is high-entropy random, so it needs no salt/PBKDF2 — a plain
// SHA-256 hash is enough to store (an attacker with DB read still can't reverse
// it, and can't use it without the raw value from the email). We store the hash,
// email the raw token, and compare by hashing the presented token.

const TOKEN_BYTES = 32; // 256 bits of entropy
export const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// A fresh random reset token (URL-safe).
export function generateResetToken(): string {
  return toBase64Url(crypto.getRandomValues(new Uint8Array(TOKEN_BYTES)));
}

// SHA-256 hash (hex) of a token — what we persist and look up by.
export async function hashResetToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return toHex(new Uint8Array(digest));
}
