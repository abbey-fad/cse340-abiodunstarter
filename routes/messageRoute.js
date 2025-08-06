const express = require("express")
const router = new express.Router()
const messageController = require("../controllers/messageController")
const utilities = require("../utilities")

// Protect all routes (require login)
router.use(utilities.checkLogin)

// GET inbox
router.get("/inbox", messageController.inboxView)

// GET archived messages
router.get("/archive", messageController.archiveView)

// GET message details
router.get("/message/:id", messageController.messageDetail)

// GET compose message form
router.get("/compose", messageController.composeForm)

// POST send new message
router.post("/send", messageController.sendMessage)

// POST delete message
router.post("/delete/:id", messageController.deleteMessage)

// POST archive message
router.post("/archive/:id", messageController.archiveMessage)

// GET reply to a message
router.get("/reply/:id", messageController.replyForm)

// POST reply to a message
router.post("/reply/:id", messageController.sendReply)

module.exports = router