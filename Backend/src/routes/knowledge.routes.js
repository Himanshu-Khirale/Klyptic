import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { upload } from "../middleware/upload.js";
import * as knowledgeController from "../controllers/knowledge.controller.js";
import {
  listKnowledgeSchema,
  createKnowledgeSchema,
  captureSchema,
  updateKnowledgeSchema,
  knowledgeIdSchema,
} from "../validators/knowledge.validators.js";

const router = Router();

router.use(requireAuth);

router.get("/", validate(listKnowledgeSchema, "query"), knowledgeController.list);
router.post("/", validate(createKnowledgeSchema), knowledgeController.create);
router.post("/capture", validate(captureSchema), knowledgeController.capture);
router.post("/upload", upload.single("file"), knowledgeController.upload);
router.get("/:id", validate(knowledgeIdSchema, "params"), knowledgeController.getById);
router.patch(
  "/:id",
  validate(knowledgeIdSchema, "params"),
  validate(updateKnowledgeSchema),
  knowledgeController.update,
);
router.delete("/:id", validate(knowledgeIdSchema, "params"), knowledgeController.remove);

export default router;
