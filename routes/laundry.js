const express = require("express");
const router = express.Router();

const withAuth = require("../helpers/middleware");

const User = require("../models/user");

router.get("/dashboard", withAuth, async (req, res, next) => {
  if (req.userID) {
    try {
      const userUpdated = await User.findById(req.userID);

      res.locals.currentUserInfo = userUpdated;

      res.render("laundry/dashboard");
    } catch (error) {
      next(error);
      return;
    }
  } else {
    res.redirect("/");
  }
});

router.post("/launderers", withAuth, async (req, res, next) => {
  const userID = req.userID;

  const laundererInfo = {
    fee: req.body.fee,
    isLaunderer: true,
  };

  try {
    const theUser = await User.findByIdAndUpdate(userID, laundererInfo, {
      new: true,
    });

    req.user = theUser;

    res.redirect("/dashboard");
  } catch (error) {
    next(error);
    return;
  }
});

router.get('/launderers', withAuth, async (req, res, next) => {
    try {
        const launderersList = await User.find({ isLaunderer: true });
        res.render('laundry/launderers', { launderers: launderersList })
    } catch (error) {
        next(error);
        return;
    }
})

module.exports = router;
