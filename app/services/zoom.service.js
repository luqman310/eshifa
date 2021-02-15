/**
 * @Name zoom-service.js
 *
 * @Description Zoom Meeting Serivce.
 *
 * @package
 * @subpackage
 * @author Suhaib <muhammad.suhaib@shifa.com.pk>
 * @Created on December 04, 2020
 */

const request = require('request-promise-native');
const jwt = require("jsonwebtoken");

const ZoomService = {};

ZoomService.getToken = () => {
  try {
    token = _getToken()
    return token;
  } catch (e) {
    throw e;
  }
}

ZoomService.users = async (params = {}) => {
  try {
    //Make Zoom API call
    let qs = {
      status: 'active' // -> uri + '?status=active'
    };
    let uri = 'https://api.zoom.us/v2/users';
    const users = await _callAPI(uri, qs);
    return users;
  } catch (e) {
    throw e;
  }
}

ZoomService.createMeeting = async (params = {}) => {
  try {
    //Make Zoom API call
    let qs = {};
    let body = {
      "topic": `Consultation of Patient ${params.patient} with ${params.consultant}`,
      "type": "1",
      "host_email": "khalidkhan@shifa.com.pk",
      "timezone": "Asia/Tashkent",
      "password": "1234",
      "agenda": "EMR Consultation",
      "settings": {
        "host_video": true,
        "participant_video": true,
        "cn_meeting": false,
        "in_meeting": false,
        "join_before_host": true,
        "mute_upon_entry": false,
        "watermark": false,
        "use_pmi": false,
        "approval_type": 2,
        "audio": "both",
        "auto_recording": "none",
        "close_registration": false,
        "waiting_room": true,
        // "contact_name": "Faisal Saeed",
        // "contact_email": "faisal.saeed@shifa.com.pk",
        // "registrants_email_notification": true,
        "meeting_authentication": false,
        "show_share_button": false,
        "allow_multiple_devices": false,
        "encryption_type": "e2ee",
        "approved_or_denied_countries_or_regions": {
          "enable": false
        }
      }
    };
    let uri = 'https://api.zoom.us/v2/users/6zdl8ZdGQ9C1ybR13fv2WA/meetings';
    const users = await _callAPI(uri, {}, body, 'POST');
    return users;
  } catch (e) {
    throw e;
  }
}

const _callAPI = async (uri, qs = {}, body = {}, method = 'GET') => {
  try {
    const accessToken = _getToken()
    let options = {
      ...{ qs },
      ...{ body },
      method: method,
      auth: {
        //Provide your token here
        // 'bearer': "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOm51bGwsImlzcyI6IlJUWEp6cGpNUTRXMVF4VU9rTjBFOFEiLCJleHAiOjE2MDcwNzE2NTQsImlhdCI6MTYwNzA2NjI1NX0.yjXDm12Q5DwezcI8DXReMYibOoz6SDd9XkdzOvro_Iw"
        'bearer': accessToken.token
      },
      headers: {
        'User-Agent': 'Zoom-Jwt-Request',
        'content-type': 'application/json'
      },
      json: true // Automatically parses the JSON string in the response
    };
    const response = await request(uri, options);
    return response;
  } catch (e) {
    throw e;
  }

}

const _getToken = () => {
  try {
    const token = jwt.sign({
      aud: null,
      iss: process.env.API_KEY,
    }, process.env.API_SECRET, {
      algorithm: "HS256",
      expiresIn: '1m'
    });
    const resToken = {
      token: token,
      createdAt: Date.now()
    }
    return resToken;
  } catch (e) {
    throw e;
  }
}



module.exports = ZoomService;