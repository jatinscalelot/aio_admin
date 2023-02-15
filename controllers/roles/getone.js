const roleModel = require('../../models/roles.model');
const responseManager = require('../../utilities/response.manager');
const mongoConnection = require('../../utilities/connections');
const constants = require('../../utilities/constants');
const mongoose = require('mongoose');
exports.getone = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.token.adminid && mongoose.Types.ObjectId.isValid(req.token.adminid)) {
        const { roleid } = req.body;
        if(roleid && roleid != '' && mongoose.Types.ObjectId.isValid(roleid)){
            let primary = mongoConnection.useDb(constants.DEFAULT_DB);
            let roledata = await primary.model(constants.MODELS.roles, roleModel).findById(roleid).lean();
            return responseManager.onSuccess("Roles data...", roledata, res);
        }else{
            return responseManager.badrequest({ message: 'Invalid role id to get role data, please try again' }, res);
        }
    }else{
        return responseManager.badrequest({ message: 'Invalid token to get role data, please try again' }, res);
    }
};