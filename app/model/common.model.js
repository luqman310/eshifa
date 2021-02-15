/**
 * @Name common.model.js
 *
 * @Description Common Queries on different Tables.
 *
 * @package
 * @subpackage
 * @author Suhaib <muhammad.suhaib@shifa.com.pk>
 * @Created on Jaqnuary 25, 2020
 */

const knex = require("./../config/knex");
const h = require("./../utils/helper");
const oracledb = require('oracledb');

const Common = {};

Common.query = async (q) => {
  try {
    const start = Date.now();
    const query = await db.query(q);
    const executionTime = Date.now() - start;
    h.log(`Raw Query Executed in ${executionTime}ms`);
    return query;
  } catch (e) {
    throw e;
  }
};

Common.insert = async (params, table, sess_user) => {
  // const inserted = await knex(table).returning('*').insert(params).toString();
  // console.log(inserted);
  const inserted = await knex(table).returning('*').insert(params).catch(err => {
    throw err;
  });
  return h.objectKeysToLowerCase(inserted);
};

Common.update = async (params, table, where, sess_user) => {
  const updated = await knex(table).returning().where(where).update(params).catch(err => {
    throw err;
  });
  return h.objectKeysToLowerCase(updated);
};

Common.delete = async (table, where, sess_user) => {
  const deleted = await knex(table).where(where).del().catch(err => {
    throw err;
  });
  return h.objectKeysToLowerCase(deleted);
};

Common.getEntities = async (params = {}) => {
  try {
    const result = knex.select()
      .from('common.web_patient_profile')
      .where('mr#', '19510995')
      .then(res => {
        return h.objectKeysToLowerCase(res);
      },
        err => {
          h.error(err);
        }
      );
    return result;
  } catch (error) {
    throw error;
  }
};

