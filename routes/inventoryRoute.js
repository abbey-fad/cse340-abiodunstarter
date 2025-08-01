// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const validation = require("../utilities/inventory-validation")
const checkEmployeeOrAdmin = require("../utilities/checkEmployeeOrAdmin")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
// Route: Vehicle detail view
router.get("/detail/:vehicleId", utilities.handleErrors(invController.buildDetailView))
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Management view
router.get("/", utilities.checkLogin, checkEmployeeOrAdmin, utilities.handleErrors(invController.buildManagement))

// View to add a classification
router.get("/add-classification", utilities.checkLogin, checkEmployeeOrAdmin, utilities.handleErrors(invController.buildAddClassification))
// Handle add classification POST
router.post("/add-classification",utilities.checkLogin,  checkEmployeeOrAdmin, validation.classificationRules(), validation.checkClassificationData, utilities.handleErrors(invController.addClassification))

router.get("/add-inventory", utilities.checkLogin, checkEmployeeOrAdmin, utilities.handleErrors(invController.buildAddInventory))
router.post("/add-inventory", utilities.checkLogin, checkEmployeeOrAdmin,validation.inventoryRules(), validation.checkInventoryData, utilities.handleErrors(invController.addInventory))

// Route to display the edit inventory view
router.get("/edit/:inv_id", utilities.checkLogin, checkEmployeeOrAdmin, utilities.handleErrors(invController.editInventoryView))
router.post("/update", utilities.checkLogin, checkEmployeeOrAdmin, validation.inventoryRules(), validation.checkInventoryData, utilities.handleErrors(invController.updateInventory))

// GET route to display delete confirmation
router.get("/delete/:inv_id", utilities.checkLogin, checkEmployeeOrAdmin, utilities.handleErrors(invController.buildDeleteInventory));
router.post("/delete/", utilities.checkLogin, checkEmployeeOrAdmin, utilities.handleErrors(invController.deleteInventoryItem));

module.exports = router;

