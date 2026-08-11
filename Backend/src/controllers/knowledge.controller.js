import * as knowledgeService from "../services/knowledge.service.js";
import { sendSuccess, sendCreated } from "../utils/ApiResponse.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validated } from "../middleware/validate.js";

export const list = asyncHandler(async (req, res) => {
  const data = await knowledgeService.listKnowledge(req.auth.userId, validated(req, "query"));
  return sendSuccess(res, { data });
});

export const getById = asyncHandler(async (req, res) => {
  const { id } = validated(req, "params");
  const data = await knowledgeService.getKnowledgeById(req.auth.userId, id);
  return sendSuccess(res, { data });
});

export const create = asyncHandler(async (req, res) => {
  const data = await knowledgeService.createKnowledge(req.auth.userId, req.body);
  return sendCreated(res, { message: "Knowledge item created", data });
});

export const capture = asyncHandler(async (req, res) => {
  const data = await knowledgeService.captureKnowledge(req.auth.userId, req.body);
  return sendCreated(res, { message: "Capture saved", data });
});

export const upload = asyncHandler(async (req, res) => {
  const data = await knowledgeService.uploadKnowledge(req.auth.userId, req.file, req.body);
  return sendCreated(res, { message: "File uploaded", data });
});

export const update = asyncHandler(async (req, res) => {
  const { id } = validated(req, "params");
  const data = await knowledgeService.updateKnowledge(req.auth.userId, id, req.body);
  return sendSuccess(res, { message: "Updated", data });
});

export const remove = asyncHandler(async (req, res) => {
  const { id } = validated(req, "params");
  const data = await knowledgeService.deleteKnowledge(req.auth.userId, id);
  return sendSuccess(res, { message: "Deleted", data });
});
