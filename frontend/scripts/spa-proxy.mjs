#!/usr/bin/env node
/**
 * Serveur SPA Railway : fichiers statiques + fallback index.html,
 * SAUF /api (et /health) qui sont proxifiés vers FastAPI.
 *
 * Cloudflare 502/520 (« invalid or incomplete response ») apparaît si
 * l'origine ferme la connexion ou recopie des en-têtes hop-by-hop /
 * `cdn-loop`. Ce proxy bufferise /api et ne renvoie que des réponses
 * HTTP/1.1 complètes (content-length).
 *
 * Runtime (service frontend Railway, PAS VITE_*) :
 *   API_URL | BACKEND_URL | MAMANDOUCE_API_URL  = origine FastAPI MamanDouce
 *   (ex. https://<service>.up.railway.app) — jamais api.neriacorp.com (N2)
 *   et jamais le domaine SPA ni l'URL publique de CE service (boucle).
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const N2_CORE_API_HOST = "api.neriacorp.com";
export const PROXY_STATUS_PATH = "/__mamandouce/proxy-status";
export const STANDALONE_API_GATE = "/__mamandouce/api";
const MAX_API_BODY_BYTES = 2 * 1024 * 1024;
const UPSTREAM_TIMEOUT_MS = 12000;

export const SPA_LOOP_HOSTS = new Set([
  "mamandouce.neriacorp.com",
  "www.mamandouce.neriacorp.com",
  "mamandouce.app",
  "www.mamandouce.app",
]);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".map": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

const DROP_REQUEST_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
  "accept-encoding",
  "cdn-loop",
  "cf-ray",
  "cf-connecting-ip",
  "cf-ipcountry",
  "cf-visitor",
  "cf-ew-via",
  "cf-warp-tag-id",
  "cf-pseudo-ipv4",
  "true-client-ip",
  "x-forwarded-for",
  "x-forwarded-proto",
  "x-forwarded-host",
  "forwarded",
]);

const PASS_RESPONSE_HEADERS = new Set([
  "content-type",
  "cache-control",
  "retry-after",
  "www-authenticate",
  "x-tenant",
  "x-tenant-kind",
  "x-neriacorp-publication-id",
]);

export function pathnameOf(url) {
  const raw = String(url || "/");
  const noHash = raw.split("#")[0];
  const noQuery = noHash.split("?")[0];
  try {
    return decodeURIComponent(noQuery || "/");
  } catch {
    return noQuery || "/";
  }
}

export function isApiPath(urlPath) {
  const p = pathnameOf(urlPath);
  return (
    p === "/api" ||
    p.startsWith("/api/") ||
    p === STANDALONE_API_GATE ||
    p.startsWith(`${STANDALONE_API_GATE}/`) ||
    p === "/health" ||
    p.startsWith("/health/")
  );
}

/** `/__mamandouce/api/v1/auth/login` → `/api/v1/auth/login` for FastAPI. */
export function upstreamRequestUrl(reqUrl) {
  const raw = String(reqUrl || "/");
  const queryIndex = raw.indexOf("?");
  const query = queryIndex >= 0 ? raw.slice(queryIndex) : "";
  const p = pathnameOf(raw);
  if (p === STANDALONE_API_GATE || p.startsWith(`${STANDALONE_API_GATE}/`)) {
    const rest = p.slice(STANDALONE_API_GATE.length);
    return `/api${rest}${query}`;
  }
  return `${p}${query}` || "/";
}

export function isProxyStatusPath(urlPath) {
  return pathnameOf(urlPath) === PROXY_STATUS_PATH;
}

export function hostnameOf(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  try {
    const withProto = raw.includes("://") ? raw : `https://${raw}`;
    return new URL(withProto).hostname.toLowerCase();
  } catch {
    return raw.split("/")[0].split(":")[0];
  }
}

export function isBlockedApiHost(hostname) {
  const host = hostnameOf(hostname);
  if (!host) return true;
  if (host === N2_CORE_API_HOST || host === `www.${N2_CORE_API_HOST}`) return true;
  if (SPA_LOOP_HOSTS.has(host)) return true;
  return false;
}

export function isBlockedApiTarget(url) {
  try {
    return isBlockedApiHost(new URL(String(url || "").trim()).hostname);
  } catch {
    return true;
  }
}

export function parseHostPort(value) {
  const raw = String(value || "").trim();
  if (!raw) return { host: "", port: "" };
  try {
    const withProto = raw.includes("://") ? raw : `http://${raw}`;
    const parsed = new URL(withProto);
    return { host: parsed.hostname.toLowerCase(), port: parsed.port || "" };
  } catch {
    const hostport = raw.split("/")[0];
    const [host, port = ""] = hostport.split(":");
    return { host: host.toLowerCase(), port };
  }
}

function isLoopbackHost(host) {
  return host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host === "::1";
}

export function isSameProxyHost(left, right) {
  const a = parseHostPort(left);
  const b = parseHostPort(right);
  if (!a.host || !b.host || a.host !== b.host) return false;
  if (a.port === b.port) return true;
  if (isLoopbackHost(a.host)) return a.port !== "" && b.port !== "" && a.port === b.port;
  if (!a.port || !b.port) return true;
  return false;
}

