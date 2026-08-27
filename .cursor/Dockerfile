# Base image for Cursor Cloud Agent — Node 22.12+ (see frontend/package.json engines)
FROM node:22.12-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    ca-certificates \
    python3 \
    python3-pip \
    python3-venv \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# No COPY of the repo here — Cursor checks out the revision after the image is built.
