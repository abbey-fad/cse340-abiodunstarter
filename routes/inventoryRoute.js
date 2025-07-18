// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route: Vehicle detail view
router.get("/detail/:vehicleId", utilities.handleErrors(invController.buildDetailView))

module.exports = router;