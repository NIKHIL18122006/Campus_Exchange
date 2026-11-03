import { z } from 'zod';

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues[0].message });
  }
  req.body = result.data;
  next();
};

export const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues[0].message });
  }
  req.validated = result.data;
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

export const createListingSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120),
  description: z.string().trim().max(2000).optional().default(''),
  price: z.coerce.number().int('Price must be a whole number').min(0, 'Price cannot be negative'),
  negotiable: z.enum(['true', 'false']).optional().default('false').transform((v) => v === 'true'),
  category: z.enum(['books', 'electronics', 'furniture', 'stationery', 'cycles', 'other']),
  condition: z.enum(['new', 'like_new', 'used', 'heavily_used']),
});

export const browseListingsSchema = z
  .object({
    q: z.string().trim().max(100).optional(),
    category: z.enum(['books', 'electronics', 'furniture', 'stationery', 'cycles', 'other']).optional(),
    minPrice: z.coerce.number().int().min(0).optional(),
    maxPrice: z.coerce.number().int().min(0).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  })
  .refine(
    (v) => v.minPrice === undefined || v.maxPrice === undefined || v.minPrice <= v.maxPrice,
    { message: 'minPrice cannot be greater than maxPrice' }
  );

export const sendMessageSchema = z.object({
  body: z.string().trim().min(1, 'Message cannot be empty').max(1000, 'Message is too long'),
});

export const updateStatusSchema = z.object({
  status: z.enum(['available', 'sold']),
});