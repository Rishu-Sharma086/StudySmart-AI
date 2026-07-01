/**
 * In-memory database
 * Replace with a real backend (Firebase, Supabase, etc.) for production.
 */
export const DB = {
  users:         {},   // email → { name, email, password, initials, joined, stats }
  otps:          {},   // email → { code, expires, purpose }
  uploadedFiles: [],   // [{ id, name, size, type, content, url, status }]
  chatHistory:   [],   // [{ role, text }]
  quizResults:   [],   // [{ date, score, total, topic, pct }]
};
