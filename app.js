const express = require("express");
const app = express();
const Route = require("./Routes/router");
const PORT = process.env.PORT || 5000;
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv/config");
const cookieParser = require("cookie-parser");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api", Route);

app.get("/logout", (req, res) => {
  res
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    })
    .send();
});

app.use(function (err, req, res, next) {
  return res.send({
    message: err.message || "Opps! Something went wrong.",
    status: err.status,
  });
});

const connectDB = async () => {
  mongoose.connect(
    process.env.CONN_STRING,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    },
    function (error) {
      if (error) console.log(error);
      else console.log("connected to DB mytodo !");
    }
  );
};

if (process.env.NODE_ENV == "production") {
  app.use(express.static("mytodo/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "mytodo", "build", "index.html"));
  });
}

module.exports = { app, connectDB, PORT };
