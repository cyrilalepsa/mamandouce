import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  createSpaProxyServer,
  discoverApiUrlFromEnv,
  isApiPath,
  isBlockedApiTarget,
  isSelfProxyTarget,
  pathnameOf,
  pickUpstreamRequestHeaders,
  resolveApiTarget,
  STANDALONE_API_GATE,
  upstreamRequestUrl,
} from "./spa-proxy.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test("isApiPath never treats /api as an SPA route", () => {
  assert.equal(isApiPath("/api"), true);
  assert.equal(isApiPath("/api/health"), true);
  assert.equal(isApiPath("/api/v1/auth/login"), true);
  assert.equal(isApiPath("/api/v1/auth/me?x=1"), true);
  assert.equal(isApiPath(`${STANDALONE_API_GATE}/v1/auth/login`), true);
  assert.equal(isApiPath("/login"), false);
  assert.equal(isApiPath("/"), false);
  assert.equal(isApiPath("/health"), true);
  assert.equal(pathnameOf("/api/v1/auth/me?foo=bar"), "/api/v1/auth/me");
  assert.equal(
    upstreamRequestUrl(`${STANDALONE_API_GATE}/v1/auth/login?x=1`),
    "/api/v1/auth/login?x=1",
  );
});

test("resolveApiTarget rejects N2 core and SPA loop hosts", () => {
  assert.equal(resolveApiTarget({}).error, "missing");
  assert.equal(isBlockedApiTarget("https://api.neriacorp.com"), true);
  assert.equal(isBlockedApiTarget("https://mamandouce.neriacorp.com"), true);
  assert.equal(resolveApiTarget({ API_URL: "https://api.neriacorp.com" }).error, "blocked");
  assert.equal(
    resolveApiTarget({ API_URL: "https://mamandouce.neriacorp.com" }).error,
    "blocked",
  );
  const ok = resolveApiTarget({ API_URL: "https://mamandouce-api.up.railway.app/" });
  assert.equal(ok.error, null);
  assert.equal(ok.origin, "https://mamandouce-api.up.railway.app");
  assert.equal(
    discoverApiUrlFromEnv({
      RAILWAY_SERVICE_FRONTEND_URL: "https://frontend.up.railway.app",
      RAILWAY_SERVICE_BACKEND_URL: "http://backend.railway.internal:8080",
    }),
    "http://backend.railway.internal:8080",
  );
  assert.equal(
    resolveApiTarget({
      RAILWAY_SERVICE_BACKEND_URL: "http://backend.railway.internal:8080",
    }).origin,
    "http://backend.railway.internal:8080",
  );
  assert.equal(
    isSelfProxyTarget("https://frontend-prod.up.railway.app", {
      RAILWAY_PUBLIC_DOMAIN: "frontend-prod.up.railway.app",
    }),
    true,
  );
  assert.equal(
    isSelfProxyTarget("http://127.0.0.1:8000", {}, "127.0.0.1:3000"),
    false,
  );
  const forwarded = pickUpstreamRequestHeaders({
    "cdn-loop": "cloudflare",
    "cf-ray": "abc",
    authorization: "Bearer tok",
    "content-type": "application/json",
    host: "mamandouce.neriacorp.com",
  });
  assert.equal(forwarded["cdn-loop"], undefined);
  assert.equal(forwarded["cf-ray"], undefined);
  assert.equal(forwarded.host, undefined);
  assert.equal(forwarded.authorization, "Bearer tok");
  assert.equal(forwarded["accept-encoding"], "identity");
});

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server.address().port));
  });
}

function request(port, urlPath, { method = "GET", headers = {}, body = null } = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname: "127.0.0.1", port, path: urlPath, method, headers },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: Buffer.concat(chunks).toString("utf8"),
          });
        });
      },
    );
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

test("spa-proxy returns JSON 502 for /api when API_URL is missing, never index.html", async () => {
  const dist = fs.mkdtempSync(path.join(os.tmpdir(), "md-dist-"));
  fs.writeFileSync(path.join(dist, "index.html"), "<!doctype html><title>SPA</title>");
  const server = createSpaProxyServer({ distDir: dist, env: {} });
  try {
    const port = await listen(server);
    const api = await request(port, "/api/health");
    assert.equal(api.status, 502);
    assert.match(api.headers["content-type"], /application\/json/);
    assert.doesNotMatch(api.body, /<!doctype html>/i);
    const parsed = JSON.parse(api.body);
    assert.equal(parsed.code, "SPA_API_PROXY_MISCONFIGURED");

    const gated = await request(port, `${STANDALONE_API_GATE}/v1/auth/login`);
    assert.equal(gated.status, 502);
    assert.match(gated.headers["content-type"], /application\/json/);
    assert.equal(JSON.parse(gated.body).code, "SPA_API_PROXY_MISCONFIGURED");

    const spa = await request(port, "/login");
    assert.equal(spa.status, 200);
    assert.match(spa.body, /<!doctype html>/i);
  } finally {
    server.close();
    fs.rmSync(dist, { recursive: true, force: true });
  }
});

