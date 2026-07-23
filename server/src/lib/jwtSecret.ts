// Fail closed if JWT_SECRET is missing or weak. Workers has no real "boot", so
// this runs on first token issue/verify and is memoized per isolate. A weak
// secret makes every HS256 token forgeable, so we'd rather 500 than sign with it.

const MIN_SECRET_LENGTH = 32; // 256 bits if random; matches a base64url(32 bytes)

let validated = false;

export function assertStrongJwtSecret(secret: string | undefined): void {
  if (validated) return;
  if (typeof secret !== "string" || secret.length < MIN_SECRET_LENGTH) {
    // Not marked validated → keeps failing on every request until fixed.
    throw new Error(
      `JWT_SECRET is missing or too weak (need >= ${MIN_SECRET_LENGTH} characters).`
    );
  }
  validated = true;
}
