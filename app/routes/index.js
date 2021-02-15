const router = require('express').Router();
const cms = require('./cms');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const US = require('./../controller/user.controller');
const CM = require('./../controller/common.controller');
const DC = require('./../controller/doctor.controller');
const PT = require('./../controller/patient.controller');
const ST = require('./../controller/setting.controller');
const Auth = require('./../middleware/user.auth');
const UserMW = require('./../middleware/user.exists');
const EMRRules = require('./../validation/emr.rules');
const Validation = require('./../middleware/validation');
const h = require("./../utils/helper");
const ver = '/api';

// adding Helmet to enhance your API's security
router.use(helmet());
// using bodyParser to parse JSON bodies into JS objects
router.use(bodyParser.json({
  limit: '50mb'
}));
// for parsing application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}));
// enabling CORS for all requests
router.use(cors());
// adding morgan to log HTTP requests
router.use(morgan(':remote-addr - [:date[web]] ":method :url HTTP/:http-version" :status Response Time::response-time ms'));
router.get('/', (req, res) => {
  res.send("Welcome: Express JS...");
});
router.get(ver, (req, res) => {
  res.send("Welcome: Express JS API v1 is Wroking...");
});
router.get(ver + '/test', CM.getVisitID);

// router.get(ver + '/test', US.getUsers);
router.post(ver + '/login', US.login);
router.post(ver + '/ywppnvhh', US.log);
router.post(ver + '/forgot-password', US.forgotPassword);

// check user login
router.use('/cms', Auth.check, cms);
router.use(Auth.check);
router.use(fileUpload());

router.get(ver + '/check-auth', US.AuthCheck);
router.get(ver + '/logout', US.logout);

//////////////////////  Users //////////////////////////////////////////////////
router.post(ver + '/users', US.getUsers);
router.post(ver + '/users/add', US.addUser);
router.put(ver + '/users/change-password', US.changePassword);
// router.put(ver + '/users/:id([0-9])', US.updateUser);
// router.delete(ver + '/users/:id([0-9])', US.deleteUser);
// router.get(ver + '/users/:id([0-9])', US.getUserByID);
// router.get(ver + '/users/:uuid([A-Fa-f0-9\-]{36})', US.getUserByID);

//////////////////////  Common /////////////////////////////////////////////////
router.get(ver + '/medicines/all', CM.getAllMedicines);
router.get(ver + '/vitals/all', CM.getVitals);
router.get(ver + '/visits/vitals', CM.getVisitVitals);
router.get(ver + '/doctors/all', CM.getDoctors);
router.get(ver + '/doctors/vitals', CM.getDoctorVitals);
router.post(ver + '/token', CM.getToken);
router.get(ver + '/get_visitid', CM.getVisitID);

//////////////////////  Patients ///////////////////////////////////////////////
router.get(ver + '/patients/appointed', CM.getAppointedPatients);
router.get(ver + '/patients/appointed-legends', CM.getAppointedPatientLegends);
router.get(ver + '/patients/demographics', CM.getPatientDemographics);
router.post(ver + '/patients/create-visit', UserMW.patientExists, UserMW.doctorExists, CM.createVisit);
router.post(ver + '/patients/vitals', CM.saveVitals);
router.get(ver + '/patient/vitals/history', CM.getPatientVitalHistory);


router.post(ver + '/patient/allergies/nkda', UserMW.patientExists, PT.checkPatientNKDA);
router.get(ver + '/patient/visit/details', UserMW.isValidVisitID, PT.getPatientVisitDetails);
router.post(ver + '/patient/visit/save', UserMW.isValidVisitID, PT.savePatientVisitDetails);
router.get(ver + '/patient/diagnosis/history', UserMW.patientExists, PT.getDiagnosisHistory);
router.get(ver + '/patient/medicines/history', UserMW.patientExists, PT.getMedicinesHistory);
router.get(ver + '/patient/diagnostics/results', UserMW.patientExists, PT.getPatientDiagnosticResults);


router.delete(ver + '/patient/diagnosis', UserMW.isValidVisitID, PT.deletePatientVisitDiagnosis);
router.delete(ver + '/patient/diagnostics', UserMW.isValidVisitID, PT.deletePatientVisitDiagnostics);
router.delete(ver + '/patient/medicines', UserMW.isValidVisitID, PT.deletePatientVisitMedicines);
router.delete(ver + '/patient/allergies', UserMW.patientExists, PT.deletePatientVisitAllergies);

//////////////////////  Nurse //////////////////////////////////////////////////
router.post(ver + '/nurse/presenting-complaint-template', CM.savePresentingComplaintTemplate);
router.get(ver + '/nurse/presenting-complaint-template', CM.getPresentingComplaintTemplate);

//////////////////////  Diagnosis //////////////////////////////////////////////
router.get(ver + '/diagnosis', DC.getDiagnosis);
router.get(ver + '/diagnosis/common', DC.getCommonDiagnosis);
router.get(ver + '/diagnosis/templates', DC.getDiagnosisTemplate);
router.get(ver + '/diagnosis/template', DC.getDiagnosisByTemplate);
router.get(ver + '/diagnosis/search/:txt', DC.getDiagnosis);
router.post(ver + '/diagnosis/template', DC.saveDiagnosisTemplate);

