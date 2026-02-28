const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const RSVP = require("../models/RSVP");
const { protect } = require("../middleware/auth");

// -----------------------------------------------
// POST /api/events — Create a new event (protected)
// -----------------------------------------------
router.post("/", protect, async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      endDate,
      location,
      speaker,
      category,
      capacity,
      tags,
      isOnline,
      meetingLink,
    } = req.body;

    const event = await Event.create({
      title,
      description,
      date,
      endDate,
      location,
      speaker,
      category,
      capacity,
      tags: tags || [],
      isOnline: isOnline || false,
      meetingLink,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// -----------------------------------------------
// GET /api/events — Get all events (with search & filter)
// -----------------------------------------------
// Query params: ?search=keyword&category=workshop&status=upcoming&page=1&limit=20
// -----------------------------------------------
router.get("/", async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 50 } = req.query;
    const query = {};

    // Text search across title, speaker, location
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { speaker: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    if (category) query.category = category;
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Event.countDocuments(query);

    const events = await Event.find(query)
      .populate("createdBy", "name email")
      .populate("rsvpCount")
      .sort({ date: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: events,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// -----------------------------------------------
// GET /api/events/categories — Get event categories with counts
// -----------------------------------------------
router.get("/categories", async (req, res) => {
  try {
    const categories = await Event.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// -----------------------------------------------
// GET /api/events/stats — Dashboard stats
// -----------------------------------------------
router.get("/stats", async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const upcomingEvents = await Event.countDocuments({
      date: { $gte: new Date() },
    });
    const totalRSVPs = await RSVP.countDocuments();
    const categoryCounts = await Event.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: { totalEvents, upcomingEvents, totalRSVPs, categoryCounts },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// -----------------------------------------------
// GET /api/events/:id — Get single event with details
// -----------------------------------------------
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("createdBy", "name email role")
      .populate("rsvpCount");

    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // Get RSVP list with user details
    const rsvps = await RSVP.find({ eventId: event._id }).populate(
      "userId",
      "name email role avatar"
    );

    res.status(200).json({
      success: true,
      data: { ...event.toJSON(), attendees: rsvps.map((r) => r.userId) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// -----------------------------------------------
// PUT /api/events/:id — Update event (protected)
// -----------------------------------------------
router.put("/:id", protect, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: event,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// -----------------------------------------------
// DELETE /api/events/:id — Delete event (protected)
// -----------------------------------------------
router.delete("/:id", protect, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // Also delete all RSVPs for this event
    await RSVP.deleteMany({ eventId: req.params.id });

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

