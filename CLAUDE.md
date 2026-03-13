# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DeenKraft is an Islamic content studio for producing social media reels. It manages media assets (clips, audio), HTML/CSS overlay templates, and automates video rendering via a scene-based timeline system.

## Monorepo Structure

pnpm workspace with three apps under `apps/`:

- **api** — NestJS 11 backend (TypeScript). REST API with Swagger docs at `/api/docs`. Uses TypeORM with MySQL, JWT auth, S3-compatible storage (MinIO locally). Port 3001.
- **web** — Next.js 16 frontend (React 19, Tailwind CSS 4). Minimal so far (single page + API client lib).
- **worker-render** — Standalone BullMQ worker (TypeScript, no framework). Polls Redis for render jobs, downloads assets from S3, uses FFmpeg to concatenate clips + apply overlays + mix audio, uploads final video to S3. Has its own health server on port 3010.

## Commands

```bash
# Install dependencies
pnpm install

# Start infrastructure (MySQL on 3307, Redis on 6379, MinIO on 9000/9001)
docker compose -f docker-compose.dev.yml up -d

# Development
pnpm dev:api          # NestJS watch mode
pnpm dev:web          # Next.js dev server
pnpm dev              # Both API + web concurrently

# Build
pnpm build:api        # nest build
pnpm build:web        # next build

# Lint
pnpm lint:api         # ESLint with auto-fix (API)
pnpm lint:web         # ESLint (web)

# Tests (API only — worker-render has no test runner yet)
pnpm --filter api test              # Jest unit tests
pnpm --filter api test -- --watch   # Watch mode
pnpm --filter api test -- <pattern> # Run specific test file
pnpm --filter api test:e2e          # E2E tests (jest-e2e config)
```

## Architecture

### API Module Structure

NestJS modules in `apps/api/src/modules/`. Each module follows the pattern: `entity → dto → service → controller → module`.

- **auth** — JWT-based authentication with Passport. `JwtAuthGuard` protects routes. `@CurrentUser()` decorator extracts user from request.
- **assets** — Media file management (upload, list, update, soft-delete). Assets have a ManyToMany relationship with Tags via a join table. Uses `StorageProvider` for S3 operations.
- **tags** — Simple tagging system. Tags are shared across assets.
- **templates** — HTML/CSS overlay templates with `variableSchema` (JSON) defining template variables and optional `promptRecipe`. `TemplateRendererService` renders HTML to PNG.
- **reels** — Reel projects with a JSON `timeline` field defining tracks (video, overlay, audio). Creates `RenderJob` records and enqueues to BullMQ.
- **storage** — Abstracted behind `StorageProvider` interface (injection token: `STORAGE_PROVIDER`). Implementation is `S3StorageService` backed by AWS SDK. Supports MinIO locally.

### Render Pipeline (worker-render)

1. API creates a `RenderJob` (status: pending) and enqueues `{renderJobId, projectId}` to BullMQ queue `reel-render-jobs`
2. Worker picks up the job, loads the project's timeline JSON
3. Pipeline stages: download video clips → FFmpeg concatenate → render template overlays to PNG → FFmpeg overlay composition → mix audio (or add silent track) → upload final.mp4 to S3
4. Worker updates `RenderJob.status` and `ReelProject.status` in MySQL directly via TypeORM (not through the API)

### Shared Database

Both `api` and `worker-render` connect to the same MySQL database. Entity definitions are **duplicated** across both apps (not shared as a package). The API uses `autoLoadEntities: true` with `synchronize: true` in dev; the worker uses `synchronize: false`.

### Key Environment Variables

API: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SYNCHRONIZE`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET_NAME`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_DB`, `REDIS_PASSWORD`, `PORT`

Worker: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_DB`, `REDIS_PASSWORD`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET_NAME`, `RENDER_QUEUE_NAME`, `RENDER_WORKER_CONCURRENCY`, `REEL_RENDER_TMP_DIR`, `WORKER_HEALTH_PORT`

Note: API uses `DB_USER` while worker uses `DB_USERNAME` for the database username.

### Conventions

- API validation uses `class-validator` with `ValidationPipe` (whitelist + transform + forbidNonWhitelisted)
- Templates use `{{variableName}}` mustache-style interpolation
- UUIDs for reel projects, render jobs, and templates; auto-increment integers for assets and tags
- Soft deletes (`DeleteDateColumn`) on assets and templates
