import { z } from 'zod';

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues[0].message });
  }
  req.body = result.data;
  next();
};

const email = z.string().trim().toLowerCase().email('Enter a valid email address');

export const signupSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email,
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

export const verifyOtpSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
});

export const resendOtpSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});