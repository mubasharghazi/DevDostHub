const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      maxlength: 2000,
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
    },
    endDate: {
      type: Date,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    speaker: {
      type: String,
      required: [true, "Speaker name is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "workshop",
        "webinar",
        "hackathon",
        "meetup",
        "conference",
        "bootcamp",
        "other",
      ],
      default: "meetup",
    },
    capacity: {
      type: Number,
      default: 0, // 0 means unlimited
    },
    tags: {
      type: [String],
      default: [],
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    meetingLink: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
  },
  { timestamps: true }
);

// Virtual field for RSVP count
eventSchema.virtual("rsvpCount", {
  ref: "RSVP",
  localField: "_id",
  foreignField: "eventId",
  count: true,
});

eventSchema.set("toJSON", { virtuals: true });
eventSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Event", eventSchema);
