import crypto from 'crypto';
import { env } from '../config/env.js';

export function generateOTP(){
    return crypto.randomInt(100000, 999999).toString();
}

export function hashOTP(otp){
    return crypto.createHash('sha256').update(otp).digest('hex');

}

export function getOtpExpiry(){
    return new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000);
}