/**
 * @Name maytapi-service.js
 *
 * @Description MayTapi WhatsApp Serivce.
 *
 * @package
 * @subpackage
 * @author Suhaib <muhammad.suhaib@shifa.com.pk>
 * @Created on November 20, 2020
 */

const request = require('request-promise-native');
const h = require("../utils/helper");

const WhatsAppService = {};

WhatsAppService.sendSMS = async (params = {}) => {
  //   // let { message, to_number, type } = params;
  //   // let text;
  //   // if (type === 'media') {
  //   //   text = params;
  //   // }
  //   let response = await sendMessage(params);
  //   return response;
  // };
  // const sendMessage = async (body) => {
  try {
    const body = { ...params };
    // let url = `${INSTANCE_URL}/${PRODUCT_ID}/${PHONE_ID}/sendMessage`;
    // const options = {
    //   uri: url,
    //   method: "POST",
    //   json: true,
    //   headers: {
    //     "Content-type": "application/json",
    //     "x-maytapi-key": API_TOKEN,
    //   },
    //   body
    // };
    // request(options, async (error, response, body) => {
    //   if (!error && response.statusCode == 200) {
    //     const info = body;
    //     return info;
    //   }
    // });
    const INSTANCE_URL = process.env.INSTANCE_URL;
    const PRODUCT_ID = process.env.PRODUCT_ID;
    const PHONE_ID = process.env.PHONE_ID;
    const API_TOKEN = process.env.API_TOKEN;

    if (!PRODUCT_ID || !PHONE_ID || !API_TOKEN) throw Error('You need to change PRODUCT_ID, PHONE_ID and API_KEY values in app.js file.');
    let url = `${INSTANCE_URL}/${PRODUCT_ID}/${PHONE_ID}/sendMessage`;
    let response = await request(url, {
      method: 'POST',
      json: true,
      body,
      headers: {
        'Content-Type': 'application/json',
        'x-maytapi-key': API_TOKEN,
      },
    });
    return response;
  } catch (e) {
    throw e;
  }
}



module.exports = WhatsAppService;