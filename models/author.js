let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let moment = require('moment');

let AuthorSchema = new Schema({
    first_name: {type: String, max: 100, required: true},
    last_name: {type: String, max: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date}
});

//Virtual for author's url
AuthorSchema.virtual('url').get(function () {
    return '/catalog/author/' + this._id;
});

//Virtual for author's date of birth
AuthorSchema.virtual('formated_date_of_birth').get(function () {
    return moment(this.date_of_birth).format('YYYY-MM-DD');
});

//Virtual for author's date of death
AuthorSchema.virtual('formated_date_of_death').get(function () {
    if (this.date_of_death !== null) {
        return moment(this.date_of_death).format('YYYY-MM-DD');
    } else {
        return 'now';
    }
});

//Virtual for author's name
AuthorSchema.virtual('name').get(function () {
    let fullName;

    if (this.first_name && this.last_name) {
        fullName = this.first_name + ' ' + this.last_name;
    } else if (this.first_name && this.last_name===undefined) {
        fullName = this.first_name;
    } else if (this.first_name===undefined && this.last_name) {
        fullName = this.last_name;
    } else {
        fullaName = '';
    }

    return fullName;
});

module.exports = mongoose.model('Author', AuthorSchema);