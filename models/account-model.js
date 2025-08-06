const pool = require("../database/")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    return error.message
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email]
    )
    return result.rows[0]
  } catch (error) {
    console.error("getAccountByEmail error:", error)
    return new Error("No matching email found")
  }
}

/* *****************************
* Return account data using account ID
* ***************************** */
async function getAccountById(accountId) {
  try {
    const sql = "SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account WHERE account_id = $1"
    const result = await pool.query(sql, [accountId])
    return result.rows[0]
  } catch (error) {
    console.error("getAccountById error:", error)
    return new Error("No matching account found")
  }
}

/* *****************************
 * Update basic account information (name and email)
 * ***************************** */
async function updateAccountInfo(account_id, first_name, last_name, email) {
  try {
    const sql = "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *"
    const result = await pool.query(sql, [first_name, last_name, email, account_id])
    return result.rowCount > 0
  } catch (error) {
    console.error("updateAccountInfo error:", error)
    return error.message
  }
}

/* *****************************
 * Update account password
 * ***************************** */
async function updatePassword(account_id, hashedPassword) {
  try {
    const sql = "UPDATE account SET account_password = $1 WHERE account_id = $2"
    const result = await pool.query(sql, [hashedPassword, account_id])
    return result.rowCount > 0
  } catch (error) {
    console.error("updatePassword error:", error)
    return error.message
  }
}

/* *****************************
* Get list of all accounts (for message dropdown)
* ***************************** */
async function getAllAccounts() {
  try {
    const sql = "SELECT account_id, account_firstname, account_lastname, account_email FROM account ORDER BY account_firstname"
    const result = await pool.query(sql)
    return result.rows
  } catch (error) {
    console.error("getAllAccounts error:", error)
    return []
  }
}

/* *****************************
* Get all accounts except current user (for message dropdown)
* ***************************** */
async function getAllAccountsExcept(accountId) {
  try {
    const sql = `
      SELECT account_id, account_firstname, account_lastname
      FROM account
      WHERE account_id != $1
      ORDER BY account_firstname
    `
    const result = await pool.query(sql, [accountId])
    return result.rows
  } catch (error) {
    console.error("getAllAccountsExcept error:", error)
    return []
  }
}


module.exports = { registerAccount,  checkExistingEmail, getAccountByEmail, getAccountById, updateAccountInfo, updatePassword,  getAllAccounts, getAllAccountsExcept }