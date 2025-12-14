import swaggerJsdoc from 'swagger-jsdoc';
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
        url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://hospital-surgoen.onrender.com',
        description: 'Production server',
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
    ],
  },
  apis: [
    resolve(process.cwd(), 'app/api/**/route.ts'), // Path to the API route files
  ],
};

export const swaggerSpec = swaggerJsdoc(options);

