/**
 * @Name patient.model.js
 *
 * @Description Patient Table Data.
 *
 * @package
 * @subpackage
 * @author Suhaib <muhammad.suhaib@shifa.com.pk>
 * @Created on October 02, 2020
 */

const knex = require("../config/knex");
const h = require("../utils/helper");
const oracledb = require('oracledb');

const Patient = {};


/**************************************** Diagnosis ****************************************/

Patient.getPatientDiagnosis = async (params = {}) => {
  const result = knex.select(knex.raw('NVL(TRIM(d.DEF_1), T.REMARKS) AS name'), 'd.REF_CODE', 'd.CODE', 't.remarks', 't.type')
    .from({
      t: 'registration.diagnosis'
    })
    .leftJoin('registration.ICD AS d', 't.icd_code', 'd.code')
    .where('t.isactive', 'T')
    .whereNotNull(knex.raw('NVL(TRIM(d.DEF_1), T.REMARKS)'))
    .modify(function (qb) {
      if (h.exists(params.mrno)) {
        qb.where('t.mr#', params.mrno)
      }
      if (h.exists(params.visit_id)) {
        qb.where('t.visit_id', params.visit_id)
      }
    })
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        throw err;
      }
    );
  return result;
};

Patient.checkPatientDiagnosis = async (diagnosis = {}, visit = {}) => {
  const result = knex.select('t.visit_id', 't.icd_code')
    .from({
      t: 'registration.diagnosis'
    })
    .where('t.visit_id', visit.visit_id)
    .andWhere('t.icd_code', diagnosis.code)
    .andWhere('t.isactive', 'T')
    .first()
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        throw err;
      }
    );
  return result;
};

/**************************************** Diagnostics **************************************/

Patient.getPatientDiagnostics = async (params = {}) => {
  const result = knex.select(knex.raw("upper(NVL(t.service_description, d.service)) AS service_description, substr(t.pre_ser_id, -4) AS prev_code, substr(t.pre_ser_id, 5, 2) AS subcode,decode(m.major_id, '3000', 'LAB', '2000', 'RAD', '1000', 'PRO') AS type"), 'm.major_id AS maj', 't.service_id', 't.is_asked_rightleft', 'd.site', 'd.CLINICAL_DET', 'd.SPECIAL_INSTRUCTION', 'd.PERIORITY', 'd.fasting', 'd.FULL_BLADDER')
    .from({
      t: 'tbl_cm_services'
    })
    .join('tbl_cm_subminor AS sm', 't.subminor_id', 'sm.subminor_id')
    .join('tbl_cm_minor AS m', 'sm.minor_id', 'm.minor_id')
    .join('registration.diagnostics AS d', 't.service_id', 'd.service_id')
    .whereIn("m.major_id", ['3000', '2000', '1000'])
    .andWhere('d.cancel', 'F')
    .andWhere('d.visit_id', params.visit_id)
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        throw err;
      }
    );
  return result;
};

Patient.checkPatientDiagnostics = async (diagnostics = {}, visit = {}) => {
  const result = knex.select('t.visit_id', 't.service_id', 't.service')
    .from({
      t: 'registration.diagnostics'
    })
    .where('t.cancel', 'F')
    .andWhere('t.visit_id', visit.visit_id)
    .andWhere('t.service_id', diagnostics.service_id)
    .first()
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        throw err;
      }
    );
  return result;
};

