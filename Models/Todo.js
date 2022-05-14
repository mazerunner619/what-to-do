const mongoose = require("mongoose");

const todoSchema = {
  status : {type : Boolean, default : false},  // completed or not
  heading : String,
  comments : String,
  description : String,
  time : { type : Date, default : Date.now}
}

module.exports = mongoose.model("Todo", todoSchema);

