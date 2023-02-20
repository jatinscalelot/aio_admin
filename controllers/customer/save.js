const roleModel = require('../../models/roles.model');
const mongoConnection = require('../../utilities/connections');
const responseManager = require('../../utilities/response.manager');
const constants = require('../../utilities/constants');
const helper = require('../../utilities/helper');
const adminModel = require('../../models/admins.model');
const customerModel = require('../../models/customers.model');
const mongoose = require('mongoose');
exports.save = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.token.adminid && mongoose.Types.ObjectId.isValid(req.token.adminid)) {
        const { customerid, name, email, mobile, country_code, password, domain } = req.body;
        if(customerid && customerid != '' && mongoose.Types.ObjectId.isValid(customerid)){
            if (name && name.trim() != '' && email && email.trim() != '' && (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) && mobile && mobile.length == 10 && country_code && country_code.trim() != '' && domain && domain.trim() != '') {
                let primary = mongoConnection.useDb(constants.DEFAULT_DB);
                let checkExisting = await primary.model(constants.MODELS.customers, customerModel).findOne({ $or: [{ mobile: mobile }, { email: email }], _id : { $ne : mongoose.Types.ObjectId(customerid)} }).lean();
                if (checkExisting == null) {
                    let obj = {
                        name: name,
                        email: email,
                        mobile: mobile,
                        country_code: country_code,
                        domain: domain,
                        updatedBy: mongoose.Types.ObjectId(req.token.adminid)
                    };
                    await primary.model(constants.MODELS.customers, customerModel).findByIdAndUpdate(customerid, obj);
                    let customerData = await primary.model(constants.MODELS.customers, customerModel).findById(customerid).populate([{path : 'createdBy', model : primary.model(constants.MODELS.admins, adminModel), select : 'name email mobile'}, {path : 'updatedBy', model : primary.model(constants.MODELS.admins, adminModel), select : 'name email mobile'}]).select('-password').lean();
                    return responseManager.onSuccess('Customer register successfully!', customerData, res);
                } else {
                    return responseManager.onSuccess('Customer with same email or mobile already exist, please try with another one!', 0, res);
                }
            } else {
                return responseManager.badrequest({ message: 'Invalid data to register customer, Please try again...' }, res);
            }
        }else{
            if (name && name.trim() != '' && email && email.trim() != '' && (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) && mobile && mobile.length == 10 && country_code && country_code.trim() != '' && password && password.length >= 6 && domain && domain.trim() != '') {
                let ecnPassword = await helper.passwordEncryptor(password);
                let primary = mongoConnection.useDb(constants.DEFAULT_DB);
                let checkExisting = await primary.model(constants.MODELS.customers, customerModel).findOne({ $or: [{ mobile: mobile }, { email: email }] }).lean();
                if (checkExisting == null) {
                    let obj = {
                        name: name,
                        email: email,
                        mobile: mobile,
                        country_code: country_code,
                        password: ecnPassword,
                        domain: domain,
                        status: true,
                        createdBy: mongoose.Types.ObjectId(req.token.adminid),
                        updatedBy: mongoose.Types.ObjectId(req.token.adminid)
                    };
                    let customerDataid = await primary.model(constants.MODELS.customers, customerModel).create(obj);
                    let customerData = await primary.model(constants.MODELS.customers, customerModel).findById(customerDataid._id).populate([{path : 'createdBy', model : primary.model(constants.MODELS.admins, adminModel), select : 'name email mobile'}, {path : 'updatedBy', model : primary.model(constants.MODELS.admins, adminModel), select : 'name email mobile'}]).select('-password').lean();
                    return responseManager.onSuccess('Customer register successfully!', customerData, res);
                } else {
                    return responseManager.onSuccess('Customer with same email or mobile already exist, please try with another one!', 0, res);
                }
            } else {
                return responseManager.badrequest({ message: 'Invalid data to register customer, Please try again...' }, res);
            }
        }
    }else{
        return responseManager.badrequest({ message: 'Invalid token to set customer data, please try again' }, res);
    }
};
module.exports = router;