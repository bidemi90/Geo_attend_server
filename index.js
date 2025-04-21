const express = require("express");
const app = express();
const ejs = require("ejs");
app.set("view engine", "ejs");
const bodypaser = require("body-parser");

app.use(bodypaser.json({ limit: "50mb" }));
app.use(bodypaser.urlencoded({ limit: "50mb", extended: true }));

const cors = require("cors");
app.use(cors({ origin: "*" }));

require("dotenv").config();



const mongoose = require("mongoose");
const uri = process.env.MONGOODB_URI;

const connect = async () => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(uri).then((result) => {
      console.log("attendance system backend connected to mongoose");
    });
  } catch (error) {
    console.log(error);
  }
};
connect();





const userrouters = require("./routes/userroutes");
app.use("/user", userrouters);


let port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`server for attendance app listening at http://localhost:${port}`);
});
