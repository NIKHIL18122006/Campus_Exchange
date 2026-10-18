import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { resendOtp, signup, verifyOtp, login, me } from "../controllers/auth.controller.js";
import { validate, signupSchema, verifyOtpSchema, loginSchema, resendOtpSchema } from "../middleware/validation.middleware.js";

const router = Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/verify-otp", validate(verifyOtpSchema), verifyOtp);
router.post("/login", validate(loginSchema), login);
router.post("/resend-otp", validate(resendOtpSchema), resendOtp);
router.get("/me",requireAuth, me);
export default router;