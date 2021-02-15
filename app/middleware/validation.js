const h = require("../utils/helper");
const { validationResult } = require('express-validator');

exports.validate = async (req, res, next) => {
  let code = 500;
  try {
    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions
    if (!errors.isEmpty()) {
      code = 422;
      returnObj = h.resultObject([], false, code, 'Validation Error', errors.array());
      res.status(code).send(returnObj);
    } else {
      next();
    }
  } catch (err) {
    returnObj = h.resultObject([], false, code, 'Bad Request');
    res.status(code).send(returnObj);
    throw (e);
  }
}