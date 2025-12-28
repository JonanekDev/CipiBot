import pino, { Logger } from 'pino';

export function createLogger(serviceName: string):Logger {
    return pino({
        name: serviceName,
        level: process.env.LOG_LEVEL || 'info',

        transport: process.env.NODE_ENV !== 'production'
            ? {
                  target: 'pino-pretty',
                  options: {
                      colorize: true,
                  },
              }
            : undefined,
        base: {
            service: serviceName,
            env: process.env.NODE_ENV || 'dev',
        }
    });
}

export type { Logger };