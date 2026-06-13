// Password hashing using the Web Crypto API (PBKDF2 + SHA-256).
//
// Why not bcrypt/argon2? Those rely on native Node bindings that do not run on
// the Cloudflare Workers runtime. PBKDF2 via SubtleCrypto is built into the
// platform (`crypto.subtle`), so it works with no dependency and no nodejs_compat.

const ITERATIONS = 100_000;
const KEY_LENGTH_BITS = 256;
const SALT_BYTES = 16;
const SCHEME = "pbkdf2";

const encoder = new TextEncoder();

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveBits(
  password: string,
  salt: Uint8Array,
  iterations: number
): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    keyMaterial,
    KEY_LENGTH_BITS
  );
  return new Uint8Array(bits);
}

// Constant-time comparison to avoid leaking match length via timing.
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

// Returns a self-describing string: `pbkdf2$<iterations>$<saltB64>$<hashB64>`.
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await deriveBits(password, salt, ITERATIONS);
  return `${SCHEME}$${ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`;
}

export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const [scheme, iterStr, saltB64, hashB64] = stored.split("$");
  if (scheme !== SCHEME) return false;

  const iterations = Number.parseInt(iterStr, 10);
  if (!Number.isFinite(iterations)) return false;

  const expected = fromBase64(hashB64);
  const actual = await deriveBits(password, fromBase64(saltB64), iterations);
  return timingSafeEqual(actual, expected);
}
