const UserModel = require("../models/usermodel");
const bcryptjs = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");
const { usermailer } = require("../utils/usermailer");
require("dotenv").config();

const Attendance = require("../models/Attendancemodel");
//
const crypto = require("crypto");
function generateCode(length = 8) {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
}

// ---------------------------- SIGNUP ----------------------------
const signup = async (req, res) => {
  let body = req.body;
  console.log(body);

  try {
    // Check if user already exists by email, matric number or username
    const [ifuseremail, ifusermatricnumber] = await Promise.all([
      UserModel.findOne({ email: body.email }),
      UserModel.findOne({ matric_number: body.matric_number }),
    ]);

    if (ifuseremail || ifusermatricnumber) {
      return res.status(400).send({
        message:
          (ifuseremail && "Email already in use") ||
          (ifusermatricnumber && "Matric-number already in use"),
        status: false,
      });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(body.password, 10);

    // Create user
    const newuser = await UserModel.create({
      matric_number: body.matric_number,
      full_name: body.full_name,
      email: body.email,
      password: hashedPassword,
    });

    // Send welcome mail

    usermailer(body.email, body.full_name);

    return res.status(200).send({
      message: "Sign up successful",
      status: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Server error", status: false });
  }
};

// ---------------------------- LOGIN ----------------------------
const login = async (req, res) => {
  let body = req.body;
  console.log(body);

  try {
    const user = await UserModel.findOne({ matric_number: body.matric_number });
    if (!user) {
      return res.status(404).send({
        message: "Account not found. Try creating an account.",
        status: false,
      });
    }

    const compare = await bcryptjs.compare(body.password, user.password);
    if (!compare) {
      return res
        .status(401)
        .send({ message: "Password incorrect", status: false });
    }

    const token = jsonwebtoken.sign(
      { matric_number: user.matric_number },
      "secretkey",
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).send({
      message: "Login successful",
      status: true,
      user,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Server error", status: false });
  }
};

// ---------------------------- GET USER BY EMAIL ----------------------------
const getUserByemail = async (req, res) => {
  try {
    const { email } = req.params;
    if (!email || email === "undefined") {
      return res.status(400).send({ message: "Invalid email", status: false });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "User not found", status: false });
    }

    const token = jsonwebtoken.sign(
      { matric_number: user.matric_number },
      "secretkey",
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).send({
      message: "User data retrieved successfully",
      status: true,
      user,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Server error", status: false });
  }
};

// ---------------------------- VERIFY USER TOKEN ----------------------------
const verifyuserondashbord = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .send({ message: "No token provided", status: false });
    }

    const decoded = jsonwebtoken.verify(token, "secretkey");
    const user = await UserModel.findOne({
      matric_number: decoded.matric_number,
    });

    if (!user) {
      return res.status(404).send({ message: "User not found", status: false });
    }

    return res.status(200).send({ message: "User is verified", status: true });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).send({ message: "Invalid token", status: false });
    }
    return res.status(500).send({ message: "Server error", status: false });
  }
};

// api/attendance
const createAttendance = async (req, res) => {
  try {
    const {
      classSection,
      duration,
      creatorName,
      creatorID,
      creationTime,
      location_name,
      location_lat,
      location_lng,
    } = req.body;

    // Generate a unique 8-character code
    const code = crypto.randomBytes(6).toString("hex").slice(0, 8);

    // Create attendance record
    const newAttendance = new Attendance({
      creatorId: creatorID,
      creatorName,
      classSection,
      location_name,
      location_lat,
      location_lng,
      duration: `${duration} minutes`, // store as "X minutes"
      code,
    });

    await newAttendance.save();

    res.status(201).json({
      success: true,
      message: "Attendance created successfully.",
      data: {
        id: newAttendance._id,
        code: newAttendance.code,
      },
    });
  } catch (err) {
    console.error("Error creating attendance:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create attendance.",
    });
  }
};

const getUserAttendance = async (req, res) => {
  try {
    const { userId } = req.params;
    const attendance = await Attendance.find({ creatorId: userId });
    res.status(200).json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAttendanceByCode = async (req, res) => {
  try {
    const { code } = req.params; // The code will be passed in the URL
    console.log(code);

    const attendance = await Attendance.findOne({ code });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found with this code.",
      });
    }

    // Check if the attendance has expired
    const currentTime = new Date();
    const createdTime = new Date(attendance.createdAt); // Assuming createdAt is saved automatically
    const durationInMs = parseInt(attendance.duration) * 60000; // Convert duration from minutes to milliseconds
    const expiryTime = new Date(createdTime.getTime() + durationInMs);

    if (currentTime > expiryTime) {
      return res.status(400).json({
        success: false,
        message: "This attendance code has expired.",
      });
    }

    // Return attendance data if valid
    res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (err) {
    console.error("Error fetching attendance by code:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance.",
    });
  }
};

// controllers/markAttendanceController.js
const markAttendance = async (req, res) => {
  const { fullName, matric_number, email, code, timestamp } = req.body;

  if (!fullName || !matric_number || !code) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields.",
    });
  }

  try {
    const attendance = await Attendance.findOne({ code });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found.",
      });
    }

    // Check if this user already marked attendance
    const alreadyMarked = attendance.attendees.some(
      (att) => att.matricNumber === matric_number
    );

    if (alreadyMarked) {
      return res.status(409).json({
        success: false,
        message: "You have already marked attendance.",
      });
    }

    // Add attendee to attendance record
    const markTime = timestamp || new Date();

    attendance.attendees.push({
      fullName,
      matricNumber: matric_number,
      email,
      timestamp: markTime,
    });

    await attendance.save();

    // Update user's markedAttendances
    const user = await UserModel.findOne({ matric_number });

    if (user) {
      user.markedAttendances.push({
        name: attendance.attendanceName || code, // fallback to code if name is missing
        markedAt: markTime,
      });
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: "Attendance marked successfully.",
    });
  } catch (error) {
    console.error("Mark attendance error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while marking attendance.",
    });
  }
};

module.exports = {
  signup,
  login,
  getUserByemail,
  verifyuserondashbord,
  //
  createAttendance,
  getUserAttendance,
  getAttendanceByCode,
  markAttendance,
};
