/**
 * Lightweight form protection helpers for public forms.
 *
 * Goals:
 *  - Honeypot field detection (bots fill hidden inputs).
 *  - Time-based check (bots typically submit instantly).
 *  - Email format + length validation.
 *  - Generic, calm, on-brand error copy (no internal details surfaced).
 *
 * NOTE: This is a frontend defence layer. Real spam protection still relies
 * on Supabase RLS, rate limits and admin moderation.
 */

export const HONEYPOT_FIELD_NAME = "company_website";

/** Visually hidden honeypot props — bots fill it, humans never see it. */
export const honeypotInputProps = {
  name: HONEYPOT_FIELD_NAME,
  type: "text",
  tabIndex: -1,
  autoComplete: "off",
  "aria-hidden": true as const,
  style: {
    position: "absolute" as const,
    left: "-10000px",
    top: "auto",
    width: "1px",
    height: "1px",
    overflow: "hidden",
    opacity: 0,
    pointerEvents: "none" as const,
  },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (trimmed.length < 5 || trimmed.length > 255) return false;
  return EMAIL_RE.test(trimmed);
}

export interface FormGuardOptions {
  /** Value of the honeypot input. If non-empty → likely bot. */
  honeypot?: string | null;
  /** Timestamp (ms) when the form first mounted. */
  startedAt?: number | null;
  /** Minimum acceptable submission delay in ms (default 1500). */
  minDelayMs?: number;
}

export interface FormGuardResult {
  ok: boolean;
  /** Internal reason — never shown to the user. */
  reason?: "honeypot" | "too_fast";
}

/**
 * Run honeypot + timing checks. Returns `{ ok: true }` on pass.
 * Callers should treat any failure as a silent success (no user-facing error)
 * to avoid signalling the protection mechanism to bots.
 */
export function checkFormGuard({
  honeypot,
  startedAt,
  minDelayMs = 1500,
}: FormGuardOptions): FormGuardResult {
  if (honeypot && honeypot.trim().length > 0) {
    return { ok: false, reason: "honeypot" };
  }
  if (startedAt && Date.now() - startedAt < minDelayMs) {
    return { ok: false, reason: "too_fast" };
  }
  return { ok: true };
}

/** Generic, calm error copy for public forms. */
export const FORM_ERRORS = {
  generic: "Something went quiet. Please try again in a moment.",
  invalidEmail: "Please enter a valid email address.",
  required: "Please complete the required fields.",
  duplicate: "This entry has already been received. Thank you.",
  tooLong: "One of the fields is longer than allowed.",
} as const;
