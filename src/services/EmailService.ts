// src/services/emailService.ts
// Sends transactional emails via Brevo (free tier: 300/day, no credit card)

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const API_KEY       = import.meta.env.VITE_BREVO_API_KEY as string;
const SENDER_EMAIL  = import.meta.env.VITE_BREVO_SENDER_EMAIL as string;
const SENDER_NAME   = import.meta.env.VITE_BREVO_SENDER_NAME || 'RentCheck';

interface SendEmailParams {
  toEmail: string;
  toName: string;
}

export async function sendVerificationEmail({ toEmail, toName }: SendEmailParams): Promise<void> {
  const body = {
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email: toEmail, name: toName }],
    subject: '✅ Your RentCheck Account Has Been Verified!',
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
      <body style="margin:0;padding:0;background:#f1f5f9;font-family:sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:100%;">

                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#1e3a8a,#2563eb);padding:32px 40px;text-align:center;">
                    <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:12px;padding:10px 20px;margin-bottom:14px;">
                      <span style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:0.08em;">📦 RENTCHECK</span>
                    </div>
                    <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0;">Account Verified!</h1>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:36px 40px;">

                    <!-- Checkmark -->
                    <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                      <tr>
                        <td style="background:#ecfdf5;border:2px solid #6ee7b7;border-radius:50%;width:72px;height:72px;text-align:center;vertical-align:middle;">
                          <span style="font-size:34px;line-height:72px;">✅</span>
                        </td>
                      </tr>
                    </table>

                    <p style="font-size:16px;color:#1e293b;font-weight:600;margin:0 0 12px;">Hi ${toName},</p>
                    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 24px;">
                      Great news! Your RentCheck account has been
                      <strong style="color:#059669;">verified and approved</strong> by our team.
                      You now have full access to browse and rent items from our catalog.
                    </p>

                    <!-- What you can do -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:28px;">
                      <tr>
                        <td style="padding:20px 24px;">
                          <p style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 14px;">What you can do now</p>
                          <table cellpadding="0" cellspacing="0">
                            <tr><td style="padding:5px 0;font-size:14px;color:#374151;">📦 &nbsp;Browse the full item catalog</td></tr>
                            <tr><td style="padding:5px 0;font-size:14px;color:#374151;">📋 &nbsp;Submit rental requests</td></tr>
                            <tr><td style="padding:5px 0;font-size:14px;color:#374151;">🔄 &nbsp;Track your active rentals</td></tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA -->
                    <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                      <tr>
                        <td style="background:#2563eb;border-radius:10px;text-align:center;">
                          <a href="${import.meta.env.VITE_APP_URL || 'https://rentcheck-6a7ec.web.app/#'}"
                            style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">
                            Open RentCheck →
                          </a>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
                    <p style="font-size:12px;color:#94a3b8;margin:0;">© 2026 RentCheck · Item Rental & Tracking</p>
                    <p style="font-size:11px;color:#cbd5e1;margin:6px 0 0;">You're receiving this because you registered at RentCheck.</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'accept':       'application/json',
      'api-key':      API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error('Brevo email failed:', err);
    throw new Error(`Failed to send verification email: ${res.status}`);
  }
}