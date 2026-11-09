import { env } from '../config/env.js';

export async function sendMail(toEmail, otp) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': env.brevoApiKey,
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'Campus Exchange', email: env.mailFrom },
      to: [{ email: toEmail }],
      subject: 'Your verification code for Campus Exchange',
      textContent: `Your verification code is ${otp}. It will expire in ${env.otpExpiryMinutes} minutes.`,
      htmlContent: `<p>Your verification code is <b>${otp}</b>.</p><p>It expires in ${env.otpExpiryMinutes} minutes.</p>`,
    }),
  });

  if (!res.ok) {
    // Brevo's response body says exactly what was wrong
    const detail = await res.text();
    throw new Error(`Email send failed (${res.status}): ${detail}`);
  }
}