import bcrypt from 'bcrypt';
import { query } from '../config/db.js';
import { env } from '../config/env.js';
import { generateOtp, hashOtp, getOtpExpiry } from '../services/otpService.js';
import { sendMail } from '../services/mailer.service.js';
import { signToken } from '../services/token.js';

export async function signup(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  /* if (!normalizedEmail.endsWith('@' + env.allowedDomain)) {
    return res.status(400).json({ error: `Use your ${env.allowedDomain} email` });
  }*/

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

export async function verifyOtp(req, res) {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.status(400).json({ error: 'userId and otp are required' });
  }

  const result = await query(
    `SELECT id, otp_hash, expires_at, attempts
     FROM email_otps
     WHERE user_id = $1 AND used = FALSE
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  );

  if (result.rows.length === 0) {
    return res.status(400).json({ error: 'No active OTP. Please request a new one.' });
  }

  const record = result.rows[0];

  if (new Date(record.expires_at) < new Date()) {
    return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
  }

  if (record.attempts >= env.otpMaxAttempts) {
    return res.status(429).json({ error: 'Too many attempts. Please request a new OTP.' });
  }

  if (hashOtp(String(otp)) !== record.otp_hash) {
    await query('UPDATE email_otps SET attempts = attempts + 1 WHERE id = $1', [record.id]);
    return res.status(400).json({ error: 'Incorrect OTP' });
  }

  await query('UPDATE email_otps SET used = TRUE WHERE id = $1', [record.id]);
  await query('UPDATE users SET is_verified = TRUE WHERE id = $1', [userId]);

  const userResult = await query('SELECT id, name, email FROM users WHERE id = $1', [userId]);
  const user = userResult.rows[0];

  const token = signToken(user.id);
  res.status(200).json({ token, user });
}

export async function login(req, res) {
  const { email, password } = req.body;
  if(!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const normalizedEmail = email.trim().toLowerCase();

  const result = await query(
    'SELECT id, name, email, password_hash, is_verified FROM users WHERE email = $1',
    [normalizedEmail]
  );
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  if (!user.is_verified) {
    return res.status(403).json({ error: 'Email not verified. Please verify your email first.' ,
      userId: user.id
    });
  }
  const token = signToken(user.id);
  res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email } });
}


export async function resendOtp(req, res) {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const userResult = await query(
    'SELECT id, email, is_verified FROM users WHERE id = $1',
    [userId]
  );
  const user = userResult.rows[0];

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  if (user.is_verified) {
    return res.status(400).json({ error: 'Email already verified' });
  }

  // Cooldown: compare against the latest OTP's created_at
  const last = await query(
    'SELECT created_at FROM email_otps WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
    [userId]
  );
  if (last.rows.length > 0) {
    const secondsSince = (Date.now() - new Date(last.rows[0].created_at).getTime()) / 1000;
    if (secondsSince < env.otpResendCooldownSeconds) {
      const wait = Math.ceil(env.otpResendCooldownSeconds - secondsSince);
      return res.status(429).json({ error: `Please wait ${wait}s before requesting another OTP` });
    }
  }

  // Invalidate any old unused codes, then issue a new one
  await query('UPDATE email_otps SET used = TRUE WHERE user_id = $1 AND used = FALSE', [userId]);

  const otp = generateOtp();
  await query(
    'INSERT INTO email_otps (user_id, otp_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, hashOtp(otp), getOtpExpiry()]
  );

  await sendMail(user.email, otp);

  res.status(200).json({ message: 'New OTP sent to your email' });
}

export async function me(req, res) {
   const result = await query('SELECT id, name, email FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ user: result.rows[0] });
}