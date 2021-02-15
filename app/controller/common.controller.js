/**
 * @Name common.controller.js
 *
 * @Description Common Operations
 *
 * @package
 * @subpackage
 * @author Suhaib <muhammad.suhaib@shifa.com.pk>
 * @Created on Jaqnuary 25, 2020
 */

// const storage = require("./../config/googleobject");
const Common = require("./../model/common.model");
const request = require('request');
const h = require("./../utils/helper");
const utility = require("./../utils/utility");
const { filter } = require("underscore");
const moment = require('moment');

const CommonController = {};

CommonController.getAllEntities = async (req, res) => {
  try {
    let result = await Common.getEntities();
    res.status(200).send(result);
  } catch (e) {
    h.error(e);
    res.status(500).send({
      message: 'Error! Fetching data.'
    });
  }
};

CommonController.getAllMedicines = async (req, res) => {
  try {
    let result = await Common.getMedicines();
    res.status(200).send(result);
  } catch (e) {
    h.error(e);
    res.status(500).send({
      message: 'Error! Fetching data.'
    });
  }
};

CommonController.getVitals = async (req, res) => {
  try {
    let filter = h.getProps2(req);
    let result = await Common.getVitals(filter);
    res.status(200).send(result);
  } catch (e) {
    h.error(e);
    res.status(500).send({
      message: 'Error! Fetching data.'
    });
  }
};

CommonController.getVisitVitals = async (req, res) => {
  try {
    let filter = h.getProps2(req);
    if (h.exists(filter.visit_id) && filter.visit_id != '') {
      const valid = await _isValidVisitID(filter.visit_id);
      if (h.exists(valid.visit_id)) {
        let result = await Common.getVisitVitals(filter);
        res.status(200).send(result);
      } else {
        res.status(401).send({
          message: 'Visit ID Not Valid'
        });
      }
    } else {
      res.status(401).send({
        message: 'Please Enter Visit ID'
      });
    }
  } catch (e) {
    h.error(e);
    res.status(500).send({
      message: 'Error! Fetching data.'
    });
  }
};

CommonController.getDoctors = async (req, res) => {
  try {
    let filter = h.getProps2(req);
    let result = await Common.getDoctors(filter, req.user);
    res.status(200).send(result);
  } catch (e) {
    h.error(e);
    res.status(500).send({
      message: 'Error! Fetching data.'
    });
  }
};

