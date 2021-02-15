const parser = require('ua-parser-js');
const _ = require('underscore');
const moment = require('moment');
const fs = require('fs');
const mime = require('mime');
let crypto = require("crypto");
let helper = {};

helper = _;

helper.log = (...theArgs) => {
  console.log(...theArgs);
};

helper.error = (...theArgs) => {
  console.error(...theArgs);
};

helper.getUserAgent = (req, iduser, action, pidsession = undefined) => {
  var ua = parser(req.get('User-Agent'));
  const obj = {
    ip: req.ip.split(',')[0].split(':').slice(-1).pop(),
    useragent: ua.ua,
    browser: ua.browser.name,
    version: ua.browser.version,
    platform: ua.os.name,
    os: Object.values(ua.os).join(' '),
    iduser: iduser,
    action: action,
    pidsession: pidsession
  };
  return obj;
}

helper.checkNotEmpty = (o, f) => {
  if (helper.exists(o) && o != '') {
    return true;
  }
  return false;
};

helper.checkExistsNotEmpty = (o, f) => {
  if (helper.exists(o) && _.has(o, f) && o[f] != '') {
    return true;
  }
  return false;
};

helper.checkExistsNotEmptyGreaterZero = (o, f) => {
  if (helper.exists(o) && _.has(o, f) && o[f] > 0) {
    return true;
  }
  return false;
};

helper.exists = (o) => {
  if (typeof o !== 'undefined' && o !== 'undefined' && o !== undefined && o !== null && o !== 'null') {
    return true;
  }
  return false;
};

helper.notExists = (o) => {
  return !helper.exists(o);
};

helper.getProps = (o) => {
  let obj = {};
  if (!_.isEmpty(o.params)) {
    obj = o.params;
  } else if (!_.isEmpty(o.body)) {
    obj = o.body;
  } else if (!_.isEmpty(o.query)) {
    obj = o.query;
  }
  return obj;
};

helper.getProps2 = (o) => {
  let obj = {};
  if (!_.isEmpty(o.params)) {
    obj = Object.assign(obj, o.params);
  }
  if (!_.isEmpty(o.body)) {
    obj = Object.assign(obj, o.body);
  }
  if (!_.isEmpty(o.query)) {
    obj = Object.assign(obj, o.query);
  }
  return obj;
};

helper.getIP = (o) => o.ip.split(',')[0].split(':').slice(-1).pop();

helper.getUserEmail = (o) => helper.checkExistsNotEmpty(o, 'email') ? o.email : '-';

helper.appendUserDetails = (o, req) => {
  let obj = { ...o }
  obj.ip = helper.getIP(req);
  obj.userid = helper.getUserEmail(req.user);
  return obj;
}

helper.toNull = (v) => {
  return (v > 0) ? v : null;
}

helper.toZero = (v) => {
  return (v) ? v : 0;
}

helper.toEmptyString = (v) => {
  return (_.isNull(v) || _.isUndefined(v)) ? "" : v;
}

helper.getQuarters = () => {
  let quarters = [{
    'quarter': '1',
    'sname': 'Q1',
    'lname': 'Quarter 1',
    'months': '1,2,3',
    'pmonths': '01,02,03'
  }, {
    'quarter': '2',
    'sname': 'Q2',
    'lname': 'Quarter 2',
    'months': '4,5,6',
    'pmonths': '04,05,06'
  }, {
    'quarter': '3',
    'sname': 'Q3',
    'lname': 'Quarter 3',
    'months': '7,8,9',
    'pmonths': '07,08,09'
  }, {
    'quarter': '4',
    'sname': 'Q4',
    'lname': 'Quarter 4',
    'months': '10,11,12',
    'pmonths': '10,11,12'
  }];
  return quarters;
}

