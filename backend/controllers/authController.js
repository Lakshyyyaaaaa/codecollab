import User from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

// REGISTER
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Manual validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    if (username.length < 3) {
      return res
        .status(400)
        .json({ message: "Username must be at least 3 characters" });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email or username already exists",
      });
    }

    const user = await User.create({ username, email, password });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User registered successfully!",
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: Object.values(error.errors)[0].message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token in httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful!",
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// REFRESH TOKEN
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token" });

    const decoded = verifyRefreshToken(token);
    const accessToken = generateAccessToken(decoded.userId);

    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

// LOGOUT
export const logout = (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully" });
};

// GET CURRENT USER
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
