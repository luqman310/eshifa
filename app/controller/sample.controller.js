/**
 * @Name sample.controller.js
 *
 * @Description Sample Operations
 *
 * @package
 * @subpackage
 * @author Suhaib <muhammad.suhaib@shifa.com.pk>
 * @Created on Month 25, 2020
 */

const request = require('request');
const h = require("../utils/helper");

const SampleController = {};

SampleController.functionName = async (req, res) => {
  // try {
  //   let result = await Common.getEntities();
  //   res.status(200).send(result);
  // } catch (e) {
  //   h.error(e);
  //   res.status(500).send({
  //     message: 'Error! Fetching data.'
  //   });
  // }
};


module.exports = SampleController;