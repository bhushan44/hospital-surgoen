# Hospital Surgeons - Next.js Application

This is a Next.js transformation of the medi-link NestJS backend application. The application provides a comprehensive hospital and doctor management system with booking, payment, and review features.

## Project Structure

```
hospital-surgeons/
├── app/
│   └── api/                    # Next.js API routes
│       ├── users/              # User management endpoints
│       ├── doctors/            # Doctor management endpoints
│       ├── hospitals/           # Hospital management endpoints
│       ├── bookings/           # Booking management endpoints
│       └── ...                 # Other modules
├── lib/
│   ├── db/                     # Database configuration
│   │   ├── schema.ts          # Drizzle ORM schema
│   │   └── index.ts           # Database connection
│   ├── auth/                   # Authentication utilities
│   │   ├── jwt.ts             # JWT token handling
│   │   └── middleware.ts      # Auth middleware
│   ├── services/              # Business logic services
│   │   ├── users.service.ts
│   │   ├── supabase.ts
│   │   └── mail.ts
│   └── repositories/           # Data access layer
│       └── users.repository.ts
└── drizzle.config.ts          # Drizzle ORM configuration
```

## Features

### Implemented Modules

1. **Users Module** ✅
   - User signup (doctor role)
   - Provider signup (hospital role, admin only)
   - User login with JWT authentication
   - Token refresh
   - User profile management
   - User CRUD operations (admin only)

2. **Doctors Module** ✅
   - Doctor creation and profile management
   - Doctor listing with pagination and filters
   - Doctor credentials management
   - Doctor specialties management
   - Doctor availability/unavailability management
   - Doctor statistics

3. **Specialties Module** ✅
   - Specialty CRUD operations
   - Active specialties listing
   - Specialty statistics and usage tracking
   - Bulk specialty creation
   - Status toggle functionality

4. **Hospitals Module** ✅
   - Hospital creation and profile management
   - Hospital listing with pagination and filters
   - Hospital departments management
   - Hospital staff management
   - Favorite doctors management
   - Hospital statistics

5. **Bookings Module** ✅
   - Booking creation with availability checks
   - Booking listing with filters
   - Booking status management
   - Doctor availability checking
   - Available time slots retrieval
   - Booking statistics

6. **Payments Module** ✅
   - Payment creation and management
   - Payment listing with filters
   - Payment status tracking
   - Support for subscription, booking, and commission payments

7. **Reviews Module** ✅
   - Review creation and management
   - Review listing with filters
   - Rating system (1-5 stars)
   - Review approval system

8. **Notifications Module** ✅
   - Notification creation and management
   - User notification preferences
   - Mark as read/unread functionality
   - Multi-channel support (push, email, SMS, in-app)

9. **Support Module** ✅
   - Support ticket creation and management
   - Ticket message system
   - Ticket status tracking
   - Internal/external message support

10. **Analytics Module** ✅
    - Analytics event tracking
    - Event listing with filters
    - User behavior tracking

11. **Subscriptions Module** ✅
    - Subscription plan management
    - User subscription management
    - Subscription status tracking
    - Booking usage tracking

12. **Authentication** ✅
    - JWT-based authentication
    - Role-based access control (RBAC)
    - Token refresh mechanism
    - Protected route middleware

13. **Database** ✅
    - Drizzle ORM integration
    - PostgreSQL database
    - Complete schema migration from NestJS

## Setup Instructions

### 1. Environment Variables Setup

✅ **Environment files have been created!** All files are in the **root of the project** (same level as `package.json`).

**Created Files:**
- `.env.local` - Local development (gitignored, contains your actual values)
- `.env.development` - Development/staging environment
- `.env.production` - Production environment
- `.env.example` - Template file (safe to commit)

**Quick Start:**
1. The `.env.local` file is already created with your values
2. Review and update any values if needed
3. For production, update `.env.production` with production credentials

**See `ENV_SETUP.md` for detailed instructions** on each variable.

**Note:** All variables are **server-side only** (for API routes). If you add a frontend later, use `NEXT_PUBLIC_` prefix for client-side variables. See `ENV_VARIABLES_GUIDE.md` for details.

**Required Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_ACCESS_TOKEN_SECRET` - Secret for JWT access tokens
- `JWT_REFRESH_TOKEN_SECRET` - Secret for JWT refresh tokens
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SENDGRID_API_KEY` - SendGrid API key for emails

**Optional:**
- `JWT_ACCESS_TOKEN_EXPIRATION` - Default: `900s` (15 minutes)
- `JWT_REFRESH_TOKEN_EXPIRATION` - Default: `7d` (7 days)
- `NODE_ENV` - Default: `development`
- `PORT` - Default: `3000`

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Supabase account (optional, for file storage)
- SendGrid account (for email services)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL=your_postgresql_connection_string

