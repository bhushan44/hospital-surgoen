# Admin Dashboard Schema Review & Implementation Guide

## Schema Review ✅

Your database schema is **excellent and comprehensive** for the admin dashboard. It covers all necessary entities:

### ✅ **Core Entities**
- **Users** - User management with roles (doctor, hospital, admin)
- **Doctors** - Doctor profiles with verification, ratings, credentials
- **Hospitals** - Hospital profiles with verification, documents
- **Specialties** - Medical specialties management
- **Files** - File storage and management

### ✅ **Subscription & Payment System**
- **Subscription Plans** - Plans with tiers (free, basic, premium, enterprise)
- **Doctor Plan Features** - Visibility weight, max affiliations
- **Hospital Plan Features** - Max patients, premium doctors access
- **Subscriptions** - Active subscriptions tracking
- **Orders** - Order management
- **Payment Transactions** - Payment gateway integration

### ✅ **Assignment System**
- **Assignments** - Doctor-hospital-patient assignments
- **Patients** - Patient records
- **Doctor Availability** - Availability slots and templates
- **Assignment Ratings** - Rating and review system
- **Assignment Payments** - Payment tracking per assignment

### ✅ **Relationships & Affiliations**
- **Doctor-Hospital Affiliations** - Affiliation management
- **Doctor Specialties** - Doctor-specialty relationships
- **Hospital Departments** - Hospital-specialty relationships

### ✅ **Admin Features**
- **Audit Logs** - Complete audit trail
- **Support Tickets** - Customer support system
- **Notifications** - Notification system
- **Analytics Events** - Analytics tracking

### ✅ **Verification System**
- **Doctor Credentials** - Credential verification
- **Hospital Documents** - Document verification
- Verification statuses: pending, verified, rejected

### ✅ **Additional Features**
- **Doctor Leaves** - Leave management
- **Doctor Preferences** - Doctor preferences
- **Hospital Preferences** - Hospital preferences
- **Webhook Logs** - Webhook tracking
- **User Devices** - Device management for push notifications

## Implementation Steps for Each Admin Page

---

## 1. Dashboard (`/admin`)

### API Endpoints Needed:
```
GET /api/admin/dashboard/stats
GET /api/admin/dashboard/trends
GET /api/admin/dashboard/recent-activity
GET /api/admin/dashboard/alerts
```

### Implementation Steps:

1. **Create API Route**: `app/api/admin/dashboard/stats/route.ts`
   - Query counts: active doctors, active hospitals, pending verifications, today's assignments
   - Query from: `users`, `doctors`, `hospitals`, `assignments`
   - Use aggregation queries with proper indexes

2. **Create API Route**: `app/api/admin/dashboard/trends/route.ts`
   - Monthly assignment trends (last 6 months)
   - User growth trends (doctors vs hospitals)
   - Query from: `assignments`, `users` with date grouping

3. **Create API Route**: `app/api/admin/dashboard/recent-activity/route.ts`
   - Recent verifications, assignments, registrations
   - Query from: `audit_logs` with filtering
   - Limit to last 10 activities

4. **Create API Route**: `app/api/admin/dashboard/alerts/route.ts`
   - Pending verifications count
   - Expiring subscriptions
   - System alerts
   - Query from: `doctors`, `hospitals`, `subscriptions`

5. **Update Dashboard Component**:
   - Replace mock data with API calls
   - Add loading states
   - Add error handling
   - Use React Query or SWR for data fetching

---

## 2. Users Management (`/admin/users`)

### API Endpoints Needed:
```
GET /api/admin/users
GET /api/admin/users/:id
PUT /api/admin/users/:id/status
PUT /api/admin/users/:id/role
DELETE /api/admin/users/:id
```

### Implementation Steps:

1. **Create API Route**: `app/api/admin/users/route.ts`
   - List all users with pagination
   - Filter by: role, status, search query
   - Include related data: doctor/hospital info
   - Query from: `users` with joins to `doctors`, `hospitals`

