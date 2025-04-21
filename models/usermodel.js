const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true },
    matric_number: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "other"] },
    profileImage: { type: String, default: "" },
    lastLogin: { type: Date },
    isActive: { type: Boolean, default: true },

    // ✅ Just attendance names and mark time
    markedAttendances: [
      {
        name: { type: String, required: true },
        markedAt: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;