Common.getMedicines = async (params = {}) => {
  const result = knex.select('m.MEDICATION', 'm.generic', 'm.medicine_code', 'FR.ROUTE', 'FR.DOSAGE', 'm.unit', 'M.FORM_DESCRIPTION', 'm.price', 'gen_code')
    .from({
      m: 'registration.medicine'
    })
    // .leftJoin('registration.FORM_ROUTE AS FR', function () {
    //   this.on('m.FORM_DESCRIPTION', '=', 'FR.FORM');
    // })
    .leftJoin('registration.FORM_ROUTE AS FR', 'm.FORM_DESCRIPTION', 'FR.FORM')
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

Common.getVitals = async (params = {}) => {
  const result = knex.select()
    .from({
      v: 'REGISTRATION.VITAL_L'
    })
    .modify(function (qb) {
      if (h.exists(params.vital_id)) {
        qb.where('v.vital_id', params.vital_id);
      }
    })
    .then(res => {
      // return res;
      return h.objectKeysToLowerCase(res);
    },
      err => {
        h.error(err);
        throw err;
      }
    );
  return result;
};

Common.getVisitVitals = async (params = {}) => {
  const result = knex.select('v.mr# as mrno', 'v.vital_id', 'v.vital_sign', 'v.unit', 'v.result', 'v.visit_id', 'v.spec_id')
    .from({
      v: 'ods.emr_vital_signs'
    })
    .where('v.vital_counter', 1)
    .modify(function (qb) {
      if (h.exists(params.visit_id)) {
        qb.where('v.visit_id', params.visit_id);
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

Common.getPatientVisitVitalsAndDefinitions = async (params = {}) => {
  const result = knex.with('d', knex.raw("SELECT vl.vital_id, vl.description label, VS.UNIT, vs.sp_id speciality_id, vs.value_type, vs.min_val, vs.max_val, vs.range_l range_lower, vs.range_u range_upper, VS.VALUE_RANGE, vs.o FROM registration.VITAL_L vl JOIN registration.vital_sp vs ON vl.vital_id = vs.vital_id JOIN COMMON.DOCTORS d ON vs.sp_id = D.PRIMARY_SPECIALITY_ID WHERE ISACTIVE = ? AND d.doctor_id = ?", ['T', params.doctor_id]))
    .with('v', knex.raw("select cn.mr# mrno, v.vital_id, vs.result, vs.visit_id, count(vs.visit_id) OVER(PARTITION BY vs.mr, vs.visit_id, vs.vital_id ORDER BY vs.enter_at desc RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) vital_counter from registration.vital_signs vs JOIN registration.vital_l v ON vs.vital_id = v.vital_id JOIN registration.const_notes cn ON vs.visit_id = cn.visit_id where vs.visit_type = ? AND vs.visit_id = ?", ['O', params.visit_id]))
    .select('d.vital_id', 'd.label', 'd.UNIT', 'd.speciality_id', 'd.value_type', 'd.min_val', 'd.max_val', 'd.range_lower', 'd.range_upper', 'd.VALUE_RANGE', 'v.mrno', 'v.visit_id', 'v.result')
    .from('d')
    .leftJoin('v', function () {
      this.on('d.vital_id', '=', 'v.vital_id').andOn('v.vital_counter', '=', 1)
    })
    .orderBy('d.o', 'asc')
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

Common.getDoctors = async (params = {}, sess_user = {}) => {
  const result = knex.select(knex.raw("distinct initcap(D.FIRST_NAME || ' ' || D.LAST_NAME) || ' (' || s.speciality_name || ')' name, d.doctor_id"))
    .from({
      d: 'COMMON.DOCTORS'
    })
    .join('COMMON.SPECIALITIES AS S', 'S.SPECIALITY_ID', 'D.PRIMARY_SPECIALITY_ID')
    // .join('TBL_DEPARTMENTS AS DP', 'DP.SP_ID', 'D.PRIMARY_SPECIALITY_ID')
    .modify(function (qb) {
      if (h.checkExistsNotEmpty(sess_user, 'role') && sess_user.role !== 'dr') {
        qb.join('cdr.API_USERs AS u', 'd.doctor_id', 'u.doctor_id')
        qb.join('cdr.assign_users AS a', 'u.username', 'a.username')
        qb.join('cdr.clinics AS c', 'a.clinicid', 'c.clinicid')
        qb.where('c.clinicid', sess_user.clinicid)
      }
      if (h.checkExistsNotEmpty(sess_user, 'role') && sess_user.role === 'dr') {
      }
    })
    .where('D.DOCTOR_STATUS', 'T')
    // .andWhere('DP.PK_INT_DEPT_ID', knex.ref("DP.PK_INT_DEPT_ID"))
    .orderBy('name', 'asc')
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

Common.getDoctorVitals = async (doctor_id) => {
  const result = knex.select("v.*")
    .from({
      v: 'registration.vital_spec'
    })
    .join('COMMON.DOCTORS AS d', 'v.sp_id', 'D.PRIMARY_SPECIALITY_ID')
    .where('d.doctor_id', doctor_id)
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

Common.isValidVisitID = async (visit_id) => {
  const result = knex.select("cn.VISIT_ID", "cn.MR# AS mrno", "cn.doctor_id", "cn.pc", "cn.impression", "cn.plan AS management_plan", "cn.objective AS physical_examination", "cn.note AS clinical_details", "D.PRIMARY_SPECIALITY_ID AS spec_id", knex.raw("TO_CHAR(cn.followup, 'YYYY-MM-DD') AS followup"), knex.raw("TO_CHAR(NVL(cn.visit_date, sysdate), 'YYYY-MM-DD HH24:MI:ss') AS visit_date"), knex.raw("TO_CHAR(cn.entry_date, 'Dy, Mon DD, YYYY') AS entry_date"), "cn.home_services", "cn.other_instruction", "cn.followup_d", "cn.followup_unit")
    .from({
      cn: 'registration.const_notes'
    })
    .join('COMMON.DOCTORS AS d', "cn.doctor_id", "d.doctor_id")
    .where('cn.visit_id', visit_id)
    .andWhere('cn.isactive', 'Y')
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

Common.hasVisitedToday = async (mrno, doctor_id) => {
  const result = knex.select(knex.raw("COUNT(VISIT_ID) AS today_visits"))
    .from({
      cn: 'registration.const_notes'
    })
    .join('doctors AS D', 'CN.DOCTOR_ID', 'D.DOCTOR_ID')
    .where('MR#', mrno)
    .andWhere('cn.isactive', 'Y')
    .andWhere(knex.raw('TRUNC(cn.Entry_Date) = TRUNC(sysdate)'))
    .andWhere('D.DOCTOR_ID', doctor_id)
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

Common.hasConfirmVisitToday = async (visit_id) => {
  const result = knex.select(knex.raw("COUNT(VISIT_ID) AS today_visits, cn.mr# as mrno"))
    .from({
      cn: 'registration.const_notes'
    })
    .where('cn.visit_id', visit_id)
    .andWhere('cn.isactive', 'Y')
    .andWhere(knex.raw('TRUNC(cn.Entry_Date) = TRUNC(sysdate)'))
    .first()
    .groupBy('cn.mr#')
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

Common.vitalsOfCurrentVisit = async (visit_id) => {
  const result = knex.select(knex.raw("COUNT(VISIT_ID) AS vitals"))
    .from({
      vs: 'registration.VITAL_SIGNS'
    })
    .where('vs.visit_id', visit_id)
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

Common.getToken = async (params = {}) => {
  const result = knex.select(knex.raw("EMR.get_token#(?) AS token_no", [params.doctor_id]))
    .from({
      cn: 'dual'
    })
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

Common.getVisitID = async (params = {}) => {

  let result = await knex.raw("BEGIN	? := REGISTRATION.GET_VISITID; END;", [{
    "dir": oracledb.BIND_OUT,
    "type": oracledb.STRING
  }])
    .then(res => {
      if (h.isArray(res)) {
        return res[0];
      } else {
        return false;
      }
    },
      err => {
        h.error(err);
        throw err;
      }
    );
  return result;
};

Common.getPatients = async (params = {}) => {
  const result = knex.select('a.mr#', 'a.name', 'a.pc', knex.raw("TO_CHAR(a.entry_date, 'DD-MM-YYYY') AS appointment_date"), 'a.visit_id', 'a.doctor_id', 'a.entered_at', 'a.visit_date', 'a.apt_time', 'a.visit_type', 'a.visit_status', 'a.close_visit', 'a.note', 'a.viewed', 'a.token#', 'a.gender', 'a.paytime', 'a.fname', 'a.lname', 'a.tname', 'a.followup_d', 'a.visit_type1', 'a.visit_status1', 'a.age')
    .from({
      a: 'REGISTRATION.PENDING_PAT1'
    })
    .where('a.DOCTOR_ID', params.doctor_id)
    .andWhere(knex.raw("TRUNC(a.ENTRY_DATE) = TRUNC(TO_DATE(?, 'YYYY-MM-DD'))", [params.app_date]))
    .modify(function (qb) {
      // if (h.exists(params.doctor_id)) {
      //   qb.where('v.DOCTOR_ID', params.doctor_id);
      // }
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

Common.getPatientLegends = async (params = {}) => {

  const result = knex.select(knex.raw("count(CASE WHEN A.VISIT_TYPE = 'Apt' THEN 1 END) AS appointed, count(CASE WHEN A.VISIT_TYPE = 'Wlk' THEN 1 END) AS walkin, count(CASE WHEN A.visit_status = 'Fup' THEN 1 END) AS followup, count(CASE WHEN A.visit_status = 'Rev Rep' THEN 1 END) AS review_report, count(CASE WHEN A.visit_status = 'Nw' THEN 1 END) AS new, count(CASE WHEN A.GENDER = 'M' THEN 1 END) AS male, count(CASE WHEN A.GENDER = 'F' THEN 1 END) AS female"))
    .from({
      a: 'REGISTRATION.PENDING_PAT1'
    })
    .first()
    .where('a.DOCTOR_ID', params.doctor_id)
    .andWhere(knex.raw("TRUNC(a.ENTRY_DATE) = TRUNC(TO_DATE(?, 'YYYY-MM-DD'))", [params.app_date]))
    .modify(function (qb) {
      // if (h.exists(params.doctor_id)) {
      //   qb.where('v.DOCTOR_ID', params.doctor_id);
      // }
    })
    // .toString();
    .orderBy('name', 'asc')
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

Common.getPatientDemographics = async (params = {}) => {
  const result = knex.select('p.mr#', 'p.patient_full_name', 'p.RELATION', 'p.FATHER_HASBAND', 'p.patient_gender', 'p.CNIC', 'p.cell_number', 'p.EMAIL', 'p.PATIENT_MARITAL_STATUS', 'p.dob', 'p.country', 'p.province_state', 'p.city', 'p.ADDRESS', 'p.reg_date', 'p.Blood_Group', 'p.PRIMARY_language', 'p.RELIGION', 'p.SITE_ID', knex.raw("ods.pkg_date_time.calculate_time(P_START_DATE => SYSDATE, P_END_DATE => p.dob, P_RETURN => 'YY') AGE"), knex.raw("regexp_replace(INITCAP(TRIM(pt.FIRST_NAME||' '||pt.LAST_NAME||' '||pt.THIRD_NAME)), ' +', ' ') name"))
    .from({
      p: 'ODS.EMR_PATIENT_DEMOGRAPHICS'
    })
    .join('patients AS pt', 'p.mr#', 'pt.mr#')
    .where('p.MR#', `${params.mr_no.toUpperCase()}`)
    .modify(function (qb) {
      // if (h.exists(params.doctor_id)) {
      //   qb.where('v.DOCTOR_ID', params.doctor_id);
      // }
    })
    .first()
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

Common.getPatientAppointment = async (params = {}) => {
  const result = knex.select('p.*', knex.raw("TO_CHAR (TRUNC (SYSDATE) + NUMTODSINTERVAL (p.apt_time, 'second'), 'hh24:mi') AS apt_time_encoded"))
    .from({
      p: 'REGISTRATION.APPTFILE'
    })
    .modify(function (qb) {
      if (h.exists(params.apt_no)) {
        qb.where('p.APPOINTMENT#', params.apt_no);
      } else {
        if (h.exists(params.doctor_id)) {
          qb.where('p.DOCTOR_ID', params.doctor_id);
        }
        if (h.exists(params.mr_no)) {
          qb.where('p.MRNO', params.mr_no);
        }
      }
    })
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

Common.doctorExists = async (doctor_id) => {
  const result = knex.select('D.DOCTOR_ID', 'D.PRIMARY_SPECIALITY_ID AS sp_id')
    .from({
      d: 'COMMON.DOCTORS'
    })
    .join('COMMON.SPECIALITIES AS S', 'S.SPECIALITY_ID', 'D.PRIMARY_SPECIALITY_ID')
    // .join('TBL_DEPARTMENTS AS DP', 'DP.SP_ID', 'D.PRIMARY_SPECIALITY_ID')
    .where('D.DOCTOR_STATUS', 'T')
    // .andWhere('DP.PK_INT_DEPT_ID', knex.ref("DP.PK_INT_DEPT_ID"))
    .andWhere('D.DOCTOR_ID', doctor_id)
    .first()
    .modify(function (qb) {
      // if (h.exists(params.vital_id)) {
      //   qb.where('v.vital_id', params.vital_id);
      // }
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

Common.patientExists = async (mr_no) => {
  const result = knex.select('p.mr# AS mrno')
    .from({
      p: 'registration.patients'
    })
    .where('p.mr#', mr_no)
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

Common.getPresentingComplaintTemplate = async (params = {}) => {
  const result = knex.select('ROWID AS id', 's.symptoms AS presenting_complaint')
    .from({
      s: 'registration.symptoms'
    })
    .whereNotNull('s.symptoms')
    .orderBy('s.Date_entered', 'desc')
    .limit(25)
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

Common.getPatientVitalHistory = async (params = {}) => {
  const result = knex.select(knex.raw("to_char(h.enter_at, 'Dy, Mon DD, YYYY HH:MI AM') AS enter_at"), 'h.BP_SYS', 'h.BP_DIA', 'h.weight', 'h.height', 'h.TEMP', 'h.RR', 'h.PULSE', 'h.temp_loc', 'h.SPO2', 'h.Pain_Scale', 'h.GlocoCheck', 'h.LMP', 'h.Head_Circumf', 'h.GCS', 'h.BSA', 'h.Response', 'h.Fall_risk', 'h.BMI', 'h.Sup_Oxygen')
    .from({
      h: 'ods.emr_vital_signs_summary'
    })
    .where('h.mr#', params.mr_no)
    .orderBy('h.vital_counter', 'desc')
    .limit(5)
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

Common.getDoctorReport = async (params = {}) => {
  const result = await knex.select('t.doctor_id', 't.prescription')
    .from({
      t: 'EMR.DOCTOR_PRESCRIPTION'
    })
    .where('t.doctor_id', params.doctor_id)
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

Common.getExternalLinks = async (params = {}) => {
  const result = await knex.select('t.*')
    .from({
      t: 'registration.external_links'
    })
    .where('t.status', 1)
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

Common.getPrescriptionSettings = async (params = {}) => {
  const result = await knex.select('t.*')
    .from({
      t: 'emr.doctor_prescription'
    })
    .where('t.doctor_id', params.doctor_id)
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

Common.getReportParams = async (type) => {
  let result = await knex.raw("BEGIN get_report_param(?, ?, ?, ?, ?, ?); END;",
    [
      { "dir": oracledb.BIND_IN, "type": oracledb.STRING, "val": type },
      { "dir": oracledb.BIND_OUT, "type": oracledb.STRING },
      { "dir": oracledb.BIND_OUT, "type": oracledb.STRING },
      { "dir": oracledb.BIND_OUT, "type": oracledb.STRING },
      { "dir": oracledb.BIND_IN, "type": oracledb.STRING, "val": process.env.DIAGNOSTIC_REPORT_SERVER_URL },
      { "dir": oracledb.BIND_IN, "type": oracledb.STRING, "val": 'windo' }
    ])
    .then(res => {
      let r = h.object(['path', 'os_path', 'rep_name'], res);
      return r;
    },
      err => {
        throw err;
      }
    );
  return result;
};

module.exports = Common;