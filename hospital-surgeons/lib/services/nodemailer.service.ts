import nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

export interface SendTemplateMailOptions {
  to: string | string[];
  from?: string;
  subject?: string;
  templateId: string; // For Nodemailer, this will be the template file name
  dynamicData: Record<string, any>; // dynamic fields to replace placeholders
  bcc?: string | string[];
}

export class NodemailerService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Get SMTP configuration from environment variables
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER || process.env.SMTP_EMAIL;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const smtpSecure = process.env.SMTP_SECURE === 'true'; // true for 465, false for other ports

    console.log('📧 [NODEMAILER] Initializing Nodemailer service...');
    console.log('📧 [NODEMAILER] SMTP Host:', smtpHost);
    console.log('📧 [NODEMAILER] SMTP Port:', smtpPort);
    console.log('📧 [NODEMAILER] SMTP User:', smtpUser ? 'Set' : 'Not set');
    console.log('📧 [NODEMAILER] SMTP Password:', smtpPassword ? 'Set' : 'Not set');
    console.log('📧 [NODEMAILER] SMTP Secure:', smtpSecure);

    if (!smtpUser || !smtpPassword) {
      throw new Error('SMTP_USER (or SMTP_EMAIL) and SMTP_PASSWORD must be defined in .env');
    }

    // Create transporter
    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
      // For Gmail, you might need to use OAuth2 or App Password
      // For testing, you can use less secure apps or App Password
    });

    console.log('✅ [NODEMAILER] Nodemailer service initialized successfully');
  }

  /**
   * Load and process HTML template
   * Replaces placeholders like {{variableName}} with values from dynamicData
   */
  private loadTemplate(templateId: string, dynamicData: Record<string, any>): string {
    const templatesDir = path.join(process.cwd(), 'email-templates');
    const templatePath = path.join(templatesDir, `${templateId}.html`);

    console.log('📧 [NODEMAILER] Loading template:', templatePath);

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found: ${templatePath}`);
    }

    let html = fs.readFileSync(templatePath, 'utf-8');

    // Replace placeholders: {{variableName}} or {{ variableName }}
    // Supports both {{var}} and {{ var }} formats
    Object.keys(dynamicData).forEach((key) => {
      const value = dynamicData[key];
      // Replace {{key}} and {{ key }} patterns
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      html = html.replace(regex, String(value || ''));
    });

    console.log('📧 [NODEMAILER] Template processed with', Object.keys(dynamicData).length, 'variables');

    return html;
  }

  /**
   * Send email using template
   * Similar interface to SendGrid MailService for easy switching
   */
  async sendTemplateMail(options: SendTemplateMailOptions) {
    console.log('📧 [NODEMAILER] sendTemplateMail called');
    console.log('📧 [NODEMAILER] Email options:', {
      to: options.to,
      from: options.from || 'no-reply@yourapp.com',
      subject: options.subject,
      templateId: options.templateId,
      hasDynamicData: !!options.dynamicData,
      dynamicDataKeys: options.dynamicData ? Object.keys(options.dynamicData) : [],
    });

    // Validate required fields
    if (!options.to) {
      const error = new Error('Email "to" field is required');
      console.error('❌ [NODEMAILER] Validation error:', error.message);
      throw error;
    }

    if (!options.templateId) {
      const error = new Error('Template ID is required');
      console.error('❌ [NODEMAILER] Validation error:', error.message);
      throw error;
    }

    try {
      // Load and process template
      const html = this.loadTemplate(options.templateId, options.dynamicData);

      // Prepare email options
      const fromEmail = options.from || process.env.SMTP_FROM_EMAIL || process.env.SMTP_EMAIL || 'no-reply@yourapp.com';
      const subject = options.subject || 'Notification';

      // Convert to array if single email
      const toEmails = Array.isArray(options.to) ? options.to : [options.to];
      const bccEmails = options.bcc ? (Array.isArray(options.bcc) ? options.bcc : [options.bcc]) : undefined;

      const mailOptions: nodemailer.SendMailOptions = {
        from: fromEmail,
        to: toEmails.join(', '),
        subject: subject,
        html: html,
        bcc: bccEmails?.join(', '),
      };

      console.log('📧 [NODEMAILER] Sending email via Nodemailer...');
      console.log('📧 [NODEMAILER] Mail options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        hasHtml: !!mailOptions.html,
        htmlLength: typeof mailOptions.html === 'string' ? mailOptions.html.length : 0,
        hasBcc: !!mailOptions.bcc,
      });

      // Send email
      const result = await this.transporter.sendMail(mailOptions);

      console.log('✅ [NODEMAILER] Email sent successfully!');
      console.log('✅ [NODEMAILER] Message ID:', result.messageId);
      console.log('✅ [NODEMAILER] Response:', {
        messageId: result.messageId,
        accepted: result.accepted,
        rejected: result.rejected,
        pending: result.pending,
        response: result.response,
      });

      return result;
    } catch (error: any) {
      console.error('❌ [NODEMAILER] Error sending email:', error);
      console.error('❌ [NODEMAILER] Error type:', error?.constructor?.name);
      console.error('❌ [NODEMAILER] Error message:', error?.message);

      if (error?.code) {
        console.error('❌ [NODEMAILER] Error code:', error.code);
      }

      if (error?.response) {
        console.error('❌ [NODEMAILER] SMTP Error Response:', error.response);
      }

      if (error?.command) {
        console.error('❌ [NODEMAILER] SMTP Command:', error.command);
      }

      if (error?.stack) {
        console.error('❌ [NODEMAILER] Error stack:', error.stack);
      }

      throw error;
    }
  }

  /**
   * Verify SMTP connection
   * Useful for testing configuration
   */
  async verifyConnection(): Promise<boolean> {
    try {
      console.log('📧 [NODEMAILER] Verifying SMTP connection...');
      await this.transporter.verify();
      console.log('✅ [NODEMAILER] SMTP connection verified successfully');
      return true;
    } catch (error: any) {
      console.error('❌ [NODEMAILER] SMTP connection verification failed:', error.message);
      return false;
    }
  }
}

