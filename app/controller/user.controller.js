/**
 * @Name user.controller.js
 *
 * @Description User Operations
 *
 * @package
 * @subpackage
 * @author Suhaib <muhammad.suhaib@shifa.com.pk>
 * @Created on Feb 04, 2020
 */

const User = require('../model/user.model');
const Common = require("./../model/common.model");
const EmailService = require('../services/email.service');
const request = require('request');
const h = require("../utils/helper");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');

const UserController = {};

UserController.getUsers = async (req, res) => {
  try {
    filter = h.getProps2(req);
    let [total] = await User.getUsersCount(filter, req.user);
    let users = await User.getUsers(filter, req.user);
    const result = {
      recordsTotal: total,
      data: users
    };
    return res.status(200).send(result);
  } catch (e) {
    h.error(e)
  }
};

UserController.getUserByID = async (req, res) => {
  try {
    let result = await User.getUserByID(req.params, req.user);
    for (let r of result) {
      delete r.iduser;
      delete r.password;
      delete r.name;
      delete r.office;
      delete r.section;
      delete r.slug;
      delete r.organization;
      delete r.role;
      r.path = 'static/avatars/';
      // if (!h.isEmpty(r.image)) {
      // }
    }
    return res.status(200).send(result);
  } catch (e) {
    h.error(e)
  }
};

UserController.login = async (req, res) => {
  let code = 500,
    message = "Error Logging in",
    token = '';
  try {
    let rows = await User.getSingleUser(req.body);
    if (!h.exists(rows)) {
      code = 400;
      message = 'Email is incorrect';
    } else {
      const user = await User.getEmployeeDoctorName(rows);
      const photo = await User.getProfilePicture(rows);
      if (h.checkExistsNotEmpty(user, 'name')) {
        rows = { ...rows, ...user };
      }
      const password = req.body.password;
      const hash = rows.password;
      const doesMatch = await bcrypt.compare(password, hash);
      if (doesMatch) {
        const userObject = getUserObject(rows);
        // sign jwt Token
        token = getToken(userObject, photo);
        token
        code = 200;
        message = 'Log in successful';
      } else {
        code = 400;
        message = 'Password is incorrect';
      }
    }
  } catch (e) {
    throw e;
  } finally {
    res.status(code).send({
      message: message,
      token: token
    });
  }
};

UserController.log = async (req, res) => {
  let code = 500,
    message = "Error Logging in",
    token = '';
  try {
    const data = h.getProps2(req)
    let rows = await User.getSingleUser(data);
    if (!h.exists(rows)) {
      code = 400;
      message = 'Email is incorrect';
    } else {
      const user = await User.getEmployeeDoctorName(rows);
      if (h.checkExistsNotEmpty(user, 'name')) {
        rows = { ...rows, ...user };
      }
      const userObject = getUserObject(rows);
      // sign jwt Token
      token = getToken(userObject);
      code = 200;
      message = 'Log in successful';
    }
  } catch (e) {
    throw e;
  } finally {
    res.status(code).send({
      message: message,
      token: token
    });
  }
};

UserController.logout = async (req, res) => {
  let code = 500;
  let message = 'Error! Logging out.';
  try {
    // Session Logging
    // const log = await Common.logActivity(req, req.user.iduser, 2, req.user.idsession);
    // if (log != false) {
    code = 200;
    message = 'Log out successful.';
    // }
  } catch (e) {
    h.error(e);
  } finally {
    return res.status(code).send({
      message: message
    });
  }
};

