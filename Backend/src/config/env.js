import 'dotenv/config';

const required = [
  'DATABASE_URL', 'JWT_SECRET', 'ALLOWED_DOMAIN',
  'BREVO_API_KEY', 'MAIL_FROM',
  'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET',
];

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
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  brevoApiKey: process.env.BREVO_API_KEY,
  mailFrom: process.env.MAIL_FROM,
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};