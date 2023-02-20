let mongoose = require("mongoose");
let mongoosePaginate = require("mongoose-paginate-v2");
let schema = new mongoose.Schema({
    status : {
        type: Boolean,
        require : true
    },
    parentId : {
        type: mongoose.Types.ObjectId,
		require: true
    },
    role : {
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