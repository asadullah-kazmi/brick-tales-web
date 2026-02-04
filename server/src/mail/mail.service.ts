import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: Transporter | null = null;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const secure = process.env.SMTP_SECURE !== 'false';

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: port ? parseInt(port, 10) : secure ? 465 : 587,
        secure,
        auth: { user, pass },
      });
    }
  }

  /** Returns true if email was sent (or skipped in dev with log). */
  async sendPasswordResetEmail(to: string, resetLink: string): Promise<boolean> {
    const from = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'noreply@example.com';
    const subject = 'Reset your password';
    const html = `
      <p>You requested a password reset.</p>
      <p>Click the link below to set a new password (valid for 1 hour):</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>If you didn't request this, you can ignore this email.</p>
    `;
    const text = `Reset your password: ${resetLink}\n\nIf you didn't request this, ignore this email.`;

    if (this.transporter) {
      await this.transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
      });
      return true;
    }

    // Dev: log link when SMTP is not configured
    console.log('[Mail] Password reset link (SMTP not configured):', resetLink);
    return true;
  }
}