CommonController.getDoctorVitals = async (req, res) => {
  let code = 500,
    message = "Error! Getting Vitals Config",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    const doctor = await _doctorExists(filter.doctor_id);
    // Doctor Exists
    if (h.exists(doctor.doctor_id)) {
      let result = await Common.getDoctorVitals(filter.doctor_id);
      code = 200;
      returnObj = result;
    } else {
      code = 404;
      message = 'Doctor not Found';
      returnObj = {
        result: false,
        message: message
      };
    }
  } catch (e) {
    // h.error(e);
    returnObj = {
      result: false,
      message: message
    };
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

CommonController.getToken = async (req, res) => {
  try {
    let filter = h.getProps2(req);
    let result = await Common.getToken(filter);
    res.status(200).send(result);
  } catch (e) {
    h.error(e);
    res.status(500).send({
      message: 'Error! Fetching data.'
    });
  }
};

CommonController.getVisitID = async (req, res) => {
  try {
    let filter = h.getProps2(req);
    let result = await Common.getVisitID(filter);
    res.sendStatus(200);
  } catch (e) {
    h.error(e);
    res.status(500).send({
      message: 'Error! Fetching data.'
    });
  }
};

CommonController.getAppointedPatients = async (req, res) => {
  let code = 500,
    message = "Error! Getting Patients",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    const doctor = await _doctorExists(filter.doctor_id);
    // Doctor Exists
    if (h.exists(doctor.doctor_id)) {
      let result = await Common.getPatients(filter);
      code = 200;
      returnObj = result;
    } else {
      code = 404;
      message = 'Doctor not Found';
      returnObj = {
        result: false,
        message: message
      };
    }
  } catch (e) {
    // h.error(e);
    returnObj = {
      result: false,
      message: message
    };
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

CommonController.getAppointedPatientLegends = async (req, res) => {
  try {
    let filter = h.getProps2(req);
    let result = await Common.getPatientLegends(filter);
    res.status(200).send(result);
  } catch (e) {
    h.error(e);
    res.status(500).send({
      message: 'Error! Fetching data.'
    });
  }
};

CommonController.getPatientDemographics = async (req, res) => {
  let code = 500,
    message = "Error! Getting Patient Details",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    let result = await Common.getPatientDemographics(filter);
    if (h.exists(result)) {
      code = 200;
      returnObj = result;
    } else {
      code = 404;
      message = 'Patient not Found';
      returnObj = {
        result: false,
        message: message
      };
    }
  } catch (e) {
    // h.error(e);
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

CommonController.createVisit = async (req, res) => {
  let code = 500,
    message = "Error! Creating Visit",
    returnObj = {};
  try {
    let postData = h.getProps2(req);
    const visited = await _hasVisitedToday(postData.mr_no, postData.doctor_id);
    if (h.checkExistsNotEmptyGreaterZero(visited, 'today_visits')) {
      code = 409;
      message = 'Visit already created';
      returnObj = {
        result: false,
        message: message
      };
    } else {
      let token = await Common.getToken(postData);
      let visit_id = await Common.getVisitID(postData);
      let appt;
      if (h.checkExistsNotEmptyGreaterZero(postData, 'apt_no')) {
        appt = await Common.getPatientAppointment(postData);
        postData = { ...postData, apt_time: appt.apt_time_encoded }
      }
      postData = { ...postData, ...token, visit_id: visit_id }
      const insertData = _constNotesObject(postData);
      const result = await Common.insert(insertData, 'REGISTRATION.CONST_NOTES', req.user);
      message = 'Visit Created Successfully';
      const returnData = _returnCreateVisit(result[0]);
      code = 200;
      returnObj = {
        result: returnData,
        message: message
      };
    }
  } catch (e) {
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

CommonController.saveVitals = async (req, res) => {
  let code = 500,
    message = "Error! Saving Visit Vitals",
    returnObj = {};
  try {
    let postData = h.getProps2(req);
    // h.log(postData);
    if (h.exists(postData.visit_id)) {
      const visit = await _hasConfirmVisitToday(postData.visit_id);
      if (h.checkExistsNotEmptyGreaterZero(visit, 'today_visits')) {
        const current_visit = await _vitalsOfCurrentVisit(postData.visit_id);
        if (h.checkExistsNotEmptyGreaterZero(current_visit, 'vitals')) {
          // await Common.delete('REGISTRATION.vital_signs', { VISIT_ID: postData.visit_id }, req.user);
        }
        let vitals = postData.vitals;
        if (typeof postData.vitals == 'string') {
          vitals = JSON.parse(postData.vitals);
        }
        const result = [];
        const details = { visit_id: postData.visit_id, "mr#": visit.mrno };
        await Common.delete('REGISTRATION.vital_signs', { visit_id: postData.visit_id }, req.user);
        for (const e of vitals) {
          if (h.checkExistsNotEmpty(e, 'result')) {
            let singleObj = _visitVitalObject(e, postData.sp_id, postData.visit_id);
            const inserted = await Common.insert(singleObj, 'REGISTRATION.vital_signs', req.user);
            if (e.vital_id == 1) {
              details.bp_s = e.result;
            } else if (e.vital_id == 2) {
              details.bp_d = e.result;
            } else if (e.vital_id == 3) {
              details.weight = e.result;
            } else if (e.vital_id == 4) {
              details.height = e.result;
            } else if (e.vital_id == 5) {
              details.temprature = e.result;
            } else if (e.vital_id == 7) {
              details.pulse = e.result;
            } else if (e.vital_id == 13) {
              details.headc = e.result;
            }
            result.push(inserted);
          }
        }
        details.id = moment().format('MMYYDDHHmmss');
        const inserted_details = await Common.insert(details, 'registration.VITAL_SIGN_DETAIL', req.user);
        const updated = await Common.update({ pc: postData.presenting_complaint }, 'REGISTRATION.const_notes', { visit_id: postData.visit_id }, req.user)
        message = 'Vitals Added/Updated Successfully';
        const returnData = true;
        code = 200;
        returnObj = {
          result: returnData,
          message: message
        };
      } else {
        code = 404;
        message = 'Visit Not Created';
        returnObj = {
          result: false,
          message: message
        };
      }
    } else {
      code = 404;
      message = 'Please Provide Visit ID';
      returnObj = {
        result: false,
        message: message
      };
    }
  } catch (e) {
    // h.error(e);
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

CommonController.savePresentingComplaintTemplate = async (req, res) => {
  let code = 500,
    message = "Error! Adding Presenting Complaint Template",
    returnObj = {};
  try {
    let postData = h.getProps2(req);
    if (h.exists(postData.presenting_complaint) && postData.presenting_complaint != '') {
      const inserted = await Common.insert({ symptoms: postData.presenting_complaint }, 'REGISTRATION.symptoms', req.user)
      message = 'Presenting Complaint Template Added Successfully';
      const returnData = inserted;
      code = 200;
      returnObj = {
        result: returnData,
        message: message
      };
    } else {
      code = 404;
      message = 'Please Type Presenting Complaint';
      returnObj = {
        result: false,
        message: message
      };
    }
  } catch (e) {
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

CommonController.getPresentingComplaintTemplate = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Presenting Complaint Template",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    if (h.exists(filter.empid) && filter.empid != '') {
      let result = await Common.getPresentingComplaintTemplate(filter);
      code = 200;
      returnObj = result;
    } else {
      code = 404;
      message = 'Please Select an EMPID';
      returnObj = {
        result: false,
        message: message
      };
    }
  } catch (e) {
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

CommonController.getPatientVitalHistory = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Patient Vital History",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    if (h.exists(filter.mr_no) && filter.mr_no != '') {
      let patient = await Common.getPatientDemographics(filter);
      if (h.exists(patient)) {
        let vitalHistory = await Common.getPatientVitalHistory(filter);
        if (h.exists(vitalHistory) && !h.isEmpty(vitalHistory)) {
          const filteredVitalHistory = await _mapVitalHistory(filter.doctor_id, vitalHistory);
          if (h.exists(filteredVitalHistory) && !h.isEmpty(filteredVitalHistory.data)) {
            code = 200;
            returnObj = filteredVitalHistory;
          } else {
            code = 404;
            message = 'Doctor Not Found';
            returnObj = {
              result: false,
              message: message
            };
          }
        } else {
          code = 404;
          message = 'No Previous Vital History';
          returnObj = {
            result: false,
            message: message
          };
        }
      } else {
        code = 404;
        message = 'Patient not Found';
        returnObj = {
          result: false,
          message: message
        };
      }
    } else {
      code = 404;
      message = 'Please Provide MRNO';
      returnObj = {
        result: false,
        message: message
      };
    }
  } catch (e) {
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

const _mapVitalHistory = async (doctor_id, vitalHistoryObject) => {
  try {
    const vitalDefnitions = h.vitalMappingDefinition();
    const doctor = await _doctorExists(doctor_id);
    // Doctor Exists
    if (h.exists(doctor.doctor_id)) {
      // Get Doctor Vital Definitions
      let definition = await Common.getDoctorVitals(doctor_id);
      // Get Doctor Vital Definitions Ids in Array
      const vital_ids = h.pluck(definition, 'vital_id');
      // Filter Global Vital Definitions by Doctor Vital Definitions Ids
      let filteredVitalDefinitions = h.pluck(vitalDefnitions.filter((vital) => vital_ids.includes(vital.id)), 'name');
      filteredVitalDefinitions = ['enter_at', ...filteredVitalDefinitions]
      // Filter vital History object by filtered Vital Definitions 
      const filteredVitalHistory = h.map(vitalHistoryObject, function (obj) {
        return h.pick(obj, filteredVitalDefinitions)
      });

      // Filter Global Vital Definitions by Doctor Vital Definitions Ids AS key value pair for table header
      let filteredVitalDefinitionKeys = h.map(vitalDefnitions.filter((vital) => vital_ids.includes(vital.id)), function (obj) {
        d = h.pick(obj, 'name', 'alt_name');
        return { [d['name']]: d['alt_name'] }
      });
      filteredVitalDefinitionKeys = [{ "enter_at": 'Enter At' }, ...filteredVitalDefinitionKeys]

      return {
        keys: filteredVitalDefinitionKeys,
        data: filteredVitalHistory
      };
    } else {
      return {}
    }
  } catch (e) {
    h.error(e);
    return {};
  }
}

const _doctorExists = async (doctor_id) => {
  try {
    let result = await Common.doctorExists(doctor_id);
    return result;
  } catch (e) {
    h.error(e);
    return {};
  }
};

const _patientExists = async (mr_no) => {
  try {
    let result = await Common.patientExists(mr_no);
    return result;
  } catch (e) {
    h.error(e);
    return {};
  }
};

const _hasVisitedToday = async (mrno, doctor_id) => {
  try {
    let result = await Common.hasVisitedToday(mrno, doctor_id);
    return result;
  } catch (e) {
    h.error(e);
    return {};
  }
};

const _isValidVisitID = async (visit_id) => {
  try {
    let result = await Common.isValidVisitID(visit_id);
    return result;
  } catch (e) {
    h.error(e);
    return {};
  }
};

const _hasConfirmVisitToday = async (visit_id) => {
  try {
    let result = await Common.hasConfirmVisitToday(visit_id);
    return result;
  } catch (e) {
    h.error(e);
    return {};
  }
};

const _vitalsOfCurrentVisit = async (visit_id) => {
  try {
    let result = await Common.vitalsOfCurrentVisit(visit_id);
    return result;
  } catch (e) {
    h.error(e);
    return {};
  }
};

const _constNotesObject = o => {
  let obj = {
    "mr#": o.mr_no.toUpperCase(),
    "doctor_id": o.doctor_id,
    "visit_type": o.visit_type,
    "visit_status": o.visit_status,
    "token#": o.token_no,
    "visit_id": o.visit_id,
    // "arrival_mode": 'In Person'
  }
  if (h.checkExistsNotEmptyGreaterZero(o, 'apt_no')) {
    obj["apt_time"] = o.apt_time;
  }
  if (h.checkExistsNotEmptyGreaterZero(o, 'arrival_mode')) {
    obj["arrival_mode"] = 'Virtual';
  }
  return obj;
}

const _returnCreateVisit = o => {
  let obj = {
    "mr_no": o['mr#'],
    "visit_id": o.visit_id,
    "token#": o['token#'],
  }
  return obj;
}

const _visitVitalObject = (o, spec_id, visit_id) => {
  let obj = {
    "vital_id": o.vital_id,
    "result": o.result,
    "spec_id": spec_id,
    "visit_id": visit_id
  }
  return obj;
}



module.exports = CommonController;