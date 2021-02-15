const router = require('express').Router();
const CMS = require('./../controller/cms.controller');
const CMSRules = require('./../validation/cms.rules');
const Validation = require('./../middleware/validation');
const h = require("../utils/helper");

/**************************************** Clinics ******************************************/
router.get('/clinics', CMS.getClinics);
router.get('/clinics/:id', CMS.getClinics);
router.post('/clinics', CMS.addClinic);

/**************************************** Professions **************************************/
router.get('/professions', CMS.getProfessions);
router.get('/professions/:id', CMS.getProfessions);

/**************************************** Departments **************************************/
router.get('/departments', CMS.getDepartments);
router.get('/departments/:id', CMS.getDepartments);

/**************************************** Users ********************************************/
router.get('/users', CMS.getUsers);
router.get('/users/:id', CMS.getUsers);
router.post('/users', CMSRules.rule('addUser'), Validation.validate, CMS.addUser);

/**************************************** Roles ********************************************/
router.get('/roles', CMS.getRoles);
router.get('/roles/:id', CMS.getRoles);

/**************************************** Employee *****************************************/
router.get('/employee', CMS.getEmployee);


module.exports = router;