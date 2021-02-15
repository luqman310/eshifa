/**
 * @Name setting.controller.js
 *
 * @Description Setting Operations
 *
 * @package
 * @subpackage
 * @author Suhaib <muhammad.suhaib@shifa.com.pk>
 * @Created on December 01, 2020
 */

const Common = require("./../model/common.model");
const User = require("./../model/user.model");
const h = require("../utils/helper");
const utility = require("./../utils/utility");

const SettingController = {};

SettingController.externalLinks = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving External Links",
    returnObj = {};
  try {
    let result = await Common.getExternalLinks();
    if (h.exists(result)) {
      code = 200;
      returnObj = h.resultObject(result, true, code);
    } else {
      code = 404;
      returnObj = h.resultObject([], false, code, 'External Links Not Found');
    }
  } catch (e) {
    returnObj = h.resultObject([], false, code, message);
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

SettingController.profilePicture = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Profile Picture",
    returnObj = {};
  try {
    let result = await User.getProfilePicture(req.user);
    if (h.exists(result)) {
      code = 200;
      returnObj = h.resultObject(result, true, code);
    } else {
      code = 404;
      returnObj = h.resultObject([], false, code, 'Profile Picture Not Found');
    }
  } catch (e) {
    returnObj = h.resultObject([], false, code, message);
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

SettingController.getPrescriptionSettings = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Prescription Settings",
    returnObj = {};
  try {
    let result = await Common.getPrescriptionSettings(req.user);
    if (h.exists(result)) {
      code = 200;
      returnObj = h.resultObject(result, true, code);
    } else {
      code = 404;
      returnObj = h.resultObject([], false, code, 'Prescription Settings Not Found');
    }
  } catch (e) {
    returnObj = h.resultObject([], false, code, message);
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

SettingController.savePrescriptionSettings = async (req, res) => {
  let code = 500,
    message = "Error! Saving Prescription Settings",
    returnObj = {};
  try {
    const postData = h.getProps2(req);
    let result = await Common.getPrescriptionSettings(postData);
    let singleObj = utility._prescriptionTemplateObject(postData);
    if (h.checkExistsNotEmpty(result, 'doctor_id')) {
      const updated = await Common.update(singleObj, 'emr.doctor_prescription', {
        doctor_id: singleObj.doctor_id
      }, req.user);
      code = 200;
      returnObj = h.resultObject(updated, true, code, 'Prescription Settings Updated Successfully');
    } else {
      code = 200;
      const inserted = await Common.insert(singleObj, 'emr.doctor_prescription', user);
      returnObj = h.resultObject(inserted, true, code, 'Prescription Settings Added Successfully');
    }
  } catch (e) {
    returnObj = h.resultObject([], false, code, message);
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};


module.exports = SettingController;