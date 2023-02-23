const mongoConnection = require('../../utilities/connections');
const responseManager = require('../../utilities/response.manager');
const constants = require('../../utilities/constants');
const customerModel = require('../../models/customers.model');
const mongoose = require('mongoose');
exports.domain = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.token.adminid && mongoose.Types.ObjectId.isValid(req.token.adminid)) {
        const { customerid, domain } = req.body;
        let primary = mongoConnection.useDb(constants.DEFAULT_DB);
        let customerData = await primary.model(constants.MODELS.customers, customerModel).findById(customerid).lean();
        if(customerData && (customerData.domain == undefined || customerData.domain == '' || customerData.domain == null)){
            let checkExistingDomain = await primary.model(constants.MODELS.customers, customerModel).findOne({domain : domain}).lean();
            if(checkExistingDomain == null){
                await primary.model(constants.MODELS.customers, customerModel).findByIdAndUpdate(customerid, {domain : domain});
                return responseManager.onSuccess("Customer domain updated successfully!", 1, res);
            }else{
                return responseManager.badrequest({ message: 'This domain already in use please use any other domain name..., please try again..' }, res);
            }
        }else{
            return responseManager.badrequest({ message: 'Customer already consist the domain you can update it..., please try again..' }, res);
        }
    }
};