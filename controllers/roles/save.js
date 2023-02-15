const roleModel = require('../../models/roles.model');
const adminModel = require('../../models/admins.model');
const responseManager = require('../../utilities/response.manager');
const mongoConnection = require('../../utilities/connections');
const constants = require('../../utilities/constants');
const mongoose = require('mongoose');
exports.save = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.token.adminid && mongoose.Types.ObjectId.isValid(req.token.adminid)) {
        const { roleid, name } = req.body;
        if(name && name != '' && name.trim() != ''){
            let primary = mongoConnection.useDb(constants.DEFAULT_DB);
            if(roleid && roleid != '' && mongoose.Types.ObjectId.isValid(roleid)){
                let checkExisting = await primary.model(constants.MODELS.roles, roleModel).findOne({name : name, _id : { $ne : mongoose.Types.ObjectId(roleid)}}).lean();
                if(checkExisting != null){
                    return responseManager.badrequest({ message: 'Role with same name already exist, Please try with new name' }, res);
                }else{
                    let obj = {
                        name : name,
                        updatedBy : mongoose.Types.ObjectId(req.token.adminid)
                    };
                    let uppdatedRole = await primary.model(constants.MODELS.roles, roleModel).findByIdAndUpdate(roleid, obj);
                    return responseManager.onSuccess("Role updated successfully...", uppdatedRole, res);
                }
            }else{
                let checkExisting = await primary.model(constants.MODELS.roles, roleModel).findOne({name : name}).lean();
                if(checkExisting != null){
                    return responseManager.badrequest({ message: 'Role with same name already exist, Please try with new name' }, res);
                }else{
                    let obj = {
                        name : name,
                        status : true,
                        createdBy : mongoose.Types.ObjectId(req.token.adminid),
                        updatedBy : mongoose.Types.ObjectId(req.token.adminid)
                    };
                    let createdRole = await primary.model(constants.MODELS.roles, roleModel).create(obj);
                    return responseManager.onSuccess("Role created successfully...", createdRole, res);
                }
            }
        }else{
            return responseManager.badrequest({ message: 'Invalid role name to update or create role, please try again' }, res);
        }
    }else{
        return responseManager.badrequest({ message: 'Invalid token to create role, please try again' }, res);
    }
};