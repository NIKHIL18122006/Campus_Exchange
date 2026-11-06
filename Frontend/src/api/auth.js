import { api } from './client.js';

export const signup = (body) => api('/auth/signup', { method: 'POST', body });
export const verifyOtp = (body) => api('/auth/verify-otp', { method: 'POST', body });
export const loginRequest = (body) => api('/auth/login', { method: 'POST', body });
export const resendOtp = (body) => api('/auth/resend-otp', { method: 'POST', body });