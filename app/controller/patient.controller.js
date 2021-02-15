/**
 * @Name patient.controller.js
 *
 * @Description Patient Operations
 *
 * @package
 * @subpackage
 * @author Suhaib <muhammad.suhaib@shifa.com.pk>
 * @Created on October 02, 2020 2021
 */

const Common = require("./../model/common.model");
const Patient = require("./../model/patient.model");
const Doctor = require("./../model/doctor.model");
const h = require("./../utils/helper");
const utility = require("./../utils/utility");
const patientUtil = require("./../utils/patient.util");
const mayTapi = require("./../services/maytapi.service");
const zoomService = require("./../services/zoom.service");
const reportService = require("./../services/report.service");
const request = require('request');
const rp = require('request-promise-native');
const moment = require('moment');
const fs = require('fs');

const PatientController = {};

/**************************************** Diagnosis ****************************************/

PatientController.getDiagnosisHistory = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Diagnosis List",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    let result = await Patient.getPatientDiagnosis(filter);
    code = 200;
    returnObj = result;
  } catch (e) {
    returnObj = {
      result: false,
      message: message
    };
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

PatientController.deletePatientVisitDiagnosis = async (req, res) => {
  let code = 500,
    message = "Error! Deleting Diagnosis",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    let singleObj = patientUtil._deleteDiagnosisDTO(req.user);
    if (h.checkExistsNotEmpty(filter, 'code')) {
      const result = await Common.update(singleObj, 'REGISTRATION.diagnosis', { visit_id: filter.visit_id, icd_code: filter.code }, req.user);
      code = 200;
      message = 'Diagnosis Deleted Successfully';
      returnObj = {
        result: result,
        message: message
      };
    } else {
      code = 400;
      message = 'Diagnosis Code not Provided';
      returnObj = {
        result: false,
        message: message
      };
    }
  } catch (e) {
    returnObj = {
      result: false,
      message: message
    };
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};
/**************************************** Diagnostics **************************************/

PatientController.deletePatientVisitDiagnostics = async (req, res) => {
  let code = 500,
    message = "Error! Deleting Diagnostics",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    let singleObj = patientUtil._deleteDiagnosticsDTO();
    if (h.checkExistsNotEmpty(filter, 'code')) {
      const result = await Common.update(singleObj, 'REGISTRATION.diagnostics', { visit_id: filter.visit_id, service_id: filter.code }, req.user);
      code = 200;
      message = 'Diagnostics Deleted Successfully';
      returnObj = {
        result: result,
        message: message
      };
    } else {
      code = 400;
      message = 'Diagnostics ID not Provided';
      returnObj = {
        result: false,
        message: message
      };
    }
  } catch (e) {
    returnObj = {
      result: false,
      message: message
    };
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

PatientController.getPatientDiagnosticResults = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Patient Diagnostics",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    const lab = await Patient.getPatientLabResults(filter);
    const radiology = await Patient.getPatientRadiologyResults(filter);
    const cardiology = await Patient.getPatientCardiologyResults(filter);
    const neurology = await Patient.getPatientNeurologyResults(filter);
    const gastro = await Patient.getPatientGastroResults(filter);
    code = 200;
    returnObj = h.resultObject({ lab, radiology, cardiology, neurology, gastro }, true, code);
  } catch (e) {
    returnObj = h.resultObject([], false, code, message);
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

/**************************************** Medicines ****************************************/

PatientController.getMedicinesHistory = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Medicine History",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    const medicines = await Patient.getPatientMedicineHistory(filter);
    const visits = h.pluck(medicines, 'visit_date').filter((v, i, a) => a.findIndex(t => (t === v)) === i);
    const doctors = patientUtil._formatDoctors(medicines).filter((v, i, a) => a.findIndex(t => (t.doctor_id === v.doctor_id && t.doctor_name === v.doctor_name)) === i);
    for (const m of medicines) {
      let filter = { code: m.medicine_code };
      let res = await Doctor.getMedicineFrequencies(filter);
      if (res.length === 0) {
        res = await Doctor.getMedicineFrequenciesAll(filter);
      }
      m.medication_frequency = res;
    }
    code = 200;
    returnObj = h.resultObject({ medications: patientUtil._formatMedicinesHistory(medicines), visits, doctors }, true, code);
  } catch (e) {
    returnObj = h.resultObject([], false, code, message);
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

PatientController.deletePatientVisitMedicines = async (req, res) => {
  let code = 500,
    message = "Error! Deleting Medicine",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    let singleObj = patientUtil._deleteMedicinesDTO();
    if (h.checkExistsNotEmpty(filter, 'code')) {
      const result = await Common.update(singleObj, 'REGISTRATION.medicine_prescription', { visit_id: filter.visit_id, medicine_code: filter.code }, req.user);
      code = 200;
      message = 'Medicine Deleted Successfully';
      returnObj = {
        result: result,
        message: message
      };
    } else if (h.checkExistsNotEmpty(filter, 'medication')) {
      const result = await Common.update(singleObj, 'REGISTRATION.medicine_prescription', { visit_id: filter.visit_id, medicine: filter.medication }, req.user);
      code = 200;
      message = 'Medicine Deleted Successfully';
      returnObj = {
        result: result,
        message: message
      };
    } else {
      code = 400;
      message = 'Medicine Code / Name not Provided';
      returnObj = {
        result: false,
        message: message
      };
    }
  } catch (e) {
    returnObj = {
      result: false,
      message: message
    };
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

/**************************************** Allergies ****************************************/

PatientController.deletePatientVisitAllergies = async (req, res) => {
  let code = 500,
    message = "Error! Deleting Allergy",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    if (h.checkExistsNotEmpty(filter, 'code')) {
      if (h.checkExistsNotEmpty(filter, 'type')) {
        let singleObj = '', table = 'pharmacy_shifa.class_alergy', where = { mrno: filter.mrno, gen_code: filter.code };
        if (filter.type.toLowerCase() === 'brand') {
          singleObj = patientUtil._deleteBrandAllergyDTO();
          table = 'registration.moar_drug_brand_allergy';
          where = { mr_no: filter.mrno, medicine_code: filter.code };
        } else if (filter.type.toLowerCase() === 'generic') {
          singleObj = patientUtil._deleteGenericAllergyDTO();
        } else if (filter.type.toLowerCase() === 'sub class') {
          where = { mrno: filter.mrno, sub_class_code: filter.code };
          singleObj = patientUtil._deleteGenericAllergyDTO();
        }
        const result = await Common.update(singleObj, table, where, req.user);
        code = 200;
        message = 'Allergy Deleted Successfully';
        returnObj = {
          result: result,
          message: message
        };
      } else {
        code = 400;
        message = 'Allergy Type not Provided';
        returnObj = {
          result: false,
          message: message
        };
      }
    } else {
      code = 400;
      message = 'Allergy Code not Provided';
      returnObj = {
        result: false,
        message: message
      };
    }
  } catch (e) {
    returnObj = {
      result: false,
      message: message
    };
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

/**************************************** Vitals *******************************************/

PatientController.getPatientVisitVitalsAndDefinitions = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Patient Visit Vitals",
    returnObj = {};
  try {
    const visit = req.visit;
    const vitals = await Common.getPatientVisitVitalsAndDefinitions(visit);
    code = 200;
    returnObj = {
      "pc": visit.pc,
      "vitals": vitals
    };
  } catch (e) {
    returnObj = {
      result: false,
      message: message
    };
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

PatientController.getPreviousVisitVitals = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Patient Vital History",
    returnObj = {};
  try {
    // let filter = h.getProps2(req);
    const previous_visit = await Patient.getPreviousVisit(req.visit);
    if (h.checkExistsNotEmpty(previous_visit, 'visit_id')) {
      let result = await Common.getVisitVitals(previous_visit);
      code = 200;
      returnObj = result;
    } else {
      code = 200;
      returnObj = [];
    }
  } catch (e) {
    returnObj = {
      result: false,
      message: message
    };
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

/*************************************** Previous Visits ***********************************/

PatientController.getOPDPreviousVisits = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Patient Vital History",
    returnObj = {};
  try {
    const result = await Patient.getOPDPreviousVisits(req.patient);
    code = 200;
    returnObj = result;
  } catch (e) {
    returnObj = {
      result: false,
      message: message
    };
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

/*************************************** Visits ********************************************/

PatientController.getPatientVisitDetails = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Patient Visit Details",
    returnObj = {};
  try {
    const visit = req.visit;
    result = await patientVisitDetails(visit);
    code = 200;
    returnObj = result;
  } catch (e) {
    returnObj = {
      result: false,
      message: message
    };
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

PatientController.savePatientVisitDetails = async (req, res) => {
  let code = 500,
    message = "Error! Saving Patient Visit Details",
    returnObj = {};
  try {
    const postData = h.getProps2(req);
    const visit = req.visit;
    const constNotesDTO = patientUtil._constNotesDTO(postData);
    const updated = await Common.update(constNotesDTO, 'REGISTRATION.const_notes', {
      visit_id: visit.visit_id
    }, req.user) // Working
    await saveVitals(visit, postData.vitals, req.user); // Working
    await saveDiagnosis(visit, postData.diagnosis, req.user); // Working
    await saveDiagnostics(visit, postData.diagnostics, req.user); // Working
    await saveAllergies(visit, postData.allergies, req.user); // Working
    await saveMedicines(visit, postData.medications, req.user); // Working

    result = await patientVisitDetails(visit);
    code = 200;
    message = 'Data Saved Successfully';
    returnObj = {
      result: result,
      message: message
    };
  } catch (e) {
    returnObj = {
      result: false,
      message: message
    };
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

PatientController.checkPatientNKDA = async (req, res) => {
  let code = 500,
    message = "Error! Saving Patient NKDA",
    returnObj = {};
  try {
    const postData = h.getProps2(req);// const nkda = await Patient.checkPatientNKDA(visit);
    const nkda = await Patient.checkPatientNKDA(postData);
    data = {
      "mrno": postData.mrno,
      "description": 'NKDA',
      "active": postData.nkda == 1 ? 'Y' : 'N',
    }
    if (h.checkExistsNotEmpty(nkda, 'active')) {
      await Common.update(data, 'registration.tbl_nkda', { mrno: postData.mrno }, req.user)
      // } else if (h.checkExistsNotEmpty(nkda, 'active') && nkda.active == 'Y') {
      // } else if (h.checkExistsNotEmpty(nkda, 'active') && nkda.active == 'N') {
      //   console.log('N');
    } else {
      await Common.insert(data, 'registration.tbl_nkda', req.user)
    }
    code = 200;
    message = 'Data Saved Successfully';
    returnObj = {
      result: true,
      message: message
    };
  } catch (e) {
    returnObj = {
      result: false,
      message: message
    };
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

PatientController.deleteVisit = async (req, res) => {
  let code = 500,
    message = "Error! Deleting Patient Visit",
    returnObj = {};
  try {
    const postData = h.getProps2(req);
    const visit = req.visit;
    const constNotesDTO = patientUtil._deleteConstNotesDTO(postData);
    const result = await Common.update(constNotesDTO, 'REGISTRATION.const_notes', {
      visit_id: visit.visit_id
    }, req.user) // Working
    code = 200;
    message = 'Visit Deleted Successfully';
    returnObj = {
      result: result,
      message: message
    };
  } catch (e) {
    returnObj = {
      result: false,
      message: message
    };
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

/*************************************** Reports *******************************************/

PatientController.patientReport = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Patient Vital History",
    returnObj = {};
  try {
    const visit = req.visit;
    const result = await Common.getDoctorReport(visit);
    const REPORT_URL = process.env.REPORT_SERVER_URL + result.prescription + process.env.REPORT_SERVER_AUTH + '&VISIT_ID=' + visit.visit_id;

    const optionsStart = {
      uri: REPORT_URL,
      method: "GET",
      encoding: "binary", // it also works with encoding: null
      headers: {
        "Content-type": "application/pdf"
      }
    };
    request(optionsStart, async (err, resp, body) => {
      let loc = './uploads/reports/';
      const filename = 'report_' + visit.visit_id + '_' + new Date().valueOf() + '.pdf'
      let writeStream = fs.createWriteStream(loc + filename);
      writeStream.write(body, 'binary');
      await writeStream.end();
      code = 200;
      returnObj = {
        filename: filename
      };
      res.status(code).send(returnObj);
    });
  } catch (e) {
    returnObj = {
      result: false,
      message: message
    };
    res.status(code).send(returnObj);
    throw e;
  }
}

PatientController.patientReportMedicalRecord = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Patient Vital History",
    returnObj = {};
  try {
    const visit = req.visit;
    const result = await Common.getDoctorReport(visit);
    const REPORT_URL = process.env.REPORT_SERVER_URL + 'patient_visit_detail_medrec.rdf' + process.env.REPORT_SERVER_AUTH + '&VISIT_ID=' + visit.visit_id;

    const optionsStart = {
      uri: REPORT_URL,
      method: "GET",
      encoding: "binary", // it also works with encoding: null
      headers: {
        "Content-type": "application/pdf"
      }
    };
    request(optionsStart, async (err, resp, body) => {
      let loc = './uploads/reports/';
      const filename = 'report_medical_record_' + visit.visit_id + '_' + new Date().valueOf() + '.pdf'
      let writeStream = fs.createWriteStream(loc + filename);
      writeStream.write(body, 'binary');
      await writeStream.end();
      code = 200;
      returnObj = {
        filename: filename
      };
      res.status(code).send(returnObj);
    });
  } catch (e) {
    returnObj = {
      result: false,
      message: message
    };
    res.status(code).send(returnObj);
    throw e;
  }
}

PatientController.patientDiagnosticReport = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Patient Report",
    returnObj = {};
  try {
    filter = h.getProps2(req);
    await reportService.getPDF(filter);
    // const visit = req.visit;
    // const result = await Common.getDoctorReport(visit);
    // const REPORT_URL = process.env.REPORT_SERVER_URL + result.prescription + process.env.REPORT_SERVER_AUTH + '&VISIT_ID=' + visit.visit_id;

    // const optionsStart = {
    //   uri: REPORT_URL,
    //   method: "GET",
    //   encoding: "binary", // it also works with encoding: null
    //   headers: {
    //     "Content-type": "application/pdf"
    //   }
    // };
    // request(optionsStart, async (err, resp, body) => {
    //   let loc = './uploads/reports/';
    //   const filename = 'report_' + visit.visit_id + '_' + new Date().valueOf() + '.pdf'
    //   let writeStream = fs.createWriteStream(loc + filename);
    //   writeStream.write(body, 'binary');
    //   await writeStream.end();
    //   code = 200;
    //   returnObj = {
    //     filename: filename
    //   };
    //   res.status(code).send(returnObj);
    // });
    returnObj = true;
  } catch (e) {
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
}

PatientController.getPatientNeurologyReport = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Patient Neurology Report",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    if (h.checkExistsNotEmpty(filter, 'test_name') && h.checkExistsNotEmptyGreaterZero(filter, 'test_code')) {
      returnObj = await reportService.genericReport(filter, 'Neurology');
      code = returnObj.statusCode;
    } else {
      code = 400;
      returnObj = h.resultObject([], false, code, 'Please provide Test name & code');
    }
  } catch (e) {
    returnObj = h.resultObject([], false, code, message);
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

PatientController.getPatientCardiologyReport = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Patient Cardiology Report",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    if (h.checkExistsNotEmpty(filter, 'test_code')) {
      returnObj = await reportService.genericReport(filter, 'Cardiology');
      code = returnObj.statusCode;
    } else {
      code = 400;
      returnObj = h.resultObject([], false, code, 'Please provide Test code');
    }
  } catch (e) {
    returnObj = h.resultObject([], false, code, message);
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

PatientController.getPatientRadiologyReport = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Patient Radiology Report",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    filter = h.appendUserDetails(filter, req);
    if (h.checkExistsNotEmptyGreaterZero(filter, 'test_code') && h.checkExistsNotEmpty(filter, 'test_status') && (filter.test_status == 'YN' || filter.test_status == 'YY')) {
      returnObj = await reportService.genericReport(filter, 'Radiology');
      code = returnObj.statusCode;
    } else {
      code = 400;
      returnObj = h.resultObject([], false, code, 'Please provide Test code');
    }
  } catch (e) {
    returnObj = h.resultObject([], false, code, message);
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

PatientController.getPatientLabReport = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Patient Lab Report",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    filter = h.appendUserDetails(filter, req);
    if (h.checkExistsNotEmptyGreaterZero(filter, 'test_code')) {
      returnObj = await reportService.genericReport(filter, 'Lab');
      code = returnObj.statusCode;
    } else {
      code = 400;
      returnObj = h.resultObject([], false, code, 'Please provide Test code');
    }
  } catch (e) {
    returnObj = h.resultObject([], false, code, message);
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

PatientController.getPatientGastroReport = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Patient Gastro Report",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    filter = h.appendUserDetails(filter, req);
    if (h.checkExistsNotEmptyGreaterZero(filter, 'test_code')) {
      returnObj = await reportService.genericReport(filter, 'Gastro');
      code = returnObj.statusCode;
    } else {
      code = 400;
      returnObj = h.resultObject([], false, code, 'Please provide Test code');
    }
  } catch (e) {
    returnObj = h.resultObject([], false, code, message);
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

/*************************************** Share Reports *************************************/

PatientController.sharePatientReport = async (req, res) => {
  let code = 500,
    message = "Error! Sharing Patient Report",
    returnObj = {};
  try {
    const visit = req.visit;
    const filter = h.getProps2(req);
    const REPORT_URL = await getDoctorReportURL(visit);
    const filepathname = './uploads/reports/' + 'report_' + visit.visit_id + '_' + new Date().valueOf() + '.pdf';
    const report = await getPatientReport(REPORT_URL, filepathname);
    // Text Message
    const content = await Patient.patientVisitMesssageTemplate(visit);
    await textSMS(content, filter.to_number);

    // Report Message
    const data = await h.base64EncodeFile(filepathname);
    await fileSMS(data, filter.to_number);
    code = 200;
    returnObj = {
      result: true,
      filename: 'Report Shared'
    };
  } catch (e) {
    returnObj = {
      result: false,
      message: message
    };
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
}

PatientController.shareZoomInvite = async (req, res) => {
  let code = 500,
    message = "Error! Sending Invitation Link",
    returnObj = {};
  try {
    const visit = req.visit;
    const filter = h.getProps2(req);
    const content = await Patient.patientVisitMesssageTemplate(visit);
    const invitation = await zoomService.createMeeting(content);

    const log = await saveInvitationLog({ ...visit, ...invitation, phoneno: filter.to_number[0] }, invitation);
    if (h.checkExistsNotEmptyGreaterZero(log, 'meetingid')) {
      // Invitation Link Message
      await linkSMS({ ...content, ...invitation }, filter.to_number);
      code = 200;
      const { uuid, id, host_email, start_url } = invitation;
      returnObj = h.resultObject({ uuid, id, host_email, start_url }, true, code);
    } else {
      returnObj = h.resultObject([], false, code, message);
    }
  } catch (e) {
    returnObj = h.resultObject([], false, code, message);
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
}

const saveInvitationLog = async (log, invitation) => {
  try {
    const data = patientUtil._invitationLogDTO(log, invitation);
    const result = await Common.insert(data, 'CDR.INVITATION_LINKS', {});
    return result.shift();
  } catch (e) {
    throw e;
  }
}

const getDoctorReportURL = async (visit) => {
  const result = await Common.getDoctorReport(visit);
  const url = process.env.REPORT_SERVER_URL + result.prescription + process.env.REPORT_SERVER_AUTH + '&VISIT_ID=' + visit.visit_id;
  return url;
}

const getPatientReport = async (url, path) => {
  let result = false;
  try {
    const options = {
      method: "GET",
      encoding: "binary", // it also works with encoding: null
      headers: {
        "Content-type": "application/pdf"
      }
    };
    let response = await rp(url, options);
    let writeStream = fs.createWriteStream(path);
    writeStream.write(response, 'binary');
    await writeStream.end();
    result = true;
  } catch (e) {
    throw e;
  } finally {
    return result;
  }

  // return filename;
}

const linkSMS = async (o, to_numbers) => {
  const message = `Dear Client,\nZoom Invitation Details of Patient *${o.patient}* for consultation with consultant *${o.consultant}* on _${o.vdate}_ is:\n*Meeting ID:* _${o.id}_\n*Password:* _${o.password}_\n*Join URL:* _${o.join_url}_\nFor assistance call +92518464646.`;
  for (const to_number of to_numbers) {
    const resp = await mayTapi.sendSMS({ message: message, type: 'text', to_number: to_number });
  }
}

const textSMS = async (o, to_numbers) => {
  const message = `Dear Client,\nPrescription Report of Patient *${o.patient}* for consultation with consultant *${o.consultant}* on _${o.vdate}_ is dispatched.\nFor assistance call +92518464646.`;
  for (const to_number of to_numbers) {
    const resp = await mayTapi.sendSMS({ message: message, type: 'text', to_number: to_number });
  }
}

const fileSMS = async (o, to_numbers) => {
  const message = o;
  for (const to_number of to_numbers) {
    const resp = await mayTapi.sendSMS({ message: message, type: 'media', to_number: to_number, text: 'Prescription Report.pdf' });
  }
}


const patientVisitDetails = async (visit, current = true) => {
  try {
    const allergies = await Patient.getPatientAllergies(visit);
    const diagnosis = await Patient.getPatientDiagnosis(visit);
    const diagnostics = await Patient.getPatientDiagnostics(visit);
    const medicines = await Patient.getPatientMedicine(visit);
    for (const m of medicines) {
      let filter = { code: m.medicine_code };
      let res = await Doctor.getMedicineFrequencies(filter);
      if (res.length === 0) {
        res = await Doctor.getMedicineFrequenciesAll(filter);
      }
      m.medication_frequency = res;
    }
    const vitalsAndDefinitions = await Common.getPatientVisitVitalsAndDefinitions(visit);
    const nkda = await Patient.checkPatientNKDA(visit);
    let previousVitals = [];

    const previous_visit = await Patient.getPreviousVisit(visit);
    if (h.checkExistsNotEmpty(previous_visit, 'visit_id')) {
      previousVitals = await Common.getVisitVitals(previous_visit);
    }
    const invitations = await Patient.getPatientInvites(visit);


    const result = {
      visit_id: visit.visit_id,
      allergies: patientUtil._formatAllergies(allergies),
      presentingComplaints: patientUtil._formatPresentingComplaints(visit),
      clinicalDetails: patientUtil._formatClinicalDetails(visit),
      impression: patientUtil._formatImpression(visit),
      followupEnter: patientUtil._formatFollowUp(visit),
      followupSelect: patientUtil._formatFollowUpSelect(visit),
      other_instruction: patientUtil._formatOtherInstruction(visit),
      visit_date: patientUtil._formatVisitDate(visit),
      entry_date: visit.entry_date,
      diagnosis: patientUtil._formatDiagnosis(diagnosis),
      diagnostics: patientUtil._formatDiagnostics(diagnostics),
      managementPlan: patientUtil._formatManagementPlan(visit),
      physicalExamination: patientUtil._formatPhysicalExamination(visit),
      medications: patientUtil._formatMedicines(medicines),
      vitals: patientUtil._formatVitals(vitalsAndDefinitions, previousVitals),
      nkda: h.checkExistsNotEmpty(nkda, 'active') && nkda.active == 'Y' ? 1 : 0,
      home_services: patientUtil._formatHomeServices(visit),
      invitations: invitations,
      invitation: patientUtil._formatInvite(invitations.shift()),
    }
    return result;
  } catch (e) {
    throw e;
  }
}

const saveVitals = async (visit, vitals, user) => {
  try {
    const result = [];
    const details = {
      visit_id: visit.visit_id,
      "mr#": visit.mrno
    };
    await Common.delete('REGISTRATION.vital_signs', { visit_id: visit.visit_id }, user);
    for (const e of vitals) {
      if (h.checkExistsNotEmpty(e, 'result')) {
        let singleObj = utility._visitVitalObject(e, visit.spec_id, visit.visit_id);
        const inserted = await Common.insert(singleObj, 'REGISTRATION.vital_signs', user);
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
          details.head = e.result;
        }
        result.push(inserted);
      }
    }
    details.id = moment().format('MMYYDDHHmmss');
    const inserted_details = await Common.insert(details, 'registration.VITAL_SIGN_DETAIL', user);
  } catch (e) {
    throw e;
  }
}

const saveDiagnosis = async (visit, diagnosis, user) => {
  try {
    for (const e of diagnosis) {
      if (h.checkExistsNotEmptyGreaterZero(e, 'code')) {
        let singleObj = patientUtil._diagnosisDTO(e, visit);
        let check = await Patient.checkPatientDiagnosis(e, visit);
        if (h.checkExistsNotEmpty(check, 'visit_id')) {
          const updated = await Common.update(singleObj, 'REGISTRATION.diagnosis', {
            visit_id: singleObj.visit_id,
            icd_code: singleObj.icd_code
          }, user);
        } else {
          const inserted = await Common.insert(singleObj, 'REGISTRATION.diagnosis', user);
        }
      }
    }
  } catch (e) {
    throw e;
  }
}

const saveDiagnostics = async (visit, diagnostics, user) => {
  try {
    for (const e of diagnostics) {
      if (h.checkExistsNotEmptyGreaterZero(e, 'service_id')) {
        let singleObj = patientUtil._diagnosticsDTO(e, visit);
        let check = await Patient.checkPatientDiagnostics(e, visit);
        if (h.checkExistsNotEmpty(check, 'visit_id')) {
          const updated = await Common.update(singleObj, 'REGISTRATION.diagnostics', {
            visit_id: singleObj.visit_id,
            service_id: singleObj.service_id
          }, user);
        } else {
          const inserted = await Common.insert(singleObj, 'REGISTRATION.diagnostics', user);
        }
      }
    }
  } catch (e) {
    throw e;
  }
}

const saveAllergies = async (visit, allergies, user) => {
  try {
    for (const e of allergies) {
      if (h.checkExistsNotEmpty(e, 'allergyCode')) {
        if (e.defaultSelectedAllergyType === 'generic') {
          let subclass = await Patient.allergyClassSubClass(e);
          let singleObj = patientUtil._genericAllergiesDTO(e, visit, subclass);
          let check = await Patient.checkPatientGenericAllergies(singleObj);
          if (h.checkExistsNotEmpty(check, 'mrno')) {
            let search = {
              mrno: singleObj.mrno
            };
            if (h.checkExistsNotEmpty(singleObj, 'gen_code')) {
              search['gen_code'] = singleObj.gen_code;
            }
            if (h.checkExistsNotEmpty(singleObj, 'sub_class_code')) {
              search['sub_class_code'] = singleObj.sub_class_code;
              search['class_code'] = singleObj.class_code;
            }
            const updated = await Common.update(singleObj, 'PHARMACY_SHIFA.CLASS_ALERGY', search, user);
          } else {
            const inserted = await Common.insert(singleObj, 'PHARMACY_SHIFA.CLASS_ALERGY', user);
          }
        } else if (e.defaultSelectedAllergyType === 'brand') {
          let singleObj = patientUtil._brandAllergiesDTO(e, visit);
          let check = await Patient.checkPatientBrandAllergies(e, visit);
          if (h.checkExistsNotEmpty(check, 'mrno')) {
            const updated = await Common.update(singleObj, 'REGISTRATION.MOAR_DRUG_BRAND_ALLERGY', {
              medicine_code: singleObj.medicine_code,
              mr_no: singleObj.mr_no
            }, user);
          } else {
            const inserted = await Common.insert(singleObj, 'REGISTRATION.MOAR_DRUG_BRAND_ALLERGY', user);
          }
        }
      }
    }
  } catch (e) {
    throw e;
  }
}

const saveMedicines = async (visit, medicines, user) => {
  try {
    for (const e of medicines) {
      if (h.checkExistsNotEmpty(e, 'medicine_code')) {
        let singleObj = patientUtil._medicinesDTO(e, visit);
        let check = await Patient.checkPatientMedicines(e, visit);
        if (h.checkExistsNotEmpty(check, 'medicine_code')) {
          const updated = await Common.update(singleObj, 'REGISTRATION.medicine_prescription', {
            visit_id: singleObj.visit_id,
            medicine_code: singleObj.medicine_code,
            isactive: 'Y'
          }, user);
        } else {
          const inserted = await Common.insert(singleObj, 'REGISTRATION.medicine_prescription', user);
        }
      } else {
        let singleObj = patientUtil._medicinesDTO(e, visit);
        let check = await Patient.checkPatientNonFormularyMedicines(e, visit);
        if (h.checkExistsNotEmpty(check, 'medicine')) {
          const updated = await Common.update(singleObj, 'REGISTRATION.medicine_prescription', {
            visit_id: singleObj.visit_id,
            medicine: singleObj.medicine,
            isactive: 'Y'
          }, user);
        } else {
          const inserted = await Common.insert(singleObj, 'REGISTRATION.medicine_prescription', user);
        }
      }
    }
  } catch (e) {
    throw e;
  }
}



module.exports = PatientController;