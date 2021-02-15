const h = require("./helper");
const knex = require("./../config/knex");
const Common = require("../model/common.model");

const patient = {};

patient._formatAllergies = allergies => {
  if (allergies.length > 0) {
    const formattedAllergies = h.map(allergies, function (obj) {
      return {
        mrno: obj.mrno,
        allergyCode: obj.code,
        allergyDescription: obj.generic,
        defaultSelectedSeverityLevel: (obj.allergy_level == 'SEVERE') ? 'S' : (obj.allergy_level == 'MILD' ? 'M' : 'D'),
        defaultSelectedAllergyType: obj.type,
      };
    });
    return formattedAllergies;
  } else {
    return []
  }
}

patient._formatDiagnosis = diagnosis => {
  if (diagnosis.length > 0) {
    const formattedDiagnosis = h.map(diagnosis, function (obj) {
      return {
        code: obj.code,
        name: obj.name,
        ref_code: obj.ref_code
      };
    });
    return formattedDiagnosis;
  } else {
    return []
  }
}

patient._formatDiagnostics = diagnostics => {
  if (diagnostics.length > 0) {
    const formattedDiagnostics = h.map(diagnostics, function (obj) {
      return {
        service_description: obj.service_description,
        service_id: obj.service_id,
        clinicalHistory: obj.clinical_det,
        specialInstruction: obj.special_instruction,
        type: obj.site,
        fasting: obj.fasting,
        full_bladder: obj.full_bladder,
        stat: obj.periority,
        is_asked_rightleft: obj.is_asked_rightleft,
        prev_code: obj.prev_code,
      };
    });
    return formattedDiagnostics;
  } else {
    return []
  }
}

patient._formatMedicines = medicines => {
  if (medicines.length > 0) {
    const formattedMedicines = h.map(medicines, function (obj) {
      return {
        medication: obj.medication,
        generic: obj.generic,
        medicine_code: obj.medicine_code,
        route: obj.route,
        dosage: obj.dose_unit,
        dosage_name: obj.dosage_name,
        unit: obj.unit,
        form: obj.form,
        gen_code: obj.gen_code,
        enteredLength: obj.length,
        enteredremarks: obj.remarks,
        selectedLength: obj.len_unit,
        selectedfrequency: obj.freq,
        selectedfrequency_name: obj.freq_name,
        selectedmealinstruction: obj.meal_instructions,
        total_dosage: obj.qty,
        medication_frequency: obj.medication_frequency
      };
    });
    return formattedMedicines;
  } else {
    return []
  }
}

patient._formatMedicinesHistory = medicines => {
  if (medicines.length > 0) {
    const formattedMedicines = h.map(medicines, function (obj) {
      return {
        medication: obj.medication,
        generic: obj.generic,
        medicine_code: obj.medicine_code,
        route: obj.route,
        dosage: obj.dose_unit,
        dosage_name: obj.dosage_name,
        unit: obj.unit,
        form: obj.form,
        gen_code: obj.gen_code,
        enteredLength: obj.length,
        enteredremarks: obj.remarks,
        selectedLength: obj.len_unit,
        selectedfrequency: obj.freq,
        selectedfrequency_name: obj.freq_name,
        selectedmealinstruction: obj.meal_instructions,
        total_dosage: obj.qty,
        medication_frequency: obj.medication_frequency,
        visit_date: obj.visit_date,
        doctor_id: obj.doctor_id,
        doctor_name: obj.doctor_name
      };
    });
    return formattedMedicines;
  } else {
    return []
  }
}

patient._formatDoctors = medicines => {
  if (medicines.length > 0) {
    const formattedMedicines = h.map(medicines, function (obj) {
      return {
        doctor_id: obj.doctor_id,
        doctor_name: obj.doctor_name
      };
    });
    return formattedMedicines;
  } else {
    return []
  }
}

patient._formatInvite = invite => {
  if (h.checkExistsNotEmptyGreaterZero(invite, 'meetingid')) {
    return { status: true, start_url: invite.start_url }
  } else {
    return { status: false, start_url: "" }
  }
}

