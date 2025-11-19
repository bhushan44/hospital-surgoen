# Pages Flow - Complete Navigation Guide

## 🏠 Landing Page

### `/` - Home Page
- **Purpose**: Entry point of the application
- **Actions**:
  - "Get Started" → `/onboarding/role-selection`
  - "API Documentation" → `/api-docs`
  - "Sign in" → `/onboarding/role-selection`

---

## 👤 Role Selection

### `/onboarding/role-selection` - Step 2 of 5
- **Purpose**: User selects their role (Doctor or Hospital)
- **Actions**:
  - Select "Doctor" → `/onboarding/doctor/step-2`
  - Select "Hospital" → `/onboarding/hospital/step-3`
  - Back arrow → `/` (Home)

---

## 🏥 HOSPITAL FLOW

### Step 1: Role Selection
- `/onboarding/role-selection` (shared with doctors)

### Step 2: Hospital Registration
- **`/onboarding/hospital/step-3`** - Step 3 of 5
  - **Purpose**: Create hospital account
  - **Fields**: Hospital Name, Email, Password
  - **Actions**:
    - Submit → Creates account → `/onboarding/hospital/step-4`
    - Back arrow → `/onboarding/role-selection`

### Step 3: Hospital Details
- **`/onboarding/hospital/step-4`** - Step 4 of 5
  - **Purpose**: Complete hospital profile
  - **Fields**: Hospital Type, Contact Phone, Address, Departments
  - **Actions**:
    - Submit → `/onboarding/hospital/step-5`
    - Back arrow → `/onboarding/hospital/step-3`

### Step 4: Success Screen
- **`/onboarding/hospital/step-5`** - Step 5 of 5
  - **Purpose**: Onboarding completion confirmation
  - **Actions**:
    - "Go to Dashboard" → `/hospital/dashboard`

---

## 🏥 HOSPITAL DASHBOARD & FEATURES

### Main Dashboard
- **`/hospital/dashboard`**
  - **Purpose**: Main hospital dashboard
  - **Features**:
    - Find Available Doctors (search & filters)
    - Patient Assignments list
    - "Add Patient" button
  - **Navigation**:
    - Bottom nav: Schedule (active) | Alerts | Profile
    - "Add Patient" → `/hospital/patients/add`
    - "Assign Doctor" → (opens doctor selection modal)

### Patient Management
- **`/hospital/patients/add`**
  - **Purpose**: Add new patient
  - **Fields**: Personal info, Medical info, Room type, Notes
  - **Actions**:
    - "Add Patient" → `/hospital/dashboard`
    - "Cancel" → `/hospital/dashboard`
    - Close (X) → `/hospital/dashboard`

### Alerts/Notifications
- **`/hospital/alerts`**
  - **Purpose**: View all notifications
  - **Features**: Notification cards with icons
  - **Navigation**:
    - Bottom nav: Schedule | Alerts (active) | Profile

### Profile
- **`/hospital/profile`**
  - **Purpose**: View hospital profile
  - **Features**: Hospital info, departments, contact details
  - **Actions**:
    - "Edit Profile" → `/hospital/profile/edit` (to be implemented)
  - **Navigation**:
    - Bottom nav: Schedule | Alerts | Profile (active)

### Subscriptions
- **`/hospital/subscriptions`**
  - **Purpose**: View and select subscription plans
  - **Features**: Plan cards (Basic, Gold, Platinum)
  - **Actions**:
    - "Upgrade Now" → `/hospital/payment?plan=gold` or `?plan=platinum`
    - Close (X) → `/hospital/dashboard`

### Payment Flow
- **`/hospital/payment`**
  - **Purpose**: Complete payment for subscription
  - **Features**: Payment method selection (Card/UPI/Net Banking)
  - **Actions**:
    - "Pay ₹X" → `/hospital/payment/success?txn=XXX&plan=XXX`
    - Close (X) → `/hospital/subscriptions`

- **`/hospital/payment/success`**
  - **Purpose**: Payment confirmation
  - **Actions**:
    - "Go to Dashboard" → `/hospital/dashboard`
    - "Download Receipt" → (downloads receipt)

