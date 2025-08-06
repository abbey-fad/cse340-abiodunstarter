const pool = require("../database/") // Adjust path if different

/* =============================
   Get inbox messages (not archived)
============================= */
async function getInbox(accountId) {
  try {
    const result = await pool.query(
      `SELECT m.message_id, m.message_subject, m.message_created, 
              a.account_firstname || ' ' || a.account_lastname AS sender_name,
              m.message_read
       FROM message m
       JOIN account a ON m.message_from = a.account_id
       WHERE m.message_to = $1 AND m.message_archived = FALSE
       ORDER BY m.message_created DESC`,
      [accountId]
    )
    return result.rows
  } catch (error) {
    console.error("getInbox error: " + error)
  }
}

/* =============================
   Get archived messages
============================= */
async function getArchived(accountId) {
  try {
    const result = await pool.query(
      `SELECT m.message_id, m.message_subject, m.message_created,
              a.account_firstname || ' ' || a.account_lastname AS sender_name,
              m.message_read
       FROM message m
       JOIN account a ON m.message_from = a.account_id
       WHERE m.message_to = $1 AND m.message_archived = TRUE
       ORDER BY m.message_created DESC`,
      [accountId]
    )
    return result.rows
  } catch (error) {
    console.error("getArchived error: " + error)
  }
}

/* =============================
   Get a single message by ID
============================= */
async function getMessageById(messageId, accountId) {
  try {
    const result = await pool.query(
      `SELECT m.*, 
              af.account_firstname || ' ' || af.account_lastname AS from_name,
              at.account_firstname || ' ' || at.account_lastname AS to_name
       FROM message m
       JOIN account af ON m.message_from = af.account_id
       JOIN account at ON m.message_to = at.account_id
       WHERE m.message_id = $1 AND (m.message_to = $2 OR m.message_from = $2)`,
      [messageId, accountId]
    )
    return result.rows[0]
  } catch (error) {
    console.error("getMessageById error: " + error)
  }
}

/* =============================
   Send a new message
============================= */
async function sendMessage(subject, body, to, from) {
  try {
    const result = await pool.query(
      `INSERT INTO message (message_subject, message_body, message_to, message_from)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [subject, body, to, from]
    )
    return result.rows[0]
  } catch (error) {
    console.error("sendMessage error: " + error)
  }
}

/* =============================
   Mark message as read
============================= */
async function markAsRead(messageId) {
  try {
    const result = await pool.query(
      `UPDATE message SET message_read = TRUE WHERE message_id = $1`,
      [messageId]
    )
    return result.rowCount
  } catch (error) {
    console.error("markAsRead error: " + error)
  }
}

/* =============================
   Archive a message
============================= */
async function archiveMessage(messageId, accountId) {
  try {
    const result = await pool.query(
      `UPDATE message 
       SET message_archived = TRUE 
       WHERE message_id = $1 AND message_to = $2`,
      [messageId, accountId]
    )
    return result.rowCount
  } catch (error) {
    console.error("archiveMessage error: " + error)
  }
}

/* =============================
   Delete a message
============================= */
async function deleteMessage(messageId, accountId) {
  try {
    const result = await pool.query(
      `DELETE FROM message 
       WHERE message_id = $1 AND message_to = $2`,
      [messageId, accountId]
    )
    return result.rowCount
  } catch (error) {
    console.error("deleteMessage error: " + error)
  }
}

/* =============================
   Get unread message count
============================= */
async function getUnreadCount(accountId) {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) FROM message 
       WHERE message_to = $1 AND message_read = FALSE AND message_archived = FALSE`,
      [accountId]
    )
    return parseInt(result.rows[0].count)
  } catch (error) {
    console.error("getUnreadCount error: " + error)
  }
}

module.exports = {
  getInbox,
  getArchived,
  getMessageById,
  sendMessage,
  markAsRead,
  archiveMessage,
  deleteMessage,
  getUnreadCount
}
