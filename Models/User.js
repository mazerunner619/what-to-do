const mongoose = require("mongoose");

const userSchema = {
  username : String,
  password : String,
  todos : [{
    type:  mongoose.Schema.Types.ObjectId,
    ref : "Todo"
  }]
}

module.exports = mongoose.model("User", userSchema);