---

## 👨‍⚕️ DOCTOR FLOW

### Step 1: Role Selection
- `/onboarding/role-selection` (shared with hospitals)

### Step 2: Doctor Registration
- **`/onboarding/doctor/step-2`** - Step 2 of 5
  - **Purpose**: Create doctor account
  - **Fields**: First Name, Last Name, Email, Phone, Password
  - **Actions**:
    - Submit → Creates account → `/onboarding/doctor/step-3`
    - Back arrow → `/onboarding/role-selection`

### Step 3: Professional Information
- **`/onboarding/doctor/step-3`** - Step 3 of 5
  - **Purpose**: Add professional details
  - **Fields**: Medical License Number, Years of Experience, Bio
  - **Actions**:
    - Submit → Creates doctor profile → `/onboarding/doctor/step-4`
    - Back arrow → `/onboarding/doctor/step-2`

### Step 4: Select Specialties
- **`/onboarding/doctor/step-4`** - Step 4 of 5
  - **Purpose**: Choose medical specialties
  - **Fields**: Multi-select specialties, Primary specialty
  - **Actions**:
    - Submit → `/onboarding/doctor/step-5`
    - Back arrow → `/onboarding/doctor/step-3`

### Step 5: Success Screen
- **`/onboarding/doctor/step-5`** - Step 5 of 5
  - **Purpose**: Onboarding completion confirmation
  - **Actions**:
    - "Go to Dashboard" → `/doctor/dashboard`

---

## 👨‍⚕️ DOCTOR DASHBOARD & FEATURES

### Main Dashboard
- **`/doctor/dashboard`**
  - **Purpose**: Main doctor dashboard
  - **Features**:
    - Find Available Doctors (search & filters)
    - Doctor cards with expandable schedules
    - Time slot selection
    - "Book Appointment" button
  - **Navigation**:
    - Bottom nav: Schedule (active) | Alerts | Profile
    - "Show Schedule" / "Hide Schedule" → (expands/collapses)

### Alerts/Notifications
- **`/doctor/alerts`**
  - **Purpose**: View all notifications
  - **Features**: Notification cards with icons
  - **Navigation**:
    - Bottom nav: Schedule | Alerts (active) | Profile

### Profile
- **`/doctor/profile`**
  - **Purpose**: View doctor profile
  - **Features**: Doctor info, specialties, rating, bio
  - **Actions**:
    - "Edit Profile" → `/doctor/profile/edit` (to be implemented)
  - **Navigation**:
    - Bottom nav: Schedule | Alerts | Profile (active)

---

## 📚 API DOCUMENTATION

### `/api-docs`
- **Purpose**: Swagger UI for API documentation
- **Features**: Interactive API documentation
- **Navigation**: Accessible from home page

---

## 🔄 COMPLETE USER FLOWS

### Hospital Onboarding Flow
```
/ (Home)
  ↓
/onboarding/role-selection (Select Hospital)
  ↓
/onboarding/hospital/step-3 (Register - Name, Email, Password)
  ↓
/onboarding/hospital/step-4 (Details - Type, Phone, Address, Departments)
  ↓
/onboarding/hospital/step-5 (Success)
  ↓
/hospital/dashboard (Main Dashboard)
```

### Hospital Main Flow
```
/hospital/dashboard
  ├─→ /hospital/patients/add (Add Patient)
  │     └─→ /hospital/dashboard (After adding)
  ├─→ /hospital/alerts (Notifications)
  ├─→ /hospital/profile (Profile)
  ├─→ /hospital/subscriptions (Plans)
  │     └─→ /hospital/payment?plan=XXX (Payment)
  │           └─→ /hospital/payment/success (Success)
  │                 └─→ /hospital/dashboard
  └─→ (Bottom Navigation: Schedule | Alerts | Profile)
```

### Doctor Onboarding Flow
```
/ (Home)
  ↓
/onboarding/role-selection (Select Doctor)
  ↓
/onboarding/doctor/step-2 (Register - Name, Email, Phone, Password)
  ↓
/onboarding/doctor/step-3 (Professional Info - License, Experience, Bio)
  ↓
/onboarding/doctor/step-4 (Select Specialties)
  ↓
/onboarding/doctor/step-5 (Success)
  ↓
/doctor/dashboard (Main Dashboard)
```

