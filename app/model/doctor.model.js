/**
 * @Name user.model.js
 *
 * @Description User Table Data.
 *
 * @package
 * @subpackage
 * @author Suhaib <muhammad.suhaib@shifa.com.pk>
 * @Created on Jaqnuary 25, 2020
 */

const knex = require("../config/knex");
const h = require("../utils/helper");

const Doctor = {};


/**************************************** Diagnosis ****************************************/

Doctor.getDiagnosis = async (params = {}) => {
  const result = knex.select(knex.raw('TRIM(DEF_1) AS name'), 'REF_CODE', 'CODE')
    .from({
      d: 'registration.ICD'
    })
    .modify(function (qb) {
      if (h.exists(params.txt)) {
        qb.where(knex.raw("LOWER(D.DEF_1) like ?", `%${params.txt.toLowerCase()}%`))
          .orWhere(knex.raw("LOWER(D.REF_CODE) like ?", `%${params.txt.toLowerCase()}%`))
          .limit(10);
      }
    })
    // .toString();
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        h.error(err);
        throw err;
      }
    );
  return result;
};

Doctor.getCommonDiagnosis = async (params = {}) => {
  const result = knex.select(knex.raw('TRIM(i.DEF_1) AS name'), 'i.REF_CODE', 'i.CODE')
    .from({
      t: 'EMR.VW_ICD'
    })
    .join('registration.ICD AS i', 't.icd_code', 'i.ref_code')
    .where('t.spec_id', params.spec_id)
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        h.error(err);
        throw err;
      }
    );
  return result;
};

Doctor.getDiagnosisTemplate = async (params = {}) => {
  const result = knex.select('t.id', 't.name')
    .from({
      t: 'REGISTRATION.DIAGNOSIS_TEMPLATE'
    })
    .where('t.doctor_id', params.doctor_id)
    .where('t.status', 1)
    .orderBy('t.name', 'asc')
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        h.error(err);
        throw err;
      }
    );
  return result;
};

Doctor.getDiagnosisByTemplate = async (params = {}) => {
  const result = knex.select(knex.raw('TRIM(i.DEF_1) AS name'), 'i.REF_CODE', 'i.CODE')
    .from({
      t: 'REGISTRATION.DIAGNOSIS_TEMPLATE_LINELIST'
    })
    .join('registration.ICD AS i', 't.code', 'i.code')
    .where('t.template_id', params.id)
    .where('t.status', 1)
    .orderBy('t.id', 'asc')
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        h.error(err);
        throw err;
      }
    );
  return result;
};

/**************************************** Diagnostics **************************************/

Doctor.getDiagnostics = async (params = {}) => {
  const result = knex.select(knex.raw("upper(t.service_description) AS service_description, substr(t.pre_ser_id, -4) AS prev_code, substr(t.pre_ser_id, 5, 2) AS subcode,decode(m.major_id, '3000', 'LAB', '2000', 'RAD', '1000', 'PRO') AS type"), 'm.major_id AS maj', 't.service_id', 't.is_asked_rightleft')
    .from({
      t: 'tbl_cm_services'
    })
    .join('tbl_cm_subminor AS sm', 't.subminor_id', 'sm.subminor_id')
    .join('tbl_cm_minor AS m', 'sm.minor_id', 'm.minor_id')
    .whereIn("m.major_id", ['3000', '2000', '1000'])
    .modify(function (qb) {
      if (h.exists(params.txt)) {
        qb.where(knex.raw("LOWER(T.service_description) like ?", `%${params.txt.toLowerCase()}%`))
          .limit(10);
      }
    })
    // .toString()
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        h.error(err);
        throw err;
      }
    );
  return result;
};

Doctor.getCommonDiagnostics = async (params = {}) => {
  const result = knex.select('t.service_description', 't.prev_code', 't.subcode', 't.type', 't.maj', 't.service_id')
    .from({
      t: 'EMR.VW_COMMON_DIAG_LIST'
    })
    .where('t.isactive', 'Y')
    .where(function () {
      this.where('t.speciality_id', params.doctor_id).orWhere('t.speciality_id', params.spec_id)
    })
    // .toString();
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        h.error(err);
        throw err;
      }
    );
  return result;
};

