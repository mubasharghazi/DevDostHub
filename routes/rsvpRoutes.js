const express = require("express");
const router = express.Router();
const RSVP = require("../models/RSVP");
const Event = require("../models/Event");
const { protect } = require("../middleware/auth");

// -----------------------------------------------
// POST /api/rsvps — RSVP to an event (protected)
// -----------------------------------------------
router.post("/", protect, async (req, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.user._id;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // Check capacity
    if (event.capacity > 0) {
      const currentCount = await RSVP.countDocuments({ eventId });
      if (currentCount >= event.capacity) {
        return res
          .status(400)
          .json({ success: false, message: "Event is at full capacity" });
      }
    }

    // Check duplicate
    const existingRSVP = await RSVP.findOne({ eventId, userId });
    if (existingRSVP) {
      return res.status(400).json({
        success: false,
        message: "You have already RSVPed to this event",
      });
    }

    const rsvp = await RSVP.create({ eventId, userId });

    res.status(201).json({
      success: true,
      message: "RSVP successful! You're going 🎉",
      data: rsvp,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// -----------------------------------------------
// DELETE /api/rsvps/:eventId — Cancel RSVP (protected)
// -----------------------------------------------
router.delete("/:eventId", protect, async (req, res) => {
  try {
    const rsvp = await RSVP.findOneAndDelete({
      eventId: req.params.eventId,
      userId: req.user._id,
    });

    if (!rsvp) {
      return res
        .status(404)
        .json({ success: false, message: "RSVP not found" });
    }

    res.status(200).json({
      success: true,
      message: "RSVP cancelled successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// -----------------------------------------------
// GET /api/rsvps/my — Get current user's RSVPs (protected)
// -----------------------------------------------
router.get("/my", protect, async (req, res) => {
  try {
    const rsvps = await RSVP.find({ userId: req.user._id })
      .populate({
        path: "eventId",
        populate: { path: "createdBy", select: "name" },
      })
      .sort({ createdAt: -1 });

    // Return the events with RSVP info
    const events = rsvps
      .filter((r) => r.eventId) // Filter out deleted events
      .map((r) => ({
        rsvpId: r._id,
        rsvpDate: r.createdAt,
        ...r.eventId.toJSON(),
      }));

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// -----------------------------------------------
// GET /api/rsvps/check/:eventId — Check if user RSVPed (protected)
// -----------------------------------------------
router.get("/check/:eventId", protect, async (req, res) => {
  try {
    const rsvp = await RSVP.findOne({
      eventId: req.params.eventId,
      userId: req.user._id,
    });

    res.status(200).json({
      success: true,
      hasRSVPed: !!rsvp,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// -----------------------------------------------
// GET /api/rsvps/event/:eventId — Get RSVPs for an event
// -----------------------------------------------
router.get("/event/:eventId", async (req, res) => {
  try {
    const rsvps = await RSVP.find({ eventId: req.params.eventId }).populate(
      "userId",
      "name email role avatar"
    );

    res.status(200).json({
      success: true,
      count: rsvps.length,
      data: rsvps,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