Patient.getPatientLabResults = async (params = {}) => {
  const result = knex.with('wa', (qb) => {
    qb.distinct(`t.lab_no`)
      .from({
        t: 'machine_interfacing'
      })
      .where('t.mrno', params.mrno)
      .whereNull('t.performed_on')
  }).with('wb', (qb) => {
    qb.select(`t.lab_no`, knex.raw(`REPLACE(t.mr_no,'-','') AS mrno`), 't.status', 't.test_code', 't.fresh_sample', 'rd.reason')
      .from({
        t: 'lab.specimen_rejected'
      })
      .join('lab.specimen_rejection_detail AS rd', 't.rejection_no', 'rd.rejection_id')
      .where(knex.raw(`REPLACE(t.mr_no,'-','')`), params.mrno)
      .andWhere('t.status', 'R')
      .whereIn('rd.detail_id', qb => {
        qb.max('rd.detail_id')
          .from({
            sr: 'lab.specimen_rejected'
          })
          .join('lab.specimen_rejection_detail AS rd', 'rd.rejection_id', 'sr.rejection_no')
          .where(knex.raw(`REPLACE(sr.mr_no,'-','')`), params.mrno)
          .andWhere('sr.status', 'R')
          .groupBy('rd.rejection_id')
      })
  }).select('t.ord_date', knex.raw(`to_char(t.dept_loc_rcv_date_time, 'dd/mm/yyyy') || ' @' || to_char(t.dept_loc_rcv_date_time, 'HH24:MI') AS dept_date`), 't.labno', 't.specimen_no', knex.raw(`to_char(t.specimen_date, 'YYYY-MM-DD HH24:MI:SS') AS specimen_date`), 't.mrno', 't.verify', 't.test_code', knex.raw(`substr(a.pre_ser_id, 5) AS pre_code`), 't.type', 't.cg_details_id', 'c.minor_description', 'a.service_description', 't.dr_ord_code', 't.dept_loc_rcv_by', 't.result_date', 't.verify_by', 't.verify_date', 't.consult_assign_1', knex.raw(`d.first_name || ' ' || d.last_name AS doc_name`), knex.raw(`CASE WHEN wb.LAB_NO IS NOT NULL AND wb.fresh_sample = 'Y' THEN 'Fresh_Result' WHEN wb.LAB_NO IS NOT NULL AND (wb.fresh_sample is null or wb.fresh_sample = 'N') THEN 'Rejected_Result' WHEN wa.LAB_NO IS NOT NULL THEN 'Machine_Result' WHEN t.result_date is null and t.dept_loc_rcv_by IS NOT NULL THEN 'Processing_Result' WHEN t.verify is null then 'Pending_Result' WHEN t.verify = 'F' then 'Unverify_Result' WHEN t.verify = 'T' then 'Verify_Result' END AS status`), 'wb.reason')
    .from({
      t: 'lab.labque'
    })
    .join('data.tbl_cm_services AS a', 't.test_code', 'a.service_id')
    .join('data.tbl_cm_subminor AS b', 'a.subminor_id', 'b.subminor_id')
    .join('data.tbl_cm_minor AS c', function () {
      this.on('b.minor_id', '=', 'c.minor_id').andOn(knex.raw("c.major_id = ?", '3000')).andOn(knex.raw("c.enabled = ?", 'T'));
    })
    .leftJoin('doctors AS d', 'd.doctor_id', 't.consult_assign_1')
    .leftJoin('wa', 't.labno', 'wa.lab_no')
    .leftJoin('wb', function () {
      this.on('t.labno', '=', 'wb.lab_no').andOn('t.test_code', '=', 'wb.test_code');
    })
    .where("t.mrno", params.mrno)
    .andWhere('t.refund', 'N')
    .andWhere(knex.raw(`nvl(t.specimen_status, 'R') = 'R'`))
    .andWhere(knex.raw(`t.dr_ord_code = nvl(null, t.dr_ord_code)`))
    .orderBy('t.ord_date', "desc")
    .orderBy('t.test_code', "asc")
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        throw err;
      }
    );
  return result;
};

