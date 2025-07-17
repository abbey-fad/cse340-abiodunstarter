const express = require("express")
const router = express.Router()
const errorController = require("../controllers/errorController")

// This route will throw a 500 error
router.get("/cause-error", errorController.throwError)

module.exports = router