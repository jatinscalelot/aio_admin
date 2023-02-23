const roleModel = require('../../models/roles.model');
const mongoConnection = require('../../utilities/connections');
const responseManager = require('../../utilities/response.manager');
const constants = require('../../utilities/constants');
const adminModel = require('../../models/admins.model');
const mongoose = require('mongoose');
exports.list = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.token.adminid && mongoose.Types.ObjectId.isValid(req.token.adminid)) {
    } else {
        return responseManager.badrequest({ message: 'Invalid token to get admin list, please try again' }, res);
    }
};