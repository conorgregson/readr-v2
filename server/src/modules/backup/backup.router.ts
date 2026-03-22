import { Router } from "express";
import { requireAuth } from "../../middleware/require-auth";
import {
  exportBackupHandler,
  importBackupHandler,
  validateImportBackup,
} from "./backup.controller";

const router = Router();

router.use(requireAuth);

router.get("/export", exportBackupHandler);
router.post("/import", validateImportBackup, importBackupHandler);

export { router as backupRouter };