2. **Create API Route**: `app/api/admin/users/[id]/route.ts`
   - Get single user details
   - Update user status (active, inactive, suspended)
   - Update user role
   - Delete user (soft delete recommended)

3. **Update UsersManagement Component**:
   - Data table with columns: Name, Email, Role, Status, Created At, Actions
   - Filters: Role dropdown, Status dropdown, Search input
   - Actions: View, Edit Status, Suspend, Delete
   - Pagination component

4. **Add User Detail Modal**:
   - Show full user profile
   - Show related doctor/hospital data
   - Show subscription info
   - Show audit log history

---

## 3. Verifications - Doctors (`/admin/verifications/doctors`)

### API Endpoints Needed:
```
GET /api/admin/verifications/doctors
GET /api/admin/verifications/doctors/:id
PUT /api/admin/verifications/doctors/:id/verify
PUT /api/admin/verifications/doctors/:id/reject
```

### Implementation Steps:

1. **Create API Route**: `app/api/admin/verifications/doctors/route.ts`
   - List doctors with pending verification
   - Include: license number, credentials, documents
   - Filter by: verification status
   - Query from: `doctors` with `doctor_credentials`, `files`

2. **Create API Route**: `app/api/admin/verifications/doctors/[id]/route.ts`
   - Get doctor verification details
   - Verify: Update `licenseVerificationStatus` to 'verified'
   - Reject: Update to 'rejected' with reason
   - Create audit log entry

3. **Update DoctorVerifications Component**:
   - Table: Name, License Number, Status, Submitted Date, Actions
   - View button: Show credentials and documents
   - Verify/Reject buttons with confirmation dialogs
   - File preview for credentials

4. **Add Verification Detail View**:
   - Display all credentials with file downloads
   - Show doctor profile information
   - Add verification notes/comments
   - History of verification status changes

---

## 4. Verifications - Hospitals (`/admin/verifications/hospitals`)

### API Endpoints Needed:
```
GET /api/admin/verifications/hospitals
GET /api/admin/verifications/hospitals/:id
PUT /api/admin/verifications/hospitals/:id/verify
PUT /api/admin/verifications/hospitals/:id/reject
```

### Implementation Steps:

1. **Create API Route**: `app/api/admin/verifications/hospitals/route.ts`
   - List hospitals with pending verification
   - Include: registration number, documents
   - Filter by: verification status
   - Query from: `hospitals` with `hospital_documents`, `files`

2. **Create API Route**: `app/api/admin/verifications/hospitals/[id]/route.ts`
   - Get hospital verification details
   - Verify: Update `licenseVerificationStatus` to 'verified'
   - Reject: Update to 'rejected' with reason
   - Create audit log entry

3. **Update HospitalVerifications Component**:
   - Table: Hospital Name, Registration Number, Status, Submitted Date, Actions
   - View button: Show all documents
   - Verify/Reject buttons
   - Document preview/download

4. **Add Verification Detail View**:
   - Display all documents with file downloads
   - Show hospital information
   - Add verification notes
   - History of verification status changes

---

## 5. Specialties Management (`/admin/specialties`)

### API Endpoints Needed:
```
GET /api/admin/specialties
POST /api/admin/specialties
PUT /api/admin/specialties/:id
DELETE /api/admin/specialties/:id
```

### Implementation Steps:

1. **Create API Route**: `app/api/admin/specialties/route.ts`
   - List all specialties
   - Create new specialty
   - Query from: `specialties`

2. **Create API Route**: `app/api/admin/specialties/[id]/route.ts`
   - Get specialty details
   - Update specialty
   - Delete specialty (check for dependencies first)

3. **Update SpecialtiesManagement Component**:
   - Table: Name, Description, Doctor Count, Hospital Count, Actions
   - Add specialty form (modal or inline)
   - Edit specialty form
   - Delete with confirmation (check if used)
   - Show usage statistics

4. **Add Validation**:
   - Check if specialty is used by doctors/hospitals before deletion
   - Unique name validation
   - Required fields validation

---

## 6. Subscription Plans (`/admin/plans`)

