const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let CurveStatusSchema = new Schema({
    path: {
        type: String
    },
    updatedAt: {
        type: Date
    },
    user: {
        type: String
    }
});

CurveStatusSchema.index({path: 1});

let model = mongoose.model("CurveFileStatus", CurveStatusSchema);

module.exports = {
    schema: CurveStatusSchema,
    model: model
};