Doctor.getDiagnosticsTemplate = async (params = {}) => {
  const result = knex.select('t.id', 't.name')
    .from({
      t: 'REGISTRATION.DIAGNOSTICS_TEMPLATE'
    })
    .where('t.doctor_id', params.doctor_id)
    .where('t.status', 1)
    .orderBy('t.name', 'asc')
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        h.error(err);
        throw err;
      }
    );
  return result;
};

Doctor.getDiagnosticsByTemplate = async (params = {}) => {
  const result = knex.select(knex.raw("upper(ts.service_description) AS service_description, substr(ts.pre_ser_id, -4) AS prev_code, substr(ts.pre_ser_id, 5, 2) AS subcode,decode(m.major_id, '3000', 'LAB', '2000', 'RAD', '1000', 'PRO') AS type"), 'm.major_id AS maj', 'ts.service_id', 'ts.is_asked_rightleft')
    .from({
      t: 'REGISTRATION.DIAGNOSTICS_TEMPLATE_LINELIST'
    })
    .join('tbl_cm_services AS ts', 't.service_id', 'ts.service_id')
    .join('tbl_cm_subminor AS sm', 'ts.subminor_id', 'sm.subminor_id')
    .join('tbl_cm_minor AS m', 'sm.minor_id', 'm.minor_id')
    .whereIn("m.major_id", ['3000', '2000', '1000'])
    .where('t.template_id', params.id)
    .where('t.status', 1)
    .orderBy('t.id', 'asc')
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        h.error(err);
        throw err;
      }
    );
  return result;
};

/**************************************** Presenting Complaint *****************************/

Doctor.getPresentingComplaintTemplate = async (params = {}) => {
  const result = knex.select('t.id', 't.name', 't.template')
    .from({
      t: 'REGISTRATION.PRESENTING_COMPLAINT_TEMPLATE'
    })
    .where('t.doctor_id', params.doctor_id)
    .where('t.status', 1)
    .orderBy('t.name', 'asc')
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        h.error(err);
        throw err;
      }
    );
  return result;
};

Doctor.getPresentingComplaintByTemplate = async (params = {}) => {
  const result = knex.select('t.id', 't.name', 't.template')
    .from({
      t: 'REGISTRATION.PRESENTING_COMPLAINT_TEMPLATE'
    })
    .where('t.status', 1)
    .where('t.id', params.id)
    .orderBy('t.name', 'asc')
    .first()
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        h.error(err);
        throw err;
      }
    );
  return result;
};

/**************************************** Clinical Detail **********************************/

Doctor.getClinicalDetailTemplate = async (params = {}) => {
  const result = knex.select('t.id', 't.name', 't.template')
    .from({
      t: 'REGISTRATION.CLINICAL_DETAIL_TEMPLATE'
    })
    .where('t.doctor_id', params.doctor_id)
    .where('t.status', 1)
    .orderBy('t.name', 'asc')
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        h.error(err);
        throw err;
      }
    );
  return result;
};

Doctor.getClinicalDetailByTemplate = async (params = {}) => {
  const result = knex.select('t.id', 't.name', 't.template')
    .from({
      t: 'REGISTRATION.CLINICAL_DETAIL_TEMPLATE'
    })
    .where('t.status', 1)
    .where('t.id', params.id)
    .orderBy('t.name', 'asc')
    .first()
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        h.error(err);
        throw err;
      }
    );
  return result;
};

/**************************************** Appointments *************************************/

