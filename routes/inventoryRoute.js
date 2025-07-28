// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const validation = require("../utilities/inventory-validation")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route: Vehicle detail view
router.get("/detail/:vehicleId", utilities.handleErrors(invController.buildDetailView))

// Management view
router.get("/", utilities.handleErrors(invController.buildManagement))

// View to add a classification
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification)
)

// Handle add classification POST
router.post("/add-classification", validation.classificationRules(), validation.checkClassificationData, utilities.handleErrors(invController.addClassification))

router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory))

router.post("/add-inventory", validation.inventoryRules(), validation.checkInventoryData, utilities.handleErrors(invController.addInventory))

module.exports = router;