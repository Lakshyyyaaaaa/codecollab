import mongoose from "mongoose";
import { nanoid } from "nanoid";

const roomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      default: () => nanoid(10),
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: {
          type: String,
          enum: ["owner", "editor", "viewer"],
          default: "editor",
        },
      },
    ],
    language: {
      type: String,
      default: "javascript",
    },
    code: {
      type: String,
      default: "// Start coding here...",
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Room", roomSchema);
