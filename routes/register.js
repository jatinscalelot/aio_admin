let express = require("express");
let router = express.Router();
const mongoConnection = require('../utilities/connections');
const responseManager = require('../utilities/response.manager');
const constants = require('../utilities/constants');
const helper = require('../utilities/helper');
const adminModel = require('../models/admins.model');
const mongoose = require('mongoose');
router.post('/', async (req, res) => {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { name, email, mobile, country_code, password, role } = req.body;
    if (name && name.trim() != '' && email && email.trim() != '' && (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) && mobile && mobile.length == 10 && country_code && country_code.trim() != '' && password && password.length >= 6 && role && role != '' && mongoose.Types.ObjectId.isValid(role)) {
        let ecnPassword = await helper.passwordEncryptor(password);
        let primary = mongoConnection.useDb(constants.DEFAULT_DB);
        let checkExisting = await primary.model(constants.MODELS.admins, adminModel).findOne({ $or: [{ mobile: mobile }, { email: email }] }).lean();
        if (checkExisting == null) {
            let obj = {
                name: name,
                email: email,
                mobile: mobile,
                country_code: country_code,
                password: ecnPassword,
                status: true,
                role: mongoose.Types.ObjectId(role),
                createdBy: null,
                updatedBy: null
            };
            let adminData = await primary.model(constants.MODELS.admins, adminModel).create(obj);
            return responseManager.onSuccess('Admin register successfully!', adminData, res);
        } else {
            return responseManager.onSuccess('Admin with same email or mobile already exist, please try with another one!', 0, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid data to register admin, Please try again...' }, res);
    }
});
module.exports = router;
