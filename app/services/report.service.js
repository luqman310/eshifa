/**
 * @Name report.service.js
 *
 * @Description Report Serivce.
 *
 * @package
 * @subpackage
 * @author Suhaib <muhammad.suhaib@shifa.com.pk>
 * @Created on December 24, 2019
 */

// const Common = require("./../model/common.model");
const rp = require('request-promise-native');
const Patient = require('../model/patient.model');
const h = require("../utils/helper");

const ReportService = {};

ReportService.getPDF = async (p) => {
  try {
    // const { path, os_path, rep_name } = await Common.getReportParams(p.type);
    // console.log(path, os_path, rep_name);
  } catch (e) {
    throw e;
  }
};

ReportService.neurologyReport = async (p) => {
  const rdf = h.neurologyReportURI(p.test_name, p.test_code);
  let obj;
  if (rdf != '') {
    try {
      const report = await getDownloadReport(rdf);
      obj = h.resultObject(report, true, 200);
      if (!report) {
        obj = h.resultObject([], false, 400, 'Neurology Report Download Exception');
      }
    } catch (e) {
      obj = h.resultObject([], false, 400, 'Neurology Report Exception');
      throw e;
    }
  } else {
    obj = h.resultObject([], false, 400, 'Please provide Test name & code');
  }
  return obj;
};

ReportService.cardiologyReport = async (p) => {
  const rdf = h.cardiologyReportURI(p.test_name, p.test_code, p.test_type, p.test_serviceid);
  // let obj = h.resultObject(rdf, true, 200);
  let obj;
  if (rdf != '') {
    try {
      const report = await getDownloadReport(rdf);
      obj = h.resultObject(report, true, 200);
      if (!report) {
        obj = h.resultObject([], false, 400, 'Cardiology Report Download Exception');
      }
    } catch (e) {
      obj = h.resultObject([], false, 400, 'Cardiology Report Exception');
      throw e;
    }
  } else {
    obj = h.resultObject([], false, 400, 'Please provide Test name & code');
  }
  return obj;
};

ReportService.genericReport = async (p, report = 'Neurology') => {
  let rdf = '';
  if (report === 'Neurology') {
    rdf = h.neurologyReportURI(p.test_name, p.test_code);
  } else if (report === 'Cardiology') {
    rdf = h.cardiologyReportURI(p.test_name, p.test_code, p.test_type, p.test_serviceid);
  } else if (report === 'Gastro') {
    rdf = h.gastroReportURI(p.test_mrno, p.test_code, p.test_labno);
  } else if (report === 'Radiology') {
    rdf = await Patient.radiologyReportURI(p);
  } else if (report === 'Lab') {
    rdf = await Patient.labReportURI(p);
  }
  // let obj = h.resultObject(rdf, true, 200);
  let obj;
  if (rdf != '') {
    try {
      const report = await getDownloadReport(rdf);
      obj = h.resultObject(report, true, 200);
      if (!report) {
        obj = h.resultObject([], false, 400, `${report} Report Download Exception`);
      }
    } catch (e) {
      obj = h.resultObject([], false, 400, `${report} Report Exception`);
      throw e;
    }
  } else {
    obj = h.resultObject([], false, 400, 'Please provide Test name, code, service id, type)');
  }
  return obj;
};

const getDownloadReport = async (url) => {
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
    // result = h.base64Encode(response);
    result = response;
  } catch (e) {
    throw e;
  } finally {
    return result;
  }

  // return filename;
}

// getReportParam = (type) => {
//   try {
//     const result = await Common.getReportParams(type);
//     console.log(result);
//   } catch (e) {
//     throw e;
//   }
// }

module.exports = ReportService;