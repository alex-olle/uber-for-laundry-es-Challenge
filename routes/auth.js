const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");

const bcryptSalt = bcrypt.genSaltSync(10);

const jwt = require("jsonwebtoken");

const User = require("../models/user");

router.get("/signup", (req, res, next) => {
  res.render("auth/signup", { errorMessage: "" });
});

router.post("/signup", async (req, res, next) => {
  const { name, email, password } = req.body;

  if (name === "" || email === "" || password === "") {
    res.render("auth/signup", {
      errorMessage: "Indicate a username and a password to sign up",
    });
    return;
  }
  try {
    const user = await User.findOne({ email: email });

    if (user !== null) {
      res.render("auth/signup", { errorMessage: "The email already exists!" });
      return;
    }

    const hashPass = bcrypt.hashSync(password, bcryptSalt);

    await User.create({
      name,
      email,
      password: hashPass,
    });

    res.redirect("/");
  } catch (error) {}
});

router.get("/login", (req, res, next) => {
  res.render("auth/login", { errorMessage: "" });
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  if (email === "" || password === "") {
    res.render("auth/login", {
      errorMessage: "Please enter both, mail and password to sign up.",
    });
    return;
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      res.render("auth/login", {errorMessage: "This email doesn't exist!"});
      return;
    } else if (bcrypt.compareSync(password, user.password)) {
      const userWithoutPass = await User.findOne({ email }).select("-password");
      const payload = { userID: userWithoutPass._id };

      const token = jwt.sign(payload, process.env.SECRET_SESSION, {
        expiresIn: "1h",
      });

      res.cookie("token", token, { httpOnly: true });
      res.status(200).redirect("/");
    } else {
      res.render("auth/login", { errorMessage: "Incorrect password" });
    }
  } catch (error) {
      console.log(error);
  }
});

module.exports = router;