//////////////////////  Diagnostics ////////////////////////////////////////////
router.get(ver + '/diagnostics', DC.getDiagnostics);
router.get(ver + '/diagnostics/common', DC.getCommonDiagnostics);
router.get(ver + '/diagnostics/templates', UserMW.doctorExists, DC.getDiagnosticsTemplate);
router.get(ver + '/diagnostics/template', DC.getDiagnosticsByTemplate);
router.get(ver + '/diagnostics/search/:txt', DC.getDiagnostics);
router.post(ver + '/diagnostics/template', UserMW.doctorExists, DC.saveDiagnosticsTemplate);

//////////////////////  Medicines //////////////////////////////////////////////
router.get(ver + '/medicines', DC.getMedicine);
router.get(ver + '/medicines/common', UserMW.doctorExists, DC.getCommonMedicine);
router.get(ver + '/medicines/templates', UserMW.doctorExists, DC.getMedicineTemplate);
router.get(ver + '/medicines/template', DC.getMedicineByTemplate);
router.get(ver + '/medicines/search/:txt', DC.getMedicine);
router.post(ver + '/medicines/template', UserMW.doctorExists, DC.saveMedicineTemplate);

router.get(ver + '/medicines/dosages', DC.getMedicineDosages);
router.get(ver + '/medicines/units', DC.getMedicineUnits);
router.get(ver + '/medicines/routes', DC.getMedicineRoutes);
router.get(ver + '/medicines/routes/:code', DC.getMedicineRoutes);
router.get(ver + '/medicines/frequencies', DC.getMedicineFrequencies);
router.get(ver + '/medicines/frequencies/:code', DC.getMedicineFrequencies);
router.get(ver + '/medicines/forms', DC.getMedicineForms);

/////////////////////////  Allergies ///////////////////////////////////////////
router.get(ver + '/allergies/brand', DC.getBrandAllergies);
router.get(ver + '/allergies/generic', DC.getGenericAllergies);
router.get(ver + '/allergies/templates', UserMW.doctorExists, DC.getAllergyTemplates);
router.get(ver + '/allergies/template', DC.getAllergiesByTemplate);
router.get(ver + '/allergies/search/:txt', DC.getAllergies);
router.post(ver + '/allergies/template', UserMW.doctorExists, DC.saveAllergiesTemplate);

//////////////////////  Presenting Complaint ///////////////////////////////////
router.get(ver + '/presenting-complaints/templates', DC.getPresentingComplaintTemplate);
router.get(ver + '/presenting-complaints/template', DC.getPresentingComplaintByTemplate);
router.post(ver + '/presenting-complaints/template', DC.savePresentingComplaintTemplate);

//////////////////////  Clinical Detail ////////////////////////////////////////
router.get(ver + '/clinical-details/templates', UserMW.doctorExists, DC.getClinicalDetailTemplate);
router.get(ver + '/clinical-details/template', DC.getClinicalDetailByTemplate);
router.post(ver + '/clinical-details/template', UserMW.doctorExists, DC.saveClinicalDetailTemplate);

//////////////////////  Previous Visits ////////////////////////////////////////
router.get(ver + '/previous-visits/opd', UserMW.patientExists, PT.getOPDPreviousVisits);

//////////////////////  Alert //////////////////////////////////////////////////
// router.get(ver + '/alert', DC.getAlert);
// router.get(ver + '/alert/templates', DC.getAlertTemplate);
// router.get(ver + '/alert/template', DC.getAlertByTemplate);
// router.post(ver + '/alert/template', DC.saveAlertTemplate);

//////////////////////  Appointments ///////////////////////////////////////////
router.get(ver + '/appointments', UserMW.doctorExists, DC.getAppointments);
router.get(ver + '/appointment-legends', UserMW.doctorExists, DC.getAppointmentLegends);
router.delete(ver + '/appointments/deleteVisit', UserMW.isValidVisitID, UserMW.hasConfirmVisitToday, PT.deleteVisit);

//////////////////////  Vitals /////////////////////////////////////////////////
router.get(ver + '/patient/visit/vital_definitions', UserMW.isValidVisitID, PT.getPatientVisitVitalsAndDefinitions);
router.get(ver + '/visits/vitals/previous', UserMW.isValidVisitID, PT.getPreviousVisitVitals);

//////////////////////  Reports ////////////////////////////////////////////////
router.get(ver + '/patient/visit/report', UserMW.isValidVisitID, PT.patientReport);
router.get(ver + '/patient/visit/report-medical-record', UserMW.isValidVisitID, PT.patientReportMedicalRecord);
router.get(ver + '/patient/visit/report-disgnostic', PT.patientDiagnosticReport);

router.get(ver + '/patient/neurology/report', PT.getPatientNeurologyReport);
router.get(ver + '/patient/cardiology/report', PT.getPatientCardiologyReport);
router.get(ver + '/patient/radiology/report', PT.getPatientRadiologyReport);
router.get(ver + '/patient/lab/report', PT.getPatientLabReport);
router.get(ver + '/patient/gastro/report', PT.getPatientGastroReport);

//////////////////////  Share //////////////////////////////////////////////////
router.post(ver + '/patient/share', UserMW.isValidVisitID, PT.sharePatientReport);
router.post(ver + '/patient/send-invite', UserMW.isValidVisitID, PT.shareZoomInvite);

//////////////////////  Settings ///////////////////////////////////////////////
router.get(ver + '/settings/external-links', ST.externalLinks);
router.get(ver + '/settings/prescription', ST.getPrescriptionSettings);
router.post(ver + '/settings/prescription', UserMW.doctorExists, EMRRules.rule('savePrescriptionSettings'), Validation.validate, ST.savePrescriptionSettings);




router.get(ver + '/settings/picture', ST.profilePicture);



module.exports = router;