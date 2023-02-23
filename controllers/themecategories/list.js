const mongoConnection = require('../../utilities/connections');
const responseManager = require('../../utilities/response.manager');
const constants = require('../../utilities/constants');
const adminModel = require('../../models/admins.model');
const themecategoryModel = require('../../models/themecategories.model');
const mongoose = require('mongoose');
exports.list = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.token.adminid && mongoose.Types.ObjectId.isValid(req.token.adminid)) {
        let primary = mongoConnection.useDb(constants.DEFAULT_DB);
        const { page, limit, search } = req.body;
        primary.model(constants.MODELS.themecategories, themecategoryModel).paginate({
            $or: [
                { categoryname: { '$regex': new RegExp(search, "i") } }
            ]
        }, {
            page,
            limit: parseInt(limit),
            populate : [
                {path : 'createdBy', model : primary.model(constants.MODELS.admins, adminModel), select : 'name email mobile'},
                {path : 'updatedBy', model : primary.model(constants.MODELS.admins, adminModel), select : 'name email mobile'}
            ],
            sort: { _id: -1 },
            lean: true
        }).then((categorylist) => {
            return responseManager.onSuccess("Category list...", categorylist, res);
        }).catch((error) => {
            return responseManager.onError(error, res);
        });
    } else {
        return responseManager.badrequest({ message: 'Invalid token to save category data, please try again' }, res);
    }
};