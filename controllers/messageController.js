const messageModel = require("../models/message-model")
const accountModel = require("../models/account-model") // to get list of users
const utilities = require("../utilities")

/* ================================
   Render Inbox View
================================ */
async function inboxView(req, res) {
  const nav = await utilities.getNav()
  const accountId = res.locals.accountData.account_id
  const inbox = await messageModel.getInbox(accountId)
  const archivedCount = (await messageModel.getArchived(accountId))?.length || 0
  const unreadCount = await messageModel.getUnreadCount(accountId)

  res.render("messages/inbox", {
    title: "Inbox",
    nav,
    inbox,
    unreadCount,
    archivedCount,
  })
}

/* ================================
   Render Archived View
================================ */
async function archiveView(req, res) {
  const nav = await utilities.getNav()
  const accountId = res.locals.accountData.account_id
  const archive = await messageModel.getArchived(accountId)

  res.render("messages/archive", {
    title: "Archived Messages",
    nav,
    archive,
  })
}

/* ================================
   Render Message Detail
================================ */
async function messageDetail(req, res) {
  const nav = await utilities.getNav()
  const messageId = req.params.id
  const accountId = res.locals.accountData.account_id
  const message = await messageModel.getMessageById(messageId, accountId)

  if (message && !message.message_read && message.message_to === accountId) {
    await messageModel.markAsRead(messageId)
  }

  res.render("messages/detail", {
    title: "Message Details",
    nav,
    message,
  })
}

/* ================================
   Render Compose Form
================================ */
async function composeForm(req, res) {
  const nav = await utilities.getNav()
  const recipients = await accountModel.getAllAccountsExcept(res.locals.accountData.account_id)

  res.render("messages/compose", {
    title: "Compose Message",
    nav,
    recipients,
    errors: null,
    message_subject: "",
    message_body: "",
    message_to: "",
    notice: req.flash("notice")
  })
}


/* ================================
   Send New Message
================================ */
async function sendMessage(req, res, next) {
  try {
    const nav = await utilities.getNav()
    const { message_subject, message_body, message_to } = req.body
    const message_from = res.locals.accountData.account_id
    const recipients = await accountModel.getAllAccountsExcept(message_from)

    if (!message_subject || !message_body || !message_to) {
      req.flash("notice", "All fields are required.")
      return res.render("messages/compose", {
        title: "Compose Message",
        nav,
        recipients,
        errors: null,
        message_subject,
        message_body,
        message_to
      })
    }

    await messageModel.sendMessage(message_subject, message_body, message_to, message_from)
    req.flash("notice", "Message sent successfully.")
    res.redirect("/messages/inbox")
  } catch (err) {
    console.error("sendMessage error:", err)
    next(err)
  }
}

/* ================================
   Delete Message
================================ */
async function deleteMessage(req, res) {
  const messageId = req.params.id
  const accountId = res.locals.accountData.account_id
  await messageModel.deleteMessage(messageId, accountId)
  req.flash("notice", "Message deleted.")
  res.redirect("/messages/inbox")
}

/* ================================
   Archive Message
================================ */
async function archiveMessage(req, res) {
  const messageId = req.params.id
  const accountId = res.locals.accountData.account_id
  await messageModel.archiveMessage(messageId, accountId)
  req.flash("notice", "Message archived.")
  res.redirect("/messages/inbox")
}

/* ================================
   Render Reply Form
================================ */
async function replyForm(req, res) {
  const nav = await utilities.getNav()
  const messageId = req.params.id
  const accountId = res.locals.accountData.account_id
  const original = await messageModel.getMessageById(messageId, accountId)

  res.render("messages/reply", {
    title: "Reply to Message",
    nav,
    message_id: messageId, // ✅ Add this line
    recipient_id: original.message_from,
    recipient_name: original.from_name,
    original_subject: original.message_subject,
    original_body: original.message_body,
    message_subject: "Re: " + original.message_subject,
    message_body: "",
    errors: null,
    notice: req.flash("notice")
  })
}


/* ================================
   Send Reply Message
================================ */
async function sendReply(req, res) {
  const nav = await utilities.getNav()
  const { message_subject, message_body, message_to } = req.body
  const message_from = res.locals.accountData.account_id

  if (!message_subject || !message_body || !message_to) {
    req.flash("notice", "All fields are required.")
    return res.render("messages/reply", {
      title: "Reply to Message",
      nav,
      message_subject,
      message_body,
      recipient_id: message_to,
      errors: null
    })
  }

  await messageModel.sendMessage(message_subject, message_body, message_to, message_from)
  req.flash("notice", "Reply sent successfully.")
  res.redirect("/messages/inbox")
}

module.exports = {
  inboxView,
  archiveView,
  messageDetail,
  composeForm,
  sendMessage,
  deleteMessage,
  archiveMessage,
  replyForm,
  sendReply
}
