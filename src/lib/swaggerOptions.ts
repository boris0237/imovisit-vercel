export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '1.0.0',
    },
    servers: [
      { url: 'http://localhost:3000' },
    ],
  },
  apis: ['./app/api/**/route.ts'],
}