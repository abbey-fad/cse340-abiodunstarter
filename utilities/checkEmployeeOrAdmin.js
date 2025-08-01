// utilities/checkEmployeeOrAdmin.js
function checkEmployeeOrAdmin(req, res, next) {
  const account = res.locals.accountData

  // If no logged-in user
  if (!account) {
    req.flash("notice", "Please log in to continue.")
    return res.redirect("/account/login")
  }

  // Check if user is Admin or Employee
  if (account.account_type === "Admin" || account.account_type === "Employee") {
    return next()
  }

  // not authorized
  req.flash("notice", "You do not have permission to access that page.")
  return res.redirect("/account/login")
}

module.exports = checkEmployeeOrAdmin