# JWT
JWT_ACCESS_TOKEN_SECRET=your_access_token_secret
JWT_REFRESH_TOKEN_SECRET=your_refresh_token_secret
JWT_ACCESS_TOKEN_EXPIRATION=900s
JWT_REFRESH_TOKEN_EXPIRATION=7d

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Run database migrations:
```bash
npm run db:push
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Users

- `POST /api/users/signup` - Create a new doctor user
- `POST /api/users/provider-signup` - Create a new hospital user (admin only)
- `POST /api/users/login` - User login
- `POST /api/users/refresh` - Refresh access token
- `GET /api/users/profile` - Get current user profile (authenticated)
- `PATCH /api/users/profile` - Update user profile (authenticated)
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/[id]` - Get user by ID (admin only)
- `DELETE /api/users/[id]` - Delete user (admin only)

### Doctors

- `GET /api/doctors` - Get all doctors with pagination and filters
- `POST /api/doctors` - Create a new doctor
- `GET /api/doctors/profile` - Get current doctor profile (authenticated)
- `GET /api/doctors/[id]` - Get doctor by ID
- `PATCH /api/doctors/[id]` - Update doctor (doctor/admin only)
- `DELETE /api/doctors/[id]` - Delete doctor (admin only)
- `GET /api/doctors/[id]/credentials` - Get doctor credentials
- `POST /api/doctors/[id]/credentials` - Add doctor credential (doctor/admin only)
- `GET /api/doctors/[id]/specialties` - Get doctor specialties
- `POST /api/doctors/[id]/specialties` - Add doctor specialty (doctor/admin only)
- `DELETE /api/doctors/[id]/specialties/[specialtyId]` - Remove specialty (doctor/admin only)
- `GET /api/doctors/[id]/availability` - Get doctor availability
- `POST /api/doctors/[id]/availability` - Add availability (doctor/admin only)
- `PATCH /api/doctors/availability/[availabilityId]` - Update availability (doctor/admin only)
- `DELETE /api/doctors/availability/[availabilityId]` - Delete availability (doctor/admin only)
- `GET /api/doctors/[id]/unavailability` - Get doctor unavailability
- `POST /api/doctors/[id]/unavailability` - Add unavailability (doctor/admin only)
- `DELETE /api/doctors/unavailability/[unavailabilityId]` - Delete unavailability (doctor/admin only)
- `GET /api/doctors/[id]/stats` - Get doctor statistics

### Specialties

- `GET /api/specialties` - Get all specialties with pagination
- `POST /api/specialties` - Create specialty (admin only)
- `GET /api/specialties/active` - Get active specialties
- `GET /api/specialties/stats` - Get all specialties statistics (admin only)
- `POST /api/specialties/bulk` - Create multiple specialties (admin only)
- `GET /api/specialties/search/[name]` - Search specialty by name
- `GET /api/specialties/[id]` - Get specialty by ID
- `PATCH /api/specialties/[id]` - Update specialty (admin only)
- `DELETE /api/specialties/[id]` - Delete specialty (admin only)
- `GET /api/specialties/[id]/stats` - Get specialty statistics
- `GET /api/specialties/[id]/usage` - Get specialty usage info (admin only)
- `PATCH /api/specialties/[id]/toggle-status` - Toggle specialty status (admin only)

### Hospitals

- `GET /api/hospitals` - Get all hospitals with pagination and filters
- `POST /api/hospitals` - Create a new hospital
- `GET /api/hospitals/profile` - Get current hospital profile (authenticated)
- `GET /api/hospitals/[id]` - Get hospital by ID
- `PATCH /api/hospitals/[id]` - Update hospital (hospital/admin only)
- `DELETE /api/hospitals/[id]` - Delete hospital (admin only)
- `GET /api/hospitals/[id]/departments` - Get hospital departments
- `POST /api/hospitals/[id]/departments` - Add department (hospital/admin only)
- `PATCH /api/hospitals/[id]/departments/[departmentId]` - Update department (hospital/admin only)
- `DELETE /api/hospitals/[id]/departments/[departmentId]` - Delete department (hospital/admin only)
- `GET /api/hospitals/[id]/staff` - Get hospital staff
- `POST /api/hospitals/[id]/staff` - Add staff (hospital/admin only)
- `PATCH /api/hospitals/[id]/staff/[staffId]` - Update staff (hospital/admin only)
- `DELETE /api/hospitals/[id]/staff/[staffId]` - Delete staff (hospital/admin only)
- `GET /api/hospitals/[id]/favorite-doctors` - Get favorite doctors
- `POST /api/hospitals/[id]/favorite-doctors` - Add favorite doctor (hospital/admin only)
- `DELETE /api/hospitals/[id]/favorite-doctors/[doctorId]` - Remove favorite doctor (hospital/admin only)
- `GET /api/hospitals/[id]/stats` - Get hospital statistics

### Bookings

