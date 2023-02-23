const mongoConnection = require('../../utilities/connections');
const responseManager = require('../../utilities/response.manager');
const constants = require('../../utilities/constants');
const adminModel = require('../../models/admins.model');
const themecategoryModel = require('../../models/themecategories.model');
const mongoose = require('mongoose');
exports.save = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.token.adminid && mongoose.Types.ObjectId.isValid(req.token.adminid)) {
        const { categoryid, categoryname, categoryicon } = req.body;
        let primary = mongoConnection.useDb(constants.DEFAULT_DB);
        if (categoryid && categoryid != '' && mongoose.Types.ObjectId.isValid(categoryid)) {
            let checkExisting = await primary.model(constants.MODELS.themecategories, themecategoryModel).findOne({ _id: { $ne: categoryid }, categoryname: categoryname }).lean();
            if (checkExisting == null) {
                let obj = {
                    categoryname: categoryname,
                    categoryicon: categoryicon,
                    updatedBy: mongoose.Types.ObjectId(req.token.adminid)
                }
                await primary.model(constants.MODELS.themecategories, themecategoryModel).findOneAndUpdate(categoryid, obj);
                let updatedData = await primary.model(constants.MODELS.themecategories, themecategoryModel).findById(categoryid).lean();
                return responseManager.onSuccess('Category updated sucecssfully!', updatedData, res);
            } else {
                return responseManager.badrequest({ message: 'Category name can not be identical, please try again' }, res);
            }
        } else {
            let checkExisting = await primary.model(constants.MODELS.themecategories, themecategoryModel).findOne({ categoryname: categoryname }).lean();
            if (checkExisting == null) {
                let obj = {
                    categoryname: categoryname,
                    categoryicon: categoryicon,
                    status: true,
                    createdBy: mongoose.Types.ObjectId(req.token.adminid),
                    updatedBy: mongoose.Types.ObjectId(req.token.adminid)
                }
                await primary.model(constants.MODELS.themecategories, themecategoryModel).create(obj);
                return responseManager.onSuccess('Category created sucecssfully!', 1, res);
            } else {
                return responseManager.badrequest({ message: 'Category name can not be identical, please try again' }, res);
            }
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to save category data, please try again' }, res);
    }
};