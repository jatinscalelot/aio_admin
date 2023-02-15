const roleModel = require('../../models/roles.model');
const responseManager = require('../../utilities/response.manager');
const mongoConnection = require('../../utilities/connections');
const constants = require('../../utilities/constants');
const mongoose = require('mongoose');
exports.list = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.token.adminid && mongoose.Types.ObjectId.isValid(req.token.adminid)) {
        const { page, limit, search } = req.body;
        let primary = mongoConnection.useDb(constants.DEFAULT_DB);
        primary.model(constants.MODELS.roles, roleModel).paginate({
            $or: [
                { name : { '$regex' : new RegExp(search, "i") } }
            ],
        },{
            page,
            limit: parseInt(limit),
            sort: { _id : -1 },
            lean: true
        }).then((roleslist) => {
            return responseManager.onSuccess("Roles list...", roleslist, res);
        }).catch((error) => {
            return responseManager.onError(error, res);
        });
    }else{
        return responseManager.badrequest({ message: 'Invalid token to get roles list, please try again' }, res);
    }
};