patient._formatVitals = (vitalsAndDefinitions, previousVitals) => {
  if (vitalsAndDefinitions.length > 0) {
    const vitals_definitions = h.map(vitalsAndDefinitions, function (obj) {
      return {
        vital_id: obj.vital_id,
        description: obj.label,
        unit: obj.unit,
        speciality_id: obj.speciality_id,
        value_type: obj.value_type,
        min_val: obj.min_val,
        max_val: obj.max_val,
        range_lower: obj.range_lower,
        range_upper: obj.range_upper,
        value_range: obj.value_range,
        mrno: obj.mrno,
        visit_id: obj.visit_id,
        result: obj.result,
      };
    });
    const formattedVitals = [];
    for (const v of vitals_definitions) {
      var p_vital = previousVitals.find(obj => {
        return obj.vital_id === v.vital_id
      })
      formattedVitals.push({
        ...v,
        previousVitalResult: h.checkExistsNotEmpty(p_vital, 'result') ? p_vital.result : ''
      })
    }
    return formattedVitals;
  } else {
    return []
  }
}

patient._formatPresentingComplaints = visit => {
  if (h.checkExistsNotEmpty(visit, 'pc')) {
    return visit.pc;
  } else {
    return ''
  }
}

patient._formatClinicalDetails = visit => {
  if (h.checkExistsNotEmpty(visit, 'clinical_details')) {
    return visit.clinical_details;
  } else {
    return ''
  }
}

patient._formatImpression = visit => {
  if (h.checkExistsNotEmpty(visit, 'impression')) {
    return visit.impression;
  } else {
    return ''
  }
}

patient._formatFollowUp = visit => {
  if (h.checkExistsNotEmpty(visit, 'followup_d')) {
    return visit.followup_d;
  } else {
    return ''
  }
}

patient._formatFollowUpSelect = visit => {
  if (h.checkExistsNotEmpty(visit, 'followup_unit')) {
    return visit.followup_unit;
  } else {
    return ''
  }
}

patient._formatVisitDate = visit => {
  if (h.checkExistsNotEmpty(visit, 'visit_date')) {
    return visit.visit_date;
  } else {
    return h.dateFormat(new Date(), 'YYYY-MM-DD HH:mm:ss')
  }
}

patient._formatHomeServices = visit => {
  if (h.checkExistsNotEmptyGreaterZero(visit, 'home_services')) {
    return 1;
  } else {
    return 0;
  }
}

patient._formatManagementPlan = visit => {
  if (h.checkExistsNotEmpty(visit, 'management_plan')) {
    return visit.management_plan;
  } else {
    return ''
  }
}

patient._formatPhysicalExamination = visit => {
  if (h.checkExistsNotEmpty(visit, 'physical_examination')) {
    return visit.physical_examination;
  } else {
    return ''
  }
}

patient._formatOtherInstruction = visit => {
  if (h.checkExistsNotEmpty(visit, 'other_instruction')) {
    return visit.other_instruction;
  } else {
    return ''
  }
}

patient._constNotesDTO = (d) => {
  let obj = {
    "pc": d.presentingComplaints,
    "impression": d.impression,
    "plan": d.managementPlan,
    "objective": d.physicalExamination,
    "note": d.clinicalDetails,
    "other_instruction": d.other_instruction,
    // "followup": h.exists(d.followup) ? new Date(d.followup) : '',
    "followup_d": h.exists(d.followupEnter) ? d.followupEnter : '',
    "followup_unit": h.exists(d.followupSelect) ? d.followupSelect : '',
    "home_services": h.checkExistsNotEmptyGreaterZero(d, 'home_services') ? '1' : '0',
    "visit_date": h.exists(d.visit_date) ? new Date(d.visit_date) : new Date()
  }
  return obj;
}

patient._diagnosisDTO = (diagnosis, visit) => {
  let obj = {
    "mr#": visit.mrno,
    "icd_code": diagnosis.code,
    "visit_id": visit.visit_id,
    "doctor_id": visit.doctor_id,
    "type": diagnosis.defaultSelectedType,
    "ref_code1": diagnosis.ref_code,
  }
  return obj;
}

