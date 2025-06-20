import nodemailer from 'nodemailer';
import {
  EmailTemplate,
  generateOrderConfirmationEmail,
  generateInventoryAlertEmail,
  generatePasswordResetEmail,
  generateWelcomeEmail,
  OrderConfirmationData,
  InventoryAlertData,
  PasswordResetData,
  WelcomeEmailData,
} from '@/lib/email/templates';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface SendEmailRequest {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  template: EmailTemplate;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private fromAddress: string;

  constructor(config?: EmailConfig) {
    const defaultConfig: EmailConfig = {
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    };

    const emailConfig = config || defaultConfig;
    this.fromAddress = process.env.FROM_EMAIL || 'noreply@example.com';

    // 開発環境ではEtherealを使用（テスト用）
    if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: 'ethereal.user@ethereal.email',
          pass: 'ethereal.pass',
        },
      });
    } else {
      this.transporter = nodemailer.createTransport(emailConfig);
    }
  }

  async sendEmail(
    request: SendEmailRequest
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const { to, cc, bcc, template, attachments } = request;

      const mailOptions: nodemailer.SendMailOptions = {
        from: `ECストア <${this.fromAddress}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        cc: cc ? (Array.isArray(cc) ? cc.join(', ') : cc) : undefined,
        bcc: bcc ? (Array.isArray(bcc) ? bcc.join(', ') : bcc) : undefined,
        subject: template.subject,
        html: template.html,
        text: template.text,
        attachments: attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType,
        })),
      };

      const result = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error('Failed to send email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async sendOrderConfirmation(
    to: string,
    data: OrderConfirmationData
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const template = generateOrderConfirmationEmail(data);
    return this.sendEmail({ to, template });
  }

  async sendInventoryAlert(
    to: string | string[],
    data: InventoryAlertData
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const template = generateInventoryAlertEmail(data);
    return this.sendEmail({ to, template });
  }

  async sendPasswordReset(
    to: string,
    data: PasswordResetData
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const template = generatePasswordResetEmail(data);
    return this.sendEmail({ to, template });
  }

  async sendWelcomeEmail(
    to: string,
    data: WelcomeEmailData
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const template = generateWelcomeEmail(data);
    return this.sendEmail({ to, template });
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

// シングルトンインスタンス
let emailService: EmailService | null = null;

export function getEmailService(): EmailService {
  if (!emailService) {
    emailService = new EmailService();
  }
  return emailService;
}

// 便利関数
export async function sendOrderConfirmationEmail(
  to: string,
  data: OrderConfirmationData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const service = getEmailService();
  return service.sendOrderConfirmation(to, data);
}

export async function sendInventoryAlertEmail(
  to: string | string[],
  data: InventoryAlertData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const service = getEmailService();
  return service.sendInventoryAlert(to, data);
}

export async function sendPasswordResetEmail(
  to: string,
  data: PasswordResetData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const service = getEmailService();
  return service.sendPasswordReset(to, data);
}

export async function sendWelcomeEmail(
  to: string,
  data: WelcomeEmailData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const service = getEmailService();
  return service.sendWelcomeEmail(to, data);
}

export async function verifyEmailConnection(): Promise<boolean> {
  const service = getEmailService();
  return service.verifyConnection();
}
