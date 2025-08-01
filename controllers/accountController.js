const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()


/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
    return
  } 

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    )
    return res.redirect("/account/login")
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 *  Deliver Account Management View
 * ************************************ */
async function buildAccountManagement(req, res) {
  let nav = await utilities.getNav()
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
    notice: req.flash("notice")
  })
}

/* ****************************************
 *  Deliver Account Update View
 * *************************************** */
async function buildUpdateAccount(req, res) {
  const accountId = parseInt(req.params.accountId)
  let nav = await utilities.getNav()

  try {
    const accountData = await accountModel.getAccountById(accountId)

    if (!accountData) {
      req.flash("notice", "Account not found.")
      return res.redirect("/account/")
    }

    res.render("account/update-account", {
      title: "Update Account",
      nav,
      accountData,
      errors: null,
      notice: req.flash("notice"),
    })
  } catch (error) {
    console.error("Error loading account for update:", error)
    req.flash("notice", "Something went wrong.")
    return res.redirect("/account/")
  }
}

/* ****************************************
 *  Process Account Info Update
 * *************************************** */
async function updateAccountInfo(req, res) {
  let nav = await utilities.getNav()
  const { account_id, first_name, last_name, email } = req.body

  try {
    // Get current account from DB
    const currentAccount = await accountModel.getAccountById(account_id)

    // Check if email changed and already exists on another account
    if (currentAccount.account_email !== email) {
      const emailExists = await accountModel.checkExistingEmail(email)
      if (emailExists) {
        req.flash("notice", "That email is already in use.")
        return res.status(400).render("account/update-account", {
          title: "Update Account",
          nav,
          errors: null,
          notice: req.flash("notice"),
          accountData: {
            account_id,
            account_firstname: first_name,
            account_lastname: last_name,
            account_email: email
          }
        })
      }
    }

    // Try to update the account in the DB
    const updateResult = await accountModel.updateAccountInfo(
      account_id,
      first_name,
      last_name,
      email
    )

    if (updateResult) {
      req.flash("notice", "Account information updated successfully.")
    } else {
      req.flash("notice", "Update failed. Please try again.")
    }

    // After update (success or fail), get latest account data
    const updatedAccount = await accountModel.getAccountById(account_id)

    // Render the account management view with updated info
    res.render("account/management", {
      title: "Account Management",
      nav,
      errors: null,
      notice: req.flash("notice"),
      accountData: updatedAccount
    })

  } catch (error) {
    console.error("Error updating account info:", error)
    req.flash("notice", "An error occurred while updating your account.")
    res.redirect("/account")
  }
}

/* ****************************************
 *  Process Password Change
 * *************************************** */
async function updatePassword(req, res) {
  let nav = await utilities.getNav()
  const { account_id, account_password } = req.body

  // Check for validation errors from express-validator
  const { validationResult } = require("express-validator")
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    req.flash("notice", "Password does not meet the requirements.")
    return res.status(400).render("account/update-account", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      notice: req.flash("notice"),
      accountData: {
        account_id
      }
    })
  }

  try {
    // Hash new password
    const hashedPassword = await bcrypt.hash(account_password, 10)

    // Update password in DB
    const updateResult = await accountModel.updatePassword(account_id, hashedPassword)

    if (updateResult) {
      req.flash("notice", "Password updated successfully.")
    } else {
      req.flash("notice", "Password update failed. Please try again.")
    }

    // Fetch updated account data
    const accountData = await accountModel.getAccountById(account_id)

    // Return to account management view with success/fail message
    res.render("account/management", {
      title: "Account Management",
      nav,
      errors: null,
      notice: req.flash("notice"),
      accountData
    })
  } catch (error) {
    console.error("Error updating password:", error)
    req.flash("notice", "Something went wrong while updating the password.")
    res.redirect("/account")
  }
}

/* ****************************************
 *  Process Logout
 * ************************************ */
async function logout(req, res) {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out.")
  return res.redirect("/")
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, buildUpdateAccount, updateAccountInfo, updatePassword, logout }