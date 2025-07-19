const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")

// Route for delivering the login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Route for delivering the registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

module.exports = router
