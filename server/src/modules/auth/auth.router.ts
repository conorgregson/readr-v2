import { Router } from "express";
import {
  loginHandler,
  registerHandler,
  meHandler,
  validateLogin,
  validateRegister,
} from "./auth.controller";
import { requireAuth } from "../../middleware/require-auth";
import { createAuthRateLimiter } from "../../middleware/rate-limit";

const router = Router();
const authRateLimiter = createAuthRateLimiter();

router.post("/register", authRateLimiter, validateRegister, registerHandler);
router.post("/login", authRateLimiter, validateLogin, loginHandler);
router.get("/me", requireAuth, meHandler);

export { router as authRouter };
