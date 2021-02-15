/**
 * @Name email-service.js
 *
 * @Description Emailimg Serivce.
 *
 * @package
 * @subpackage
 * @author Suhaib <muhammad.suhaib@shifa.com.pk>
 * @Created on January 29, 2021
 */

const e = require('express');
const nodemailer = require('nodemailer');
const h = require("./../utils/helper");

const EmailService = {};

let transporter = nodemailer.createTransport({
  host: process.env.EHOST,
  port: 587, // 465 or 587
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EPASS,
  },
});

EmailService.sendEmail = async (p) => {
  const mailOptions = {
    from: process.env.EMAIL, // sender address
    to: p.email, // list of receivers
    subject: p.subject, // Subject line
    html: p.body // Body line
  };
  console.log(mailOptions, transporter);
  try {
    let info = await transporter.sendMail(mailOptions);
  } catch (e) {
    throw e;
  }
};

EmailService.sendForgotPasswordEmail = async (p) => {
  let params = p;
  params.subject = 'Forgot Password';
  params.body = `<h3>Your New Password</h3>
  <table>
    <tr>
      <td>Email: </td>
      <td>${p.email}</td>
    </tr>
    <tr>
      <td>Username: </td>
      <td>${p.username}</td>
    </tr>
    <tr>
      <td>Password: </td>
      <td>${p.password}</td>
    </tr>
  </table>
  <p>Please change Password after login.</p>
  <p>Thanks.</p>`;

  try {
    await EmailService.sendEmail(params);
  } catch (e) {
    throw e;
  }
};

module.exports = EmailService;