Patient.getPatientRadiologyResults = async (params = {}) => {
  const result = knex.select('t.ord_date AS ord_date', 't.rad_id', 't.mrno', 't.service_id', knex.raw(`substr(a.pre_ser_id, 5) AS pre_code`), knex.raw(`decode(upper(t.TYPE), 'O', 'OPD', 'IPD') AS type`), 'a.service_description', knex.raw(`nvl(c.per_date,t.ack_date) AS per_date`), 'c.per_time', knex.raw(`nvl(d.rep_date,t.report_saved) AS rep_date`), 'd.rep_time', 't.dr_ord_code', 't.stat_final', 't.final', knex.raw(`nvl(t.refund,'N') AS refund`), knex.raw(`t.report||t.final AS rpt_status`), knex.raw(`case when t.report||t.final='YN' then 'NOT VERIFIED' when t.report||t.final='YY' then 'VERIFIED' when t.report||t.final='NN' and t.radiology_ack='Y' then 'PENDING' when t.report||t.final='NN' and t.radiology_ack='Y' and t.radiology_ack='Y' then 'NOT PERFORMED' else 'UNKWON' end status`), `a.subminor_id`)
    .from({
      t: 'radiology.radque'
    })
    .join('data.tbl_cm_services AS a', 't.service_id', 'a.service_id')
    // .leftJoin('radiology.rad_film_details AS b', 't.rad_id', 'b.rad_id')
    .leftJoin('radiology.perform AS c', 't.rad_id', 'c.rad_id')
    .leftJoin('radiology.report AS d', 't.rad_id', 'd.rad_id')
    .where("t.mrno", params.mrno)
    .orderBy('t.ord_date', "desc")
    .orderBy('a.service_description', "asc")
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        throw err;
      }
    );
  return result;
};

Patient.getPatientCardiologyResults = async (params = {}) => {
  const result = knex.with('a', (qb) => {
    qb.select(`c.ord_date`, `c.card_id`, `c.mrno`, `c.service_id`, knex.raw(`substr(a.pre_ser_id, 5) AS pre_code`), knex.raw(`decode(upper(c.type), 'O', 'OPD', 'IPD') AS type`), `a.service_description`, `cd.performed_date`, `cd.performed_time_start`, `cd.varified_report_date`, `cd.varified_report_time`, knex.raw(`null AS rep_type`), `c.dr_ord_code`)
      .from({
        c: 'cardiology'
      })
      .join('tbl_cm_services AS a', 'c.service_id', 'a.service_id')
      .leftJoin('card_test_detail AS cd', 'c.card_id', 'cd.card_id')
      .where('c.mrno', params.mrno)
      .andWhere('c.perform', 'Y')
      .whereIn('c.service_id', ['00104', '00105', '00106', '00107', '00108', '00115', '00104', '00110', '00116', '00117', '00118',
        '00119', '00120', '00122', '00125', '07864', '00101'])
  }).with('b', (qb) => {
    qb.select(`ca.prfm_date AS order_date`, `ca.angio_id AS card_id`, `ca.mrno`, `tcs.service_id`, knex.raw(`substr(tcs.pre_ser_id,5) AS pre_code`), knex.raw(`'IPD' AS type`), `ar.rpt_name AS service_description`, `ca.prfm_date AS performed_date`, knex.raw(`null AS performed_time_start`), `ca.verified_date AS varified_report_date`, `ca.verified_time AS varified_report_time`, `ar.type AS rep_type`, `ca.doctor_id AS dr_ord_code`)
      .from({
        ca: 'coronary_angiography'
      })
      .join('angio_rpt AS ar', 'ar.pre_fix', knex.raw('SUBSTR(ca.angio_id, 1, 3)'))
      .join('tbl_cm_services AS tcs', 'ca.service_id', 'tcs.service_id')
      .where('ca.mrno', params.mrno)
      .andWhere('ca.verified', 'Y')
  }).with('c', (qb) => {
    qb.select(`*`)
      .from('a')
      .unionAll([
        knex.select('*').from('b')
      ])
  }).select('c.*', knex.raw(`emr.consultant_pkg.get_consultant(c.dr_ord_code) AS ord_doctor`))
    .from('c')
    .orderBy(1, 'desc')
    .orderBy(5, 'asc')
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        throw err;
      }
    );
  return result;
};

