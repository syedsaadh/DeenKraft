interface LogContext {
  jobId?: string | number;
  projectId?: string | number;
  [key: string]: unknown;
}

function formatContext(context: LogContext): string {
  const pairs = Object.entries(context)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${String(value)}`);

  return pairs.length === 0 ? '' : ` ${pairs.join(' ')}`;
}

export function logInfo(message: string, context: LogContext = {}): void {
  console.log(`[worker-render] INFO ${message}${formatContext(context)}`);
}

export function logError(message: string, context: LogContext = {}): void {
  console.error(`[worker-render] ERROR ${message}${formatContext(context)}`);
}
