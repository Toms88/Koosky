var mg = require('mongoose');
var Schema = mg.Schema;

var City = new Schema({
	Name: String,
	Postal_Code : String
});

module.exports = mg.model('City', City);