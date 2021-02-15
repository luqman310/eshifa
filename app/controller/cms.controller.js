/**
 * @Name cms.controller.js
 *
 * @Description Clinic Management System Operations
 *
 * @package
 * @subpackage
 * @author Suhaib <muhammad.suhaib@shifa.com.pk asdad>
 * @Created on November 03, 2020 2021
 */

const CMS = require("./../model/cms.model");
const Common = require("./../model/common.model");
const h = require("../utils/helper");
const cms = require("../utils/cms.util");

const CMSController = {};

/**************************************** Clinics ******************************************/

CMSController.getClinics = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Clinics",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    let result = await CMS.getClinics(filter);
    if (h.exists(result)) {
      code = 200;
      returnObj = h.resultObject(result, true, code);
    } else {
      code = 404;
      returnObj = h.resultObject([], false, code, 'Clinic Not Found');
    }
  } catch (e) {
    returnObj = h.resultObject([], false, code, message);
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

CMSController.addClinic = async (req, res) => {
  let code = 500,
    message = "Error! Adding Clinic",
    returnObj = {};
  try {
    let data = h.getProps2(req);
    if (h.checkExistsNotEmpty(data, 'clinic') && h.checkExistsNotEmptyGreaterZero(data, 'hdeptid') && h.checkExistsNotEmpty(data, 'status')) {
      const result = await Common.insert(cms._clinicsDTO(data), 'cdr.clinics', req.user)
      code = 200;
      returnObj = h.resultObject(result, true, code);
    } else {
      code = 400;
      returnObj = h.resultObject([], false, code, 'Please fill all Fields');
    }
  } catch (e) {
    returnObj = h.resultObject([], false, code, message);
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

/**************************************** Professions **************************************/

CMSController.getProfessions = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Professions",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    let result = await CMS.getProfessions(filter);
    if (h.exists(result)) {
      code = 200;
      returnObj = h.resultObject(result, true, code);
    } else {
      code = 404;
      returnObj = h.resultObject([], false, code, 'Profession Not Found');
    }
  } catch (e) {
    returnObj = h.resultObject([], false, code, message);
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

/**************************************** Departments **************************************/

CMSController.getDepartments = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Departments",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    let result = await CMS.getDepartments(filter);
    if (h.exists(result)) {
      code = 200;
      returnObj = h.resultObject(result, true, code);
    } else {
      code = 404;
      returnObj = h.resultObject([], false, code, 'Department Not Found');
    }
  } catch (e) {
    returnObj = h.resultObject([], false, code, message);
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

/**************************************** Users ********************************************/

CMSController.getUsers = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Users",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    let result = await CMS.getUsers(filter);
    if (h.exists(result)) {
      code = 200;
      returnObj = h.resultObject(result, true, code);
    } else {
      code = 404;
      returnObj = h.resultObject([], false, code, 'User Not Found');
    }
  } catch (e) {
    returnObj = h.resultObject([], false, code, message);
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

CMSController.addUser = async (req, res) => {
  let code = 500,
    message = "Error! Adding User",
    returnObj = {};
  try {
    let data = h.getProps2(req);
    record = cms._userDTO(data);
    const result = await Common.insert(record.user, 'cdr.api_users', req.user).then(async () => {
      return await Common.insert(record.assign_user, 'cdr.assign_users', req.user)
    })
    code = 200;
    returnObj = h.resultObject(result, true, code);
  } catch (e) {
    returnObj = h.resultObject([], false, code, message);
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

/**************************************** Roles ********************************************/

CMSController.getRoles = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Roles",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    let result = await CMS.getRoles(filter);
    if (h.exists(result)) {
      code = 200;
      returnObj = h.resultObject(result, true, code);
    } else {
      code = 404;
      returnObj = h.resultObject([], false, code, 'Role Not Found');
    }
  } catch (e) {
    returnObj = h.resultObject([], false, code, message);
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

/**************************************** Employee *****************************************/

CMSController.getEmployee = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Employee/Consultant",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    let result;
    if (filter.user == 'D') {
      result = await CMS.getConsultant(filter);
    } else {
      result = await CMS.getEmployee(filter);
    }
    if (h.checkExistsNotEmpty(result, 'id')) {
      code = 200;
      returnObj = h.resultObject(result, true, code);
    } else {
      code = 404;
      returnObj = h.resultObject([], false, code, 'Employee/Consultant Not Found');
    }
  } catch (e) {
    returnObj = h.resultObject([], false, code, message);
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};


module.exports = CMSController;