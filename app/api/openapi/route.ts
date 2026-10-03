import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Minimal OpenAPI 3.0 spec for TalentsHill — extend as routes are documented
const spec = {
  openapi: '3.0.0',
  info: {
    title: 'TalentsHill API',
    version: '1.0.0',
    description: 'TalentsHill talent management and marketing platform API',
  },
  servers: [{ url: process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000' }],
  paths: {
    '/api/health': {
      get: {
        summary: 'Health check',
        tags: ['System'],
        responses: { '200': { description: 'OK' }, '503': { description: 'Service unavailable' } },
      },
    },
    '/api/admin/contacts': {
      get: {
        summary: 'List contacts',
        tags: ['CRM'],
        security: [{ cookieAuth: [] }],
        responses: { '200': { description: 'Contact list' }, '401': { description: 'Unauthorized' } },
      },
      post: {
        summary: 'Create contact',
        tags: ['CRM'],
        security: [{ cookieAuth: [] }],
        responses: {
          '201': { description: 'Contact created' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Admin login',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Login successful' },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/api/openapi': {
      get: {
        summary: 'OpenAPI specification',
        tags: ['System'],
        responses: { '200': { description: 'OpenAPI 3.0 JSON spec' } },
      },
    },
  },
  components: {
    securitySchemes: {
      cookieAuth: { type: 'apiKey', in: 'cookie', name: 'session' },
    },
  },
};

export async function GET() {
  return NextResponse.json(spec);
}
