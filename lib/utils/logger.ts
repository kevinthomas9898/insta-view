type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogPayload {
  provider?: string;
  action?: string;
  username?: string;
  durationMs?: number;
  status?: 'success' | 'failure';
  errorCategory?: string;
  message?: string;
  [key: string]: unknown;
}

export function log(level: LogLevel, payload: LogPayload): void {
  // Never log raw tokens, cookies, or secrets
  const cleanPayload = { ...payload };
  const sensitiveKeys = ['apiKey', 'key', 'token', 'authorization', 'cookie', 'secret', 'password'];
  
  for (const k of Object.keys(cleanPayload)) {
    if (sensitiveKeys.some((s) => k.toLowerCase().includes(s))) {
      cleanPayload[k] = '[REDACTED]';
    }
  }

  const timestamp = new Date().toISOString();
  const logStr = `[${timestamp}] [${level.toUpperCase()}] ${JSON.stringify(cleanPayload)}`;

  switch (level) {
    case 'error':
      console.error(logStr);
      break;
    case 'warn':
      console.warn(logStr);
      break;
    case 'debug':
      if (process.env.DEBUG === 'true') {
        console.debug(logStr);
      }
      break;
    default:
      console.log(logStr);
      break;
  }
}
