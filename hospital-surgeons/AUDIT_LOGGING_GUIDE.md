# Audit Logging Implementation Guide

## Overview
This guide explains how to implement comprehensive audit logging across all API endpoints for write operations (POST, PUT, DELETE, PATCH).

## Centralized Audit Logger

The audit logger utility is located at: `lib/utils/audit-logger.ts`

### Key Functions:
- `createAuditLog(data)` - Main function to create audit logs
- `getRequestMetadata(req)` - Extracts IP, user agent, endpoint from request
- `buildChangesObject(oldData, newData, fields)` - Builds changes object for updates

## Implementation Pattern

### 1. Import the audit logger
```typescript
import { createAuditLog, getRequestMetadata, buildChangesObject } from '@/lib/utils/audit-logger';
```

### 2. For CREATE operations (POST)
```typescript
// After successfully creating the entity
const metadata = getRequestMetadata(req);
const adminUserId = req.headers.get('x-user-id') || null; // Adjust based on your auth

await createAuditLog({
  userId: adminUserId,
  actorType: 'admin', // or 'user', 'system', 'webhook'
  action: 'create',
  entityType: 'specialty', // or 'user', 'doctor', 'hospital', etc.
  entityId: newEntity.id,
  entityName: newEntity.name, // Human-readable name
  httpMethod: 'POST',
  endpoint: '/api/admin/specialties',
  ipAddress: metadata.ipAddress,
  userAgent: metadata.userAgent,
  details: {
    // Include relevant entity details
    description: newEntity.description,
    // ... other relevant fields
  },
});
```

### 3. For UPDATE operations (PUT/PATCH)
```typescript
// Before updating, get old data
const oldData = existingEntity[0];

// After updating
const [updatedEntity] = await db.update(...).returning();

const metadata = getRequestMetadata(req);
const adminUserId = req.headers.get('x-user-id') || null;

// Build changes object
const changes = buildChangesObject(
  { status: oldData.status, name: oldData.name },
  { status: updatedEntity.status, name: updatedEntity.name },
  ['status', 'name'] // Fields to track
);

await createAuditLog({
  userId: adminUserId,
  actorType: 'admin',
  action: 'update',
  entityType: 'user',
  entityId: userId,
  entityName: oldData.email,
  httpMethod: 'PUT',
  endpoint: `/api/admin/users/${userId}/status`,
  ipAddress: metadata.ipAddress,
  userAgent: metadata.userAgent,
  changes: changes,
  previousStatus: oldData.status,
  newStatus: updatedEntity.status,
  reason: body.reason, // If applicable
  details: {
    // Additional context
  },
});
```

### 4. For DELETE operations
```typescript
// Before deleting, get entity data
const existing = await db.select().from(...).where(...).limit(1);

// After deletion check (but before actual delete)
const metadata = getRequestMetadata(req);
const adminUserId = req.headers.get('x-user-id') || null;

// Delete the entity
await db.delete(...).where(...);

// Log the deletion
await createAuditLog({
  userId: adminUserId,
  actorType: 'admin',
  action: 'delete',
  entityType: 'specialty',
  entityId: specialtyId,
  entityName: existing[0].name,
  httpMethod: 'DELETE',
  endpoint: `/api/admin/specialties/${specialtyId}`,
  ipAddress: metadata.ipAddress,
  userAgent: metadata.userAgent,
  details: {
    // Include relevant info about what was deleted
    description: existing[0].description,
    deletedAt: new Date().toISOString(),
  },
});
```

## Endpoints That Need Audit Logging

### Already Implemented ✅
- `/api/admin/verifications/doctors/[id]/verify` - Doctor verification
- `/api/admin/verifications/doctors/[id]/reject` - Doctor rejection
- `/api/admin/verifications/hospitals/[id]/verify` - Hospital verification
- `/api/admin/users/[id]/status` - User status update
- `/api/admin/plans` - Plan creation
- `/api/admin/plans/[id]` - Plan update & delete
- `/api/admin/specialties` - Specialty creation
- `/api/admin/specialties/[id]` - Specialty update & delete

### Need Implementation 📝

