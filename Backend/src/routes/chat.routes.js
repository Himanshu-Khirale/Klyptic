import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import * as chatController from "../controllers/chat.controller.js";
import { chatSchema } from "../validators/chat.validators.js";

const router = Router();

router.use(requireAuth);
router.get("/suggestions", chatController.suggestions);
router.post("/", validate(chatSchema), chatController.ask);

export default router;