helper.getMonths = () => {
  let months = [{
    'sname': 'Jan',
    'lname': 'January',
    'month': '1',
    'pmonth': '01'
  }, {
    'sname': 'Feb',
    'lname': 'February',
    'month': '2',
    'pmonth': '02'
  }, {
    'sname': 'Mar',
    'lname': 'March',
    'month': '3',
    'pmonth': '03'
  }, {
    'sname': 'Apr',
    'lname': 'April',
    'month': '4',
    'pmonth': '04'
  }, {
    'sname': 'May',
    'lname': 'May',
    'month': '5',
    'pmonth': '05'
  }, {
    'sname': 'Jun',
    'lname': 'June',
    'month': '6',
    'pmonth': '06'
  }, {
    'sname': 'Jul',
    'lname': 'July',
    'month': '7',
    'pmonth': '07'
  }, {
    'sname': 'Aug',
    'lname': 'August',
    'month': '8',
    'pmonth': '08'
  }, {
    'sname': 'Sep',
    'lname': 'September',
    'month': '9',
    'pmonth': '09'
  }, {
    'sname': 'Oct',
    'lname': 'October',
    'month': '10',
    'pmonth': '10'
  }, {
    'sname': 'Nov',
    'lname': 'November',
    'month': '11',
    'pmonth': '11'
  }, {
    'sname': 'Dec',
    'lname': 'December',
    'month': '12',
    'pmonth': '12'
  }];
  return months;
}

helper.getMQ = () => {
  let mq = {
    months: helper.getMonths(),
    quarters: helper.getQuarters(),
  }
  return mq;
}

helper.randomString = (len) => {
  return helper.shuffle(crypto.randomBytes(len).toString('hex').split('').map(function (c, i) {
    return i & 2 ? c.toUpperCase() : c.toLowerCase();
  })).join('');
}

helper.randomString2 = (len) => {
  const c = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@-_~^&()';
  const s = [...Array(len)].map(_ => c[~~(Math.random() * c.length)]).join('');
  return s
}

helper.last5Years = (t = {}) => {
  var today = new Date();
  if (!helper.isEmpty(t)) {
    today = new Date(t);
  }
  c = today.getFullYear();
  var last5Years = new Date(today.setFullYear(today.getFullYear() - 4)).getFullYear();
  years = [];
  if (last5Years < 2018) {
    last5Years = 2018;
  }
  for (var i = last5Years; i <= c; i++) {
    years.push(i);
  }
  return years;
}

helper.cfv = params => {
  const columns = Object.keys(params);
  // const filters = columns.map(function (o, i) {
  //     return "$" + (i + 1);
  // });
  const filters = columns.map((o, i) => "$" + (i + 1));
  const values = Object.values(params);
  return {
    c: `"${columns.join('", "')}"`,
    f: `${filters.join(', ')}`,
    v: values
  }
}

helper.getLocation = o => {
  if (helper.exists(o.iduc) && o.iduc > 0) {
    o.idlocation = o.iduc;
  } else if (helper.exists(o.iddistrict) && o.iddistrict > 0) {
    o.idlocation = o.iddistrict;
  } else if (helper.exists(o.idprovince) && o.idprovince > 0) {
    o.idlocation = o.idprovince;
  }
  delete o.idprovince;
  delete o.iddistrict;
  delete o.iduc;
  return o;
}

helper.getProvince = o => {
  if (!helper.isNull(o) && o > 0) {
    return o.toString().substring(0, 1);
  }
  return 0;
}

helper.getDistrict = o => {
  if (!helper.isNull(o) && o > 100) {
    return o.toString().substring(0, 3);
  }
  return 0;
}

helper.todayDateDBFormat = () => {
  return moment().format('DDMMYYYY');
}

helper.dateFormat = (date, format) => {
  return moment(date).format(format);
}

helper.toDate = (date) => {
  return moment(date);
}

helper.objectKeysToLowerCase = (input) => {
  if (typeof input !== 'object' || input === null) { if (input === null) { return "" } else { return input } }; // null
  if (Array.isArray(input)) return input.map(helper.objectKeysToLowerCase);
  return Object.keys(input).reduce((newObj, key) => {
    let val = input[key];
    let newVal = (typeof val !== 'object') || (Array.isArray(val)) || (Buffer.isBuffer(val)) ? val : helper.objectKeysToLowerCase(val);
    newObj[key.toLowerCase()] = newVal;
    return newObj;
  }, {});
}

