import express from "express";
import {
  createRoom,
  getRoom,
  getMyRooms,
  deleteRoom,
} from "../controllers/roomController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createRoom);
router.get("/my-rooms", protect, getMyRooms);
router.get("/:roomId", protect, getRoom);
router.delete("/:roomId", protect, deleteRoom);

export default router;
