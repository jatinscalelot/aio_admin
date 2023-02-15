let express = require("express");
let router = express.Router();
const mongoConnection = require('../utilities/connections');
const responseManager = require('../utilities/response.manager');
const constants = require('../utilities/constants');
const helper = require('../utilities/helper');
const adminModel = require('../models/admins.model');
router.post('/', async (req, res) => {
    res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { email, password } = req.body;
    if(email && email.trim() != '' && (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) && password && password.length >= 6){
        let primary = mongoConnection.useDb(constants.DEFAULT_DB);
        let adminData = await primary.model(constants.MODELS.admins, adminModel).findOne({email : email, status : true}).lean();
        if(adminData){
            let decpass = await helper.passwordDecryptor(adminData.password);
            if(password == decpass){
                let accessToken = await helper.generateAccessToken({ adminid : adminData._id.toString() });
                return responseManager.onSuccess('Admin login successfully!', {token : accessToken}, res);
            }else{
                return responseManager.badrequest({message : 'Invalid password, Please try again...'}, res);
            }
        }else{
            return responseManager.badrequest({message : 'Invalid email or password, Please try again...'}, res);
        }
    }else{
        return responseManager.badrequest({message : 'Invalid email or password, Please try again...'}, res);
    }
});
module.exports = router;
