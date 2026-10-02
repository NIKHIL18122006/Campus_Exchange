import 'dotenv/config';

const required = [
    'DATABASE_URL','JWT_SECRET','ALLOWED_DOMAIN','SMTP_HOST','SMTP_USER','SMTP_PASS'
]

for (const key of required) {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  allowedDomain: process.env.ALLOWED_DOMAIN.toLowerCase(),
  otpExpiryMinutes: Number(process.env.OTP_EXPIRY_MINUTES) || 10,
  otpMaxAttempts: Number(process.env.OTP_MAX_ATTEMPTS) || 5,
  otpResendCooldownSeconds: Number(process.env.OTP_RESEND_COOLDOWN_SECONDS) || 60,
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};
console.log('SMTP config:', env.smtp);