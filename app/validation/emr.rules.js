const h = require("../utils/helper");
const utility = require("../utils/utility");
const { check } = require('express-validator');
const ValidationRules = {};

ValidationRules.rule = (method) => {
  switch (method) {
    case 'savePrescriptionSettings': {
      return [
        check('doctor_id').notEmpty().trim(),
        check('pad_dtls').trim(),
        check('plan').notEmpty().isIn(['0', '1']),
        check('clinical_dtls').notEmpty().isIn(['0', '1']),
        check('vitals').notEmpty().isIn(['0', '1']),
        check('investigation').notEmpty().isIn(['0', '1']),
        check('logo').notEmpty().isIn(['0', '1']),
        check('diagnosis').notEmpty().isIn(['0', '1']),
        check('presenting_comp').notEmpty().isIn(['0', '1']),
        check('pad_dtls_cp').notEmpty().isIn(['0', '1']),
        check('sig_dtls').trim(),
        check('is_footer_print').notEmpty().isIn(['0', '1']),
        check('objective').notEmpty().isIn(['0', '1']),
        check('imp').notEmpty().isIn(['0', '1'])
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