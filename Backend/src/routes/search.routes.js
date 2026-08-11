import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import * as searchController from "../controllers/search.controller.js";
import { searchQuerySchema } from "../validators/search.validators.js";

const router = Router();

router.get("/", requireAuth, validate(searchQuerySchema, "query"), searchController.search);

export default router;
