import { DB } from "./db";

/** Generate a random 6-digit OTP string */
export function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Store an OTP for the given email (valid 5 minutes).
 * Returns the code so the UI can display it in demo mode.
 * In production, send this via an email service (SendGrid, Resend, etc.).
 */
export function sendOTP(email, purpose) {
  const code = generateOTP();
  DB.otps[email] = { code, expires: Date.now() + 5 * 60 * 1000, purpose };
  console.log(`[EduAI OTP] ${email} → ${code}`);
  return code;
}

/**
 * Verify a submitted OTP against the stored record.
 * Returns { ok: true } or { ok: false, msg: string }.
 */
export function verifyOTP(email, inputCode) {
  const rec = DB.otps[email];
  if (!rec)                           return { ok: false, msg: "No OTP found. Request a new one." };
  if (Date.now() > rec.expires)       return { ok: false, msg: "OTP expired. Request a new one." };
  if (rec.code !== inputCode.trim())  return { ok: false, msg: "Incorrect OTP. Try again." };
  delete DB.otps[email];
  return { ok: true };
}
