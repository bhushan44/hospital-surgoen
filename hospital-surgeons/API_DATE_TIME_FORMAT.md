# API Date and Time Format Documentation

## Expected Format from Frontend

### For Availability Slots (`POST /api/doctors/{id}/availability`)

**Format:**
- `slotDate`: **String** in format `"YYYY-MM-DD"` (e.g., `"2024-01-15"`)
- `startTime`: **String** in format `"HH:mm"` (24-hour format, e.g., `"09:00"`, `"14:30"`)
- `endTime`: **String** in format `"HH:mm"` (24-hour format, e.g., `"10:00"`, `"15:30"`)

**Important Notes:**
1. **Date Format**: `YYYY-MM-DD` (ISO 8601 date format, date only, no time)
2. **Time Format**: `HH:mm` (24-hour format, no seconds, no timezone)
3. **No UTC Conversion**: Dates should be sent as the user selected them (local calendar date)
4. **No Timezone**: Times are timezone-agnostic (local time as selected by user)

### Example Request:
```json
{
  "slotDate": "2024-01-15",
  "startTime": "09:00",
  "endTime": "10:00",
  "notes": "Regular consultation",
  "status": "available",
  "isManual": true
}
```

## Backend Handling

The backend:
- Accepts dates as-is (no timezone conversion)
- Stores `slotDate` as PostgreSQL `date` type (timezone-agnostic)
- Stores `startTime`/`endTime` as PostgreSQL `time` type (timezone-agnostic)
- Treats dates as calendar dates (not timestamps)

## Frontend Implementation

### ✅ Correct Way:
```typescript
// HTML date input returns date in user's local timezone
const slotDate = e.target.value; // "2024-01-15" (as selected by user)

// Send directly without UTC conversion
await apiClient.post('/api/doctors/{id}/availability', {
  slotDate: slotDate, // "2024-01-15"
  startTime: "09:00",
  endTime: "10:00"
});
```

### ❌ Wrong Way (Don't Do This):
```typescript
// DON'T convert to UTC - this can shift the date by one day
const date = new Date(slotDate);
const utcDate = date.toISOString().split('T')[0]; // Might be different date!

// DON'T send UTC dates
await apiClient.post('/api/doctors/{id}/availability', {
  slotDate: utcDate, // Wrong! Date might be shifted
  startTime: "09:00",
  endTime: "10:00"
});
```

## Why This Matters

- **Date Input**: HTML `<input type="date">` returns the date as the user sees it in their timezone
- **Calendar Date**: "2024-01-15" should represent January 15, 2024 regardless of timezone
- **No Conversion Needed**: Since we're storing dates (not timestamps), no timezone conversion is needed
- **Consistency**: All users see the same calendar date, regardless of their timezone

## Template Generation

When generating slots from templates:
- Uses UTC for date calculations to ensure consistency
- Converts to `YYYY-MM-DD` format before storing
- Ensures same date is generated regardless of server timezone

