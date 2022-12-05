const express = require("express");
const app = express();
const db = require("./Models");
const Route = require("./Routes/router");
const PORT = process.env.PORT || 5000;
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv/config");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api", Route);

app.get("/logout", (req, res) => {
  console.log("logged out");
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

mongoose.connect(
  process.env.CONN_STRING,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  function (error) {
    if (error) {
      console.log(error);
    } else {
      console.log("connected to DB mytodo !");
      app.listen(PORT, () => {
        console.log(`Server is running on port:` + PORT);
      });
    }
  }
);

app.use(express.static(path.join(__dirname, "./mytodo/build")));
app.get("*", function (_, res) {
  res.sendFile(
    path.join(__dirname, "./mytodo/build/index.html"),
    function (err) {
      res.status(500).send(err);
    }
  );
});
