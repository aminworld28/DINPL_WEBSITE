// Stable per-browser ID so the same visitor can't like a post twice.
// Persisted in localStorage since this is a real deployed site (not a
// claude.ai artifact preview), so it survives across page loads.
export function getSessionId() {
  const KEY = 'dinpl_session_id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}