Doctor.getAppointments = async (params = {}) => {
  const result = knex.with('apt', knex.raw("SELECT t.appointment# appointment_id, t.appointment_date, t.appointment_type appointment_status, (case when t.visit_type = 'F/UP' then 'F' when t.visit_type = 'N/P' then 'N' end) visit_status, (to_char(t.appointment_datetime, 'HH:MI AM')) APPOINTMENT_TIME, t.mrno, t.DOCTOR_ID, t.arrival_mode FROM registration.APPTFILE t WHERE t.appointment_date = TO_DATE(?, 'YYYY-MM-DD') AND t.doctor_id = ? AND t.appointment_type = ?", [params.appointment_date, params.doctor_id, 'N']))
    .with('cn', knex.raw("SELECT t.entry_date, t.VISIT_TYPE, t.VISIT_ID, t.visit_status, t.MR# mrno, t.DOCTOR_ID, t.note, t.viewed seen, trunc(t.visit_date) seen_date, to_char(t.visit_date, 'HH:MI AM') seen_time, t.token# token_id, t.isactive, t.arrival_mode FROM registration.const_notes t WHERE t.entry_date BETWEEN TO_DATE(?, 'YYYY-MM-DD') AND TO_DATE(?, 'YYYY-MM-DD')+1 AND t.doctor_id = ? AND t.isactive = ?", [params.appointment_date, params.appointment_date, params.doctor_id, 'Y']))
    .with('t', knex.raw("SELECT apt.appointment_id, nvl(apt.appointment_date, trunc(cn.entry_date)) appointment_date, apt.APPOINTMENT_TIME, CASE WHEN APT.appointment_id IS NOT NULL THEN 'A' ELSE CN.VISIT_TYPE END appointment_type, apt.appointment_status, cn.VISIT_ID, nvl(cn.visit_status, apt.visit_status) visit_type, nvl(CN.mrno, apt.mrno) mrno, nvl(cn.DOCTOR_ID, apt.DOCTOR_ID) DOCTOR_ID, cn.seen, cn.seen_date, cn.seen_time, cn.TOKEN_ID, trunc(cn.entry_date) AS arrival_date, to_char(cn.entry_date, 'HH:MI AM') arrival_time, cn.isactive, nvl(cn.arrival_mode, apt.arrival_mode) arrival_mode FROM apt FULL OUTER JOIN cn ON apt.mrno = cn.mrno and apt.doctor_id = cn.doctor_id"))
    .select('t.appointment_id', 't.appointment_date', 't.appointment_time', 't.appointment_type', 't.visit_id', 't.visit_type', 't.token_id', 't.arrival_date', 't.arrival_time', 't.mrno', 't.doctor_id', 't.seen_date', 't.seen_time', 't.isactive', knex.raw("to_char(a.assess_time, 'HH:MI AM') assess_time"), 'b.amount', knex.raw("CASE WHEN t.seen_time IS NOT NULL AND t.seen = 'Y' THEN 'Seen' WHEN a.assess_time IS NOT NULL THEN 'Assessed' WHEN t.visit_id IS NOT NULL THEN 'Arrived' ELSE 'Pending' END AS status"), knex.raw("CASE WHEN b.amount IS NOT NULL AND b.amount > 0 THEN '' ELSE 'UNPAID' END AS payment_status"), knex.raw("regexp_replace(INITCAP(TRIM(P.FIRST_NAME||' '||P.LAST_NAME||' '||P.THIRD_NAME)), ' +', ' ') name"), 'p.gender', 't.arrival_mode', knex.raw(`CASE WHEN c.visit_id IS NOT NULL THEN 1 END AS invite_sent`))
    .from('t')
    .join('registration.patients AS p', 't.mrno', 'p.mr#')
    .leftJoin(function () {
      this.select('t.visit_id', 'c.mr# as mrno', 'c.doctor_id', knex.raw('MAX(t.enter_at) assess_time'))
        .from({
          t: 'registration.vital_signs'
        })
        .join('registration.const_notes AS c', 't.visit_id', 'c.visit_id')
        .where('c.doctor_id', params.doctor_id)
        .andWhere(knex.raw("TRUNC(t.enter_at) = TO_DATE(?, 'YYYY-MM-DD')", [params.appointment_date]))
        .groupBy('t.visit_id', 'c.mr#', 'c.doctor_id').as('a')
    }, 't.visit_id', 'a.visit_id')
    .leftJoin(function () {
      this.select('sc.doctor_id', 'sc.mrno', knex.raw('SUM(sc.charges) amount'))
        .from({
          sc: 'ods.sih_opd_services_charging'
        })
        .where('sc.major_id', '5555')
        .andWhere(knex.raw("TRUNC(sc.tran_date) = TO_DATE(?, 'YYYY-MM-DD')", [params.appointment_date]))
        .andWhere('sc.doctor_id', params.doctor_id)
        .groupBy('sc.doctor_id', 'sc.mrno').as('b')
    }, function () {
      this.on('t.doctor_id', '=', 'b.doctor_id').andOn('t.mrno', '=', 'b.mrno')
    })
    .leftJoin(function () {
      this.distinct('t.visit_id')
        .from({
          t: 'cdr.invitation_links'
        })
        .where(knex.raw("TRUNC(t.entereddate) = TO_DATE(?, 'YYYY-MM-DD')", [params.appointment_date]))
        .as('c')
    }, 't.visit_id', 'c.visit_id')
    .where('t.doctor_id', params.doctor_id)
    .andWhere(knex.raw("TRUNC(t.appointment_date) = TO_DATE(?, 'YYYY-MM-DD')", [params.appointment_date]))
    .orderBy('t.token_id', 'asc')
    .orderBy('name', 'asc')
    // .toString();
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        h.error(err);
        throw err;
      }
    );
  return result;
};