### API Endpoints Needed:
```
GET /api/admin/plans
POST /api/admin/plans
PUT /api/admin/plans/:id
DELETE /api/admin/plans/:id
GET /api/admin/plans/:id/features
```

### Implementation Steps:

1. **Create API Route**: `app/api/admin/plans/route.ts`
   - List all subscription plans
   - Create new plan
   - Query from: `subscription_plans` with `doctor_plan_features`, `hospital_plan_features`

2. **Create API Route**: `app/api/admin/plans/[id]/route.ts`
   - Get plan details with features
   - Update plan
   - Delete plan (check for active subscriptions)

3. **Create API Route**: `app/api/admin/plans/[id]/features/route.ts`
   - Get plan features
   - Update plan features

4. **Update SubscriptionPlans Component**:
   - Table: Name, Tier, User Role, Price, Currency, Actions
   - Add plan form with features
   - Edit plan form
   - Toggle plan active/inactive
   - Show active subscriptions count

5. **Add Plan Features Management**:
   - Doctor plan features: visibility weight, max affiliations
   - Hospital plan features: max patients, premium doctors access
   - Form validation for feature values

---

## 7. Assignments Monitor (`/admin/assignments`)

### API Endpoints Needed:
```
GET /api/admin/assignments
GET /api/admin/assignments/:id
PUT /api/admin/assignments/:id/status
GET /api/admin/assignments/stats
```

### Implementation Steps:

1. **Create API Route**: `app/api/admin/assignments/route.ts`
   - List all assignments with pagination
   - Filter by: status, priority, date range, doctor, hospital
   - Include: doctor name, hospital name, patient name
   - Query from: `assignments` with joins

2. **Create API Route**: `app/api/admin/assignments/[id]/route.ts`
   - Get assignment details
   - Update assignment status
   - View assignment history

3. **Create API Route**: `app/api/admin/assignments/stats/route.ts`
   - Assignment statistics: by status, by priority, by month
   - Query aggregations from `assignments`

4. **Update AssignmentsMonitor Component**:
   - Table: ID, Doctor, Hospital, Patient, Priority, Status, Requested At, Actions
   - Filters: Status, Priority, Date Range, Doctor, Hospital
   - View assignment details modal
   - Status update dropdown
   - Export to CSV functionality

5. **Add Assignment Detail View**:
   - Full assignment information
   - Treatment notes
   - Payment information
   - Rating and review
   - Timeline/history

---

## 8. Affiliations (`/admin/affiliations`)

### API Endpoints Needed:
```
GET /api/admin/affiliations
POST /api/admin/affiliations
PUT /api/admin/affiliations/:id/status
DELETE /api/admin/affiliations/:id
```

### Implementation Steps:

1. **Create API Route**: `app/api/admin/affiliations/route.ts`
   - List all doctor-hospital affiliations
   - Filter by: status, doctor, hospital
   - Include: doctor name, hospital name
   - Query from: `doctor_hospital_affiliations` with joins

2. **Create API Route**: `app/api/admin/affiliations/[id]/route.ts`
   - Get affiliation details
   - Update affiliation status
   - Delete affiliation

3. **Update Affiliations Component**:
   - Table: Doctor, Hospital, Status, Is Preferred, Created At, Actions
   - Filters: Status, Doctor, Hospital
   - Create new affiliation form
   - Status update (active, inactive, suspended)
   - Toggle preferred status

---

## 9. Subscriptions Overview (`/admin/subscriptions`)

### API Endpoints Needed:
```
GET /api/admin/subscriptions
GET /api/admin/subscriptions/:id
PUT /api/admin/subscriptions/:id/status
GET /api/admin/subscriptions/expiring
```

### Implementation Steps:

1. **Create API Route**: `app/api/admin/subscriptions/route.ts`
   - List all subscriptions
   - Filter by: status, plan, user
   - Include: user info, plan info
   - Query from: `subscriptions` with joins

2. **Create API Route**: `app/api/admin/subscriptions/[id]/route.ts`
   - Get subscription details
   - Update subscription status
   - Cancel subscription
   - Extend subscription

