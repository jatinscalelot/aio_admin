var mongoose = require("mongoose");
const _ = require("lodash");
var CryptoJS = require("crypto-js");
let permissionModel = require("../models/permissions.model");
let mongoConnection = require('./connections');
let constants = require('./constants');
// mongoose.set('useCreateIndex', true);
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
mongoose.connection.once('open', () => {
    console.log("Well done! , connected with mongoDB database");
}).on('error', error => {
    console.log("Oops! database connection error:" + error);
});
let Collections = [
    { text: 'Admins', value: 'admins' },
    { text: 'Roles', value: 'roles' },
    { text: 'Permissions', value: 'permissions' },
    { text: 'Customers', value: 'customers' },
    { text: 'Domains', value: 'domains' }
];
async function encryptPassword(plainPassword) {
    var encLayer1 = CryptoJS.AES.encrypt(plainPassword, process.env.PASSWORD_ENCRYPTION_SECRET).toString();
    var encLayer2 = CryptoJS.DES.encrypt(encLayer1, process.env.PASSWORD_ENCRYPTION_SECRET).toString();
    var finalEncPassword = CryptoJS.TripleDES.encrypt(encLayer2, process.env.PASSWORD_ENCRYPTION_SECRET).toString();
    return finalEncPassword;
}
async function decryptPassword(encryptedPassword) {
    var decLayer1 = CryptoJS.TripleDES.decrypt(encryptedPassword, process.env.PASSWORD_ENCRYPTION_SECRET);
    var deciphertext1 = decLayer1.toString(CryptoJS.enc.Utf8);
    var decLayer2 = CryptoJS.DES.decrypt(deciphertext1, process.env.PASSWORD_ENCRYPTION_SECRET);
    var deciphertext2 = decLayer2.toString(CryptoJS.enc.Utf8);
    var decLayer3 = CryptoJS.AES.decrypt(deciphertext2, process.env.PASSWORD_ENCRYPTION_SECRET);
    var finalDecPassword = decLayer3.toString(CryptoJS.enc.Utf8);
    return finalDecPassword;
}
async function getPermission(roleID, modelName, permissionType, secondaryDB) {
    let results = await secondaryDB.model(constants.MODELS.permissions, permissionModel).find({ roleId: roleID }).lean();
    if (results.length == 1) {
        let permisions = _.filter(results[0].permission, { 'collectionName': modelName });
        if (permisions.length == 1) {
            if (permissionType == "view") {
                if (permisions[0].view == true)
                    return true;
                else
                    return false;
            }

            if (permissionType == "insertUpdate") {
                if (permisions[0].insertUpdate == true)
                    return true;
                else
                    return false;
            }

            if (permissionType == "delete") {
                if (permisions[0].delete == true)
                    return true;
                else
                    return false;
            }
            return false;
        } else
            return false;
    } else
        return false;
}
const propComparator = (prop) => {
    return function (a, b) {
        return a[prop] - b[prop];
    }
}
module.exports = { mongoose, encryptPassword, decryptPassword, getPermission, propComparator, Collections };