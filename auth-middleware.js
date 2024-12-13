const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (token && token.length > 0) {
      const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);
      if (verified.userId === req.params.userid) next();
      else {
        return next({
          message: "Authorization Failed",
          status: 400,
        });
      }
    } else {
      return next({
        message: "Authorization Failed",
        status: 400,
      });
    }
  } catch (err) {
    return next({
      message: err.message,
    });
  }
};
