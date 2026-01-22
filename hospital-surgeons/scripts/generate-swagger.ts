import swaggerJsdoc from 'swagger-jsdoc';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hospital Surgeons API',
      version: '1.0.0',
      description: 'API documentation for Hospital Surgeons application',
      contact: {
        name: 'API Support',
        email: 'admin@example.com',
      },
    },
    servers: [
      {
        url: process.env.FRONTEND_URL || 'https://hospital-surgoen.onrender.com',
        description: 'API Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: 'Users', description: 'User management endpoints' },
      { name: 'Doctors', description: 'Doctor management endpoints' },
      { name: 'Hospitals', description: 'Hospital management endpoints' },
      { name: 'Specialties', description: 'Specialty management endpoints' },
      { name: 'Bookings', description: 'Booking management endpoints' },
      { name: 'Payments', description: 'Payment management endpoints' },
      { name: 'Reviews', description: 'Review management endpoints' },
      { name: 'Notifications', description: 'Notification management endpoints' },
      { name: 'Support', description: 'Support ticket endpoints' },
      { name: 'Analytics', description: 'Analytics endpoints' },
      { name: 'Subscriptions', description: 'Subscription management endpoints' },
      { name: 'Admin', description: 'Admin management endpoints' },
      { name: 'Files', description: 'File management endpoints' },
      { name: 'Documentation', description: 'API documentation endpoints' },
    ],
  },
  apis: [
    './app/api/**/*.ts', // Scan all API route files
  ],
};

console.log('🔄 [SWAGGER] Generating swagger.json from JSDoc comments...');
console.log('📁 [SWAGGER] Scanning files in: ./app/api/**/*.ts');

const swaggerSpec = swaggerJsdoc(options) as {
  paths?: Record<string, any>;
  [key: string]: any;
};

// Write to public/swagger.json
const outputPath = resolve(process.cwd(), 'public/swagger.json');
writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2), 'utf8');

const pathCount = swaggerSpec.paths ? Object.keys(swaggerSpec.paths).length : 0;
console.log(`✅ [SWAGGER] Generated swagger.json with ${pathCount} API paths`);
console.log(`📄 [SWAGGER] Output file: ${outputPath}`);

