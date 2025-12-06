# Doctor Credentials Upload API

## Endpoint
`POST /api/doctors/{doctorId}/credentials/upload`

## Authentication
Requires Bearer token in Authorization header:
```
Authorization: Bearer <access_token>
```

## Request Format
**Content-Type:** `multipart/form-data`

### FormData Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | ✅ Yes | The credential file (PDF, PNG, JPG, JPEG) |
| `credentialType` | String | ✅ Yes | Type of credential: `degree`, `certificate`, `license`, or `other` |
| `title` | String | ✅ Yes | Title of the credential (e.g., "MBBS Degree") |
| `institution` | String | ❌ No | Institution that issued the credential (e.g., "AIIMS Delhi") |

### Example Request (JavaScript/React Native)

```javascript
const formData = new FormData();
formData.append('file', {
  uri: fileUri,           // For React Native: file path/URI
  type: 'application/pdf', // or 'image/png', 'image/jpeg'
  name: 'degree.pdf',     // Original filename
});
formData.append('credentialType', 'degree');
formData.append('title', 'MBBS Degree');
formData.append('institution', 'AIIMS Delhi'); // Optional

const response = await fetch(`/api/doctors/${doctorId}/credentials/upload`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    // Don't set Content-Type header - browser/React Native will set it automatically with boundary
  },
  body: formData,
});

const data = await response.json();
```

### Example Request (React Native with react-native-document-picker)

```javascript
import DocumentPicker from 'react-native-document-picker';

// Pick file
const result = await DocumentPicker.pick({
  type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
});

const formData = new FormData();
formData.append('file', {
  uri: result[0].uri,
  type: result[0].type,
  name: result[0].name,
});
formData.append('credentialType', 'degree');
formData.append('title', 'MBBS Degree');
formData.append('institution', 'AIIMS Delhi');

const response = await fetch(`/api/doctors/${doctorId}/credentials/upload`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
  body: formData,
});
```

### Example Request (iOS Swift)

```swift
import Foundation

let url = URL(string: "https://your-api.com/api/doctors/\(doctorId)/credentials/upload")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")

let boundary = UUID().uuidString
request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

var body = Data()

// File
body.append("--\(boundary)\r\n".data(using: .utf8)!)
body.append("Content-Disposition: form-data; name=\"file\"; filename=\"degree.pdf\"\r\n".data(using: .utf8)!)
body.append("Content-Type: application/pdf\r\n\r\n".data(using: .utf8)!)
body.append(fileData)
body.append("\r\n".data(using: .utf8)!)

// credentialType
body.append("--\(boundary)\r\n".data(using: .utf8)!)
body.append("Content-Disposition: form-data; name=\"credentialType\"\r\n\r\n".data(using: .utf8)!)
body.append("degree\r\n".data(using: .utf8)!)

// title
body.append("--\(boundary)\r\n".data(using: .utf8)!)
body.append("Content-Disposition: form-data; name=\"title\"\r\n\r\n".data(using: .utf8)!)
body.append("MBBS Degree\r\n".data(using: .utf8)!)

// institution (optional)
body.append("--\(boundary)\r\n".data(using: .utf8)!)
body.append("Content-Disposition: form-data; name=\"institution\"\r\n\r\n".data(using: .utf8)!)
body.append("AIIMS Delhi\r\n".data(using: .utf8)!)

body.append("--\(boundary)--\r\n".data(using: .utf8)!)

request.httpBody = body

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    // Handle response
}
task.resume()
```

### Example Request (Android Kotlin)

```kotlin
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.File

val client = OkHttpClient()

val file = File(filePath)
val requestBody = MultipartBody.Builder()
    .setType(MultipartBody.FORM)
    .addFormDataPart("file", file.name, file.asRequestBody("application/pdf".toMediaType()))
    .addFormDataPart("credentialType", "degree")
    .addFormDataPart("title", "MBBS Degree")
    .addFormDataPart("institution", "AIIMS Delhi")
    .build()

val request = Request.Builder()
    .url("https://your-api.com/api/doctors/$doctorId/credentials/upload")
    .addHeader("Authorization", "Bearer $accessToken")
    .post(requestBody)
    .build()

val response = client.newCall(request).execute()
```

## Response

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Credential uploaded and created successfully",
  "data": {
    "credential": {
      "id": "uuid",
      "doctorId": "uuid",
      "fileId": "uuid",
      "credentialType": "degree",
      "title": "MBBS Degree",
      "institution": "AIIMS Delhi",
      "verificationStatus": "pending",
      "uploadedAt": "2024-01-15T10:30:00Z"
    },
    "file": {
      "fileId": "uuid",
      "url": "https://...",
      "filename": "degree.pdf"
    }
  }
}
```

### Error Responses

**400 Bad Request** - Missing required fields or invalid credential type
```json
{
  "success": false,
  "message": "File is required"
}
```

**401 Unauthorized** - Invalid or missing token
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**403 Forbidden** - Insufficient permissions
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details"
}
```

## Notes

1. **File Size**: Recommended max 5MB (check with backend team for exact limit)
2. **File Types**: PDF, PNG, JPG, JPEG are supported
3. **Folder/Bucket**: Backend automatically determines storage location - frontend doesn't need to specify
4. **Verification Status**: All new credentials start with `pending` status
5. **Content-Type**: Don't manually set `Content-Type` header when using FormData - the library will set it with the correct boundary

## Important for Mobile Developers

- ✅ **Do NOT** specify `folder` or `bucket` in FormData - backend handles this
- ✅ **Do NOT** set `Content-Type` header manually - let the HTTP client handle it
- ✅ File field should include: `uri`, `type`, `name` (for React Native)
- ✅ All string fields should be sent as plain text in FormData
- ✅ `institution` is optional - can be omitted if not available