patient._diagnosticsDTO = (diagnostics, visit) => {
  let obj = {
    "visit_id": visit.visit_id,
    "service_id": diagnostics.service_id,
    "service": diagnostics.service_description,
    "clinical_det": h.checkExistsNotEmpty(diagnostics, 'clinicalHistory') ? diagnostics.clinicalHistory : '',
    "special_instruction": h.checkExistsNotEmpty(diagnostics, 'specialInstruction') ? diagnostics.specialInstruction : '',
    "site": h.checkExistsNotEmpty(diagnostics, 'type') ? diagnostics.type : '',
    "fasting": h.checkExistsNotEmpty(diagnostics, 'fasting') ? diagnostics.fasting : '',
    "full_bladder": h.checkExistsNotEmpty(diagnostics, 'full_bladder') ? diagnostics.full_bladder : '',
    "periority": h.checkExistsNotEmpty(diagnostics, 'stat') ? diagnostics.stat : '',
  }
  return obj;
}

patient._brandAllergiesDTO = (allergies, visit) => {
  let obj = {
    "mr_no": visit.mrno,
    "medicine_code": allergies.allergyCode,
    "allergy_level": allergies.defaultSelectedSeverityLevel,
    "is_valid": 'Y',
    // "entry_code": 'MOAR_BRAND_ALLERGY.nextval'
  }
  return obj;
}

patient._genericAllergiesDTO = (allergies, visit, subclass) => {
  let obj = {
    "mrno": visit.mrno,
    "active": 'Y',
    "allergy_level": allergies.defaultSelectedSeverityLevel,
    "tran_date": new Date(),
    "tran_by": "WEB_USER"
    // "entry_code": 'pharmacy_shifa.DRUG_ALLERGY_SEQ.nextval'
  }
  if (h.checkExistsNotEmpty(subclass, 'subclassid')) {
    obj = {
      ...obj,
      "class_code": subclass.classid,
      "sub_class_code": subclass.subclassid,
      "class_code": subclass.classid,
    }
  } else {
    obj = {
      ...obj,
      "gen_code": allergies.allergyCode,
    }
  }
  return obj;
}

patient._medicinesDTO = (medicine, visit) => {
  let obj = {
    "medicine": medicine.medication,
    "mr#": visit.mrno,
    "medicine_code": (medicine.medicine_code) ? medicine.medicine_code : null,
    "route": medicine.route,
    "freq": medicine.selectedfrequency,
    "length": medicine.enteredLength,
    "len_unit": medicine.selectedLength,
    "form": medicine.form,
    "start_at": knex.raw('sysdate'),
    "substitute": 1,
    "visit_id": visit.visit_id,
    "dose_unit": medicine.dosage,
    "qty": medicine.total_dosage,
    "remarks": medicine.enteredremarks,
    "doctor_id": visit.doctor_id,
    "meal_instructions": medicine.selectedmealinstruction,
  }

  let note = medicine.total_dosage + ' ' + medicine.dosage_name;
  if (medicine.enteredLength > 0) {
    note += ' ' + medicine.selectedfrequency_name + ' For ' + medicine.enteredLength + ' ' + medicine.selectedLength;
  } else {
    note += ' ' + medicine.selectedfrequency_name + ' ' + medicine.selectedLength;
  }
  note += ' ' + medicine.selectedmealinstruction + ' ' + medicine.enteredremarks;

  obj['note'] = note.replace(/ +(?= )/g, ''); //replace(/\s\s+/g, ' ');

  return obj;
}

patient._deleteConstNotesDTO = (d) => {
  let obj = {
    "isactive": 'N',
    "token#": ''
  }
  return obj;
}

patient._deleteDiagnosisDTO = (sess_user) => {
  let obj = {
    "isactive": 'F',
    "deactive_by": sess_user.doctor_id,
    "deactive_at": knex.raw('sysdate'),
  }
  return obj;
}

patient._deleteDiagnosticsDTO = () => {
  let obj = {
    "cancel": 'T',
  }
  return obj;
}

patient._deleteMedicinesDTO = (sess_user) => {
  let obj = {
    "isactive": 'N'
  }
  return obj;
}

patient._deleteBrandAllergyDTO = (sess_user) => {
  let obj = {
    "is_valid": 'N'
  }
  return obj;
}

patient._deleteGenericAllergyDTO = (sess_user) => {
  let obj = {
    "active": 'N'
  }
  return obj;
}

patient._invitationLogDTO = (log, invitation) => {
  let obj = {
    "visit_id": log.visit_id,
    "mrno": log.mrno,
    "phoneno": log.phoneno,
    "meetingid": log.id,
    "start_url": log.start_url,
    "join_url": log.join_url,
    "meeting_data": JSON.stringify(invitation),
    "status": 1
  }
  return obj;
}

module.exports = patient;