Patient.getPatientNeurologyResults = async (params = {}) => {
  const result = knex.with('a', (qb) => {
    qb.select(`t.eeg_id AS e_code`, `t.mr_no AS mrno`, `t.perform_date`, knex.raw(`'EEG' AS test_name`), `t.entry_status AS p_status`, `t.neu_id`)
      .from({
        t: 'registration.tbl_neuro_eeg_report'
      })
      .where('t.mr_no', params.mrno)
  }).with('b', (qb) => {
    qb.select(`t.brainstem_id AS e_code`, `t.mr_no AS mrno`, `t.perform_date`, knex.raw(`'Brain Stem Auditory' AS test_name`), `t.process_status AS p_status`, `t.neu_id`)
      .from({
        t: 'registration.tbl_neuro_brainstem_auditory'
      })
      .where('t.mr_no', params.mrno)
  }).with('c', (qb) => {
    qb.select(`t.evoked_id AS e_code`, `t.mr_no AS mrno`, `t.perform_date`, knex.raw(`'Visual Evoked Potential' AS test_name`), `t.entry_status AS p_status`, `t.neu_id`)
      .from({
        t: 'registration.tbl_neuro_evoked_potential'
      })
      .where('t.mr_no', params.mrno)
  }).with('d', (qb) => {
    qb.select(`t.stimulation_id AS e_code`, `t.mr_no AS mrno`, `t.perform_date`, knex.raw(`'Repetitive Nerve Stimulation' AS test_name`), `t.process_status AS p_status`, `t.neu_id`)
      .from({
        t: 'registration.tbl_neuro_nerve_stimulation'
      })
      .where('t.mr_no', params.mrno)
  }).with('qbinner', (qb) => {
    qb.distinct(`t.neu_id`, `t.status`)
      .from({
        t: 'registration.neuro_ncs_emg'
      })
      .where('t.mr_no', params.mrno)
      .andWhere('t.status', 'a')
  }).with('e', (qb) => {
    qb.select(`t.ncs_id AS e_code`, `t.mr_no AS mrno`, `n.performed_date AS perform_date`, knex.raw(`CASE WHEN qbinner.status = 'a' THEN 'Nerve Conduction Studies EMG' ELSE 'Nerve Conduction Studies' END AS test_name`), knex.raw(`decode(t.entry_status,'V','Verified','U','UnVerified',t.entry_status) AS p_status`), `t.neu_id`)
      .from({
        t: 'registration.neuro_ncs_main'
      })
      .join('neurology AS n', 't.neu_id', 'n.neu_id')
      .leftJoin('qbinner', 't.neu_id', 'qbinner.neu_id')
      .where('t.mr_no', params.mrno)
  }).with('f', (qb) => {
    qb.select(`*`)
      .from('a')
      .union([
        knex.select('*').from('b'),
        knex.select('*').from('c'),
        knex.select('*').from('d'),
        knex.select('*').from('e')
      ])
  }).select('f.*', knex.raw("regexp_replace(INITCAP(TRIM(P.FIRST_NAME||' '||P.LAST_NAME||' '||P.THIRD_NAME)), ' +', ' ') pat_name"))
    .from('f')
    .join('registration.patients AS p', 'f.mrno', 'p.mr#')
    // .orderBy(1, 'desc')
    // .orderBy(5, 'asc')
    //   .toString();
    // console.log(result);
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        throw err;
      }
    );
  return result;
};

