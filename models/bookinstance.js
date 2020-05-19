let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let moment = require('moment');

let BookinstanceSchema = new Schema({
    book: {type: Schema.Types.ObjectId, ref: 'Book', required: true},
    imprint: {type: String, required: true, max: 100},
    status: {type: String, required: true, enum: ['Available', 'Maintaintence', 'Loaned', 'Reserved']},
    due_back: {type: Date}
});

//Virtual for bookinstance's url
BookinstanceSchema.virtual('url').get(function () {
    return '/catalog/bookinstance/' + this._id;
});

//Virtual for bookinstance's due back
BookinstanceSchema.virtual('formated_due_back').get(function () {
    return moment(this.due_back).format('YYYY-MM-DD');
});

module.exports = mongoose.model('Bookinstance', BookinstanceSchema);