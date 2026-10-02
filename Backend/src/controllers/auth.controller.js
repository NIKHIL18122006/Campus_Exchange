import bcrypt from 'bcrypt';
import { query } from '../config/db.js';
import { env } from '../config/env.js';
import { generateOtp, hashOtp, getOtpExpiry } from '../services/otp.service.js';
import { sendMail } from '../services/mailer.service.js';

export async function signup(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail.endsWith('@' + env.allowedDomain)) {
    return res.status(400).json({ error: `Use your ${env.allowedDomain} email` });
  }

  const existing = await query('SELECT id, is_verified FROM users WHERE email = $1', [normalizedEmail]);

  let userId;
  const passwordHash = await bcrypt.hash(password, 10);

  if (existing.rows.length > 0) {
    const user = existing.rows[0];
    if (user.is_verified) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    // unverified — reuse the row, refresh password + name
    userId = user.id;
    await query(
      'UPDATE users SET name = $1, password_hash = $2 WHERE id = $3',
      [name, passwordHash, userId]
    );
  } else {
    const result = await query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
      [name, normalizedEmail, passwordHash]
    );
    userId = result.rows[0].id;
  }

  const otp = generateOtp();
  const otpHash = hashOtp(otp);
  const expiresAt = getOtpExpiry();

  await query(
    'INSERT INTO email_otps (user_id, otp_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, otpHash, expiresAt]
  );

  await sendMail(normalizedEmail, otp);

  res.status(201).json({ message: 'OTP sent to your email', userId });
}