- `GET /api/bookings` - Get all bookings with filters (authenticated)
- `POST /api/bookings` - Create booking (hospital/admin only)
- `GET /api/bookings/[id]` - Get booking by ID (authenticated)
- `PATCH /api/bookings/[id]` - Update booking (hospital/doctor/admin only)
- `DELETE /api/bookings/[id]` - Delete booking (hospital/admin only)
- `POST /api/bookings/availability` - Check doctor availability
- `GET /api/bookings/time-slots` - Get available time slots
- `GET /api/bookings/stats` - Get booking statistics (admin only)

### Payments

- `GET /api/payments` - Get all payments with filters (authenticated)
- `POST /api/payments` - Create payment (authenticated)
- `GET /api/payments/[id]` - Get payment by ID (authenticated)
- `PATCH /api/payments/[id]` - Update payment (admin only)
- `DELETE /api/payments/[id]` - Delete payment (admin only)

### Reviews

- `GET /api/reviews` - Get all reviews with filters
- `POST /api/reviews` - Create review (authenticated)
- `GET /api/reviews/[id]` - Get review by ID
- `PATCH /api/reviews/[id]` - Update review (admin only)
- `DELETE /api/reviews/[id]` - Delete review (admin only)

### Notifications

- `GET /api/notifications` - Get user notifications (authenticated)
- `POST /api/notifications` - Create notification (admin only)
- `GET /api/notifications/[id]` - Get notification by ID (authenticated)
- `PATCH /api/notifications/[id]` - Mark notification as read/unread (authenticated)
- `GET /api/notifications/preferences` - Get notification preferences (authenticated)
- `PATCH /api/notifications/preferences` - Update notification preferences (authenticated)

### Support

- `GET /api/support/tickets` - Get all support tickets (authenticated)
- `POST /api/support/tickets` - Create support ticket (authenticated)
- `GET /api/support/tickets/[id]` - Get ticket by ID (authenticated)
- `PATCH /api/support/tickets/[id]` - Update ticket (admin only)
- `DELETE /api/support/tickets/[id]` - Delete ticket (admin only)
- `GET /api/support/tickets/[id]/messages` - Get ticket messages (authenticated)
- `POST /api/support/tickets/[id]/messages` - Add message to ticket (authenticated)

### Analytics

- `GET /api/analytics/events` - Get analytics events (admin only)
- `POST /api/analytics/events` - Create analytics event (public for tracking)

### Subscriptions

- `GET /api/subscriptions/plans` - Get all subscription plans
- `POST /api/subscriptions/plans` - Create subscription plan (admin only)
- `GET /api/subscriptions/plans/[id]` - Get plan by ID
- `PATCH /api/subscriptions/plans/[id]` - Update plan (admin only)
- `DELETE /api/subscriptions/plans/[id]` - Delete plan (admin only)
- `GET /api/subscriptions` - Get all subscriptions with filters (authenticated)
- `POST /api/subscriptions` - Create subscription (authenticated)
- `GET /api/subscriptions/[id]` - Get subscription by ID (authenticated)
- `PATCH /api/subscriptions/[id]` - Update subscription (admin only)
- `DELETE /api/subscriptions/[id]` - Delete subscription (admin only)

## Key Differences from NestJS

### Architecture Changes

1. **API Routes**: NestJS controllers are transformed to Next.js API route handlers in the `app/api` directory
2. **Middleware**: NestJS guards are replaced with Next.js middleware functions
3. **Dependency Injection**: Replaced with direct instantiation of services and repositories
4. **Module System**: NestJS modules are replaced with Next.js file-based routing

### Code Structure

- **Services**: Business logic remains in service classes
- **Repositories**: Data access logic remains in repository classes
- **DTOs**: TypeScript interfaces replace NestJS DTOs with class-validator decorators
- **Authentication**: JWT handling moved to utility functions with middleware wrappers

## Database Schema

The application uses Drizzle ORM with PostgreSQL. The schema includes:

- Users and authentication
- Doctors and their profiles
- Hospitals and departments
- Bookings and appointments
- Payments and subscriptions
- Reviews and ratings
- Notifications
- Support tickets
- Analytics events

## Development

### Database Commands

```bash
# Generate migrations
npm run db:generate

# Push schema changes
npm run db:push

# Open Drizzle Studio
npm run db:studio
```

### Adding New Modules

To add a new module (e.g., doctors):

1. Create repository: `lib/repositories/doctors.repository.ts`
2. Create service: `lib/services/doctors.service.ts`
3. Create API routes: `app/api/doctors/route.ts` and nested routes
4. Use authentication middleware: `withAuth()` from `lib/auth/middleware.ts`

## Migration Notes

This codebase has been transformed from a NestJS backend to Next.js. Key transformations:

- Controllers → API Route Handlers
- Services → Service Classes (same structure)
- Repositories → Repository Classes (same structure)
- Guards → Middleware Functions
- Modules → File-based Organization
- DTOs → TypeScript Interfaces

## License

Private project
