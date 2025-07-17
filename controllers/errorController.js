const errorController = {}

errorController.throwError = (req, res, next) => {
  // Intentionally throw an error to simulate a server crash
  throw new Error("Intentional 500 error for testing.")
}

module.exports = errorController