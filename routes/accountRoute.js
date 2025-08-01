const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const regValidate = require('../utilities/account-validation')
const checkLogin = require("../utilities/checkLogin")


// Route for delivering the login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Route for delivering the registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Process the registration data
router.post("/register", regValidate.registrationRules(), regValidate.checkRegData, utilities.handleErrors(accountController.registerAccount))

// Process the login
router.post("/login", regValidate.loginRules(), regValidate.checkLoginData, utilities.handleErrors(accountController.accountLogin))

// Deliver Account Management View
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement))

// Deliver Update Account Info Form
router.get("/update/:accountId", utilities.checkLogin, utilities.handleErrors(accountController.buildUpdateAccount))

// Process Account Info Update
router.post("/update", regValidate.accountUpdateRules(), regValidate.checkUpdateData, utilities.handleErrors(accountController.updateAccountInfo))

// Process Password Update
router.post("/update-password", regValidate.passwordUpdateRules(), regValidate.checkPasswordData, utilities.handleErrors(accountController.updatePassword))

// Process Logout
router.get("/logout", utilities.handleErrors(accountController.logout))

module.exports = router