3. **Create API Route**: `app/api/admin/subscriptions/expiring/route.ts`
   - List subscriptions expiring soon (next 7/30 days)
   - Query from: `subscriptions` with date filtering

4. **Update SubscriptionsOverview Component**:
   - Table: User, Plan, Status, Start Date, End Date, Auto Renew, Actions
   - Filters: Status, Plan, Expiring Soon
   - Status update dropdown
   - Cancel subscription with confirmation
   - Extend subscription form

---

## 10. Analytics (`/admin/analytics`)

### API Endpoints Needed:
```
GET /api/admin/analytics/overview
GET /api/admin/analytics/users
GET /api/admin/analytics/assignments
GET /api/admin/analytics/revenue
GET /api/admin/analytics/trends
```

### Implementation Steps:

1. **Create API Route**: `app/api/admin/analytics/overview/route.ts`
   - Overall statistics: total users, assignments, revenue
   - Growth percentages
   - Query aggregations from multiple tables

2. **Create API Route**: `app/api/admin/analytics/users/route.ts`
   - User growth over time
   - Users by role
   - Active vs inactive users
   - Query from: `users` with date grouping

3. **Create API Route**: `app/api/admin/analytics/assignments/route.ts`
   - Assignment trends
   - Assignments by status
   - Assignments by priority
   - Query from: `assignments`

4. **Create API Route**: `app/api/admin/analytics/revenue/route.ts`
   - Revenue by month
   - Revenue by plan
   - Payment transaction stats
   - Query from: `payment_transactions`, `orders`, `assignment_payments`

5. **Update Analytics Component**:
   - Multiple chart sections
   - Date range picker
   - Export reports
   - Real-time data refresh
   - Use Recharts for visualizations

---

## 11. Audit Logs (`/admin/audit-logs`)

### API Endpoints Needed:
```
GET /api/admin/audit-logs
GET /api/admin/audit-logs/:id
GET /api/admin/audit-logs/export
```

### Implementation Steps:

1. **Create API Route**: `app/api/admin/audit-logs/route.ts`
   - List audit logs with pagination
   - Filter by: actor type, action, entity type, date range, user
   - Query from: `audit_logs` with joins to `users`

2. **Create API Route**: `app/api/admin/audit-logs/[id]/route.ts`
   - Get single audit log entry
   - Show full details and JSON payload

3. **Create API Route**: `app/api/admin/audit-logs/export/route.ts`
   - Export audit logs to CSV/JSON
   - Filter by same criteria as list

4. **Update AuditLogs Component**:
   - Table: Timestamp, Actor, Action, Entity Type, Entity ID, Details, Actions
   - Filters: Actor Type, Action, Entity Type, Date Range, User
   - View details modal (show JSON)
   - Export button
   - Pagination

---

## 12. Support Tickets (`/admin/support`)

### API Endpoints Needed:
```
GET /api/admin/support/tickets
GET /api/admin/support/tickets/:id
PUT /api/admin/support/tickets/:id
POST /api/admin/support/tickets/:id/assign
POST /api/admin/support/tickets/:id/comment
```

### Implementation Steps:

1. **Create API Route**: `app/api/admin/support/tickets/route.ts`
   - List support tickets
   - Filter by: status, priority, category, assigned to
   - Query from: `support_tickets` with joins

2. **Create API Route**: `app/api/admin/support/tickets/[id]/route.ts`
   - Get ticket details
   - Update ticket (status, priority, category)
   - Assign ticket to admin
   - Add comments/responses

3. **Update SupportTickets Component**:
   - Table: ID, Subject, Category, Priority, Status, Assigned To, Created At, Actions
   - Filters: Status, Priority, Category, Assigned To
   - View ticket detail modal
   - Status update
   - Assign to admin dropdown
   - Add comment form

4. **Add Ticket Detail View**:
   - Full ticket information
   - User information
   - Comments/thread
   - Status history
   - Assignment history

---

## 13. System Settings (`/admin/settings`)