helper.vitalMappingDefinition = () => {
  return [,
    { id: 1, name: 'bp_sys', alt_name: 'BP SYS' },
    { id: 2, name: 'bp_dia', alt_name: 'BP DIA' },
    { id: 3, name: 'weight', alt_name: 'Weight' },
    { id: 4, name: 'height', alt_name: 'Height' },
    { id: 5, name: 'temp', alt_name: 'Temprature' },
    { id: 6, name: 'rr', alt_name: 'RR' },
    { id: 7, name: 'pulse', alt_name: 'Pulse' },
    { id: 8, name: 'temp_loc', alt_name: 'Temp Loc' },
    { id: 9, name: 'spo2', alt_name: 'SPO2' },
    { id: 10, name: 'pain_scale', alt_name: 'Pain Scale' },
    { id: 11, name: 'glococheck', alt_name: 'Gloco Check' },
    { id: 12, name: 'lmp', alt_name: 'LMP' },
    { id: 13, name: 'head_circumf', alt_name: 'Head Circumference' },
    { id: 14, name: 'gcs', alt_name: 'GCS' },
    { id: 15, name: 'bsa', alt_name: 'BSA' },
    { id: 16, name: 'response', alt_name: 'Response' },
    { id: 17, name: 'fall_risk', alt_name: 'Fall Risk' },
    { id: 18, name: 'bmi', alt_name: 'BMI' },
    { id: 19, name: 'sup_oxygen', alt_name: 'Sup Oxygen' }
  ];
};

helper.resultObject = (data, status, statuCode, message = "", error = "") => {
  return {
    data: data,
    status: status,
    statusCode: statuCode,
    message: message,
    error: error,
  }
}

helper.base64Encode = (data) => {
  try {
    const base64data = Buffer.from(data, 'binary').toString('base64');
    const filemime = 'application/pdf';
    return `data:${filemime};base64,${base64data}`;
  } catch (error) {
    throw error;
  }
}

helper.base64EncodeFile = async (path) => {
  try {
    const base64data = await fs.promises.readFile(path, { encoding: 'base64' });
    const filemime = mime.getType(path);
    return `data:${filemime};base64,${base64data}`;
  } catch (error) {
    throw error;
  }
}

helper.pad = (pad, str, padLeft = true) => {
  if (typeof str === 'undefined')
    return pad;
  if (padLeft) {
    return (pad + str).slice(-pad.length);
  } else {
    return (str + pad).substring(0, pad.length);
  }
}

helper.neurologyReport = (test) => {
  const reports = {
    "repetitivenervestimulation": { name: "rpt_nerve_stimulation.rdf", param: '&P1=' },
    "brainstemauditory": { name: "brainstem_auditory.rdf", param: '&P1=' },
    "visualevokedpotential": { name: "rpt_evoked_potential_bill.rdf", param: '&P2=' },
    "eeg": { name: "rpt_neuro_eeg_report.rdf", param: '&P1=' },
    "nerveconductionstudies": { name: "neuro_ncs_report.rdf", param: '&n=' },
    "nerveconductionstudiesemg": { name: "neuro_ncs_report_emg.rdf", param: '&n=' },
  };
  return reports[test];
};

helper.neurologyReportURI = (name, code) => {
  const report_name = helper.neurologyReport(name.replace(/\s+/g, '').toLowerCase());
  let report_uri = '';
  if (helper.checkExistsNotEmpty(report_name, 'name')) {
    report_uri = process.env.DIAGNOSTIC_REPORT_SERVER_URL + "/sihapp/clinic/reports/" + report_name.name + process.env.REPORT_SERVER_AUTH + report_name.param + code;
  }
  return report_uri;
}

