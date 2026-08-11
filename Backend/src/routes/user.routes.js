import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import * as userController from "../controllers/user.controller.js";
import {
  updateProfileSchema,
  updatePreferencesSchema,
} from "../validators/user.validators.js";

const router = Router();

router.use(requireAuth);
router.patch("/me", validate(updateProfileSchema), userController.updateProfile);
router.patch(
  "/me/preferences",
  validate(updatePreferencesSchema),
  userController.updatePreferences,
);
router.get("/me/export", userController.exportData);
router.delete("/me", userController.deleteWorkspace);

export default router;
