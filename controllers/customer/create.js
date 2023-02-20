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
exports.create = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.token.adminid && mongoose.Types.ObjectId.isValid(req.token.adminid)) {
        const { full_name, company_name, email, country_code, mobile, country, password } = req.body;
        if (full_name && full_name.trim() != '' && company_name && company_name.trim() != '' && email && email.trim() != '' && (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) && mobile && mobile.length == 10 && country_code && country_code.trim() != '' && country && country != '' && mongoose.Types.ObjectId.isValid(country)) {
            let primary = mongoConnection.useDb(constants.DEFAULT_DB);
            let ecnPassword = await helper.passwordEncryptor(password);
            let countryData = await primary.model(constants.MODELS.countries, countriesModel).findById(country).lean();
            let checkExisting = await primary.model(constants.MODELS.customers, customerModel).findOne({ $or: [{ mobile: mobile }, { email: email }]}).lean();
            if (checkExisting == null) {
                let obj = {
                    full_name: full_name,
                    company_name: company_name,
                    email : email,
                    mobile: mobile,
                    country_code: country_code,
                    domain : '',
                    status : true,
                    web_status : 'offline',
                    app_status : 'offline',
                    database : 'db_' + company_name.toLowerCase().replace(/\s/g, '') +'_'+ helper.makeid(5).toLowerCase() + '_' +countryData.name.toLowerCase().replace(/\s/g, ''),
                    country : mongoose.Types.ObjectId(country),
                    createdBy : mongoose.Types.ObjectId(req.token.adminid),
                    updatedBy: mongoose.Types.ObjectId(req.token.adminid)
                };
                let createdCustomer = await primary.model(constants.MODELS.customers, customerModel).create(obj);
                if (createdCustomer != null) {
                    let secondarydb = mongoConnection.useDb(createdCustomer.database);
                    let primaryRolePayload = { name: "Administrator", status: true, parentId: createdCustomer._id };
                    let primaryroleCreated = await secondarydb.model(constants.MODELS.customerroles, customerroleModel).create(primaryRolePayload);
                    if (primaryroleCreated != null) {
                        let adminuserObj = {
                            full_name : full_name,
                            email : email,
                            mobile: mobile,
                            country_code: country_code,
                            parentId : mongoose.Types.ObjectId(createdCustomer._id),
                            roleId : mongoose.Types.ObjectId(primaryroleCreated._id),
                            status : true,
                            password : ecnPassword,
                            createdBy : mongoose.Types.ObjectId(req.token.adminid),
                            updatedBy: mongoose.Types.ObjectId(req.token.adminid)
                        };
                        let adminuserCreated = await secondarydb.model(constants.MODELS.customerusers, customeruserModel).create(adminuserObj);
                        if(adminuserCreated != null){
                            let primarypermissionsData = [
                                {
                                    "collectionName": "customerroles",
                                    "insertUpdate": true,
                                    "delete": true,
                                    "view": true,
                                    "_id": new mongoose.Types.ObjectId()
                                },
                                {
                                  "collectionName": "permissions",
                                  "insertUpdate": true,
                                  "delete": true,
                                  "view": true,
                                  "_id": new mongoose.Types.ObjectId()
                                },
                                {
                                    "collectionName": "customerusers",
                                    "insertUpdate": true,
                                    "delete": true,
                                    "view": true,
                                    "_id": new mongoose.Types.ObjectId()
                                }
                            ];
                            let primarypermissionsPayload = { roleId: primaryroleCreated._id, permission: primarypermissionsData, updatedBy: mongoose.Types.ObjectId(adminuserCreated._id), createdBy: mongoose.Types.ObjectId(adminuserCreated._id) };
                            let primarypermissionCreated = await secondarydb.model(constants.MODELS.permissions, permissionModel).create(primarypermissionsPayload);
                            if(primarypermissionCreated != null){
                                return responseManager.onSuccess("Customer created successfully!", 1, res);
                            }else{
                                return responseManager.badrequest({ message: 'Customer not created, There is something went wrong..., please try again...' }, res);
                            }
                        }else{
                            return responseManager.badrequest({ message: 'Customer not created, There is something went wrong..., please try again...' }, res);
                        } 
                    }else{
                        return responseManager.badrequest({ message: 'Customer not created, There is something went wrong..., please try again...' }, res);
                    }
                }else{
                    return responseManager.badrequest({ message: 'Customer not created, There is something went wrong..., please try again...' }, res);
                }
            } else {
                return responseManager.badrequest({ message: 'Customer already exist with same mobile or email..., please try again...!' }, res);
            }
        }else{
            return responseManager.badrequest({ message: 'Invalid data to create new customer..., please try again...' }, res);
        }
    }else{
        return responseManager.badrequest({ message: 'Invalid token to set customer data, please try again' }, res);
    }
};
module.exports = router;