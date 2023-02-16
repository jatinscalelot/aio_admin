let mongoose = require("mongoose");
let schema = new mongoose.Schema({
    roleId: {
        type: mongoose.Types.ObjectId,
        default: null
    },
    permission: [{
        collectionName: {
            type: String,
            default: "",
        },
        insertUpdate: {
            type: Boolean,
            default: true,
        },
        delete: {
            type: Boolean,
            default: true,
        },
        view: {
            type: Boolean,
            default: true,
        },
    }],
    updatedBy: {
        type: mongoose.Types.ObjectId,
        default: null
    },
    createdBy:{
        type: mongoose.Types.ObjectId,
        default: null
    }
},{timestamps: true, strict: false});
module.exports = schema