Patient.getPatientGastroResults = async (params = {}) => {
  const result = knex.with('a', (qb) => {
    qb.select(`t.mrno`, `t.ord_date`, `t.service_id`, `s.service_description`, `t.scopy_no AS chg_id`, knex.raw(`CASE WHEN ee.process_status = 'U' THEN 'Unverified'  WHEN ee.process_status = 'V' THEN 'Verified' ELSE 'Pending' END AS status`))
      .from({
        t: 'endoscopy'
      })
      .join('tbl_cm_services AS s', 't.service_id', 's.service_id')
      .leftJoin('endo_ercp AS ee', 't.scopy_no', 'ee.scopy_No')
      .where('t.mrno', params.mrno)
      .andWhere('t.refund', 'N')
      .whereIn('t.service_id', ['00757', '00765', '00519', '05284'])
  }).with('b', (qb) => {
    qb.select(`t.mrno`, `t.ord_date`, `t.service_id`, `s.service_description`, `t.scopy_no AS chg_id`, knex.raw(`CASE WHEN ee.process_status = 'U' THEN 'Unverified'  WHEN ee.process_status = 'V' THEN 'Verified' ELSE 'Pending' END AS status`))
      .from({
        t: 'endoscopy'
      })
      .join('tbl_cm_services AS s', 't.service_id', 's.service_id')
      .leftJoin('endo_upper_gi AS ee', 't.scopy_no', 'ee.scopy_No')
      .where('t.mrno', params.mrno)
      .andWhere('t.refund', 'N')
      .whereIn('t.service_id', ['00741', '00738', '00763', '00753'])
  }).with('c', (qb) => {
    qb.select(`t.mrno`, `t.ord_date`, `t.service_id`, `s.service_description`, `t.scopy_no AS chg_id`, knex.raw(`CASE WHEN ee.process_status = 'U' THEN 'Unverified'  WHEN ee.process_status = 'V' THEN 'Verified' ELSE 'Pending' END AS status`))
      .from({
        t: 'endoscopy'
      })
      .join('tbl_cm_services AS s', 't.service_id', 's.service_id')
      .leftJoin('endo_lower_gi AS ee', 't.scopy_no', 'ee.scopy_No')
      .where('t.mrno', params.mrno)
      .andWhere('t.refund', 'N')
      .whereIn('t.service_id', ['00724', '00747'])
  }).with('d', (qb) => {
    qb.select(`t.mrno`, `t.ord_date`, `t.service_id`, `s.service_description`, knex.raw(`TO_CHAR(t.que_id) AS chg_id`), knex.raw(`CASE WHEN ee.entry_status = 'U' THEN 'Unverified'  WHEN ee.entry_status = 'V' THEN 'Verified' ELSE 'Pending' END AS status`))
      .from({
        t: 'clinic_que_for_procedures'
      })
      .join('tbl_cm_services AS s', 't.service_id', 's.service_id')
      .leftJoin('bronchoscopy AS ee', 't.que_id', 'ee.charging_id')
      .where('t.mrno', params.mrno)
      .andWhere('t.refund', 'N')
      .whereIn('t.service_id', ['00754', '00819'])
  }).with('e', (qb) => {
    qb.select(`*`)
      .from('a')
      .union([
        knex.select('*').from('b'),
        knex.select('*').from('c'),
        knex.select('*').from('d')
      ])
  }).select('e.*', knex.raw("regexp_replace(INITCAP(TRIM(P.FIRST_NAME||' '||P.LAST_NAME||' '||P.THIRD_NAME)), ' +', ' ') pat_name"))
    .from('e')
    .join('registration.patients AS p', 'e.mrno', 'p.mr#')
    .orderBy(2, 'desc')
    // .toString();
    // console.log(result);
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        throw err;
      }
    );
  return result;
};

/**************************************** Vitals *******************************************/

Patient.getPreviousVisit = async (params = {}) => {
  const result = await knex.select('t.visit_id', 't.mr# AS mrno')
    .from({
      t: 'registration.const_notes'
    })
    .where('t.mr#', params.mrno)
    .andWhere('t.isactive', 'Y')
    .andWhere("t.entry_date", "<", function () {
      this.select('t.entry_date')
        .from({
          t: 'registration.const_notes'
        })
        .where('t.visit_id', params.visit_id)
        .andWhere('t.isactive', 'Y')
    })
    .orderBy('t.entry_date', 'desc')
    .first()
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        throw err;
      }
    );
  return result;
};

Patient.getPatientInvites = async (params = {}) => {
  const result = await knex.select('t.*')
    .from({
      t: 'cdr.invitation_links'
    })
    .where('t.visit_id', params.visit_id)
    .orderBy('t.entereddate', 'desc')
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        throw err;
      }
    );
  return result;
};

/**************************************** Previous Visits **********************************/

