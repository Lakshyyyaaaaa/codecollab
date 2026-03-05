import Room from "../models/Room.js";

// CREATE ROOM
export const createRoom = async (req, res) => {
  try {
    const { name, language, isPublic } = req.body;

    const room = await Room.create({
      name,
      language: language || "javascript",
      isPublic: isPublic || false,
      owner: req.userId,
      participants: [{ user: req.userId, role: "owner" }],
    });

    res.status(201).json({
      message: "Room created successfully!",
      room,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET ROOM BY ID
export const getRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId })
      .populate("owner", "username avatar")
      .populate("participants.user", "username avatar");

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json({ room });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET MY ROOMS
export const getMyRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ owner: req.userId })
      .populate("owner", "username avatar")
      .sort({ updatedAt: -1 });

    res.json({ rooms });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE ROOM
export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) return res.status(404).json({ message: "Room not found" });

    if (room.owner.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await room.deleteOne();
    res.json({ message: "Room deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
