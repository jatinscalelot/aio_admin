const mongoConnection = require('../../utilities/connections');
const responseManager = require('../../utilities/response.manager');
const constants = require('../../utilities/constants');
const adminModel = require('../../models/admins.model');
const themecategoryModel = require('../../models/themecategories.model');
const mongoose = require('mongoose');
exports.remove = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.token.adminid && mongoose.Types.ObjectId.isValid(req.token.adminid)) {
        const { categoryid } = req.body;
        let primary = mongoConnection.useDb(constants.DEFAULT_DB);
        if (categoryid && categoryid != '' && mongoose.Types.ObjectId.isValid(categoryid)) {
            await primary.model(constants.MODELS.themecategories, themecategoryModel).findByIdAndRemove(categoryid);
            return responseManager.onSuccess('Category removed sucecssfully!', 1, res);
        } else {
            return responseManager.badrequest({ message: 'Invalid category id to remove category data, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to get category data, please try again' }, res);
    }
};