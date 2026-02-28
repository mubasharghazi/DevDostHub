const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect, generateToken } = require("../middleware/auth");

// -----------------------------------------------
// POST /api/users/register — Register a new user
// -----------------------------------------------
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, skills, bio, github, linkedin } =
      req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      skills: skills || [],
      bio: bio || "",
      github: github || "",
      linkedin: linkedin || "",
    });

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      data: userResponse,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// -----------------------------------------------
// POST /api/users/login — Login user
// -----------------------------------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "No account found with this email",
      });
    }

    // Check password — handle legacy users created before auth was added
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: "This account was created before password login was enabled. Please create a new account.",
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    const token = generateToken(user._id);

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: userResponse,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// -----------------------------------------------
// GET /api/users — Get all users (protected)
// -----------------------------------------------
router.get("/", protect, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// -----------------------------------------------
// GET /api/users/me — Get current logged-in user
// -----------------------------------------------
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// -----------------------------------------------
// PUT /api/users/me — Update current user profile
// -----------------------------------------------
router.put("/me", protect, async (req, res) => {
  try {
    const allowedFields = ["name", "skills", "bio", "avatar", "github", "linkedin"];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// -----------------------------------------------
// GET /api/users/:id — Get user by ID (public profile)
// -----------------------------------------------
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// -----------------------------------------------
// PUT /api/users/:id/role — Admin: Update user role
// -----------------------------------------------
router.put("/:id/role", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// -----------------------------------------------
// DELETE /api/users/:id — Admin: Delete user
// -----------------------------------------------
router.delete("/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

