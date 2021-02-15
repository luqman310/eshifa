const h = require("./helper");
const knex = require("../config/knex");
const Common = require("../model/common.model");

const cms = {};

cms._clinicsDTO = (c) => {
  let obj = {
    ...{ clinic, status, hdept } = c,
    "userid": "EMRNEXTGEN",
    "user_name": "EMRNEXTGEN",
  }
  return obj;
}

cms._userDTO = (c) => {
  const o = { email, username, password, professionid, status, idrole, clinicid, user, emp_doctor_id } = c
  let _user = {
    ...{ email, username, password, professionid, status, idrole },
    "userid": "EMRNEXTGEN",
    "user_name": "EMRNEXTGEN",
  }
  user === 'E' ? _user['empid'] = emp_doctor_id : _user['doctor_id'] = emp_doctor_id;
  let _assign_user = {
    ...{ username, status, clinicid },
    "userid": "EMRNEXTGEN",
    "user_name": "EMRNEXTGEN",

  }
  return { user: _user, assign_user: _assign_user };
}

module.exports = cms;