### API Endpoints Needed:
```
GET /api/admin/settings
PUT /api/admin/settings
GET /api/admin/settings/notifications
PUT /api/admin/settings/notifications
```

### Implementation Steps:

1. **Create API Route**: `app/api/admin/settings/route.ts`
   - Get system settings
   - Update system settings
   - Store in database or environment variables

2. **Create API Route**: `app/api/admin/settings/notifications/route.ts`
   - Get notification preferences
   - Update notification preferences

3. **Update SystemSettings Component**:
   - Settings form sections:
     - General Settings
     - Email Settings
     - Payment Settings
     - Notification Settings
     - Security Settings
   - Save button with validation
   - Reset to defaults option

---

## Common Implementation Patterns

### 1. Database Queries
```typescript
// Example: Get users with pagination
import { db } from '@/lib/db';
import { users, doctors, hospitals } from '@/src/db/drizzle/migrations/schema';
import { eq, and, or, like, desc } from 'drizzle-orm';

const getUsers = async (page: number, limit: number, filters: any) => {
  const offset = (page - 1) * limit;
  
  const whereConditions = [];
  if (filters.role) whereConditions.push(eq(users.role, filters.role));
  if (filters.status) whereConditions.push(eq(users.status, filters.status));
  if (filters.search) {
    whereConditions.push(
      or(
        like(users.email, `%${filters.search}%`),
        // Add more search fields
      )
    );
  }
  
  const result = await db
    .select()
    .from(users)
    .where(and(...whereConditions))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(users.createdAt));
    
  return result;
};
```

### 2. API Route Structure
```typescript
// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUsers } from '@/lib/queries/users';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const filters = {
      role: searchParams.get('role'),
      status: searchParams.get('status'),
      search: searchParams.get('search'),
    };
    
    const users = await getUsers(page, limit, filters);
    const total = await getUsersCount(filters);
    
    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

### 3. Component Data Fetching
```typescript
// Using React Query
import { useQuery } from '@tanstack/react-query';

export function UsersManagement() {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['users', page, filters],
    queryFn: () => fetchUsers(page, filters),
  });
  
  // Render component
}
```

### 4. Audit Logging
```typescript
// Create audit log entry
import { auditLogs } from '@/src/db/drizzle/migrations/schema';

async function createAuditLog(
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  details: any
) {
  await db.insert(auditLogs).values({
    userId,
    actorType: 'admin',
    action,
    entityType,
    entityId,
    details,
  });
}
```

---

## Priority Implementation Order

1. **High Priority** (Core Admin Functions):
   - Dashboard
   - Users Management
   - Verifications (Doctors & Hospitals)
   - Support Tickets

2. **Medium Priority** (Business Operations):
   - Assignments Monitor
   - Subscriptions Overview
   - Subscription Plans
   - Affiliations

3. **Low Priority** (Analytics & Settings):
   - Analytics
   - Audit Logs
   - Specialties Management
   - System Settings

---

## Testing Checklist

For each page, test:
- ✅ Data loading and display
- ✅ Filtering and search
- ✅ Pagination
- ✅ Create/Update/Delete operations
- ✅ Error handling
- ✅ Loading states
- ✅ Responsive design
- ✅ Permission checks (admin only)
- ✅ Audit log creation
- ✅ Data validation

---

## Security Considerations

1. **Authentication**: All admin routes must require admin role
2. **Authorization**: Verify user has admin role before allowing actions
3. **Input Validation**: Validate all inputs on server side
4. **SQL Injection**: Use parameterized queries (Drizzle ORM handles this)
5. **Rate Limiting**: Add rate limiting to API routes
6. **Audit Logging**: Log all admin actions
7. **Data Sanitization**: Sanitize user inputs before storing

---

## Next Steps

1. Start with Dashboard implementation
2. Implement Users Management
3. Implement Verifications
4. Continue with remaining pages in priority order
5. Add comprehensive error handling
6. Add loading states and skeletons
7. Implement proper pagination
8. Add export functionality where needed
9. Write tests for critical paths
10. Deploy and monitor