export function isSelfProxyTarget(origin, env = {}, requestHost = "") {
  const target = parseHostPort(origin);
  if (!target.host) return true;
  const aliases = [
    requestHost,
    env.RAILWAY_PUBLIC_DOMAIN,
    env.RAILWAY_PRIVATE_DOMAIN,
    env.RAILWAY_STATIC_URL,
  ];
  return aliases.some((alias) => isSameProxyHost(origin, alias));
}

export function discoverApiUrlFromEnv(env = process.env) {
  const direct = String(
    env.API_URL || env.BACKEND_URL || env.MAMANDOUCE_API_URL || "",
  ).trim();
  if (direct) return direct;
  const keys = Object.keys(env || {}).sort();
  for (const key of keys) {
    if (!/^RAILWAY_SERVICE_.+_URL$/i.test(key)) continue;
    if (/FRONTEND|STATIC|SPA|UI|CLIENT/i.test(key)) continue;
    if (!/(API|BACKEND|FASTAPI|SERVER|WEB|MAMANDOUCE|UVICORN)/i.test(key)) continue;
    const val = String(env[key] || "").trim();
    if (val) return val;
  }
  return "";
}

export function resolveApiTarget(env = process.env) {
  const raw = discoverApiUrlFromEnv(env).replace(/\/+$/, "");
  if (!raw) {
    return { origin: "", error: "missing" };
  }
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    return { origin: raw, error: "invalid" };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { origin: raw, error: "protocol" };
  }
  if (isBlockedApiHost(parsed.hostname)) {
    return { origin: `${parsed.protocol}//${parsed.host}`, error: "blocked" };
  }
  return { origin: `${parsed.protocol}//${parsed.host}`, error: null };
}

export function isHtmlContentType(value) {
  return String(value || "").toLowerCase().includes("text/html");
}

function sendJson(res, status, body) {
  if (res.writableEnded || res.headersSent) return;
  const data = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "content-length": Buffer.byteLength(data),
    connection: "close",
  });
  res.end(data);
}

function apiMisconfigured(res, resolved, urlPath) {
  const hints = {
    missing:
      "API_URL n'est pas défini sur le service frontend Railway. Indiquez l'origine FastAPI MamanDouce (pas ce domaine SPA, pas api.neriacorp.com).",
    invalid: "API_URL is not a valid URL.",
    protocol: "API_URL must be http(s).",
    blocked:
      "API_URL must be the MamanDouce FastAPI origin, not api.neriacorp.com (N2) and not the SPA domain.",
  };
  sendJson(res, 502, {
    detail: hints[resolved.error] || "API proxy is misconfigured.",
    path: urlPath,
    code: "SPA_API_PROXY_MISCONFIGURED",
    error: resolved.error,
  });
}

export function pickUpstreamRequestHeaders(headers) {
  const out = {};
  for (const [key, value] of Object.entries(headers || {})) {
    const name = String(key).toLowerCase();
    if (DROP_REQUEST_HEADERS.has(name)) continue;
    if (name.startsWith("cf-")) continue;
    if (value == null || value === "") continue;
    out[name] = Array.isArray(value) ? value.join(", ") : String(value);
  }
  out.accept = out.accept || "application/json, */*";
  out["accept-encoding"] = "identity";
  return out;
}

