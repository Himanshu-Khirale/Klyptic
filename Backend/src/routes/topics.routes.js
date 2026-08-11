import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import * as topicsController from "../controllers/topics.controller.js";
import { topicNameSchema } from "../validators/user.validators.js";

const router = Router();

router.use(requireAuth);
router.get("/", topicsController.list);
router.get("/:name", validate(topicNameSchema, "params"), topicsController.getByName);

export default router;
