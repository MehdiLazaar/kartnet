// Journal de l'API (logs). En développement : lisible et coloré. En production : JSON.
import { pino } from 'pino';

import { env } from '../config/env.js';

export const logger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : env.LOG_LEVEL,
  ...(env.NODE_ENV === 'development' && {
    transport: { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } },
  }),
  // On ne journalise jamais les tokens ni les mots de passe.
  redact: ['req.headers.authorization', 'req.body.password'],
});
