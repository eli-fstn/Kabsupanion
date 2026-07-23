import type { Env } from "../types";

// Email delivery via Resend's HTTP API (Workers-native — just `fetch`, no SDK).
// Provider is isolated here so it can be swapped without touching route logic.
//
// Best-effort by design: password-reset must return a generic success to the
// caller regardless of send outcome (no account enumeration), so callers ignore
// the boolean for control flow and we log failures for observability instead.

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM = "KabsuPanion <onboarding@resend.dev>";

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
  env: Env
): Promise<boolean> {
  if (!env.RESEND_API_KEY) {
    // Not configured (e.g. local dev) — skip sending, don't crash the request.
    console.warn("RESEND_API_KEY not set; password reset email not sent.");
    return false;
  }

  const html =
    `<p>We received a request to reset your KabsuPanion password.</p>` +
    `<p><a href="${resetUrl}">Reset your password</a> (link expires in 30 minutes).</p>` +
    `<p>If you didn't request this, you can safely ignore this email.</p>`;

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM || DEFAULT_FROM,
        to,
        subject: "Reset your KabsuPanion password",
        html,
      }),
    });
    if (!res.ok) {
      console.error(`Resend send failed: ${res.status} ${await res.text()}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Resend send threw:", err instanceof Error ? err.message : err);
    return false;
  }
}
