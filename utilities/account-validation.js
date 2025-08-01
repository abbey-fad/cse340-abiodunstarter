const { body, validationResult } = require("express-validator")
const utilities = require(".")
const accountModel = require("../models/account-model")

const validate = {}

/* **********************************
 * Registration Validation Rules
 * ********************************* */
validate.registrationRules = () => [
  body("account_firstname")
    .trim()
    .isString()
    .isLength({ min: 1 })
    .withMessage("Please provide a first name."),
  body("account_lastname")
    .trim()
    .isString()
    .isLength({ min: 2 })
    .withMessage("Please provide a last name."),
  body("account_email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("A valid email is required.")
    .custom(async (account_email) => {
      const emailExists = await accountModel.checkExistingEmail(account_email)
      if (emailExists) {
        throw new Error("Email exists. Please log in or use a different email.")
      }
    }),
  body("account_password")
    .trim()
    .notEmpty()
    .isStrongPassword({
      minLength: 12,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage("Password does not meet requirements."),
]

/* **********************************
 * Check Registration Data
 * ********************************* */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    return res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
  }
  next()
}

/* **********************************
 * Login Validation Rules
 * ********************************* */
validate.loginRules = () => [
  body("account_email")
    .trim()
    .isEmail()
    .withMessage("A valid email is required."),
  body("account_password")
    .trim()
    .notEmpty()
    .withMessage("Password is required."),
]

/* **********************************
 * Check Login Data
 * ********************************* */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    return res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
    })
  }
  next()
}

/* **********************************
 * Account Info Update Validation Rules
 * ********************************* */
validate.accountUpdateRules = () => [
  body("first_name")
    .trim()
    .notEmpty()
    .withMessage("First name is required."),
  body("last_name")
    .trim()
    .notEmpty()
    .withMessage("Last name is required."),
  body("email")
    .trim()
    .isEmail()
    .withMessage("A valid email is required.")
    .custom(async (email, { req }) => {
      const currentAccount = await accountModel.getAccountById(req.body.account_id)
      if (!currentAccount) {
        throw new Error("Account not found.")
      }
      if (email !== currentAccount.account_email) {
        const emailExists = await accountModel.checkExistingEmail(email)
        if (emailExists) {
          throw new Error("Email already in use by another account.")
        }
      }
    }),
]

/* **********************************
 * Check Account Info Update Data
 * ********************************* */
validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  const { account_id, first_name, last_name, email } = req.body
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    req.flash("notice", "Please correct the errors below.")
    return res.status(400).render("account/update-account", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      notice: req.flash("notice"),
      accountData: {
        account_id,
        account_firstname: first_name,
        account_lastname: last_name,
        account_email: email,
      }
    })
  }
  next()
}

/* **********************************
 * Password Update Validation Rules
 * ********************************* */
validate.passwordUpdateRules = () => [
  body("account_password")
    .trim()
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{12,}$/)
    .withMessage("Password must be at least 12 characters and include uppercase, number, and special character."),
]

/* **********************************
 * Check Password Update Data
 * ********************************* */
validate.checkPasswordData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    req.flash("notice", "Password update failed.")
    return res.redirect(`/account/update/${req.body.account_id}`)
  }
  next()
}

module.exports = validate