function pickClientResponseHeaders(upstreamHeaders, contentType, byteLength) {
  const out = {
    "content-type": contentType || "application/json; charset=utf-8",
    "cache-control": "no-store",
    "content-length": byteLength,
    connection: "close",
  };
  if (!upstreamHeaders || typeof upstreamHeaders.get !== "function") return out;
  for (const name of PASS_RESPONSE_HEADERS) {
    const value = upstreamHeaders.get(name);
    if (value && name !== "content-type") out[name] = value;
  }
  return out;
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_API_BODY_BYTES) {
        reject(new Error("Request body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export async function proxyApiRequest(req, res, origin) {
  const urlPath = pathnameOf(req.url);
  let target;
  try {
    target = new URL(origin);
  } catch {
    sendJson(res, 502, { detail: "Invalid API origin", path: urlPath });
    return;
  }

  const method = String(req.method || "GET").toUpperCase();
  let body;
  try {
    body = await readRequestBody(req);
  } catch (err) {
    sendJson(res, 413, { detail: String(err.message || err), path: urlPath });
    return;
  }

  const headers = pickUpstreamRequestHeaders(req.headers);
  const init = {
    method,
    headers,
    redirect: "manual",
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  };
  if (method !== "GET" && method !== "HEAD") {
    init.body = body;
  }

  let upstream;
  try {
    upstream = await fetch(`${target.origin}${upstreamRequestUrl(req.url)}`, init);
  } catch (err) {
    sendJson(res, 502, {
      detail: "Upstream API unreachable",
      path: urlPath,
      code: "SPA_API_UPSTREAM_UNREACHABLE",
      error: String(err && err.message ? err.message : err),
    });
    return;
  }

  const buf = Buffer.from(await upstream.arrayBuffer());
  const contentType = upstream.headers.get("content-type") || "";
  const preview = buf.slice(0, 96).toString("utf8").trim().toLowerCase();
  const bodyLooksHtml = preview.startsWith("<!doctype") || preview.startsWith("<html");
  if (isHtmlContentType(contentType) || bodyLooksHtml) {
    sendJson(res, 502, {
      detail:
        "Upstream returned HTML instead of JSON. API_URL does not point to MamanDouce FastAPI.",
      path: urlPath,
      code: "SPA_API_UPSTREAM_HTML",
    });
    return;
  }

  if (res.writableEnded || res.headersSent) return;
  res.writeHead(
    upstream.status || 502,
    pickClientResponseHeaders(upstream.headers, contentType || "application/json; charset=utf-8", buf.length),
  );
  res.end(buf);
}

function safeJoin(root, urlPath) {
  const relative = pathnameOf(urlPath).replace(/^\/+/, "");
  const resolved = path.resolve(root, relative);
  const rootResolved = path.resolve(root);
  if (resolved !== rootResolved && !resolved.startsWith(rootResolved + path.sep)) {
    return null;
  }
  return resolved;
}

export function serveStaticOrSpa(req, res, distDir) {
  const urlPath = pathnameOf(req.url);
  const indexPath = path.join(distDir, "index.html");
  if (!fs.existsSync(indexPath)) {
    sendJson(res, 503, {
      detail: "SPA dist/index.html is missing. Did the frontend build run?",
      path: urlPath,
    });
    return;
  }

  if (urlPath === "/" || urlPath === "") {
    res.writeHead(200, { "content-type": MIME[".html"], "cache-control": "no-store" });
    fs.createReadStream(indexPath).pipe(res);
    return;
  }

  const filePath = safeJoin(distDir, urlPath);
  if (!filePath) {
    res.writeHead(403);
    res.end();
    return;
  }

  fs.stat(filePath, (err, st) => {
    if (!err && st.isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { "content-type": MIME[ext] || "application/octet-stream" });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
    res.writeHead(200, { "content-type": MIME[".html"], "cache-control": "no-store" });
    fs.createReadStream(indexPath).pipe(res);
  });
}

export function createSpaProxyServer({ distDir, env = process.env } = {}) {
  const resolved = resolveApiTarget(env);
  const server = http.createServer((req, res) => {
    const fail = (err) => {
      if (!res.headersSent && !res.writableEnded) {
        sendJson(res, 500, {
          detail: "spa-proxy failed",
          error: String(err && err.message ? err.message : err),
          code: "SPA_PROXY_CRASH",
        });
      } else {
        try {
          res.destroy();
        } catch {
          /* ignore */
        }
      }
    };

    try {
      const urlPath = pathnameOf(req.url);
      if (isProxyStatusPath(urlPath)) {
        sendJson(res, 200, {
          ok: true,
          apiConfigured: Boolean(resolved.origin) && !resolved.error,
          apiHost: hostnameOf(resolved.origin) || null,
          error: resolved.error,
          gate: STANDALONE_API_GATE,
        });
        return;
      }
      if (isApiPath(urlPath)) {
        if (resolved.error || !resolved.origin) {
          apiMisconfigured(res, resolved, urlPath);
          return;
        }
        if (isSelfProxyTarget(resolved.origin, env, req.headers.host)) {
          sendJson(res, 502, {
            detail:
              "API_URL points at this same frontend service (proxy loop). Use the FastAPI Railway URL.",
            path: urlPath,
            code: "SPA_API_PROXY_LOOP",
          });
          return;
        }
        proxyApiRequest(req, res, resolved.origin).catch(fail);
        return;
      }
      serveStaticOrSpa(req, res, distDir);
    } catch (err) {
      fail(err);
    }
  });
  server.keepAliveTimeout = 5000;
  server.headersTimeout = 10000;
  server.requestTimeout = UPSTREAM_TIMEOUT_MS + 2000;
  server.on("clientError", (_err, socket) => {
    try {
      socket.end(
        "HTTP/1.1 400 Bad Request\r\nContent-Type: application/json\r\nContent-Length: 16\r\nConnection: close\r\n\r\n{\"detail\":\"bad\"}",
      );
    } catch {
      /* ignore */
    }
  });
  return server;
}

export function defaultDistDir() {
  return path.resolve(__dirname, "..", "dist");
}

function isDirectRun() {
  try {
    return path.resolve(process.argv[1] || "") === __filename;
  } catch {
    return false;
  }
}

if (isDirectRun()) {
  const port = Number(process.env.PORT || 3000);
  const distDir = defaultDistDir();
  const resolved = resolveApiTarget(process.env);
  const server = createSpaProxyServer({ distDir, env: process.env });
  server.listen(port, "0.0.0.0", () => {
    const apiState = resolved.error
      ? `API proxy disabled (${resolved.error})`
      : `API proxy → ${resolved.origin}`;
    console.log(`[spa-proxy] listening on 0.0.0.0:${port} dist=${distDir} ${apiState}`);
  });
}
