const express = require("express");
const router = express.Router();
const db = require("../Models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const LoggedInMW = require("../auth-middleware");

//===================== CURRENT LOGGED USER if any
router.get("/current", async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (token) {
      const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);
      if (verified) {
        const user = await db.User.findById(verified.userId).populate({
          path: "todos",
        });

        if (user) {
          res.json({
            message: user,
            status: true,
            outcome: true,
          });
        } else {
          res.json({
            message: "user not found!",
            status: true,
            outcome: false,
          });
        }
      } else {
        console.log("no JWT found !");
        res.json({
          message: "auth failed",
          status: true,
          outcome: false,
        });
      }
    } else {
      console.log("null token");
      res.json({
        message: "token not found",
        status: true,
        outcome: false,
      });
    }
  } catch (error) {
    console.log(error.message);
    next({ message: error.message });
  }
});

//==================== LOGIN =============
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await db.User.findOne({ username: username });
    if (user) {
      const correctPassword = await bcrypt.compare(password, user.password);
      if (correctPassword) {
        //create jwt authorizatoin
        const token = jwt.sign(
          {
            userId: user._id,
          },
          process.env.JWT_SECRET_KEY
        );
        //send the token to browser cookie
        res.cookie("token", token, { httpOnly: true }).json({
          outcome: true,
          message: `logged in as ${user.username}`,
          status: true,
        });
      } else
        res.json({
          message: "invalid password !",
          status: true,
          outcome: false,
        });
    } else {
      res.json({
        message: "username not registered !",
        status: true,
        outcome: false,
      });
    }
  } catch (error) {
    console.log("login error", error.message);
    return next({ message: error.message, status: false });
  }
});

//=====================SIGNUP===============
router.post("/signup", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const alreadyExists = await db.User.findOne({ username: username });
    if (alreadyExists) {
      return res.status(200).json({
        message: "username already exists !",
        status: true,
        outcome: false,
      });
    }
    const userData = {
      username: username,
      password: await bcrypt.hash(password, 10),
    };

    await db.User.create(userData);
    return res.status(200).json({
      message: "Registered successfully",
      status: true,
      outcome: true,
    });
  } catch (error) {
    console.log(error);
    return next({
      message: error.message,
      status: false,
    });
  }
});

//  add new todo
router.post("/:userid/todo/add", LoggedInMW, async (req, res, next) => {
  try {
    const { userid } = req.params;
    const { heading, comments, description } = req.body;
    const newTodo = await db.Todo.create({
      heading,
      comments,
      description,
    });
    const user = await db.User.findById(userid);
    user.todos.push(newTodo);
    await user.save();
    res
      .status(200)
      .json({ message: "todo added !", status: true, outcome: true });
  } catch (err) {
    console.log(err.message);
    return next({ message: err.message, status: false });
  }
});

// get a todo by id
router.get("/:userid/gettodo/:todoid", LoggedInMW, async (req, res, next) => {
  try {
    const todo = await db.Todo.findById(req.params.todoid);
    res.status(200).json({ message: todo, status: true, outcome: true });
  } catch (err) {
    console.log(err.message);
    return next({ message: err.message, status: false });
  }
});
// delete a todo
router.delete("/:userid/:todoid/delete", LoggedInMW, async (req, res, next) => {
  try {
    const { todoid } = req.params;

    await db.Todo.deleteOne({ _id: todoid }, (err, done) => {
      if (err) {
        console.log(err.message);
        next({
          message: err.message,
          status: false,
        });
      } else {
        res.status(200).json({
          message: "deleted successfully !",
          status: true,
          outcome: true,
        });
      }
    });
  } catch (err) {
    console.log(err.message);
    return next({ message: err.message, status: false });
  }
});

//update a todo
router.post(
  "/:userid/:todoid/todo/update",
  LoggedInMW,
  async (req, res, next) => {
    try {
      const { todoid } = req.params;
      const { heading, comments, description, status } = req.body;
      await db.Todo.findByIdAndUpdate(
        todoid,
        {
          heading,
          comments,
          description,
          status,
        },
        function (err, docs) {
          if (err) {
            console.log(err);
            res
              .status(200)
              .json({ message: err.message, status: true, outcome: false });
          } else {
            res
              .status(200)
              .json({ message: "changes saved", status: true, outcome: true });
          }
        }
      );
    } catch (err) {
      console.log(err.message);
      return next({ message: err.message, status: false });
    }
  }
);

//fetch todos from userid
router.get("/:userid/todos", LoggedInMW, async (req, res, next) => {
  try {
    const user = await db.User.findById(req.params.userid).populate({
      path: "todos",
    });
    res
      .status(200)
      .json({ message: user.todos.reverse(), status: true, outcome: true });
  } catch (err) {
    console.log(err.message);
    return next({ message: err.message, status: false });
  }
});

module.exports = router;
