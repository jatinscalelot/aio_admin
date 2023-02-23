const roleModel = require('../../models/roles.model');
const mongoConnection = require('../../utilities/connections');
const responseManager = require('../../utilities/response.manager');
const constants = require('../../utilities/constants');
const helper = require('../../utilities/helper');
const adminModel = require('../../models/admins.model');
const mongoose = require('mongoose');
exports.save = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.token.adminid && mongoose.Types.ObjectId.isValid(req.token.adminid)) {
        const { adminid, name, email, mobile, country_code, password, role } = req.body;
        
    } else {
        return responseManager.badrequest({ message: 'Invalid token to set admin data, please try again' }, res);
    }
};