Doctor.getAppointmentLegends = async (params = {}) => {
  const result = knex.with('apt', knex.raw("SELECT t.appointment# appointment_id, t.appointment_date, t.appointment_type appointment_status, (case when t.visit_type = 'F/UP' then 'F' when t.visit_type = 'N/P' then 'N' end) visit_status, (to_char(t.appointment_datetime, 'HH:MI AM')) APPOINTMENT_TIME, t.mrno, t.DOCTOR_ID, t.arrival_mode FROM registration.APPTFILE t WHERE t.appointment_date = TO_DATE(?, 'YYYY-MM-DD') AND t.doctor_id = ? AND t.appointment_type = ?", [params.appointment_date, params.doctor_id, 'N']))
    .with('cn', knex.raw("SELECT t.entry_date, t.VISIT_TYPE, t.VISIT_ID, t.visit_status, t.MR# mrno, t.DOCTOR_ID, t.note, t.viewed seen, trunc(t.visit_date) seen_date, to_char(t.visit_date, 'HH:MI AM') seen_time, t.token# token_id, t.isactive FROM registration.const_notes t WHERE t.entry_date BETWEEN TO_DATE(?, 'YYYY-MM-DD') AND TO_DATE(?, 'YYYY-MM-DD')+1 AND t.doctor_id = ? AND t.isactive = ?", [params.appointment_date, params.appointment_date, params.doctor_id, 'Y']))
    .with('t', knex.raw("SELECT apt.appointment_id, nvl(apt.appointment_date, trunc(cn.entry_date)) appointment_date, apt.APPOINTMENT_TIME, CASE WHEN APT.appointment_id IS NOT NULL THEN 'A' ELSE CN.VISIT_TYPE END appointment_type, apt.appointment_status, cn.VISIT_ID, nvl(cn.visit_status, apt.visit_status) visit_type, nvl(CN.mrno, apt.mrno) mrno, nvl(cn.DOCTOR_ID, apt.DOCTOR_ID) DOCTOR_ID, cn.seen, cn.seen_date, cn.seen_time, cn.TOKEN_ID, trunc(cn.entry_date) AS arrival_date, to_char(cn.entry_date, 'HH:MI AM') arrival_time, cn.isactive, apt.arrival_mode FROM apt FULL OUTER JOIN cn ON apt.mrno = cn.mrno and apt.doctor_id = cn.doctor_id"))
    .select(knex.raw("count(CASE WHEN t.appointment_type = 'A' THEN t.mrno END) AS appointed, count(CASE WHEN t.appointment_type = 'W' THEN t.mrno END) AS walkin, count(CASE WHEN t.visit_type = 'F' THEN t.mrno END) AS followup, count(CASE WHEN t.visit_type = 'R' THEN t.mrno END) AS review_report, count(CASE WHEN t.visit_type = 'N' THEN t.mrno END) AS new, count(CASE WHEN t.visit_type NOT IN ('F','R','N') THEN t.mrno END) AS other, count(CASE WHEN p.GENDER = 'M' THEN t.mrno END) AS male, count(CASE WHEN p.GENDER = 'F' THEN t.mrno END) AS female"))
    .from('t')
    .join('registration.patients AS p', 't.mrno', 'p.mr#')
    .where('t.doctor_id', params.doctor_id)
    .andWhere(knex.raw("TRUNC(t.appointment_date) = TO_DATE(?, 'YYYY-MM-DD')", [params.appointment_date]))
    .first()
    // .toString();
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        h.error(err);
        throw err;
      }
    );
  return result;
};

