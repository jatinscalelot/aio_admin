const roleModel = require('../../models/roles.model');
const mongoConnection = require('../../utilities/connections');
const responseManager = require('../../utilities/response.manager');
const constants = require('../../utilities/constants');
const adminModel = require('../../models/admins.model');
const mongoose = require('mongoose');
exports.list = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.token.adminid && mongoose.Types.ObjectId.isValid(req.token.adminid)) {
        const { page, limit, search } = req.body;
        let primary = mongoConnection.useDb(constants.DEFAULT_DB);
        primary.model(constants.MODELS.admins, adminModel).paginate({
            $or: [
                { name : { '$regex' : new RegExp(search, "i") } }
            ],
        },{
            page,
            limit: parseInt(limit),
            sort: { _id : -1 },
            populate : [
                {path : 'role', model : primary.model(constants.MODELS.roles, roleModel), select : 'name'},
                {path : 'createdBy', model : primary.model(constants.MODELS.admins, adminModel), select : 'name email mobile'},
                {path : 'updatedBy', model : primary.model(constants.MODELS.admins, adminModel), select : 'name email mobile'}
            ],
            select: '-password',
            lean: true
        }).then((adminslist) => {
            return responseManager.onSuccess("Admin list...", adminslist, res);
        }).catch((error) => {
            return responseManager.onError(error, res);
        });
    }else{
        return responseManager.badrequest({ message: 'Invalid token to get admin list, please try again' }, res);
    }
};