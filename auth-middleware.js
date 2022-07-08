const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (token && token.length > 0) {
      const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);
      if (verified.userId === req.params.userid) next();
      else {
        console.log("auth error 1");
        return next({
          message: "Authorization Failed",
          status: 400,
        });
      }
    } else {
      console.log("not logged in");
      return next({
        message: "Authorization Failed",
        status: 400,
      });
    }
  } catch (err) {
    console.log(err.message);
    return next({
      message: err.message,
    });
  }
};