Patient.getOPDPreviousVisits = async (params = {}) => {
  const result = await knex.select(knex.raw("distinct initcap(D.FIRST_NAME || ' ' || D.LAST_NAME) || ' (' || s.speciality_name || ')' name"), 't.visit_id', knex.raw("to_char(t.entry_date, 'Dy, Mon DD, YYYY') AS visit_date"), 't.entry_date')
    .from({
      t: 'registration.const_notes'
    })
    .join('COMMON.DOCTORS AS D', 't.doctor_id', 'D.doctor_id')
    .join('COMMON.SPECIALITIES AS S', 'D.PRIMARY_SPECIALITY_ID', 'S.SPECIALITY_ID')
    // .join('TBL_DEPARTMENTS AS DP', 'DP.SP_ID', 'D.PRIMARY_SPECIALITY_ID')
    .where('t.mr#', params.mrno)
    .andWhere('t.isactive', 'Y')
    .andWhere(knex.raw('TRUNC(t.Entry_Date) <> TRUNC(sysdate)'))
    .orderBy('t.entry_date', 'desc')
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        throw err;
      }
    );
  return result;
};

/**************************************** Medicine *****************************************/

Patient.getPatientMedicine = async (params = {}) => {
  const result = knex.select(knex.raw('NVL(m.MEDICATION, p.medicine) AS medication'), 'm.generic', 'm.medicine_code', knex.raw('NVL(FR.ROUTE, p.route) AS route'), knex.raw('NVL(FR.DOSAGE, p.dose_unit) AS DOSAGE'), 'm.unit', knex.raw('NVL(M.FORM_DESCRIPTION, p.form) AS form'), 'm.gen_code', 'p.mr# AS mrno', 'p.qty', 'p.freq', 'p.remarks', 'p.MEAL_INSTRUCTIONS', 'p.length', 'p.LEN_UNIT', 'p.dose_UNIT', 'd.DESCRIPT_EMR AS freq_name', 'u.description AS dosage_name')
    .from({
      p: 'registration.medicine_prescription'
    })
    .leftJoin('registration.medicine AS m', 'm.medicine_code', 'p.medicine_code')
    .leftJoin('registration.FORM_ROUTE AS FR', 'm.FORM_DESCRIPTION', 'FR.FORM')
    .leftJoin('prescripted_amount_unit AS u', 'p.dose_unit', 'u.unit_id')
    .leftJoin('ODS.RX_MEDICINE_DIRECTION AS d', 'p.freq', 'd.code')
    .where('p.visit_id', params.visit_id)
    .andWhere('p.isactive', 'Y')
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        throw err;
      }
    );
  return result;
};

Patient.getPatientMedicineHistory = async (params = {}) => {
  const result = knex.select('m.MEDICATION', 'm.generic', 'm.medicine_code', 'FR.ROUTE', 'FR.DOSAGE', 'm.unit', 'M.FORM_DESCRIPTION AS form', 'm.gen_code', 'p.mr# AS mrno', 'p.qty', 'p.freq', 'p.remarks', 'p.MEAL_INSTRUCTIONS', 'p.length', 'p.LEN_UNIT', 'p.dose_UNIT', 'd.DESCRIPT_EMR AS freq_name', 'u.description AS dosage_name', 'p.doctor_id', knex.raw("regexp_replace(INITCAP(TRIM(dd.d_surname||' '||dd.consultant)), ' +', ' ') doctor_name"), knex.raw("TO_CHAR(c.entry_date, 'DD-MM-YYYY') AS visit_date"))
    .from({
      m: 'registration.medicine'
    })
    .join('registration.medicine_prescription AS p', 'm.medicine_code', 'p.medicine_code')
    .join('registration.const_notes AS c', 'p.visit_id', 'c.visit_id')
    .join('common.doctors AS dd', 'p.doctor_id', 'dd.doctor_id')
    .leftJoin('registration.FORM_ROUTE AS FR', 'm.FORM_DESCRIPTION', 'FR.FORM')
    .leftJoin('prescripted_amount_unit AS u', 'p.dose_unit', 'u.unit_id')
    .leftJoin('ODS.RX_MEDICINE_DIRECTION AS d', 'p.freq', 'd.code')
    .where('p.mr#', params.mrno)
    .andWhere('p.isactive', 'Y')
    .orderBy('c.entry_date', 'desc')
    .orderBy('m.medication', 'asc')
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        throw err;
      }
    );
  return result;
};

