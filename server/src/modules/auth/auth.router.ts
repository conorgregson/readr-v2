import { Router } from "express";
import {
  loginHandler,
  registerHandler,
  meHandler,
  validateLogin,
  validateRegister,
} from "./auth.controller";
import { requireAuth } from "../../middleware/require-auth";

const router = Router();

router.post("/register", validateRegister, registerHandler);
router.post("/login", validateLogin, loginHandler);
router.get("/me", requireAuth, meHandler);

export { router as authRouter };
