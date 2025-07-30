const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
	const classification_id = req.params.classificationId
	const data = await invModel.getInventoryByClassificationId(classification_id)
	const grid = await utilities.buildClassificationGrid(data)
	let nav = await utilities.getNav()
	let className = "No Vehicles Found"

	if (data.length > 0) {
    className = data[0].classification_name
  }
	res.render("./inventory/classification", {
		title: className + " vehicles",
		nav,
		grid,
	})
}

/* ***************************
 *  Build detail view for a single vehicle
 * ************************** */
invCont.buildDetailView = async function (req, res, next) {
  const vehicleId = req.params.vehicleId
  const data = await invModel.getVehicleById(vehicleId)
  const nav = await utilities.getNav()
  const vehicleHtml = utilities.buildVehicleDetail(data)

  res.render("inventory/detail", {
    title: `${data.inv_year} ${data.inv_make} ${data.inv_model}`,
    nav,
    vehicleHtml,
  })
}

invCont.buildManagement = async function (req, res) {
  const nav = await utilities.getNav()
  //const notice = req.flash("notice")
  const classificationList = await utilities.buildClassificationList()
  res.render("inventory/management", {
    title: "Vehicle Management",
    nav,
    classificationSelect: classificationList,
    //notice,
    errors: null
  })
}

invCont.buildAddClassification = async function (req, res) {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  })
}

/* ***************************
 *  Update Classification Data
 * ************************** */
invCont.addClassification = async function (req, res) {
  const { classification_name } = req.body
  try {
    const result = await invModel.addClassification(classification_name)
    if (result) {
      req.flash("notice", `Successfully added "${classification_name}" classification.`)
      return res.redirect("/inv") // <== redirect sends the flash message
    } else {
      throw new Error("Insert failed")
    }
  } catch (error) {
    console.error("Classification insert error:", error)
    const nav = await utilities.getNav()
    req.flash("notice", "Classification addition failed.")
    return res.status(500).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      classification_name,
      errors: null,
    })
  }
}

invCont.buildAddInventory = async function (req, res) {
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "Add New Inventory",
    nav,
    classificationList,
    errors: null,
  })
}

/* ***************************
 *  Add Inventory Data
 * ************************** */
invCont.addInventory = async function (req, res) {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color
  } = req.body

  const insertResult = await invModel.addInventoryItem(
    classification_id, inv_make, inv_model, inv_description,
    inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color
  )

  let nav = await utilities.getNav()

  if (insertResult) {
    req.flash("notice", `Successfully added ${inv_make} ${inv_model} to the inventory.`)
    return res.redirect("/inv")
  } else {
    let classificationList = await utilities.buildClassificationList(classification_id)
    req.flash("notice", "Sorry, the inventory item couldn't be added.")
    return res.status(500).render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
      errors: null,
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color
    })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getVehicleById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = inv_make + " " + inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    return res.redirect("/inv")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    })
  }
}

/* ***********************************
 *  Build delete inventory confirmation view
 * *********************************** */
invCont.buildDeleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getVehicleById(inv_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price
  })
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
invCont.deleteInventoryItem = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id)
  let nav = await utilities.getNav()

  // ✅ Try to get item info
  const itemData = await invModel.getVehicleById(inv_id)

  // ❗ Handle case where item wasn't found
  if (!itemData) {
    req.flash("notice", "Item not found.")
    return res.redirect("/inv")
  }

  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  // ✅ Perform deletion
  const deleteResult = await invModel.deleteInventoryItem(inv_id)

  if (deleteResult) {
    req.flash("notice", `The ${itemName} was successfully deleted.`)
    return res.redirect("/inv")
  } else {
    req.flash("notice", "Sorry, the delete failed.")
    res.status(501).render("inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_price: itemData.inv_price
    })
  }
}



module.exports = invCont