Patient.checkPatientMedicines = async (medicine = {}, visit = {}) => {
  const result = knex.select('t.medicine_code')
    .from({
      t: 'registration.medicine_prescription'
    })
    .where('t.isactive', 'Y')
    .andWhere('t.visit_id', visit.visit_id)
    .andWhere('t.medicine_code', medicine.medicine_code)
    .first()
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        throw err;
      }
    );
  return result;
};

Patient.checkPatientNonFormularyMedicines = async (medicine = {}, visit = {}) => {
  const result = knex.select('t.medicine')
    .from({
      t: 'registration.medicine_prescription'
    })
    .where('t.isactive', 'Y')
    .andWhere('t.visit_id', visit.visit_id)
    .whereNull('t.medicine_code')
    .andWhere(knex.raw('UPPER(TRIM(t.medicine))'), medicine.medication.toUpperCase().trim())
    .first()
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        throw err;
      }
    );
  return result;
};

/**************************************** Allergy ******************************************/

Patient.getPatientAllergies = async (params = {}) => {
  const result = await knex.with('g', (qb) => {
    qb.select(`t.mrno`, knex.raw(`CASE WHEN t.gen_code IS NOT NULL THEN 'Generic' WHEN t.sub_class_code IS NOT NULL THEN 'Sub Class' END AS type`), knex.raw(`NVL(g.generic, c.subclassname) AS generic`), knex.raw(`NVL(g.code, t.sub_class_code) AS code`), `t.allergy_level`, `t.tran_date`)
      .from({
        t: 'pharmacy_shifa.class_alergy'
      })
      .leftJoin('pharmacy_shifa.generic AS g', 't.gen_code', 'g.code')
      .leftJoin('pharmacy_shifa.classsub AS c', 't.sub_class_code', 'c.subclassid')
      .where('t.mrno', params.mrno)
      .andWhere('t.active', 'Y')
  }).with('b', (qb) => {
    qb.select(`t.mr_no AS mrno`, knex.raw(`'Brand' AS type`), 'b.medicine_name AS generic', 't.medicine_code AS code', `t.allergy_level`, `t.entry_date AS tran_date`)
      .from({
        t: 'registration.moar_drug_brand_allergy'
      })
      .join('pharmacy_shifa.brand_allergy AS b', 't.medicine_code', 'b.medicine_code')
      .where('t.mr_no', params.mrno)
      .andWhere('t.is_valid', 'Y')
  }).select('*')
    .from('g')
    .unionAll([
      knex.select('*').from('b')
    ])
    .orderBy(6, 'desc')
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        throw err;
      }
    );
  return result;
};

Patient.allergyClassSubClass = async (params = {}) => {
  const result = await knex.select('cs.subclassid', 'cs.subclassname', 'cs.classid')
    .from({
      t: 'pharmacy_shifa.generic'
    })
    .join('pharmacy_shifa.classsub AS cs', 't.subclassid', 'cs.subclassid')
    .where('t.code', params.allergyCode)
    .andWhere('t.class_allergy', 'Y')
    .first()
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        throw err;
      }
    );
  return result;
};

Patient.checkPatientBrandAllergies = async (allergy = {}, visit = {},) => {
  const result = await knex.select('t.mr_no AS mrno', 't.medicine_code AS code')
    .from({
      t: 'REGISTRATION.MOAR_DRUG_BRAND_ALLERGY'
    })
    .where('t.mr_no', visit.mrno)
    .andWhere('t.medicine_code', allergy.allergyCode)
    .andWhere('t.is_valid', 'Y')
    .first()
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        throw err;
      }
    );
  return result;
};

