const jwt = require("jsonwebtoken")
require("dotenv").config()

function checkLogin(req, res, next) {
  const token = req.cookies.jwt

  if (!token) {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    // Set user data on res.locals if needed
    res.locals.loggedin = true
    res.locals.accountData = decoded
    next()
  } catch (error) {
    req.flash("notice", "Session expired or invalid. Please log in again.")
    res.clearCookie("jwt")
    return res.redirect("/account/login")
  }
}

module.exports = checkLogin
