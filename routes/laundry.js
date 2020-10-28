const express = require("express");
const router = express.Router();

const withAuth = require("../helpers/middleware");

const User = require("../models/user");

const LaundryPickup = require("../models/laundry-pickup");

router.get("/dashboard", withAuth, async (req, res, next) => {
  if (req.userID) {
    try {
      const userUpdated = await User.findById(req.userID);

      res.locals.currentUserInfo = userUpdated;

      let query;

      if (res.locals.currentUserInfo.isLaunderer) {
        query = { launderer: res.locals.currentUserInfo._id };
      } else {
        query = { user: res.locals.currentUserInfo._id };
      }

      const pickupDocs = await LaundryPickup.find(query)
        .populate('user')
        .populate('launderer')
        .sort("pickupDate")
        .exec();

      res.render("laundry/dashboard", { pickups: pickupDocs });
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

router.get("/launderers", withAuth, async (req, res, next) => {
  try {
    const launderersList = await User.find( {$and: [
        { isLaunderer: true },
        { _id: { $ne: req.userID } }
    ]})
    res.render("laundry/launderers", { launderers: launderersList });
  } catch (error) {
    next(error);
    return;
  }
});

router.get("/launderers/:id", withAuth, async (req, res, next) => {
  const laundererId = req.params.id;

  try {
    const theUser = await User.findById(laundererId);
    res.render("laundry/launderer-profile", { theLaunderer: theUser });
  } catch (error) {
    next(error);
    return;
  }
});

router.post("/laundry-pickups", withAuth, async (req, res, next) => {
  const pickupInfo = {
    pickupDate: req.body.pickupDate,
    launderer: req.body.laundererId,
    user: req.userID,
  };

  const thePickup = new LaundryPickup(pickupInfo);

  thePickup.save((err) => {
    if (err) {
      next(err);
      return;
    }

    res.redirect("/dashboard");
  });
});

module.exports = router;