Patient.checkPatientGenericAllergies = async (allergy = {}) => {
  const result = await knex.select('t.MRNO', knex.raw('NVL(t.Gen_Code, t.SUB_CLASS_CODE) AS code'))
    .from({
      t: 'pharmacy_shifa.class_alergy'
    })
    .where('t.MRNO', allergy.mrno)
    .andWhere('t.Active', 'Y')
    .modify(function (qb) {
      if (h.checkExistsNotEmpty(allergy, 'sub_class_code')) {
        qb.where(function () {
          this.where('t.SUB_CLASS_CODE', allergy.sub_class_code).orWhere('t.CLASS_CODE', allergy.class_code)
        });
      }
      if (h.checkExistsNotEmpty(allergy, 'gen_code')) {
        qb.where('t.gen_code', allergy.gen_code);
      }
    })
    .first()
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        throw err;
      }
    );
  return result;
};

Patient.checkPatientNKDA = async (params = {}) => {
  const result = await knex.select('t.MRNO', 't.active')
    .from({
      t: 'registration.tbl_nkda'
    })
    .where('t.MRNO', params.mrno)
    .andWhere(knex.raw('trim(t.description)'), 'NKDA')
    .first()
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        throw err;
      }
    );
  return result;
};

/**************************************** Message Template *********************************/

Patient.patientVisitMesssageTemplate = async (params = {}) => {
  const result = await knex.select(knex.raw("regexp_replace(INITCAP(TRIM(P.FIRST_NAME||' '||P.LAST_NAME||' '||P.THIRD_NAME)), ' +', ' ') patient"), knex.raw(`TRIM(d.consultant) AS consultant, TO_CHAR(t.entry_date, 'DD-MM-YYYY') AS vdate`))
    .from({
      t: 'registration.const_notes'
    })
    .join('registration.patients AS p', 't.mr#', 'p.mr#')
    .join('doctors AS d', 't.doctor_id', 'd.doctor_id')
    .where('t.visit_id', params.visit_id)
    .first()
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        throw err;
      }
    );
  return result;
};

/**************************************** Message Template *********************************/

Patient.radiologyReportURI = async (params = {}) => {
  let result = await knex.raw("BEGIN EMRNEXTGEN.EMRNEXTGEN_PKG.radiology_reports(?, ?, ?, ?, ?, ?); END;",
    [
      { "dir": oracledb.BIND_IN, "type": oracledb.STRING, "val": params.test_code },
      { "dir": oracledb.BIND_IN, "type": oracledb.STRING, "val": params.test_status },
      { "dir": oracledb.BIND_IN, "type": oracledb.STRING, "val": params.ip },
      { "dir": oracledb.BIND_IN, "type": oracledb.STRING, "val": process.env.DIAGNOSTIC_REPORT_DB_AUTH },
      { "dir": oracledb.BIND_IN, "type": oracledb.STRING, "val": process.env.DIAGNOSTIC_REPORT_SERVER_URL + '/sihapp/radiology/reports/' },
      { "dir": oracledb.BIND_OUT, "type": oracledb.STRING, "maxSize": 2000 }
    ])
    .then(res => {
      let r = res.shift();
      return r;
    },
      err => {
        throw err;
      }
    );
  return result;
};

Patient.labReportURI = async (params = {}) => {
  const auth = process.env.DIAGNOSTIC_REPORT_DB_AUTH;
  const url = process.env.DIAGNOSTIC_REPORT_SERVER_URL + '/sihapp/lab/reports/';
  let result = await knex.raw(`BEGIN EMRNEXTGEN.EMRNEXTGEN_PKG.lab_reports('${params.test_code}', '${params.test_labno}', '${params.test_specimenno}', TO_DATE('${params.test_specimendate}','YYYY-MM-DD HH24:MI:ss'), '${params.ip}', '${params.userid}', '${params.test_mrno}', '${auth}', ?, ?); END;`,
    [
      { "dir": oracledb.BIND_IN, "type": oracledb.STRING, "val": url },
      { "dir": oracledb.BIND_OUT, "type": oracledb.STRING, "maxSize": 2000 }
    ])
    .then(res => {
      let r = res.shift();
      return r;
    },
      err => {
        throw err;
      }
    );
  return result;
};

module.exports = Patient;