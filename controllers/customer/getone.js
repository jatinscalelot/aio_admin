const roleModel = require('../../models/roles.model');
const mongoConnection = require('../../utilities/connections');
const responseManager = require('../../utilities/response.manager');
const constants = require('../../utilities/constants');
const adminModel = require('../../models/admins.model');
const customerModel = require('../../models/customers.model');
const countriesModel = require('../../models/countries.model');
const mongoose = require('mongoose');
exports.getone = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.token.adminid && mongoose.Types.ObjectId.isValid(req.token.adminid)) {
        const { customerid } = req.body;
        let primary = mongoConnection.useDb(constants.DEFAULT_DB);
        primary.model(constants.MODELS.customers, customerModel).findById(customerid).populate([
            { path: 'country', model: primary.model(constants.MODELS.countries, countriesModel), select: 'name code currency currency_symbole rate flag'},
            {path : 'createdBy', model : primary.model(constants.MODELS.admins, adminModel), select : 'name email mobile'}, 
            {path : 'updatedBy', model : primary.model(constants.MODELS.admins, adminModel), select : 'name email mobile'}
        ]).select('-password').lean().then((customerdata) => {
            return responseManager.onSuccess("Customer Data...", customerdata, res);
        }).catch((error) => {
            return responseManager.onError(error, res);
        });
    }else{
        return responseManager.badrequest({ message: 'Invalid token to get admin data, please try again' }, res);
    }
};