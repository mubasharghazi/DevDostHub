// -----------------------------------------------
// models/RSVP.js — RSVP Schema & Model
// -----------------------------------------------
// Defines the shape of an RSVP document in MongoDB.
// An RSVP links a User to an Event they plan to attend.
// Fields:
//   - eventId: Reference to the Event document
//   - userId:  Reference to the User document
// -----------------------------------------------

const mongoose = require("mongoose");

const rsvpSchema = new mongoose.Schema(
  {
    // Reference to the Event the user is RSVPing to
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event", // Links to the Event model
      required: [true, "Event ID is required"],
    },

    // Reference to the User who is RSVPing
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Links to the User model
      required: [true, "User ID is required"],
    },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Export the model so other files can use it
module.exports = mongoose.model("RSVP", rsvpSchema);
