const jwt = require("jsonwebtoken");

const secret = process.env.SECRET_SESSION;

const User = require("../models/user");

const withAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.locals.isUserLoggedIn = false;
      next();
    } else {
      const decoded = await jwt.verify(token, secret);

      req.userID = decoded.userID;

      res.locals.currentUserInfo = await User.findById(req.userID);
      res.locals.isUserLoggedIn = true;
      next();
    }
  } catch (error) {
      console.log('ERROR: ', error)
      res.locals.isUserLoggedIn = false;
      next(error)
  }
};

module.exports = withAuth;
