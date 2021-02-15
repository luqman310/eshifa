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

const knex = require("./../config/knex");
const h = require("./../utils/helper");

const User = {};

User.getUsersCount = async (params = {}, user = {}) => {
  const result = knex.count('t.username as total')
    .from({
      t: 'cdr.api_users'
    })
    .join('registration.api_roles AS r', 't.IDROLE', 'r.IDROLE')
    .join('cdr.professions AS p', 't.professionid', 'p.professionid')
    .join('cdr.assign_users AS u', 't.username', 'u.username')
    .join('cdr.clinics AS c', 'u.clinicid', 'c.clinicid')
    .modify(function (qb) {
      // if (h.exists(params.email)) {
      //   qb.where(knex.raw('LOWER(t.email)'), params.email.toLowerCase());
      //   qb.orWhere(knex.raw('LOWER(t.username)'), params.email.toLowerCase());
      // }
      // if (h.exists(params.EMAIL)) {
      //   qb.where(knex.raw('LOWER(t.email)'), params.EMAIL.toLowerCase());
      //   qb.orWhere(knex.raw('LOWER(t.username)'), params.EMAIL.toLowerCase());
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

User.getUsers = async (params = {}, user = {}) => {
  const result = await knex.select('t.email', 't.username', 't.professionid', 't.empid', 't.doctor_id', 'p.profession', 'r.name AS rolename', 'r.slug AS role', 'c.clinicid', 'c.clinic')
    .from({
      t: 'cdr.api_users'
    })
    .join('registration.api_roles AS r', 't.IDROLE', 'r.IDROLE')
    .join('cdr.professions AS p', 't.professionid', 'p.professionid')
    .join('cdr.assign_users AS u', 't.username', 'u.username')
    .join('cdr.clinics AS c', 'u.clinicid', 'c.clinicid')
    .modify(function (qb) {
      // if (h.exists(params.email)) {
      //   qb.where(knex.raw('LOWER(t.email)'), params.email.toLowerCase());
      //   qb.orWhere(knex.raw('LOWER(t.username)'), params.email.toLowerCase());
      // }
      // if (h.exists(params.EMAIL)) {
      //   qb.where(knex.raw('LOWER(t.email)'), params.EMAIL.toLowerCase());
      //   qb.orWhere(knex.raw('LOWER(t.username)'), params.EMAIL.toLowerCase());
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

User.getSingleUser = async (params, user) => {
  const result = await knex.select('t.password', 't.email', 't.username', 't.professionid', 't.empid', 't.doctor_id', 'p.profession', 'r.name AS rolename', 'r.slug AS role', 'c.clinicid', 'c.clinic')
    .from({
      t: 'cdr.api_users'
    })
    .join('registration.api_roles AS r', 't.IDROLE', 'r.IDROLE')
    .join('cdr.professions AS p', 't.professionid', 'p.professionid')
    .join('cdr.assign_users AS u', 't.username', 'u.username')
    .join('cdr.clinics AS c', 'u.clinicid', 'c.clinicid')
    .modify(function (qb) {
      if (h.checkExistsNotEmpty(params, 'email')) {
        qb.where(knex.raw('TRIM(LOWER(t.email))'), params.email.toLowerCase().trim());
        qb.orWhere(knex.raw('TRIM(LOWER(t.username))'), params.email.toLowerCase().trim());
      } else if (h.checkExistsNotEmpty(params, 'username')) {
        qb.where(knex.raw('TRIM(LOWER(t.email))'), params.username.toLowerCase().trim());
        qb.orWhere(knex.raw('TRIM(LOWER(t.username))'), params.username.toLowerCase().trim());
      } else if (h.checkExistsNotEmpty(params, 'EMAIL')) {
        qb.where(knex.raw('TRIM(LOWER(t.email))'), params.EMAIL.toLowerCase().trim());
        qb.orWhere(knex.raw('TRIM(LOWER(t.username))'), params.EMAIL.toLowerCase().trim());
      } else {
        qb.where(knex.raw('TRIM(LOWER(t.username))'), user.username.toLowerCase().trim());
      }
    })
    .first()
    // .toString()
    // console.log(result);
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

User.getEmployeeDoctorName = async (params, user) => {
  const result = await knex.select('e.name')
    .from({
      t: 'cdr.api_users'
    })
    .modify(function (qb) {
      if (h.checkExistsNotEmpty(params, 'doctor_id') && params.role === 'dr') {
        qb.join(function () {
          this.select(knex.raw('distinct t.doctor_id'), knex.raw("regexp_replace(INITCAP(TRIM(t.D_SURNAME||' '||t.consultant)), ' +', ' ') name"))
            .from({
              t: 'common.doctors'
            })
            .as('e')
        }, 't.doctor_id', 'e.doctor_id')
      } else if (h.checkExistsNotEmpty(params, 'empid') && params.role !== 'dr') {
        qb.join('hrds.employee_list_working AS e', 't.empid', 'e.emp_id')
      } else {
        qb.join(function () {
          this.select(knex.raw(`'${params.username}' AS name`))
            .from({
              t: 'dual'
            }).as('e')
        }, 't.username', 'e.name')
      }
    })
    .where('t.username', params.username)
    .andWhere('t.status', 1)
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

User.getProfilePicture = async (params) => {
  const result = await knex.select('t.photo')
    .modify(function (qb) {
      if (h.checkExistsNotEmpty(params, 'doctor_id') && params.role === 'dr') {
        qb.from({
          t: 'hrds.consultant_info'
        })
          .where('t.consultant_id', params.doctor_id)
      } else if (h.checkExistsNotEmpty(params, 'empid') && params.role !== 'dr') {
        qb.from({
          t: 'hrds.employee_profile'
        })
          .where('t.emp_id', params.empid)
      }
    })
    .first()
    // .toString()
    // console.log(result);
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

User.functionName = async (params) => {
  // return result;
};

module.exports = User;