let mongoose = require("mongoose");
let mongoosePaginate = require("mongoose-paginate-v2");
let schema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    mobile: {
        type: String,
        require: true
    },
    country_code: {
        type: String,
        require: true
    },
    status: {
        type: Boolean,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    role: {
        type: mongoose.Types.ObjectId,
        require: true
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        default: null
    },
    updatedBy: {
        type: mongoose.Types.ObjectId,
        default: null
    }
}, { timestamps: true, strict: false, autoIndex: true });
schema.plugin(mongoosePaginate);
module.exports = schema;