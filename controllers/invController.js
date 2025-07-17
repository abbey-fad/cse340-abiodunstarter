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

  module.exports = invCont
