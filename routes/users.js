const express = require("express");
const router = express.Router();
const passport = require("passport");

const users = require("../controllers/users");
const catchAsync = require("../utils/catchAsync");
const { storeReturnTo } = require('../middleware');


router.route('/register')
    .get(users.registerForm)
    .post(catchAsync(users.register));

router.route('/login')
    .get(users.loginForm)
    .post(storeReturnTo, passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), users.login);

router.get("/logout", users.logout);


module.exports = router;