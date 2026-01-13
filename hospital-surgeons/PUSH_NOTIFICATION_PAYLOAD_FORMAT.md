# Push Notification Payload Format for Mobile Developers

## Overview
This document describes the push notification payload format that your mobile app will receive from the backend when notifications are sent via Firebase Cloud Messaging (FCM).

## Notification Structure

### Standard FCM Notification Format (Simplified)
```json
{
  "notification": {
    "title": "Notification Title",
    "body": "Notification message text",
    "sound": "default",
    "badge": 1
  },
  "data": {
    // Simplified payload - only essential fields
    // All values in data must be strings (FCM requirement)
    "deepLink": "hospitalapp://view_assignment",
    "pn_id": "uuid-string",
    "type": "assignment_created|assignment_accepted|assignment_declined|assignment_completed|assignment_cancelled"
  }
}
```

### Payload Fields:
- **deepLink**: Deep link URL to navigate to the assignment screen (format: `hospitalapp://view_assignment`)
- **pn_id**: Assignment ID (the assignment identifier, not the notification ID)
- **type**: Notification type (e.g., `assignment_created`, `assignment_accepted`, etc.)

## Notification Types

### 1. Assignment Created
**Triggered when:** Hospital creates a new assignment for a doctor

**Payload:**
```json
{
  "notification": {
    "title": "New Assignment Request",
    "body": "You have a new assignment from {hospitalName} - {patientName}"
  },
  "data": {
    "deepLink": "hospitalapp://view_assignment",
    "pn_id": "{assignmentId}",
    "type": "assignment_created"
  }
}
```

### 2. Assignment Accepted
**Triggered when:** Doctor accepts an assignment

**Payload:**
```json
{
  "notification": {
    "title": "Assignment Accepted",
    "body": "{doctorName} has accepted the assignment for {patientName}"
  },
  "data": {
    "deepLink": "hospitalapp://view_assignment",
    "pn_id": "{assignmentId}",
    "type": "assignment_accepted"
  }
}
```

### 3. Assignment Declined
**Triggered when:** Doctor declines an assignment

**Payload:**
```json
{
  "notification": {
    "title": "Assignment Declined",
    "body": "{doctorName} has declined the assignment for {patientName}"
  },
  "data": {
    "deepLink": "hospitalapp://view_assignment",
    "pn_id": "{assignmentId}",
    "type": "assignment_declined"
  }
}
```

### 4. Assignment Completed
**Triggered when:** Doctor completes an assignment

**Payload:**
```json
{
  "notification": {
    "title": "Assignment Completed",
    "body": "{doctorName} has completed the assignment for {patientName}"
  },
  "data": {
    "deepLink": "hospitalapp://view_assignment",
    "pn_id": "{assignmentId}",
    "type": "assignment_completed"
  }
}
```

### 5. Assignment Cancelled
**Triggered when:** Hospital or Doctor cancels an assignment

**Payload:**
```json
{
  "notification": {
    "title": "Assignment Cancelled",
    "body": "{senderName} has cancelled the assignment for {patientName}"
  },
  "data": {
    "deepLink": "hospitalapp://view_assignment",
    "pn_id": "{assignmentId}",
    "type": "assignment_cancelled"
  }
}
```

## Deep Linking

All notifications include a `deepLink` field in the data payload:
- Format: `hospitalapp://view_assignment`
- The assignment ID is provided separately in the `pn_id` field

**Implementation:**
- When user taps the notification, extract `pn_id` from `data.pn_id` (this is the assignment ID)
- Use the `deepLink` (`hospitalapp://view_assignment`) to navigate to the assignment screen
- Pass the `pn_id` (assignment ID) to the assignment details screen
- Fetch assignment details using the assignment ID from `pn_id`

## Important Notes

1. **All data values are strings**: FCM requires all values in the `data` object to be strings. The backend converts all values to strings.

2. **Notification vs Data**: 
   - `notification` object: Used for display when app is in background
   - `data` object: Always delivered, used for app logic and deep linking

3. **Handling in App**:
   - When app is in **foreground**: Handle via `onMessage` callback
   - When app is in **background**: System shows notification, handle via `onNotificationOpenedApp` or `getInitialNotification`
   - Extract `data` payload for navigation and app logic

4. **Required Fields** (Simplified Payload):
   - `deepLink`: Always present - Deep link to navigate to assignment screen
   - `pn_id`: Always present - Assignment ID (the assignment identifier)
   - `type`: Always present - Notification type (e.g., `assignment_created`, `assignment_accepted`)

5. **Payload Simplification**:
   - The payload has been simplified to only include essential fields
   - All detailed information (hospital name, doctor name, patient name, etc.) is removed from payload
   - Mobile app should fetch assignment details using the assignment ID from the deep link

## Example Implementation (React Native / Flutter)

### React Native (using `@react-native-firebase/messaging`)
```javascript
// Handle foreground messages
messaging().onMessage(async remoteMessage => {
  const { notification, data } = remoteMessage;
  
  // Extract assignment ID from pn_id (deep link doesn't contain ID)
  const assignmentId = data?.pn_id;
  const deepLink = data?.deepLink; // hospitalapp://view_assignment
  const type = data?.type;
  
  if (assignmentId && deepLink === 'hospitalapp://view_assignment') {
    navigation.navigate('AssignmentDetails', { 
      assignmentId,
      notificationType: type
    });
  }
});

// Handle background/quit state messages
messaging().onNotificationOpenedApp(remoteMessage => {
  const assignmentId = remoteMessage.data?.pn_id;
  const deepLink = remoteMessage.data?.deepLink;
  const type = remoteMessage.data?.type;
  
  if (assignmentId && deepLink === 'hospitalapp://view_assignment') {
    navigation.navigate('AssignmentDetails', { 
      assignmentId,
      notificationType: type
    });
  }
});
```

### Flutter (using `firebase_messaging`)
```dart
// Handle foreground messages
FirebaseMessaging.onMessage.listen((RemoteMessage message) {
  final data = message.data;
  final assignmentId = data['pn_id']; // Assignment ID directly from pn_id
  final type = data['type'];
  
  if (assignmentId != null) {
    Navigator.pushNamed(
      context, 
      '/assignment', 
      arguments: {
        'assignmentId': assignmentId,
        'notificationType': type,
      }
    );
  }
});

// Handle background messages
FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
  final data = message.data;
  final assignmentId = data['pn_id']; // Assignment ID directly from pn_id
  final type = data['type'];
  
  if (assignmentId != null) {
    Navigator.pushNamed(
      context, 
      '/assignment', 
      arguments: {
        'assignmentId': assignmentId,
        'notificationType': type,
      }
    );
  }
});
```

## Testing

To test push notifications:
1. Register device token during login (see Device Token Registration below)
2. Create/update an assignment from the web interface
3. Check device for notification
4. Tap notification to verify deep linking works

## Device Token Registration

During login, send the FCM device token in the request:

**Endpoint:** `POST /api/users/login`

**Request Body:**
```json
{
  "email": "doctor@example.com",
  "password": "password123",
  "device": {
    "device_token": "YOUR_FCM_TOKEN_FROM_FIREBASE_SDK",
    "device_type": "ios",  // or "android"
    "app_version": "1.0.0",
    "os_version": "17.0",
    "device_name": "iPhone 15 Pro",
    "is_active": true
  }
}
```

**Important:** 
- `device_token` must be the actual FCM token from Firebase Cloud Messaging SDK
- Do NOT send placeholder tokens like "web-token"
- Get FCM token using Firebase SDK: `FirebaseMessaging.instance.getToken()` (Flutter) or `messaging().getToken()` (React Native)

