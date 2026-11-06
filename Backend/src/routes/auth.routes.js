import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { resendOtp, signup, verifyOtp, login, me } from "../controllers/auth.controller.js";
import { validate, signupSchema, verifyOtpSchema, loginSchema, resendOtpSchema } from "../middleware/validation.middleware.js";
import { rateLimiter } from "../middleware/rateLimiter.js";
const router = Router();

router.post("/signup", rateLimiter, validate(signupSchema), signup);
router.post("/verify-otp", rateLimiter, validate(verifyOtpSchema), verifyOtp);
router.post("/login", rateLimiter, validate(loginSchema), login);
router.post("/resend-otp", rateLimiter, validate(resendOtpSchema), resendOtp);
router.get("/me",requireAuth, me);
export default router;