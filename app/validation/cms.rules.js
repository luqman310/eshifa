const h = require("../utils/helper");
const utility = require("../utils/utility");
const { check } = require('express-validator');
const ValidationRules = {};

ValidationRules.rule = (method) => {
  switch (method) {
    case 'addUser': {
      return [
        check('email').normalizeEmail().notEmpty().isEmail(),
        check('username').notEmpty().trim(),
        check('password').notEmpty().trim().isLength({ min: 5 }),
        check('professionid').notEmpty().isInt(),
        check('status').notEmpty().isIn(['0', '1']),
        check('idrole').notEmpty().isInt(),
        check('clinicid').notEmpty().isInt(),
        check('emp_doctor_id').notEmpty().toLowerCase().custom((value, { req }) => {
          if (req.body.user === 'E') {
            return h.isNumber(roughScale(value));
          } else {
            return h.isString(value);
          }
        }),
        check('user').notEmpty().isIn(['E', 'D']),
      ]
    }
  }
}

function roughScale(x, base = 10) {
  const parsed = parseInt(x, base);
  if (isNaN(parsed)) { return false; }
  return parsed;
}

module.exports = ValidationRules;