/**************************************** Medicine *****************************************/

Doctor.getMedicine = async (params = {}) => {
  const result = knex.select('m.MEDICATION', 'm.generic', 'm.medicine_code', 'FR.ROUTE', 'FR.DOSAGE', 'm.unit', 'M.FORM_DESCRIPTION AS form', 'm.gen_code', knex.raw("CASE WHEN m.FORM_DESCRIPTION = 'TABLET' THEN 'TAB' WHEN m.FORM_DESCRIPTION IN ('SYRUP','SUSPENSION') THEN 'TSF' WHEN m.FORM_DESCRIPTION = 'CAPSULE' THEN 'CAP' WHEN m.FORM_DESCRIPTION LIKE '%SPRAY%' THEN 'PUFFS' WHEN m.FORM_DESCRIPTION LIKE '%DROPS%' THEN 'DROPS' WHEN m.FORM_DESCRIPTION = 'SACHET' THEN 'SACHET' WHEN m.FORM_DESCRIPTION = 'INJECTION' THEN 'MG' END AS dosage_form"))
    .from({
      m: 'registration.medicine'
    })
    .leftJoin('registration.FORM_ROUTE AS FR', 'm.FORM_DESCRIPTION', 'FR.FORM')
    .modify(function (qb) {
      if (h.exists(params.txt)) {
        qb.where(knex.raw("LOWER(M.MEDICATION) like ?", `%${params.txt.toLowerCase()}%`))
          .orWhere(knex.raw("LOWER(M.generic) like ?", `%${params.txt.toLowerCase()}%`))
          .orWhere(knex.raw("LOWER(M.medicine_code) like ?", `%${params.txt.toLowerCase()}%`))
          .orWhere(knex.raw("LOWER(M.gen_code) like ?", `%${params.txt.toLowerCase()}%`))
          .limit(10);
      }
    })
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        h.error(err);
        throw err;
      }
    );
  return result;
};

Doctor.getCommonMedicine = async (params = {}) => {
  const result = knex.select('m.MEDICATION', 'm.generic', 'm.medicine_code', 'FR.ROUTE', 'FR.DOSAGE', 'm.unit', 'M.FORM_DESCRIPTION AS form', 'm.gen_code', knex.raw("CASE WHEN m.FORM_DESCRIPTION = 'TABLET' THEN 'TAB' WHEN m.FORM_DESCRIPTION IN ('SYRUP','SUSPENSION') THEN 'TSF' WHEN m.FORM_DESCRIPTION = 'CAPSULE' THEN 'CAP' WHEN m.FORM_DESCRIPTION LIKE  '%SPRAY%' THEN 'PUFFS' WHEN m.FORM_DESCRIPTION LIKE  '%DROPS%' THEN 'DROPS' WHEN m.FORM_DESCRIPTION = 'SACHET' THEN 'SACHET' WHEN m.FORM_DESCRIPTION = 'INJECTION' THEN 'MG' END AS dosage_form"))
    .from({
      t: 'EMR.VW_COMMON_MED_LIST'
    })
    .join('registration.medicine AS m', 't.medicine_code', 'm.medicine_code')
    .leftJoin('registration.FORM_ROUTE AS FR', 'm.FORM_DESCRIPTION', 'FR.FORM')
    // .where('t.isactive', 'Y')
    .where(function () {
      this.where('t.speciality', params.doctor_id).orWhere('t.speciality', params.spec_id)
    })
    // .toString();
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        h.error(err);
        throw err;
      }
    );
  return result;
};

