import nodemailer from "nodemailer";
import { Resend } from "resend";

/**
 * Enterprise Production-Grade Email Dispatcher with Multi-Provider Failover:
 * 1. Resend API (HTTPS REST - 100% immune to cloud port blocks)
 * 2. Secure SMTP (Pooled TLS 587/465 - SendGrid, Brevo, AWS SES, Gmail, Mailgun)
 * 3. Ethereal Local Development Fallback
 */

export const sendPasswordResetEmail = async (email, resetUrl, userName = "User") => {
    const emailSubject = "🔐 Reset Your ChatApp Password";
    const brandName = "ChatApp";
    const clientOrigin = resetUrl.split("/reset-password")[0];

    const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>${emailSubject}</title>
      <style>
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
        body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0b0f19;">
      <!-- Preview text for email clients -->
      <div style="display: none; font-size: 1px; color: #0b0f19; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
        Use this secure link to reset your ${brandName} password. Link expires in 15 minutes.
      </div>

      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding: 40px 15px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #151c2e; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6); overflow: hidden;">
              
              <!-- Brand Header -->
              <tr>
                <td align="center" style="padding: 36px 40px 20px 40px; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                  <table border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); border-radius: 14px; width: 48px; height: 48px; text-align: center; vertical-align: middle;">
                        <span style="font-size: 24px; line-height: 48px; color: #ffffff;">💬</span>
                      </td>
                      <td style="padding-left: 14px;">
                        <span style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">${brandName}</span>
                        <span style="background: rgba(99, 102, 241, 0.2); color: #818cf8; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 99px; margin-left: 6px; text-transform: uppercase;">PRO</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Main Content Body -->
              <tr>
                <td style="padding: 36px 40px 20px 40px;">
                  <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                    Reset Your Password
                  </h1>
                  <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 24px; color: #94a3b8;">
                    Hello <strong style="color: #f1f5f9;">${userName}</strong>,
                  </p>
                  <p style="margin: 0 0 28px 0; font-size: 15px; line-height: 24px; color: #94a3b8;">
                    We received a request to reset the password for your ${brandName} account. Click the button below to choose a new, secure password.
                  </p>

                  <!-- Bulletproof CTA Button -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 30px;">
                    <tr>
                      <td align="center">
                        <table border="0" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="border-radius: 12px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); box-shadow: 0 4px 20px rgba(99, 102, 241, 0.45);">
                              <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 16px 36px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 12px; border: 1px solid rgba(255,255,255,0.15);">
                                Reset Password &rarr;
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Fallback Link Box -->
                  <div style="background-color: #0b0f19; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
                      Button not working? Copy & Paste Link:
                    </p>
                    <p style="margin: 0; font-size: 12px; line-height: 18px; word-break: break-all;">
                      <a href="${resetUrl}" target="_blank" style="color: #818cf8; text-decoration: underline;">
                        ${resetUrl}
                      </a>
                    </p>
                  </div>

                  <!-- Expiration & Security Notice -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 12px; padding: 14px; margin-bottom: 24px;">
                    <tr>
                      <td style="font-size: 13px; line-height: 20px; color: #fbbf24;">
                        ⏱️ <strong>Security Notice:</strong> This link is valid for exactly <strong>15 minutes</strong>. If you did not initiate this request, you can safely ignore this email—your account credentials remain securely protected.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td align="center" style="padding: 24px 40px 32px 40px; background-color: #0f1422; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                  <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b;">
                    Sent securely by <a href="${clientOrigin}" style="color: #818cf8; text-decoration: none;">${brandName} Identity & Security System</a>
                  </p>
                  <p style="margin: 0; font-size: 11px; color: #475569;">
                    &copy; ${new Date().getFullYear()} ${brandName}, Inc. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    // Strategy 1: Resend HTTP API (Production Default)
    if (process.env.RESEND_API_KEY) {
        try {
            const resend = new Resend(process.env.RESEND_API_KEY);
            const fromEmail = process.env.EMAIL_FROM || "ChatApp <onboarding@resend.dev>";

            const { data, error } = await resend.emails.send({
                from: fromEmail,
                to: email,
                subject: emailSubject,
                html: emailHtml,
            });

            if (!error && data?.id) {
                console.log(`[Resend] Password reset email delivered successfully to ${email} (ID: ${data.id})`);
                return { success: true, messageId: data.id, provider: "resend" };
            } else {
                console.warn(`[Resend Warning]:`, error?.message || error);
            }
        } catch (resendError) {
            console.warn(`[Resend Exception]:`, resendError.message);
        }
    }

    // Strategy 2: Enterprise SMTP Transport (Gmail, SendGrid, Brevo, AWS SES, Custom SMTP)
    const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
    const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

    if (emailUser && emailPass) {
        try {
            let transporter;

            if (process.env.SMTP_HOST) {
                transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: Number(process.env.SMTP_PORT) || 587,
                    secure: Number(process.env.SMTP_PORT) === 465,
                    pool: true,
                    maxConnections: 5,
                    auth: {
                        user: emailUser,
                        pass: emailPass,
                    },
                    tls: {
                        rejectUnauthorized: process.env.NODE_ENV === "production",
                    },
                });
            } else {
                transporter = nodemailer.createTransport({
                    service: process.env.EMAIL_SERVICE || "gmail",
                    auth: {
                        user: emailUser,
                        pass: emailPass,
                    },
                });
            }

            const senderFrom = process.env.EMAIL_FROM || process.env.SMTP_FROM || emailUser || `"${brandName} Security" <${emailUser}>`;
            const info = await transporter.sendMail({
                from: senderFrom,
                to: email,
                subject: emailSubject,
                html: emailHtml,
            });

            console.log(`[SMTP] Email sent successfully to ${email} (MessageId: ${info.messageId})`);
            return { success: true, messageId: info.messageId, provider: "smtp" };
        } catch (smtpError) {
            console.error(`[SMTP Error]:`, smtpError.message);
        }
    }

    // Strategy 3: Development & Testing Ethereal Fallback
    try {
        const testAccount = await nodemailer.createTestAccount();
        const fallbackTransporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });

        const info = await fallbackTransporter.sendMail({
            from: `"${brandName} Security" <security@chatapp.com>`,
            to: email,
            subject: emailSubject,
            html: emailHtml,
        });

        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log(`[Ethereal Fallback] Test email sent to: ${email}`);
        if (previewUrl) {
            console.log(`📧 Ethereal Preview URL: ${previewUrl}`);
        }

        return {
            success: true,
            previewUrl,
            messageId: info.messageId,
            provider: "ethereal",
        };
    } catch (fallbackError) {
        console.error("Critical: All email strategies failed:", fallbackError);
        return { success: false, error: fallbackError.message };
    }
};
