let express = require("express");
let router = express.Router();
const mongoConnection = require('../utilities/connections');
const responseManager = require('../utilities/response.manager');
const constants = require('../utilities/constants');
const adminModel = require('../models/admins.model');
const mongoose = require('mongoose');
router.post('/', async (req, res) => {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { adminid, time, newpassword } = req.body;
    if (adminid && adminid != '' && mongoose.Types.ObjectId.isValid(adminid)) {
        if (newpassword && newpassword != '' && newpassword.trim() != '' && newpassword.length > 6) {
            let ecnPassword = await helper.passwordEncryptor(newpassword);
            let primary = mongoConnection.useDb(constants.DEFAULT_DB);
            let adminData = await primary.model(constants.MODELS.admins, adminModel).findById(adminid).lean();
            if (adminData) {
                let nowtime = Date.now();
                let linktime = Number(time) + (10 * 60 * 1000);
                if (linktime >= nowtime) {
                    await primary.model(constants.MODELS.admins, adminModel).findByIdAndUpdate(adminid, {password : ecnPassword});
                    return responseManager.onSuccess('Admin password updated successfully!', 1, res);
                } else {
                    return responseManager.badrequest({ message: 'Reset password link expire..., Please try again...' }, res);
                }
            } else {
                return responseManager.badrequest({ message: 'Invalid adminid to reset password, Please try again...' }, res);
            }
        }else{
            return responseManager.badrequest({ message: 'Invalid password, password must be >= 6 chars, Please try again...' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid adminid to reset password, Please try again...' }, res);
    }
});
module.exports = router;