test("spa-proxy forwards /api JSON and never HTML-fallback login", async () => {
  const dist = fs.mkdtempSync(path.join(os.tmpdir(), "md-dist-"));
  fs.writeFileSync(path.join(dist, "index.html"), "<!doctype html><title>SPA</title>");

  const upstream = http.createServer((req, res) => {
    if (req.url === "/api/health") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ status: "ok", service: "mamandouce" }));
      return;
    }
    if (req.url === "/api/v1/auth/login" && req.method === "POST") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          access_token: "tok",
          email: "cyrilalepsa@gmail.com",
          is_vip: true,
        }),
      );
      return;
    }
    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ detail: "Not Found" }));
  });

  try {
    const upPort = await listen(upstream);
    const proxy = createSpaProxyServer({
      distDir: dist,
      env: { API_URL: `http://127.0.0.1:${upPort}` },
    });
    const port = await listen(proxy);
    try {
      const health = await request(port, "/api/health");
      assert.equal(health.status, 200);
      assert.deepEqual(JSON.parse(health.body), { status: "ok", service: "mamandouce" });

      const gated = await request(port, `${STANDALONE_API_GATE}/health`);
      assert.equal(gated.status, 200);
      assert.deepEqual(JSON.parse(gated.body), { status: "ok", service: "mamandouce" });

      const login = await request(port, `${STANDALONE_API_GATE}/v1/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: "cyrilalepsa@gmail.com", password: "x" }),
      });
      assert.equal(login.status, 200);
      assert.equal(JSON.parse(login.body).is_vip, true);

      const spa = await request(port, "/pricing");
      assert.equal(spa.status, 200);
      assert.match(spa.body, /SPA/);
    } finally {
      proxy.close();
    }
  } finally {
    upstream.close();
    fs.rmSync(dist, { recursive: true, force: true });
  }
});

test("spa-proxy rejects upstream HTML on /api", async () => {
  const dist = fs.mkdtempSync(path.join(os.tmpdir(), "md-dist-"));
  fs.writeFileSync(path.join(dist, "index.html"), "<!doctype html><title>SPA</title>");
  const upstream = http.createServer((_req, res) => {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end("<!doctype html><title>wrong</title>");
  });
  try {
    const upPort = await listen(upstream);
    const proxy = createSpaProxyServer({
      distDir: dist,
      env: { API_URL: `http://127.0.0.1:${upPort}` },
    });
    const port = await listen(proxy);
    try {
      const api = await request(port, "/api/v1/auth/me");
      assert.equal(api.status, 502);
      assert.equal(JSON.parse(api.body).code, "SPA_API_UPSTREAM_HTML");
      assert.doesNotMatch(api.body, /<!doctype html>/i);
    } finally {
      proxy.close();
    }
  } finally {
    upstream.close();
    fs.rmSync(dist, { recursive: true, force: true });
  }
});

test("spa-proxy refuses self-loop and strips Cloudflare hop headers", async () => {
  const dist = fs.mkdtempSync(path.join(os.tmpdir(), "md-dist-"));
  fs.writeFileSync(path.join(dist, "index.html"), "<!doctype html><title>SPA</title>");

  const loop = createSpaProxyServer({
    distDir: dist,
    env: {
      API_URL: "https://frontend-prod.up.railway.app",
      RAILWAY_PUBLIC_DOMAIN: "frontend-prod.up.railway.app",
    },
  });
  try {
    const port = await listen(loop);
    const api = await request(port, "/api/health", {
      headers: { host: "frontend-prod.up.railway.app" },
    });
    assert.equal(api.status, 502);
    assert.equal(JSON.parse(api.body).code, "SPA_API_PROXY_LOOP");
    assert.match(api.headers["content-type"], /application\/json/);
    assert.equal(api.headers["content-length"], String(Buffer.byteLength(api.body)));
  } finally {
    loop.close();
  }

  let seenCdnLoop = false;
  const upstream = http.createServer((req, res) => {
    if (req.headers["cdn-loop"]) seenCdnLoop = true;
    res.writeHead(200, {
      "content-type": "application/json",
      connection: "close",
      "cdn-loop": "cloudflare",
      "cf-ray": "should-not-leak",
    });
    res.end(JSON.stringify({ status: "ok", sawCdnLoop: Boolean(req.headers["cdn-loop"]) }));
  });
  try {
    const upPort = await listen(upstream);
    const proxy = createSpaProxyServer({
      distDir: dist,
      env: { API_URL: `http://127.0.0.1:${upPort}` },
    });
    const port = await listen(proxy);
    try {
      const health = await request(port, "/api/health", {
        headers: {
          "cdn-loop": "cloudflare",
          "cf-ray": "abc",
          host: "mamandouce.neriacorp.com",
        },
      });
      assert.equal(health.status, 200);
      assert.deepEqual(JSON.parse(health.body), { status: "ok", sawCdnLoop: false });
      assert.equal(seenCdnLoop, false);
      assert.equal(health.headers["cdn-loop"], undefined);
      assert.equal(health.headers["cf-ray"], undefined);
      assert.equal(health.headers["content-length"], String(Buffer.byteLength(health.body)));

      const status = await request(port, "/__mamandouce/proxy-status");
      assert.equal(status.status, 200);
      assert.equal(JSON.parse(status.body).apiConfigured, true);
    } finally {
      proxy.close();
    }
  } finally {
    upstream.close();
    fs.rmSync(dist, { recursive: true, force: true });
  }
});

test("package start command uses spa-proxy not serve -s", () => {
  const pkg = fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8");
  const railway = fs.readFileSync(path.join(__dirname, "..", "railway.json"), "utf8");
  assert.match(pkg, /node scripts\/spa-proxy\.mjs/);
  assert.doesNotMatch(pkg, /serve -s dist/);
  assert.match(railway, /node scripts\/spa-proxy\.mjs/);
  assert.doesNotMatch(railway, /serve -s dist/);
});