Doctor.getMedicineTemplate = async (params = {}) => {
  const result = knex.select('t.id', 't.name')
    .from({
      t: 'REGISTRATION.MEDICINES_TEMPLATE'
    })
    .where('t.doctor_id', params.doctor_id)
    .where('t.status', 1)
    .orderBy('t.name', 'asc')
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        h.error(err);
        throw err;
      }
    );
  return result;
};

Doctor.getMedicineByTemplate = async (params = {}) => {
  const result = knex.select('m.MEDICATION', 'm.generic', 'm.medicine_code', 'FR.ROUTE', 'FR.DOSAGE', 'm.unit', 'M.FORM_DESCRIPTION AS form', 'm.gen_code', `t.qty`, `t.dose_unit`, `t.freq`, `t.length`, `t.len_unit`, `t.meal_instructions`, knex.raw("CASE WHEN m.FORM_DESCRIPTION = 'TABLET' THEN 'TAB' WHEN m.FORM_DESCRIPTION IN ('SYRUP','SUSPENSION') THEN 'TSF' WHEN m.FORM_DESCRIPTION = 'CAPSULE' THEN 'CAP' WHEN m.FORM_DESCRIPTION LIKE  '%SPRAY%' THEN 'PUFFS' WHEN m.FORM_DESCRIPTION LIKE '%DROPS%' THEN 'DROPS' WHEN m.FORM_DESCRIPTION = 'SACHET' THEN 'SACHET' WHEN m.FORM_DESCRIPTION = 'INJECTION' THEN 'MG' END AS dosage_form"))
    .from({
      t: 'REGISTRATION.MEDICINES_TEMPLATE_LINELIST'
    })
    .join('registration.medicine AS m', 't.code', 'm.medicine_code')
    .leftJoin('registration.FORM_ROUTE AS FR', 'm.FORM_DESCRIPTION', 'FR.FORM')
    .where('t.template_id', params.id)
    .where('t.status', 1)
    .orderBy('t.id', 'asc')
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        h.error(err);
        throw err;
      }
    );
  return result;
};

Doctor.getMedicineRoutes = async (params = {}) => {
  const result = knex.select('t.unit_id_emr AS route_id', knex.raw('UPPER(TRIM(t.route_emr)) AS route'))
    .from({
      t: 'ODS.RX_MEDICINE_DOSE_ROUTE'
    })
    .modify(function (qb) {
      if (h.exists(params.code)) {
        qb.join('PHARMACY_SHIFA.MEDICINE_ROUTE AS MRT', 'T.ABBREV', 'MRT.ABBREV')
          .where(knex.raw("MRT.MEDICINE_CODE||MRT.CARD_NO = ?", `${params.code}`))
          .first();
      }
    })
    .orderBy('t.route_emr', 'asc')
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        h.error(err);
        throw err;
      }
    );
  return result;
};

Doctor.getMedicineFrequencies = async (params = {}) => {
  const result = knex.select('T.DESCRIPT_EMR AS value', 'T.UNIT_ID_EMR AS id')
    .from({
      t: 'ODS.RX_MEDICINE_DIRECTION'
    })
    .join('PHARMACY_SHIFA.MEDICINE_DIRECTION AS DIR', 'T.CODE', 'DIR.DIR_CODE')
    .where('DIR.ACTIVE', 'Y')
    .andWhere(knex.raw('DIR.MEDICINE_CODE || DIR.CARD_NO = ?', `${params.code}`))
    .orderBy(1)
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        h.error(err);
        throw err;
      }
    );
  return result;
};

