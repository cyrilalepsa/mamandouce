/**
 * Garde-fous : une 200 HTML (SPA fallback) ne doit jamais devenir un "user".
 */

export function looksLikeHtml(value) {
  if (typeof value !== "string") return false;
  const s = value.trim().slice(0, 96).toLowerCase();
  return (
    s.startsWith("<!doctype") ||
    s.startsWith("<html") ||
    s.includes("<head>") ||
    s.includes("<title>")
  );
}

export function headerContentType(headers) {
  if (!headers || typeof headers !== "object") return "";
  return String(headers["content-type"] || headers["Content-Type"] || "");
}

export function isHtmlContentType(value) {
  return String(value || "").toLowerCase().includes("text/html");
}

export function isHtmlApiResponse(response) {
  if (!response) return false;
  if (isHtmlContentType(headerContentType(response.headers))) return true;
  return looksLikeHtml(response.data);
}

export function assertNotHtmlApiPayload(value, context = "api") {
  if (looksLikeHtml(value)) {
    const err = new Error(
      `${context}: réponse HTML reçue à la place du JSON API. Le domaine sert le SPA au lieu de FastAPI.`,
    );
    err.code = "API_HTML_FALLBACK";
    throw err;
  }
  return value;
}

/** Payload utilisateur / token : objet avec email, jamais une page HTML. */
export function sanitizeAuthPayload(raw) {
  if (raw == null) return null;
  assertNotHtmlApiPayload(raw, "auth");
  if (typeof raw !== "object") return null;
  return raw;
}
