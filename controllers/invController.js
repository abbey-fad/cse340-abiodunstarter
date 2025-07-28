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
  const notice = req.flash("notice")
  res.render("inventory/management", {
    title: "Vehicle Management",
    nav,
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
module.exports = invCont