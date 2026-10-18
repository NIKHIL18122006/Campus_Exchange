import crypto from 'crypto';
import { env } from '../config/env.js';

export function generateOtp(){
    return crypto.randomInt(100000, 999999).toString();
}

export function hashOtp(otp){
    return crypto.createHash('sha256').update(otp).digest('hex');

}

export function getOtpExpiry(){
    return new Date(Date.now() + env.otpExpiryMinutes * 60 * 1000);
}