### Doctor Main Flow
```
/doctor/dashboard
  ├─→ /doctor/alerts (Notifications)
  ├─→ /doctor/profile (Profile)
  └─→ (Bottom Navigation: Schedule | Alerts | Profile)
```

---

## 📱 BOTTOM NAVIGATION (Mobile)

### Hospital Bottom Nav
- **Schedule** → `/hospital/dashboard`
- **Alerts** → `/hospital/alerts`
- **Profile** → `/hospital/profile`

### Doctor Bottom Nav
- **Schedule** → `/doctor/dashboard`
- **Alerts** → `/doctor/alerts`
- **Profile** → `/doctor/profile`

---

## 🔐 AUTHENTICATION FLOW

### Login Flow (To be implemented)
- Currently, users are created during onboarding
- Token is stored in `localStorage` after signup
- Protected routes check for token in `localStorage`

### Token Storage
- `localStorage.setItem('token', accessToken)`
- `localStorage.setItem('userId', userId)`
- `localStorage.setItem('hospitalId', hospitalId)` (for hospitals)
- `localStorage.setItem('doctorId', doctorId)` (for doctors)

---

## 📊 PAGE SUMMARY

### Total Pages: 25+

#### Onboarding Pages (8)
1. `/` - Home
2. `/onboarding/role-selection` - Role selection
3. `/onboarding/hospital/step-3` - Hospital registration
4. `/onboarding/hospital/step-4` - Hospital details
5. `/onboarding/hospital/step-5` - Hospital success
6. `/onboarding/doctor/step-2` - Doctor registration
7. `/onboarding/doctor/step-3` - Doctor professional info
8. `/onboarding/doctor/step-4` - Doctor specialties
9. `/onboarding/doctor/step-5` - Doctor success

#### Hospital Pages (10)
10. `/hospital/dashboard` - Main dashboard
11. `/hospital/patients/add` - Add patient
12. `/hospital/alerts` - Notifications
13. `/hospital/profile` - Profile view
14. `/hospital/subscriptions` - Subscription plans
15. `/hospital/payment` - Payment form
16. `/hospital/payment/success` - Payment success

#### Doctor Pages (7)
17. `/doctor/dashboard` - Main dashboard
18. `/doctor/alerts` - Notifications
19. `/doctor/profile` - Profile view

#### Documentation (1)
20. `/api-docs` - API documentation

---

## 🎯 KEY NAVIGATION PATTERNS

### 1. **Linear Onboarding**
- Each step has a back button to previous step
- Progress bar shows completion percentage
- Final step redirects to dashboard

### 2. **Dashboard Hub**
- Main dashboard is the central hub
- Bottom navigation for quick access
- Modal/overlay for quick actions

### 3. **Form Flows**
- Multi-step forms with validation
- Clear error messages
- Continue/Cancel options

### 4. **Payment Flow**
- Plan selection → Payment → Success
- Can navigate back to subscriptions
- Success page redirects to dashboard

---

## 🚀 QUICK START PATHS

### For New Hospital User:
```
/ → /onboarding/role-selection → (Select Hospital) → 
/onboarding/hospital/step-3 → step-4 → step-5 → 
/hospital/dashboard
```

### For New Doctor User:
```
/ → /onboarding/role-selection → (Select Doctor) → 
/onboarding/doctor/step-2 → step-3 → step-4 → step-5 → 
/doctor/dashboard
```

### For Existing Users:
- Direct access to `/hospital/dashboard` or `/doctor/dashboard`
- (Login page to be implemented)

---

## 📝 NOTES

- All pages are client-side rendered (`'use client'`)
- Authentication uses JWT tokens stored in `localStorage`
- API calls include `Authorization: Bearer ${token}` header
- Bottom navigation is fixed at bottom for mobile experience
- Progress bars show step completion (40%, 60%, 80%, 100%)
- All forms include validation and error handling
- Success pages provide clear next steps