helper.cardiologyReportA = (code, serviceid, name) => {
  // subserviceid = serviceid.substring(4, 5);
  // replacedname = name.replace(/\s+/g, '$');
  if (_.contains(['00101', '0010', '00109', '0009', '000'], serviceid)) {
    return { name: "rep_ecg.rdf", param: `&P_CARD_ID=${code}` };
  } else if (_.contains(['00111'], serviceid)) {
    return { name: "rep_pft_bronchodilation.rdf", param: `&P_CARD_ID=${code}` };
  } else if (_.contains(['00112', '00078'], serviceid)) {
    return { name: "rep_pft.rdf", param: `&P_CARD_ID=${code}` };
  } else if (_.contains(['00115', '00116'], serviceid) && helper.checkNotEmpty(name)) {
    return { name: "rep_carotids_ultrasound.rdf", param: `&P_CARD_ID=${code}&P_TEST_NAME=CA${serviceid.substring(3, 5)}${name.replace(/\s+/g, '$')}` };
  } else if (_.contains(['00119'], serviceid) && helper.checkNotEmpty(name)) {
    return { name: "rep_ext_venous_ultrasound.rdf", param: `&P_CARD_ID=${code}&P_TEST_NAME=CA${name.replace(/\s+/g, '$')}(${serviceid.substring(3, 5)})` };
  } else if (_.contains(['00120'], serviceid) && helper.checkNotEmpty(name)) {
    return { name: "rep_ext_venous_ultrasound2.rdf", param: `&P_CARD_ID=${code}&P_TEST_NAME=CA${name.replace(/\s+/g, '$')}(${serviceid.substring(3, 5)})` };
  } else if (_.contains(['00118'], serviceid) && helper.checkNotEmpty(name)) {
    return { name: "rep_ext_arterial_ultrasound2.rdf", param: `&P_CARD_ID=${code}&P_TEST_NAME=CA${name.replace(/\s+/g, '$')}(${serviceid.substring(3, 5)})` };
  } else if (_.contains(['00117'], serviceid) && helper.checkNotEmpty(name)) {
    return { name: "rep_ext_arterial_ultrasound.rdf", param: `&P_CARD_ID=${code}&P_TEST_NAME=CA${name.replace(/\s+/g, '$')}(${serviceid.substring(3, 5)})` };
  } else if (_.contains(['00103', '00104', '00105', '00106', '00102', '00107', '00099', '00121', '00108', '07864', '00122'], serviceid) && helper.checkNotEmpty(name)) {
    return { name: "rep_echo.rdf", param: `&P_CARD_ID=${code}&P_TEST_NAME=CA${name.replace(/\s+/g, '$')}(${serviceid.substring(3, 5)})` };
  }
  return '';
};

helper.cardiologyReportB = (type, code) => {
  switch (type) {
    case 'A':
      return { name: "angio_rpt.rdf", param: `&ANG_ID=${code}` };
    case 'B':
    case 'C':
    case 'D':
    case 'E':
    case 'F':
    case 'G':
    case 'H':
    case 'I':
      return { name: `angio_graphy_${type.toLowerCase()}.rdf`, param: `&ANG_ID=${code}` };
    default:
      return '';
  }
};

helper.cardiologyReportURI = (name, code, type, serviceid) => {
  const report_name = !(type) ? helper.cardiologyReportA(code, serviceid, name) : helper.cardiologyReportB(type.toUpperCase(), code);
  let report_uri = '';
  if (helper.checkExistsNotEmpty(report_name, 'name')) {
    report_uri = process.env.DIAGNOSTIC_REPORT_SERVER_URL + "/sihapp/cardiology/reports/" + report_name.name + process.env.REPORT_SERVER_AUTH + report_name.param;
  }
  return report_uri;
}

helper.gastroReport = (mrno, code, labno) => {
  if (_.contains(['00741', '00738', '00763', '00753', '00755'], code)) {
    return { name: "endoscopy_upper_report.rdf", param: `&scopy_id=${labno}&mrno=${mrno}` };
  } else if (_.contains(['00724', '00747'], code)) {
    return { name: "endoscopy_lower_report.rdf", param: `&scopy_id=${labno}&mrno=${mrno}` };
  } else if (_.contains(['00757', '00765', '00519', '05284'], code)) {
    return { name: "endoscopy_ercp_report.rdf", param: `&scopy_id=${labno}&mrno=${mrno}` };
  } else if (_.contains(['00754', '00819'], code)) {
    return { name: "bronchoscopy.rdf", param: `&scopy_id=${labno}&mrno=${mrno}` };
  }
  return '';
};

helper.gastroReportURI = (mrno, code, labno) => {
  const report_name = helper.gastroReport(mrno, code, labno);
  let report_uri = '';
  if (helper.checkExistsNotEmpty(report_name, 'name')) {
    report_uri = process.env.DIAGNOSTIC_REPORT_SERVER_URL + "/sihapp/endoscopy/reports/" + report_name.name + process.env.REPORT_SERVER_AUTH + report_name.param;
  }
  return report_uri;
}
module.exports = helper;