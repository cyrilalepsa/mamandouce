# MamanDouce — frontend production image (monorepo root)
# Build: DOCKER_BUILDKIT=1 docker build --progress=plain --no-cache -t mamandouce-frontend .
# Requires package-lock.json in frontend/ (npm ci).

FROM node:22.12-bookworm-slim AS deps
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM deps AS build
COPY frontend/ ./
RUN npm run build

FROM node:22.12-bookworm-slim AS runtime
WORKDIR /app/frontend
ENV NODE_ENV=production
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY --from=build /app/frontend/dist ./dist
COPY frontend/scripts ./scripts
EXPOSE 3000
CMD ["node", "scripts/spa-proxy.mjs"]
