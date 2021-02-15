const h = require("./helper");
const Common = require("./../model/common.model");

const utility = {};

utility._mapVitalHistory = async (doctor_id, vitalHistoryObject) => {
  try {
    const vitalDefnitions = h.vitalMappingDefinition();
    const doctor = await utility._doctorExists(doctor_id);
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

utility._doctorExists = async (doctor_id) => {
  try {
    let result = await Common.doctorExists(doctor_id);
    return result;
  } catch (e) {
    h.error(e);
    return {};
  }
};

utility._patientExists = async (mr_no) => {
  try {
    let result = await Common.patientExists(mr_no);
    return result;
  } catch (e) {
    h.error(e);
    return {};
  }
};

utility._hasVisitedToday = async (mrno, doctor_id) => {
  try {
    let result = await Common.hasVisitedToday(mrno, doctor_id);
    return result;
  } catch (e) {
    h.error(e);
    return {};
  }
};

utility._isValidVisitID = async (visit_id) => {
  try {
    let result = await Common.isValidVisitID(visit_id);
    return result;
  } catch (e) {
    h.error(e);
    return {};
  }
};

utility._hasConfirmVisitToday = async (visit_id) => {
  try {
    let result = await Common.hasConfirmVisitToday(visit_id);
    return result;
  } catch (e) {
    h.error(e);
    return {};
  }
};

utility._vitalsOfCurrentVisit = async (visit_id) => {
  try {
    let result = await Common.vitalsOfCurrentVisit(visit_id);
    return result;
  } catch (e) {
    h.error(e);
    return {};
  }
};

utility._constNotesObject = o => {
  let obj = {
    "mr#": o.mr_no,
    "doctor_id": o.doctor_id,
    "visit_type": o.visit_type,
    "visit_status": o.visit_status,
    "token#": o.token_no,
    "visit_id": o.visit_id
  }
  if (o.apt_no > 0) {
    obj["apt_time"] = o.apt_time;
  }
  return obj;
}

utility._returnCreateVisit = o => {
  let obj = {
    "mr_no": o['mr#'],
    "visit_id": o.visit_id,
    "token#": o['token#'],
  }
  return obj;
}

utility._visitVitalObject = (o, spec_id, visit_id) => {
  let obj = {
    "vital_id": o.vital_id,
    "result": o.result,
    "spec_id": spec_id,
    "visit_id": visit_id
  }
  return obj;
}

utility._diagnosisTemplateHeaderObject = (o) => {
  let obj = {
    "name": o.name,
    "doctor_id": o.doctor_id
  }
  return obj;
}

utility._diagnosisTemplateLinelistObject = (o, template_id) => {
  let obj = {
    "code": o.code,
    "template_id": template_id
  }
  return obj;
}

utility._diagnosticsTemplateLinelistObject = (o, template_id) => {
  let obj = {
    "service_id": o.service_id,
    "template_id": template_id
  }
  return obj;
}

utility._medicinesTemplateLinelistObject = (o, template_id) => {
  let obj = {
    "code": o.code,
    "template_id": template_id,
    "qty": o.qty,
    "dose_unit": o.dose_unit,
    "freq": o.freq,
    "length": o.length,
    "len_unit": o.len_unit,
    "meal_instructions": o.meal_instructions
  }
  return obj;
}

utility._allergiesTemplateLinelistObject = (o, template_id) => {
  let obj = {
    "code": o.code,
    "type": o.type,
    "template_id": template_id
  }
  return obj;
}

utility._presentingComplaintTemplateObject = (o) => {
  let obj = {
    "name": o.name,
    "doctor_id": o.doctor_id,
    "template": o.template
  }
  return obj;
}

utility._clinicalDetailTemplateObject = (o) => {
  let obj = {
    "name": o.name,
    "doctor_id": o.doctor_id,
    "template": o.template
  }
  return obj;
}

utility._prescriptionTemplateObject = (o, u) => {
  let obj = {
    "doctor_id": o.doctor_id,
    "prescription": "patient_visit_detail_card1_le_aa3.rdf",
    "pad_dtls": o.pad_dtls,
    "plan": o.plan,
    "clinical_dtls": o.clinical_dtls,
    "vitals": o.vitals,
    "investigation": o.investigation,
    "logo": o.logo,
    "diagnosis": o.diagnosis,
    "presenting_comp": o.presenting_comp,
    "pad_dtls_cp": o.pad_dtls_cp,
    "sig_dtls": o.sig_dtls,
    "is_footer_print": o.is_footer_print,
    "objective": o.objective,
    "imp": o.imp,
    "pad_dtls_web": o.pad_dtls,
  }
  return obj;
}

module.exports = utility;