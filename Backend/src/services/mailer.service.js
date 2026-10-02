import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: false,
    auth: {
        user: env.smtp.user,
        pass: env.smtp.pass
    }
});

export async function sendMail(toEmail, otp) {
    await transporter.sendMail({
        from: `"Campus Exchange" <${env.smtp.user}>`,
        to: toEmail,
        subject: 'Your verification code for Campus Exchange',
        text: `Your verification code is ${otp}. It will expire in ${env.otpExpiryMinutes} minutes.`,
        html: `<p>Your verification code is <b>${otp}</b>.</p><p>It expires in ${env.otpExpiryMinutes} minutes.</p>`,
    });
}