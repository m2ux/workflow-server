import pino from 'pino';
import type { Logger } from 'pino';

const LOG_LEVEL = process.env['LOG_LEVEL'] ?? 'info';

const transport = pino.transport({
  target: 'pino-roll',
  options: {
    file: 'logs/runner',
    frequency: 'daily',
    limit: { count: 14 },
    mkdir: true,
  },
});

export const logger: Logger = pino({ level: LOG_LEVEL }, transport);

export function createChildLogger(context: Record<string, unknown>): Logger {
  return logger.child(context);
}
