/**
 * @Name cms.model.js
 *
 * @Description Clinic Management System Data.
 *
 * @package
 * @subpackage
 * @author Suhaib <muhammad.suhaib@shifa.com.pk>
 * @Created on November 03, 2020
 */

const knex = require("../config/knex");
const h = require("../utils/helper");

const CMS = {};


/**************************************** Clinics ******************************************/

CMS.getClinics = async (params = {}) => {
  const result = knex.select('d.*')
    .from({
      d: 'cdr.clinics'
    })
    .modify(function (qb) {
      if (h.exists(params.id)) {
        qb.where('d.clinicid', params.id).first();
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

/**************************************** Professions **************************************/

CMS.getProfessions = async (params = {}) => {
  const result = knex.select('d.*')
    .from({
      d: 'cdr.PROFESSIONS'
    })
    .modify(function (qb) {
      if (h.exists(params.id)) {
        qb.where('d.professionid', params.id).first();
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

/**************************************** Departments **************************************/

CMS.getDepartments = async (params = {}) => {
  const result = knex.select('d.*')
    .from({
      d: 'cdr.HOSPITAL_DEPARTMENTS'
    })
    .modify(function (qb) {
      if (h.exists(params.id)) {
        qb.where('d.hdeptid', params.id).first();
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

/**************************************** Users ********************************************/

CMS.getUsers = async (params = {}) => {
  const result = knex.select('d.*', 'u.clinicid')
    .from({
      d: 'cdr.api_users'
    })
    .leftJoin('cdr.assign_users AS u', 'd.username', 'u.username')
    .modify(function (qb) {
      if (h.exists(params.id)) {
        // qb.where('d.clinicid', params.id);
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

/**************************************** Users ********************************************/

CMS.getRoles = async (params = {}) => {
  const result = knex.select('d.*')
    .from({
      d: 'registration.api_roles'
    })
    .modify(function (qb) {
      if (h.exists(params.id)) {
        qb.where('d.idrole', params.id).first();
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

/**************************************** Epmloyee *****************************************/

CMS.getEmployee = async (params = {}) => {
  const result = knex.select('t.emp_id AS id', 't.name')
    .from({
      t: 'hrds.employee_list_working'
    })
    .where('t.emp_id', params.id)
    .modify(function (qb) {
    })
    .first()
    // .toString();
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        throw err;
      }
    );
  return result;
};

CMS.getConsultant = async (params = {}) => {
  const result = knex.select('t.doctor_id AS id', 't.consultant AS name')
    .from({
      t: 'common.doctors'
    })
    .where(knex.raw('LOWER(t.doctor_id)'), h.pad('00000000', params.id).toLowerCase())
    .modify(function (qb) {
    })
    .first()
    // .toString();
    .then(res => {
      return h.objectKeysToLowerCase(res);
    },
      err => {
        throw err;
      }
    );
  return result;
};


module.exports = CMS;