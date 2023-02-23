const mongoConnection = require('../../utilities/connections');
const responseManager = require('../../utilities/response.manager');
const constants = require('../../utilities/constants');
const adminModel = require('../../models/admins.model');
const themecategoryModel = require('../../models/themecategories.model');
const mongoose = require('mongoose');
exports.getone = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.token.adminid && mongoose.Types.ObjectId.isValid(req.token.adminid)) {
        const { categoryid } = req.body;
        let primary = mongoConnection.useDb(constants.DEFAULT_DB);
        if (categoryid && categoryid != '' && mongoose.Types.ObjectId.isValid(categoryid)) {
            primary.model(constants.MODELS.themecategories, themecategoryModel).findById(categoryid).populate([{path : 'createdBy', model : primary.model(constants.MODELS.admins, adminModel), select : 'name email mobile'}, {path : 'updatedBy', model : primary.model(constants.MODELS.admins, adminModel), select : 'name email mobile'}]).select('-password').lean().then((categorydata) => {
                return responseManager.onSuccess("Category Data...", categorydata, res);
            }).catch((error) => {
                return responseManager.onError(error, res);
            });
        } else {
            return responseManager.badrequest({ message: 'Invalid category id to get item data, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to get category data, please try again' }, res);
    }
};