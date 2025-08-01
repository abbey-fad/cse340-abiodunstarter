const jwt = require("jsonwebtoken")
require("dotenv").config()

const checkJWTToken = (req, res, next) => {
  const token = req.cookies.jwt

  if (!token) {
    res.locals.loggedin = false
    res.locals.accountData = null
    return next()
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    res.locals.loggedin = true
    res.locals.accountData = decoded
  } catch (err) {
    res.locals.loggedin = false
    res.locals.accountData = null
  }

  return next()
}

module.exports = checkJWTToken