UserController.AuthCheck = async (req, res) => {
  let code = 500,
    message = "Error! Bad Request",
    returnObj = {};
  try {
    code = 200;
    returnObj = h.resultObject(req.user, true, code);
  } catch (e) {
    returnObj = h.resultObject([], false, code, message);
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};

UserController.addUser = async (req, res) => {
  const password = req.body.password;
  try {
    const user = await User.getSingleUser(req.body);
    if (user.length === 0) {
      try {
        bcrypt.hash(password, 10, async (err, bcryptedPassword) => {
          // INSERT
          req.body.password = bcryptedPassword;
          // req.body.createdby = req.user.iduser;
          const result = await Common.insert(req.body, 'cdr.API_USERS', req.user);
          delete result[0].password;
          const message = 'User added successfully';
          res.status(200).send({
            result: result[0],
            message: message
          });
        });
      } catch (e) {
        h.error(e)
        res.status(400).send({
          message: 'Registration unsuccessful!'
        });
      }
    } else {
      res.status(409).send({
        message: 'This email already exists'
      });
    }
  } catch (e) {
    h.error(e)
    res.status(400).send({
      message: 'Error in user registration'
    });
  }
};

UserController.changePassword = async (req, res) => {
  try {
    let rows = await User.getSingleUser({}, req.user);
    if (rows.length === 0) {
      res.status(500).send({
        message: 'Email is incorrect'
      });
    } else if (rows.length > 1) {
      res.status(500).send({
        message: 'This user does not exists'
      });
    } else {
      let password = req.body.oldpassword;
      const hash = rows.password;
      bcrypt.compare(password, hash, (err, doesMatch) => {
        if (doesMatch) {
          password = req.body.newpassword;
          try {
            bcrypt.hash(password, 10, async (err, bcryptedPassword) => {
              let obj = {
                password: bcryptedPassword
              };
              // UPDATE
              const result = await Common.update(obj, 'cdr.API_USERS', { username: req.user.username }, req.user);
              const message = 'Password changed successfully';
              return res.status(200).send({
                message: message
              });
            });
          } catch (e) {
            h.error(e)
            return res.status(500).send({
              message: 'Password change unsuccessful!'
            });
          }
        } else {
          res.status(500).send({
            message: 'Old Password is incorrect'
          });
        }
      });
    }
  } catch (e) {
    h.error(e)
    return res.status(500).send({
      message: 'Error In Password change!'
    });
  }
};

UserController.forgotPassword = async (req, res) => {
  let code = 500,
    message = "Error In Forgot Password",
    returnObj = {};
  try {
    let filter = h.getProps2(req);
    if (h.checkExistsNotEmpty(filter, 'email')) {
      let rows = await User.getSingleUser(filter);
      if (h.checkExistsNotEmpty(rows, 'email')) {
        const pass = h.randomString2(16);
        try {
          bcryptedPassword = bcrypt.hashSync(pass, 10);
          let p = {
            email: rows.email,
            username: rows.username,
            password: pass
          }
          const result = await Common.update({ password: bcryptedPassword }, 'cdr.API_USERS', { email: rows.email, username: rows.username });
          await EmailService.sendForgotPasswordEmail(p);
          code = 200;
          returnObj = h.resultObject([], true, code, 'Please check your Email!');
        } catch (e) {
          returnObj = h.resultObject([], false, code, 'Password change unsuccessful');
          throw e;
        }
      } else {
        returnObj = h.resultObject([], false, code, 'Email is incorrect');
      }
    } else {
      returnObj = h.resultObject([], false, code, 'Please enter Email Address');
    }
  } catch (e) {
    returnObj = h.resultObject([], false, code, message);
    throw e;
  } finally {
    res.status(code).send(returnObj);
  }
};


UserController.functionName = async (req, res) => {
  // try {
  //   let result = await User.functionName();
  //   res.status(200).send(result);
  // } catch (e) {
  //   h.error(e);
  //   res.status(500).send({
  //     message: 'Error! Fetching data.'
  //   });
  // }
};

const getUserObject = user => {
  let obj = {
    email: user.email,
    username: user.username,
    professionid: user.professionid,
    profession: user.profession,
    empid: user.empid,
    rolename: user.rolename,
    role: user.role,
    clinicid: user.clinicid,
    clinic: user.clinic,
    name: user.name,
    photo: user.photo,
  }
  if (user.role === 'dr') {
    obj.doctor_id = user.doctor_id;
  }
  return obj;
}

const getToken = (userObject, photo) => {
  try {
    const token = jwt.sign({
      data: userObject
    }, process.env.JWT_SECRET, {
      expiresIn: '8h',
      algorithm: "RS256",
    });
    const resToken = {
      accessToken: token,
      data: { ...userObject, ...photo },
      ttl: '8h',
      createdAt: Date.now()
    }
    return resToken;
  } catch (e) {
    throw e;
  }
}

module.exports = UserController;