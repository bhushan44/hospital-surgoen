# Nodemailer Service Setup (For Testing)

## Overview
The `NodemailerService` is a testing alternative to `MailService` (SendGrid). It uses SMTP to send emails and can be used for local development and testing.

## Environment Variables

Add these to your `.env.local` file:

```env
# SMTP Configuration (for Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_EMAIL=your-email@gmail.com  # Alternative to SMTP_USER
SMTP_PASSWORD=your-app-password
SMTP_SECURE=false  # true for port 465, false for other ports
SMTP_FROM_EMAIL=your-email@gmail.com  # Optional, defaults to SMTP_USER/SMTP_EMAIL
```

## Gmail Setup

### Option 1: App Password (Recommended)
1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Go to App Passwords: https://myaccount.google.com/apppasswords
4. Generate a new app password for "Mail"
5. Use this 16-character password as `SMTP_PASSWORD`

### Option 2: Less Secure Apps (Not Recommended)
- Only works if you haven't enabled 2-Step Verification
- Less secure, not recommended for production

## Other Email Providers

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

### Yahoo
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
```

### Custom SMTP Server
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASSWORD=your-password
SMTP_SECURE=false
```

## Usage

The `NodemailerService` has the same interface as `MailService`, so you can easily switch between them:

```typescript
// Using Nodemailer (for testing)
import { NodemailerService } from '@/lib/services/nodemailer.service';
const mailService = new NodemailerService();

// Using SendGrid (for production)
import { MailService } from '@/lib/services/mail.service';
const mailService = new MailService();

// Both have the same interface
await mailService.sendTemplateMail({
  to: 'user@example.com',
  from: 'noreply@yourapp.com',
  subject: 'Test Email',
  templateId: 'password-reset', // File name in email-templates folder (without .html)
  dynamicData: {
    username: 'John Doe',
    resetPasswordUrl: 'https://yourapp.com/reset?token=xxx',
    appName: 'Healthcare Platform',
    year: '2026',
  },
});
```

## Template Files

Templates are stored in `email-templates/` folder:
- File name: `password-reset.html` → `templateId: 'password-reset'`
- Placeholders: `{{variableName}}` or `{{ variableName }}`
- Example: `{{username}}`, `{{resetPasswordUrl}}`, `{{appName}}`

## Testing Connection

You can verify your SMTP configuration:

```typescript
import { NodemailerService } from '@/lib/services/nodemailer.service';

const mailService = new NodemailerService();
const isValid = await mailService.verifyConnection();
console.log('SMTP Connection:', isValid ? 'Valid' : 'Invalid');
```

## Switching Between Services

To switch from SendGrid to Nodemailer (or vice versa), simply change the import:

**Before (SendGrid):**
```typescript
import { MailService } from '@/lib/services/mail.service';
const mailService = new MailService();
```

**After (Nodemailer):**
```typescript
import { NodemailerService } from '@/lib/services/nodemailer.service';
const mailService = new NodemailerService();
```

Both services have the same `sendTemplateMail()` method signature, so no other code changes are needed.

## Troubleshooting

### Error: "Invalid login"
- Check your email and password
- For Gmail, make sure you're using an App Password, not your regular password
- Verify 2-Step Verification is enabled (required for App Passwords)

### Error: "Connection timeout"
- Check firewall settings
- Verify SMTP host and port are correct
- Try different ports (587, 465, 25)

### Error: "Template file not found"
- Make sure template file exists in `email-templates/` folder
- Template ID should match filename without `.html` extension
- Example: `password-reset.html` → `templateId: 'password-reset'`

### Error: "Authentication failed"
- Gmail: Use App Password, not regular password
- Check if "Less secure app access" is enabled (if not using App Password)
- Verify SMTP credentials are correct

