const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const regValidate = require('../utilities/account-validation')


// Route for delivering the login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Route for delivering the registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))
router.post("/register", utilities.handleErrors(accountController.registerAccount))

// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

module.exports = router
