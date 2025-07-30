const { body, validationResult } = require("express-validator")
const utilities = require("./")  // make sure this path is correct

// Classification form validation
const classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .isAlpha()
      .withMessage("Classification name must contain only letters (no spaces or special characters).")
      .isLength({ min: 1 })
      .withMessage("Classification name is required.")
  ]
}

const checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    return res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors,
      classification_name // to keep input sticky
    })
  }

  next()
}

// Inventory form validation
const inventoryRules = () => {
  return [
    body("inv_make")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Make must be at least 3 characters long."),
    
    body("inv_model")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Model must be at least 3 characters long."),
    
    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Description is required."),
    
    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Image path is required."),
    
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Thumbnail path is required."),
    
    body("inv_price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a valid number."),
    
    body("inv_year")
      .isInt({ min: 1900, max: 2099 })
      .withMessage("Year must be a valid 4-digit year."),
    
    body("inv_miles")
      .isInt({ min: 0 })
      .withMessage("Miles must be a valid number."),
    
    body("inv_color")
      .trim()
      .notEmpty()
      .withMessage("Color is required."),
    
    body("classification_id")
      .isInt({ gt: 0 })
      .withMessage("Classification is required.")
  ]
}

const checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(req.body.classification_id)
    return res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
      errors,
      ...req.body
    })
  }

  next()
}

/* ******************************
 * Check data and return errors for inventory update
 * ***************************** */
const checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList(req.body.classification_id)
    const itemName = `${req.body.inv_make} ${req.body.inv_model}`

    return res.render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors,
      ...req.body
    })
  }

  next()
}

module.exports = {classificationRules, checkClassificationData, inventoryRules, checkInventoryData, checkUpdateData }
