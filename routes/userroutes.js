const express = require("express");

const {
  signup,
  login,
  getUserByemail,
  verifyuserondashbord,
//   
  createAttendance ,
  getUserAttendance,
  getAttendanceByCode,
  markAttendance,
} = require("../controllers/usercontroller");

const userrouters = express.Router();

userrouters.post("/signup", signup);
userrouters.post("/login", login);
userrouters.get("/getUserByemail/:email", getUserByemail);
userrouters.get("/verifyuserondashbord", verifyuserondashbord);
// 
userrouters.post("/createAttendance", createAttendance);
userrouters.get("/getUserAttendance/:userId", getUserAttendance);
userrouters.get("/getAttendanceByCode/:code", getAttendanceByCode);
userrouters.post("/markAttendance", markAttendance);

module.exports = userrouters;
