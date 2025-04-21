const mongoose = require("mongoose");

const attendeeSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  matricNumber: { type: String, required: true },
  email: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const AttendanceSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserTable", // The user who created the attendance
      required: true,
    },
    creatorName: {
      type: String,
      required: true,
    },
    classSection: {
      type: String,
      required: true,
    },
    location_lat: {
      type: Number,
      required: true,
    },
    location_lng: {
      type: Number,
      required: true,
    },
    duration: {
      type: String, // Example: "45 minutes"
      required: true,
    },
    code: { type: String, unique: true },

    attendees: {
      type: [attendeeSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const AttendanceModel = mongoose.model("Attendance", AttendanceSchema);
module.exports = AttendanceModel;
