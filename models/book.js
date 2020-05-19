let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let BookSchema = new Schema({
    title: {type: String, required: true, max: 100},
    genre: [{type: Schema.Types.ObjectId, ref: 'Genre', required: true}],
    author: {type: Schema.Types.ObjectId, ref: 'Author', required: true},
    summary: {type: String, max: 1000},
    isbn: {type: String, max: 100, required: true}
});

//Virtual for Book's url
BookSchema
.virtual('url')
.get(function () {
    return '/catalog/book/' + this._id;
});

module.exports = mongoose.model('Book', BookSchema);