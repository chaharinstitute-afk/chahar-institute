/**
 * Thin wrapper around fetch for admin panel API calls.
 * If the server responds 401 (session missing/expired), redirects to the login
 * page with a callbackUrl and returns `null` — callers should check for `null`
 * and bail out immediately (no error message, no further state updates) since
 * the page is about to navigate away.
 */
export async function apiFetch(url: string, init?: RequestInit): Promise<Response | null> {
  const res = await fetch(url, init);

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      const callbackUrl = encodeURIComponent(window.location.pathname);
      window.location.href = `/admin/login?callbackUrl=${callbackUrl}`;
    }
    return null;
  }

  return res;
}
