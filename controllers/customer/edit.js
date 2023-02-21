const roleModel = require('../../models/roles.model');
const mongoConnection = require('../../utilities/connections');
const responseManager = require('../../utilities/response.manager');
const constants = require('../../utilities/constants');
const helper = require('../../utilities/helper');
const adminModel = require('../../models/admins.model');
const customerModel = require('../../models/customers.model');
const customeruserModel = require('../../models/customerusers.model');
const countriesModel = require('../../models/countries.model');
const customerroleModel = require('../../models/customerroles.model');
const permissionModel = require('../../models/permissions.model');
const mongoose = require('mongoose');
exports.edit = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.token.adminid && mongoose.Types.ObjectId.isValid(req.token.adminid)) {
        const { customerid, full_name, company_name, email, country_code, mobile, country, password, domain } = req.body;
        if (customerid && customerid != '' && mongoose.Types.ObjectId.isValid(customerid)) {
            if (full_name && full_name.trim() != '' && company_name && company_name.trim() != '' && email && email.trim() != '' && (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) && mobile && mobile.length == 10 && country_code && country_code.trim() != '' && country && country != '' && mongoose.Types.ObjectId.isValid(country)) {
                let primary = mongoConnection.useDb(constants.DEFAULT_DB);
                let ecnPassword = '';
                if (password && password != '') {
                    ecnPassword = await helper.passwordEncryptor(password);
                }
                let customerData = await primary.model(constants.MODELS.customers, customerModel).findById(customerid).lean();
                if (customerData) {
                    let checkExisting = await primary.model(constants.MODELS.customers, customerModel).findOne({ $or: [{ mobile: mobile }, { email: email }], _id: { $ne: mongoose.Types.ObjectId(customerid) } }).lean();
                    if (checkExisting == null) {
                        let obj = {
                            full_name: full_name,
                            company_name: company_name,
                            email: email,
                            mobile: mobile,
                            country_code: country_code,
                            domain: (domain && domain != '') ? domain : '',
                            country: mongoose.Types.ObjectId(country),
                            updatedBy: mongoose.Types.ObjectId(req.token.adminid)
                        };
                        await primary.model(constants.MODELS.customers, customerModel).findByIdAndUpdate(customerid, obj);
                        let adminData = await secondarydb.model(constants.MODELS.customerusers, customeruserModel).findOne({email : customerData.email, mobile : customerData.mobile, parentId : mongoose.Types.ObjectId(customerData._id)}).lean();
                        if (ecnPassword != '') {
                            if(adminData){
                                let adminuserObj = {
                                    full_name: full_name,
                                    email: email,
                                    mobile: mobile,
                                    country_code: country_code,
                                    password: ecnPassword,
                                    updatedBy: mongoose.Types.ObjectId(req.token.adminid)
                                };
                                await secondarydb.model(constants.MODELS.customerusers, customeruserModel).findByIdAndUpdate(adminData._id, adminuserObj);
                                let finalcustomerData = await primary.model(constants.MODELS.customers, customerModel).findById(customerid).lean();
                                return responseManager.onSuccess("Customer data updated successfully!", finalcustomerData, res);
                            }
                        } else {
                            let adminuserObj = {
                                full_name: full_name,
                                email: email,
                                mobile: mobile,
                                country_code: country_code,
                                updatedBy: mongoose.Types.ObjectId(req.token.adminid)
                            };
                            await secondarydb.model(constants.MODELS.customerusers, customeruserModel).findByIdAndUpdate(adminData._id, adminuserObj);
                            let finalcustomerData = await primary.model(constants.MODELS.customers, customerModel).findById(customerid).lean();
                            return responseManager.onSuccess("Customer data updated successfully!", finalcustomerData, res);
                        }
                    } else {
                        return responseManager.badrequest({ message: 'Customer already exist with same mobile or email..., please try other email and phone...' }, res);
                    }
                }else{
                    return responseManager.badrequest({ message: 'Customer can not update, There is something went wrong..., please try again...' }, res);
                }
            } else {
                return responseManager.badrequest({ message: 'Invalid data to update customer..., please try again...' }, res);
            }
        } else {
            return responseManager.badrequest({ message: 'Invalid customer id to update customer data..., please try again...!' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to update customer detail..., please try again...' }, res);
    }
};