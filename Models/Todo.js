const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    status: { type: Boolean, default: false }, // completed or not
    heading: String,
    comments: String,
    description: String,
    time: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Todo", todoSchema);
