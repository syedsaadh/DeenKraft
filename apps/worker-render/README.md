# Worker Render

Async rendering worker for reel jobs.

## Required Environment Variables

Never commit real credentials in this file. Use placeholders only and load real secrets from your local `.env` or a secret manager.

```bash
REDIS_HOST=<redis_host>
REDIS_PORT=<redis_port>
REDIS_PASSWORD=<optional_redis_password>
REDIS_DB=<redis_db>
RENDER_QUEUE_NAME=<render_queue_name>

DB_HOST=<db_host>
DB_PORT=<db_port>
DB_USERNAME=<db_username>
DB_PASSWORD=<db_password>
DB_NAME=<db_name>

AWS_REGION=<aws_region>
AWS_ACCESS_KEY_ID=<aws_access_key_id>
AWS_SECRET_ACCESS_KEY=<aws_secret_access_key>
AWS_BUCKET_NAME=<aws_bucket_name>

REEL_RENDER_TMP_DIR=<optional_tmp_dir>
FFMPEG_PATH=<optional_ffmpeg_path>
RENDER_WORKER_CONCURRENCY=<worker_concurrency>
WORKER_HEALTH_PORT=<worker_health_port>
```

## Commands

```bash
pnpm --filter worker-render dev
pnpm --filter worker-render build
pnpm --filter worker-render start
pnpm --filter worker-render test
```

## Health Endpoints

- `GET /health/live` on `WORKER_HEALTH_PORT`
- `GET /health/ready` on `WORKER_HEALTH_PORT`

## Failure Visibility

- Queue failed jobs are retained for observability.
- Worker emits failed-job logs with attempt metadata.
- Render failures persist details in `render_jobs.errorMessage`.
