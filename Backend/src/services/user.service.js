import { User } from "../models/User.js";
import { KnowledgeItem } from "../models/KnowledgeItem.js";
import { ApiError } from "../utils/ApiError.js";
import { toUserDto, toKnowledgeDto } from "../utils/serializers.js";
import { aiEngine } from "./ai.service.js";

export async function updateProfile(userId, body) {
  if (body.handle) {
    const taken = await User.findOne({ handle: body.handle, _id: { $ne: userId } });
    if (taken) {
      throw new ApiError(409, "Handle already taken", { code: "HANDLE_TAKEN" });
    }
  }

  const user = await User.findByIdAndUpdate(userId, { $set: body }, { new: true, runValidators: true });
  if (!user) {
    throw new ApiError(404, "User not found", { code: "USER_NOT_FOUND" });
  }
  return toUserDto(user);
}

export async function updatePreferences(userId, body) {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found", { code: "USER_NOT_FOUND" });
  }

  if (body.notifications) {
    user.preferences.notifications = {
      ...user.preferences.notifications.toObject?.() ?? user.preferences.notifications,
      ...body.notifications,
    };
  }
  if (body.appearance) {
    user.preferences.appearance = {
      ...user.preferences.appearance.toObject?.() ?? user.preferences.appearance,
      ...body.appearance,
    };
  }
  if (body.privacy) {
    user.preferences.privacy = {
      ...user.preferences.privacy.toObject?.() ?? user.preferences.privacy,
      ...body.privacy,
    };
  }
  if (body.defaultModel) {
    user.preferences.defaultModel = body.defaultModel;
  }

  await user.save();
  return toUserDto(user);
}

export async function exportLibrary(userId, format = "json") {
  const [user, items] = await Promise.all([
    User.findById(userId),
    KnowledgeItem.find({ userId }).sort({ capturedAt: -1 }),
  ]);

  if (!user) {
    throw new ApiError(404, "User not found", { code: "USER_NOT_FOUND" });
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    user: toUserDto(user),
    items: items.map(toKnowledgeDto),
  };

  if (format === "markdown") {
    const md = [
      `# Klyptic export — ${user.name}`,
      `Exported: ${payload.exportedAt}`,
      "",
      ...items.map((item) => {
        const dto = toKnowledgeDto(item);
        return [
          `## ${dto.title}`,
          `- Type: ${dto.type}`,
          `- Topic: #${dto.topic}`,
          `- Source: ${dto.source}`,
          `- Captured: ${dto.date}`,
          "",
          dto.summary || dto.preview,
          "",
          ...(dto.takeaways || []).map((t) => `- ${t}`),
          "",
        ].join("\n");
      }),
    ].join("\n");

    return { format: "markdown", content: md, filename: "klyptic-export.md" };
  }

  return {
    format: "json",
    content: payload,
    filename: "klyptic-export.json",
  };
}

export async function deleteWorkspace(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found", { code: "USER_NOT_FOUND" });
  }

  const items = await KnowledgeItem.find({ userId }).select("_id");
  await KnowledgeItem.deleteMany({ userId });
  await User.deleteOne({ _id: userId });

  await aiEngine.tryRequest("/api/v1/user/purge", {
    userId: String(userId),
    body: {
      userId: String(userId),
      knowledgeIds: items.map((i) => String(i._id)),
    },
  });

  return { deleted: true };
}
