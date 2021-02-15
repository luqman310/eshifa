const jwt = require("jsonwebtoken");
const h = require("../utils/helper");
const utility = require("../utils/utility");
const User = {};

User.doctorExists = async (req, res, next) => {
  let code = 500,
    message = "Doctor not Found",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    const doctor = await utility._doctorExists(filter.doctor_id);
    if (h.checkExistsNotEmpty(doctor, 'doctor_id')) {
      req.doctor = doctor;
      next();
    } else {
      code = 404;
      message = 'Doctor not Found';
      returnObj = {
        result: false,
        message: message
      };
      res.status(code).send(returnObj);
    }
  } catch (e) {
    returnObj = {
      result: false,
      message: message
    };
    res.status(code).send(returnObj);
    throw (e);
  }
};

User.isValidVisitID = async (req, res, next) => {
  let code = 500,
    message = "Visit ID Not Valid",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    if (h.checkExistsNotEmpty(filter, 'visit_id')) {
      const visit = await utility._isValidVisitID(filter.visit_id);
      if (h.checkExistsNotEmpty(visit, 'visit_id')) {
        req.visit = visit;
        next();
      } else {
        code = 404;
        message = 'Visit ID Not Valid';
        returnObj = {
          result: false,
          message: message
        };
        res.status(code).send(returnObj);
      }
    } else {
      code = 400;
      message = 'Please Enter Visit ID';
      returnObj = {
        result: false,
        message: message
      };
      res.status(code).send(returnObj);
    }
  } catch (e) {
    returnObj = {
      result: false,
      message: message
    };
    res.status(code).send(returnObj);
    throw (e);
  }
};

User.hasConfirmVisitToday = async (req, res, next) => {
  console.log('hasConfirmVisitToday');
  let code = 500,
    message = "Not Today's Visit ID",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    if (h.checkExistsNotEmpty(filter, 'visit_id')) {
      const visit = await utility._hasConfirmVisitToday(filter.visit_id);
      if (h.checkExistsNotEmptyGreaterZero(visit, 'today_visits')) {
        next();
      } else {
        code = 400;
        returnObj = {
          result: false,
          message: message
        };
        res.status(code).send(returnObj);
      }
    } else {
      code = 400;
      message = 'Please Enter Visit ID';
      returnObj = {
        result: false,
        message: message
      };
      res.status(code).send(returnObj);
    }
  } catch (e) {
    returnObj = {
      result: false,
      message: message
    };
    res.status(code).send(returnObj);
    throw (e);
  }
};

User.patientExists = async (req, res, next) => {
  let code = 500,
    message = "MRNO Not Valid",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    let mrno = '';
    if (h.checkExistsNotEmpty(filter, 'mr_no')) {
      mrno = filter.mr_no;
    } else if (h.checkExistsNotEmpty(filter, 'mrno')) {
      mrno = filter.mrno;
    }
    if (mrno != '') {
      const patient = await utility._patientExists(mrno);
      if (h.checkExistsNotEmpty(patient, 'mrno')) {
        req.patient = patient;
        next();
      } else {
        code = 404;
        message = 'MRNO Not Valid';
        returnObj = {
          result: false,
          message: message
        };
        res.status(code).send(returnObj);
      }
    } else {
      code = 400;
      message = 'Please Enter MRNO';
      returnObj = {
        result: false,
        message: message
      };
      res.status(code).send(returnObj);
    }
  } catch (e) {
    returnObj = {
      result: false,
      message: message
    };
    res.status(code).send(returnObj);
    throw (e);
  }
};

module.exports = User;