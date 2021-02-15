/**
 * @Name doctor.controller.js
 *
 * @Description Doctor Operations
 *
 * @package
 * @subpackage
 * @author Suhaib <muhammad.suhaib@shifa.com.pk>
 * @Created on Jul 17, 2020 2021
 */

const Common = require("./../model/common.model");
const Doctor = require("./../model/doctor.model");
const h = require("./../utils/helper");
const utility = require("./../utils/utility");

const DoctorController = {};


/**************************************** Diagnosis ****************************************/

DoctorController.getDiagnosis = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Diagnosis List",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    let result = await Doctor.getDiagnosis(filter);
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

DoctorController.getCommonDiagnosis = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Common Diagnosis List",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    const doctor = await utility._doctorExists(filter.doctor_id);
    // Doctor Exists
    if (h.checkExistsNotEmpty(doctor, 'doctor_id')) {
      filter.spec_id = doctor.sp_id;
      let result = await Doctor.getCommonDiagnosis(filter);
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
    returnObj = {
      result: false,
      message: message
    };
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

DoctorController.getDiagnosisTemplate = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Diagnosis Template List",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    const doctor = await utility._doctorExists(filter.doctor_id);
    // Doctor Exists
    if (h.checkExistsNotEmpty(doctor, 'doctor_id')) {
      filter.spec_id = doctor.sp_id;
      let result = await Doctor.getDiagnosisTemplate(filter);
      for (let r of result) {
        r.diagnosis = await Doctor.getDiagnosisByTemplate(r);
      }
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
    returnObj = {
      result: false,
      message: message
    };
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

DoctorController.getDiagnosisByTemplate = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Diagnosis List",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    if (h.checkExistsNotEmptyGreaterZero(filter, 'id')) {
      let result = await Doctor.getDiagnosisByTemplate(filter);
      code = 200;
      returnObj = result;
    } else {
      message = 'Diagnosis Template ID not Provided';
      code = 404;
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

DoctorController.saveDiagnosisTemplate = async (req, res) => {
  let code = 500,
    message = "Error! Saving Diagnosis Template",
    returnObj = {};
  try {
    let postData = h.getProps2(req);
    const doctor = await utility._doctorExists(postData.doctor_id);
    // Doctor Exists
    if (h.checkExistsNotEmpty(doctor, 'doctor_id')) {
      let template = utility._diagnosisTemplateHeaderObject(postData);
      const inserted_template = await Common.insert(template, 'REGISTRATION.DIAGNOSIS_TEMPLATE', req.user);
      if (h.checkExistsNotEmpty(inserted_template[0], 'id')) {
        let diagnosis = postData.diagnosis;
        if (typeof postData.diagnosis == 'string') {
          diagnosis = JSON.parse(postData.diagnosis);
        }
        for (const e of diagnosis) {
          if (h.checkExistsNotEmpty(e, 'code')) {
            let singleObj = utility._diagnosisTemplateLinelistObject(e, inserted_template[0].id);
            const inserted = await Common.insert(singleObj, 'REGISTRATION.DIAGNOSIS_TEMPLATE_LINELIST', req.user);
          }
        }
        message = 'Diagnosis Template Added Successfully';
        const returnData = true;
        code = 200;
        returnObj = {
          result: returnData,
          message: message
        };
      } else {
        message = 'Diagnosis Template Saving Error';
        code = 404;
        returnObj = {
          result: false,
          message: message
        };
      }
    } else {
      code = 404;
      message = 'Doctor not Found';
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

DoctorController.getDiagnostics = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Diagnostics List",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    let result = await Doctor.getDiagnostics(filter);
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

DoctorController.getCommonDiagnostics = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Common Diagnostics List",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    const doctor = await utility._doctorExists(filter.doctor_id);
    // Doctor Exists
    if (h.checkExistsNotEmpty(doctor, 'doctor_id')) {
      filter.spec_id = doctor.sp_id;
      let result = await Doctor.getCommonDiagnostics(filter);
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
    returnObj = {
      result: false,
      message: message
    };
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

DoctorController.getDiagnosticsTemplate = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Diagnostics Template List",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    filter.spec_id = req.doctor.sp_id;
    let result = await Doctor.getDiagnosticsTemplate(filter);
    for (const r of result) {
      r.diagnostics = await Doctor.getDiagnosticsByTemplate(r);
    }
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

DoctorController.getDiagnosticsByTemplate = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Diagnostics List",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    if (h.checkExistsNotEmptyGreaterZero(filter, 'id')) {
      let result = await Doctor.getDiagnosticsByTemplate(filter);
      code = 200;
      returnObj = result;
    } else {
      message = 'Diagnostics Template ID not Provided';
      code = 404;
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

DoctorController.saveDiagnosticsTemplate = async (req, res) => {
  let code = 500,
    message = "Error! Saving Diagnostics Template",
    returnObj = {};
  try {
    let postData = h.getProps2(req);
    let template = utility._diagnosisTemplateHeaderObject(postData);
    const inserted_template = await Common.insert(template, 'REGISTRATION.DIAGNOSTICS_TEMPLATE', req.user);
    if (h.checkExistsNotEmpty(inserted_template[0], 'id')) {
      let diagnostics = postData.diagnostics;
      if (typeof postData.diagnostics == 'string') {
        diagnostics = JSON.parse(postData.diagnostics);
      }
      for (const e of diagnostics) {
        if (h.checkExistsNotEmpty(e, 'service_id')) {
          let singleObj = utility._diagnosticsTemplateLinelistObject(e, inserted_template[0].id);
          const inserted = await Common.insert(singleObj, 'REGISTRATION.DIAGNOSTICS_TEMPLATE_LINELIST', req.user);
        }
      }
      message = 'Diagnostics Template Added Successfully';
      const returnData = true;
      code = 200;
      returnObj = {
        result: returnData,
        message: message
      };
    } else {
      message = 'Diagnostics Template Saving Error';
      code = 404;
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



/**************************************** Presenting Complaint ******************************/

DoctorController.getPresentingComplaintTemplate = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Presenting Complaint Template List",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    const doctor = await utility._doctorExists(filter.doctor_id);
    // Doctor Exists
    if (h.checkExistsNotEmpty(doctor, 'doctor_id')) {
      filter.spec_id = doctor.sp_id;
      let result = await Doctor.getPresentingComplaintTemplate(filter);
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
    returnObj = {
      result: false,
      message: message
    };
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

DoctorController.getPresentingComplaintByTemplate = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Presenting Complaint List",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    if (h.checkExistsNotEmptyGreaterZero(filter, 'id')) {
      let result = await Doctor.getPresentingComplaintByTemplate(filter);
      code = 200;
      returnObj = result;
    } else {
      message = 'Presenting Complaint Template ID not Provided';
      code = 404;
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

DoctorController.savePresentingComplaintTemplate = async (req, res) => {
  let code = 500,
    message = "Error! Saving Presenting Complaint Template",
    returnObj = {};
  try {
    let postData = h.getProps2(req);
    const doctor = await utility._doctorExists(postData.doctor_id);
    // Doctor Exists
    if (h.checkExistsNotEmpty(doctor, 'doctor_id')) {
      let template = utility._presentingComplaintTemplateObject(postData);
      const inserted_template = await Common.insert(template, 'REGISTRATION.PRESENTING_COMPLAINT_TEMPLATE', req.user);
      if (h.checkExistsNotEmpty(inserted_template[0], 'id')) {
        message = 'Presenting Complaint Template Added Successfully';
        const returnData = true;
        code = 200;
        returnObj = {
          result: returnData,
          message: message
        };
      } else {
        message = 'Presenting Complaint Template Saving Error';
        code = 404;
        returnObj = {
          result: false,
          message: message
        };
      }
    } else {
      code = 404;
      message = 'Doctor not Found';
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



/**************************************** Presenting Complaint ******************************/

DoctorController.getClinicalDetailTemplate = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Clinical Detail Template List",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    filter.spec_id = req.doctor.sp_id;
    let result = await Doctor.getClinicalDetailTemplate(filter);
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

DoctorController.getClinicalDetailByTemplate = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Clinical Detail List",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    if (h.checkExistsNotEmptyGreaterZero(filter, 'id')) {
      let result = await Doctor.getClinicalDetailByTemplate(filter);
      code = 200;
      returnObj = result;
    } else {
      message = 'Clinical Detail Template ID not Provided';
      code = 404;
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

DoctorController.saveClinicalDetailTemplate = async (req, res) => {
  let code = 500,
    message = "Error! Saving Clinical Detail Template",
    returnObj = {};
  try {
    let postData = h.getProps2(req);
    let template = utility._clinicalDetailTemplateObject(postData);
    const inserted_template = await Common.insert(template, 'REGISTRATION.CLINICAL_DETAIL_TEMPLATE', req.user);
    if (h.checkExistsNotEmpty(inserted_template[0], 'id')) {
      message = 'Clinical Detail Template Added Successfully';
      const returnData = true;
      code = 200;
      returnObj = {
        result: returnData,
        message: message
      };
    } else {
      message = 'Clinical Detail Template Saving Error';
      code = 404;
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


/**************************************** Appointments *************************************/


DoctorController.getAppointments = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Appointments",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    let result = await Doctor.getAppointments(filter);
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

DoctorController.getAppointmentLegends = async (req, res) => {
  try {
    let filter = h.getProps2(req);
    let result = await Doctor.getAppointmentLegends(filter);
    res.status(200).send(result);
  } catch (e) {
    h.error(e);
    res.status(500).send({
      message: 'Error! Fetching data.'
    });
  }
};


/**************************************** Medicine *****************************************/

DoctorController.getMedicine = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Medicine List",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    let result = await Doctor.getMedicine(filter);
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

DoctorController.getCommonMedicine = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Common Medicine List",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    filter.spec_id = req.doctor.sp_id;
    let result = await Doctor.getCommonMedicine(filter);
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

DoctorController.getMedicineTemplate = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Medicine Template List",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    filter.spec_id = req.doctor.sp_id;
    let result = await Doctor.getMedicineTemplate(filter);
    for (const r of result) {
      r.medicines = await Doctor.getMedicineByTemplate(r);
    }
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

DoctorController.getMedicineByTemplate = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Medicine List",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    if (h.checkExistsNotEmptyGreaterZero(filter, 'id')) {
      let result = await Doctor.getMedicineByTemplate(filter);
      code = 200;
      returnObj = result;
    } else {
      message = 'Medicine Template ID not Provided';
      code = 404;
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

DoctorController.saveMedicineTemplate = async (req, res) => {
  let code = 500,
    message = "Error! Saving Medicine Template",
    returnObj = {};
  try {
    let postData = h.getProps2(req);
    let template = utility._diagnosisTemplateHeaderObject(postData);
    const inserted_template = await Common.insert(template, 'REGISTRATION.MEDICINES_TEMPLATE', req.user);
    if (h.checkExistsNotEmpty(inserted_template[0], 'id')) {
      let medicines = postData.medicines;
      if (typeof postData.medicines == 'string') {
        medicines = JSON.parse(postData.medicines);
      }
      for (const e of medicines) {
        if (h.checkExistsNotEmpty(e, 'code')) {
          let singleObj = utility._medicinesTemplateLinelistObject(e, inserted_template[0].id);
          const inserted = await Common.insert(singleObj, 'REGISTRATION.MEDICINES_TEMPLATE_LINELIST', req.user);
        }
      }
      message = 'Medicine Template Added Successfully';
      const returnData = true;
      code = 200;
      returnObj = {
        result: returnData,
        message: message
      };
    } else {
      message = 'Medicine Template Saving Error';
      code = 404;
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

DoctorController.getMedicineRoutes = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Medicine Routes",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    let result = await Doctor.getMedicineRoutes(filter);
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

DoctorController.getMedicineFrequencies = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Medicine Frequencies",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    let result = await Doctor.getMedicineFrequencies(filter);
    if (result.length == 0) {
      result = await Doctor.getMedicineFrequenciesAll(filter);
    }
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

DoctorController.getMedicineUnits = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Medicine Units",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    let result = await Doctor.getMedicineUnits(filter);
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

DoctorController.getMedicineDosages = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Medicine Units",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    let result = ['TAB', 'TSF', 'CAP', 'PUFFS', 'DROPS', 'SACHET', 'MG']
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

DoctorController.getMedicineForms = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Medicine Units",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    let result = await Doctor.getMedicineForms(filter);
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



/**************************************** Allergy ******************************************/

DoctorController.getAllergies = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Allergies List",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    let result;
    if (h.checkExistsNotEmpty(filter, 'type') && filter.type === 'brand') {
      result = await Doctor.getBrandAllergies(filter);
    } else {
      result = await Doctor.getGenericAllergies(filter);
    }
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

DoctorController.getBrandAllergies = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Brand/Composite Allergies List",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    let result = await Doctor.getBrandAllergies(filter);
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

DoctorController.getGenericAllergies = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Generic Allergies List",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    let result = await Doctor.getGenericAllergies(filter);
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

DoctorController.getAllergyTemplates = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Allergies Template List",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    filter.spec_id = req.doctor.sp_id;
    let result = await Doctor.getAllergyTemplates(filter);
    for (const r of result) {
      r.allergies = await Doctor.getAllergiesByTemplate(r);
    }
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

DoctorController.getAllergiesByTemplate = async (req, res) => {
  let code = 500,
    message = "Error! Retrieving Allergies List",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    if (h.checkExistsNotEmptyGreaterZero(filter, 'id')) {
      let result = await Doctor.getAllergiesByTemplate(filter);
      code = 200;
      returnObj = result;
    } else {
      message = 'Allergy Template ID not Provided';
      code = 404;
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

DoctorController.saveAllergiesTemplate = async (req, res) => {
  let code = 500,
    message = "Error! Saving Allergies Template",
    returnObj = {};
  try {
    let postData = h.getProps2(req);
    let template = utility._diagnosisTemplateHeaderObject(postData);
    const inserted_template = await Common.insert(template, 'REGISTRATION.ALLERGIES_TEMPLATE', req.user);
    if (h.checkExistsNotEmpty(inserted_template[0], 'id')) {
      let allergies = postData.allergies;
      if (typeof postData.allergies == 'string') {
        allergies = JSON.parse(postData.allergies);
      }
      for (const e of allergies) {
        if (h.checkExistsNotEmpty(e, 'code')) {
          let singleObj = utility._allergiesTemplateLinelistObject(e, inserted_template[0].id);
          const inserted = await Common.insert(singleObj, 'REGISTRATION.ALLERGIES_TEMPLATE_LINELIST', req.user);
        }
      }
      message = 'Allergies Template Added Successfully';
      const returnData = true;
      code = 200;
      returnObj = {
        result: returnData,
        message: message
      };
    } else {
      message = 'Allergies Template Saving Error';
      code = 404;
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


module.exports = DoctorController;