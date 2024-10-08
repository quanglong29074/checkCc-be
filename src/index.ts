import { Elysia, error, t } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import addressPlugin from './plugins/addressPlugin';
import amazonAccountPlugin from './plugins/amazonAccountPlugin';
import authPlugin from './plugins/auth';
import ccPlugin from './plugins/ccPlugin';
import gpmProfilePlugin from './plugins/gpmProfilePlugin';
import testcafeCommandPlugin from './plugins/testcafeCommandPlugin';


import { cors } from '@elysiajs/cors'

import connectDb from './data-source';

connectDb();
const app = new Elysia()
  .use(swagger({
    path: '/swagger-ui',
    provider: 'swagger-ui',
    documentation: {
      info: {
        title: 'Check credit card',
        description: 'Check credit card API Documentation',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          JwtAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Enter JWT Bearer token **_only_**',
          },
        },
      },
    },
    swaggerOptions: {
      persistAuthorization: true,
    },
  }))
  .group('/api', (group) =>
    group
  .use(authPlugin)
  .use(addressPlugin)
  .use(amazonAccountPlugin)
  .use(ccPlugin)
  .use(gpmProfilePlugin)
  .use(testcafeCommandPlugin)
  )
  .use(cors())
  .listen(3000);
console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