Doctor.getMedicineFrequenciesAll = async (params = {}) => {
  const result = knex.select('T.description AS value', 'T.code AS id')
    .from({
      t: 'REGISTRATION.FREQ'
    })
    .where('t.status', 'T')
    .orderBy('t.unit_id')
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        h.error(err);
        throw err;
      }
    );
  return result;
};

Doctor.getMedicineUnits = async (params = {}) => {
  const result = knex.select('T.description AS value', 'T.unit_id AS id')
    .from({
      t: 'prescripted_amount_unit'
    })
    .orderBy('t.unit_id', 'asc')
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        h.error(err);
        throw err;
      }
    );
  return result;
};

Doctor.getMedicineForms = async (params = {}) => {
  const result = knex.select('t.FORM')
    .from({
      t: 'registration.FORM_ROUTE'
    })
    .orderBy('t.FORM', 'asc')
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        h.error(err);
        throw err;
      }
    );
  return result;
};

/**************************************** Allergy ******************************************/

Doctor.getBrandAllergies = async (params = {}) => {
  const result = knex.select(knex.raw(`DISTINCT 'Brand' AS type`), 't.medicine_name AS generic', 't.medicine_code AS code')
    .from({
      t: 'pharmacy_shifa.brand_allergy'
    })
    .modify(function (qb) {
      if (h.exists(params.txt)) {
        qb.where(knex.raw("LOWER(T.medicine_name) like ?", `%${params.txt.toLowerCase()}%`))
          .orWhere(knex.raw("LOWER(T.medicine_code) like ?", `%${params.txt.toLowerCase()}%`))
          .limit(10);
      }
    })
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        h.error(err);
        throw err;
      }
    );
  return result;
};

Doctor.getGenericAllergies = async (params = {}) => {
  const result = knex.select(knex.raw(`'Generic' AS type`), 't.generic', 't.code')
    .from({
      t: 'pharmacy_shifa.generic'
    })
    .whereNotNull('t.generic')
    .andWhere('t.active', 'T')
    .modify(function (qb) {
      if (h.exists(params.txt)) {
        qb.where(knex.raw("LOWER(T.generic) like ?", `%${params.txt.toLowerCase()}%`))
          .orWhere(knex.raw("LOWER(T.code) like ?", `%${params.txt.toLowerCase()}%`))
          .limit(10);
      }
    })
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        h.error(err);
        throw err;
      }
    );
  return result;
};

Doctor.getAllergyTemplates = async (params = {}) => {
  const result = knex.select('t.id', 't.name')
    .from({
      t: 'REGISTRATION.ALLERGIES_TEMPLATE'
    })
    .where('t.doctor_id', params.doctor_id)
    .where('t.status', 1)
    .orderBy('t.name', 'asc')
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        h.error(err);
        throw err;
      }
    );
  return result;
};

Doctor.getAllergiesByTemplate = async (params = {}) => {
  const result = knex.select('t.type', knex.raw('NVL(g.generic, b.medicine_name) AS generic'), knex.raw('NVL(g.code, b.medicine_code) AS code'))
    .from({
      t: 'REGISTRATION.ALLERGIES_TEMPLATE_LINELIST'
    })
    .leftJoin('pharmacy_shifa.generic AS g', function () {
      this.on('t.code', '=', 'g.code').andOn(knex.raw("T.type = ?", 'Generic'))
    })
    .leftJoin('pharmacy_shifa.brand_allergy AS b', function () {
      this.on('t.code', '=', 'b.medicine_code').andOn(knex.raw("T.type = ?", 'Brand'))
    })
    .where('t.template_id', params.id)
    .where('t.status', 1)
    .orderBy('t.id', 'asc')
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        h.error(err);
        throw err;
      }
    );
  return result;
};




module.exports = Doctor;