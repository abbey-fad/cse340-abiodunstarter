/****************************************** 
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const session = require("express-session")
const pgSession = require("connect-pg-simple")(session)
const bodyParser = require("body-parser")
const flash = require("connect-flash")
const env = require("dotenv").config()
const pool = require("./database/")
const cookieParser = require("cookie-parser")

const app = express()

const static = require("./routes/static")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute")
const errorRoute = require("./routes/errorRoute")
const messageRoute = require("./routes/messageRoute")

const baseController = require("./controllers/baseController")
const utilities = require("./utilities/")
const checkJWTToken = require("./utilities/checkJWTToken")

/* ***********************
 * Session Configuration
 *************************/
app.use(session({
  store: new pgSession({
    pool,
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: "sessionId",
  cookie: {
    maxAge: 1000 * 60 * 60 * 2, // 2 hours
    secure: false // set to true if using HTTPS
  }
}))

/* ***********************
 * Middleware
 *************************/
// Body parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Static files
app.use(express.static("public"))

// Flash messages
app.use(flash())

// Cookie parser and JWT check
app.use(cookieParser())
app.use(utilities.checkJWTToken)

// Inject nav and flash into views
app.use(async (req, res, next) => {
  res.locals.notice = req.flash("notice")
  if (process.env.NODE_ENV !== "production") {
    console.log("Flash message:", res.locals.notice)
  }
  res.locals.nav = await utilities.getNav()
  next()
})

/* ***********************
 * View Engine and Layouts
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // default layout

/* ***********************
 * Routes
 *************************/
// Static pages
app.use(static)

// Base route
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory routes
app.use("/inv", inventoryRoute)

// Account routes
app.use("/account", accountRoute)

// Message routes
app.use("/messages", messageRoute)

// Error route
app.use("/error", errorRoute)

// 404 Handler
app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." })
})

/* ***********************
 * General Error Handler
 *************************/
app.use(async (err, req, res, next) => {
  const nav = await utilities.getNav()
  const status = err.status || 500
  const message = err.status == 404
    ? err.message
    : "Oh no! There was a crash. Maybe try a different route?"

  console.error(`Error at: "${req.originalUrl}": ${err.message}`)

  res.status(status).render("errors/error", {
    title: status,
    message,
    nav,
  })
})

/* ***********************
 * Server Initialization
 *************************/
const port = process.env.PORT || 5500
const host = process.env.HOST || "localhost"

app.listen(port, () => {
  console.log(`App listening on http://${host}:${port}`)
})