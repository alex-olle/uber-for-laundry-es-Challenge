const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");

const bcryptSalt = bcrypt.genSaltSync(10);

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

router.get('/login', (req, res, next) => {
    res.render('auth/login', { errorMessage: '' });
})

module.exports = router;
