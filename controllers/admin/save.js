const roleModel = require('../../models/roles.model');
const mongoConnection = require('../../utilities/connections');
const responseManager = require('../../utilities/response.manager');
const constants = require('../../utilities/constants');
const helper = require('../../utilities/helper');
const adminModel = require('../../models/admins.model');
const mongoose = require('mongoose');
exports.save = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.token.adminid && mongoose.Types.ObjectId.isValid(req.token.adminid)) {
        const { adminid, name, email, mobile, country_code, password, role } = req.body;
        if(adminid && adminid != '' && mongoose.Types.ObjectId.isValid(adminid)){
            if (name && name.trim() != '' && email && email.trim() != '' && (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) && mobile && mobile.length == 10 && country_code && country_code.trim() != '' && role && role != '' && mongoose.Types.ObjectId.isValid(role)) {
                let primary = mongoConnection.useDb(constants.DEFAULT_DB);
                let checkExisting = await primary.model(constants.MODELS.admins, adminModel).findOne({ $or: [{ mobile: mobile }, { email: email }], _id : { $ne : mongoose.Types.ObjectId(adminid)} }).lean();
                if (checkExisting == null) {
                    let obj = {
                        name: name,
                        email: email,
                        mobile: mobile,
                        country_code: country_code,
                        role: mongoose.Types.ObjectId(role),
                        updatedBy: mongoose.Types.ObjectId(req.token.adminid)
                    };
                    await primary.model(constants.MODELS.admins, adminModel).findByIdAndUpdate(adminid, obj);
                    let adminData = await primary.model(constants.MODELS.admins, adminModel).findById(adminid).populate([{path : 'role', model : primary.model(constants.MODELS.roles, roleModel), select : 'name'}, {path : 'createdBy', model : primary.model(constants.MODELS.admins, adminModel), select : 'name email mobile'}, {path : 'updatedBy', model : primary.model(constants.MODELS.admins, adminModel), select : 'name email mobile'}]).select('-password').lean();
                    return responseManager.onSuccess('Admin register successfully!', adminData, res);
                } else {
                    return responseManager.onSuccess('Admin with same email or mobile already exist, please try with another one!', 0, res);
                }
            } else {
                return responseManager.badrequest({ message: 'Invalid data to register admin, Please try again...' }, res);
            }
        }else{
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
                        createdBy: mongoose.Types.ObjectId(req.token.adminid),
                        updatedBy: mongoose.Types.ObjectId(req.token.adminid)
                    };
                    let adminDataid = await primary.model(constants.MODELS.admins, adminModel).create(obj);
                    let adminData = await primary.model(constants.MODELS.admins, adminModel).findById(adminDataid._id).populate([{path : 'role', model : primary.model(constants.MODELS.roles, roleModel), select : 'name'}, {path : 'createdBy', model : primary.model(constants.MODELS.admins, adminModel), select : 'name email mobile'}, {path : 'updatedBy', model : primary.model(constants.MODELS.admins, adminModel), select : 'name email mobile'}]).select('-password').lean();
                    return responseManager.onSuccess('Admin register successfully!', adminData, res);
                } else {
                    return responseManager.onSuccess('Admin with same email or mobile already exist, please try with another one!', 0, res);
                }
            } else {
                return responseManager.badrequest({ message: 'Invalid data to register admin, Please try again...' }, res);
            }
        }
    }else{
        return responseManager.badrequest({ message: 'Invalid token to set admin data, please try again' }, res);
    }
};