#### Verifications
- `/api/admin/verifications/hospitals/[id]/reject` - Hospital rejection
- `/api/admin/doctor-credentials/[credentialId]` - Credential status update

#### Users Management
- `/api/admin/users` - User creation (POST)
- `/api/admin/users/[id]` - User update (PUT)
- `/api/admin/users/[id]` - User deletion (DELETE)
- `/api/admin/users/[id]/role` - User role update

#### Support Tickets
- `/api/admin/support/tickets` - Ticket creation (POST)
- `/api/admin/support/tickets/[id]` - Ticket update (PUT)
- `/api/admin/support/tickets/[id]` - Ticket deletion (DELETE)
- `/api/admin/support/tickets/[id]/assign` - Ticket assignment
- `/api/admin/support/tickets/[id]/comment` - Comment addition (already has basic logging)

#### Assignments
- `/api/admin/assignments` - Assignment creation (POST)
- `/api/admin/assignments/[id]` - Assignment update (PUT)
- `/api/admin/assignments/[id]` - Assignment deletion (DELETE)

#### Subscriptions
- `/api/admin/subscriptions/[id]` - Subscription update/delete

#### Affiliations
- `/api/admin/affiliations` - Affiliation creation (POST)
- `/api/admin/affiliations/[id]` - Affiliation update/delete

## Actor Type Guidelines

### `'admin'`
- All admin panel operations
- Admin user performing actions
- Default for admin routes

### `'user'`
- Regular users performing actions on their own data
- User updating their profile
- User creating assignments/bookings

### `'system'`
- Automated system processes
- Scheduled tasks
- Background jobs
- System-generated actions

### `'webhook'`
- External webhook integrations
- Third-party API callbacks
- Payment gateway webhooks

## Entity Types Reference

- `'user'` - User accounts
- `'doctor'` - Doctor profiles
- `'hospital'` - Hospital profiles
- `'assignment'` - Assignments/bookings
- `'subscription'` - Subscription plans
- `'subscription_plan'` - Subscription plan definitions
- `'specialty'` - Medical specialties
- `'support_ticket'` - Support tickets
- `'doctor_credential'` - Doctor credentials
- `'hospital_document'` - Hospital documents
- `'affiliation'` - Doctor-hospital affiliations
- `'order'` - Orders/payments

## Best Practices

1. **Always include entityName** - Human-readable name, not just ID
2. **Track changes for updates** - Use `buildChangesObject` to show old → new
3. **Include context** - Add relevant details in `details` field
4. **Get request metadata** - Always include IP, user agent, endpoint
5. **Async logging** - Audit logger is already async, won't block operations
6. **Error handling** - Logger handles errors internally, won't break main operation
7. **Don't log GET requests** - Only log write operations (POST, PUT, DELETE, PATCH)

## Example: Complete Implementation

```typescript
// Example: Update user role
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = getDb();
    const { id } = await params;
    const userId = id;
    const body = await req.json();
    const { role } = body;

    // Get existing user
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const oldUser = existingUser[0];

    // Update user
    const [updatedUser] = await db
      .update(users)
      .set({ role: role })
      .where(eq(users.id, userId))
      .returning();

    // Get request metadata
    const metadata = getRequestMetadata(req);
    const adminUserId = req.headers.get('x-user-id') || null;

    // Build changes
    const changes = buildChangesObject(
      { role: oldUser.role },
      { role: updatedUser.role },
      ['role']
    );

    // Create audit log
    await createAuditLog({
      userId: adminUserId,
      actorType: 'admin',
      action: 'update_role',
      entityType: 'user',
      entityId: userId,
      entityName: oldUser.email,
      httpMethod: 'PUT',
      endpoint: `/api/admin/users/${userId}/role`,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      changes: changes,
      details: {
        previousRole: oldUser.role,
        newRole: updatedUser.role,
        updatedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User role updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    // Error handling...
  }
}
```

## Notes

- The audit logger is **async and non-blocking** - it won't slow down your API
- Errors in audit logging are caught internally and logged to console
- All audit logs include timestamp automatically
- The `details` field is flexible JSON - add any relevant information

