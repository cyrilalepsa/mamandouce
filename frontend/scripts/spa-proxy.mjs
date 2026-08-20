#!/usr/bin/env node
/**
 * Serveur SPA Railway : fichiers statiques + fallback index.html,
 * SAUF /api (et /health) qui sont proxifiés vers FastAPI.
 *
 * `npx serve -s dist` renvoyait index.html pour TOUT chemin, y compris
 * /api/health et /api/v1/auth/login — le navigateur avalait du HTML
 * à la place du JSON. Ce script rend ça impossible.
 *
 * Runtime (service frontend Railway, PAS VITE_*) :
 *   API_URL | BACKEND_URL | MAMANDOUCE_API_URL  = origine FastAPI MamanDouce
 *   (ex. https://<service>.up.railway.app) — jamais api.neriacorp.com (N2)
 *   et jamais mamandouce.neriacorp.com (ce domaine est le SPA).
 */
import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const N2_CORE_API_HOST = "api.neriacorp.com";

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

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
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
    p === "/health" ||
    p.startsWith("/health/")
  );
}

export function isBlockedApiHost(hostname) {
  const host = String(hostname || "").toLowerCase().split(":")[0];
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

export function resolveApiTarget(env = process.env) {
  const raw = String(
    env.API_URL || env.BACKEND_URL || env.MAMANDOUCE_API_URL || "",
  )
    .trim()
    .replace(/\/+$/, "");
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
  const data = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "content-length": Buffer.byteLength(data),
  });
  res.end(data);
}

function apiMisconfigured(res, resolved, urlPath) {
  const hints = {
    missing:
      "API_URL is not set on the frontend Railway service. /api cannot be served as HTML.",
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

function filterHeaders(headers, extraDrop = []) {
  const drop = new Set([...HOP_BY_HOP, ...extraDrop.map((h) => h.toLowerCase())]);
  const out = {};
  for (const [key, value] of Object.entries(headers || {})) {
    if (drop.has(String(key).toLowerCase())) continue;
    if (value == null) continue;
    out[key] = value;
  }
  return out;
}

export function proxyApiRequest(req, res, origin) {
  const urlPath = pathnameOf(req.url);
  let target;
  try {
    target = new URL(origin);
  } catch {
    sendJson(res, 502, { detail: "Invalid API origin", path: urlPath });
    return;
  }
  const lib = target.protocol === "https:" ? https : http;
  const headers = filterHeaders(req.headers, ["host"]);
  headers.host = target.host;
  headers["x-forwarded-host"] = req.headers.host || "";
  headers["x-forwarded-proto"] = "https";

  const proxyReq = lib.request(
    {
      hostname: target.hostname,
      port: target.port || (target.protocol === "https:" ? 443 : 80),
      path: req.url || "/",
      method: req.method,
      headers,
    },
    (proxyRes) => {
      if (isHtmlContentType(proxyRes.headers["content-type"])) {
        proxyRes.resume();
        sendJson(res, 502, {
          detail:
            "Upstream returned HTML instead of JSON. API_URL does not point to MamanDouce FastAPI.",
          path: urlPath,
          code: "SPA_API_UPSTREAM_HTML",
        });
        return;
      }
      res.writeHead(proxyRes.statusCode || 502, filterHeaders(proxyRes.headers));
      proxyRes.pipe(res);
    },
  );
  proxyReq.on("error", (err) => {
    sendJson(res, 502, {
      detail: "Upstream API unreachable",
      path: urlPath,
      code: "SPA_API_UPSTREAM_UNREACHABLE",
      error: String(err && err.message ? err.message : err),
    });
  });
  req.pipe(proxyReq);
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
  return http.createServer((req, res) => {
    const urlPath = pathnameOf(req.url);
    if (isApiPath(urlPath)) {
      if (resolved.error || !resolved.origin) {
        apiMisconfigured(res, resolved, urlPath);
        return;
      }
      proxyApiRequest(req, res, resolved.origin);
      return;
    }
    serveStaticOrSpa(req, res, distDir);
  });
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
