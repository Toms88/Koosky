var mg = require('mongoose');
var Schema = mg.Schema;

var School = new Schema({
	Name : String,
	Address : String,
	Phone : String,
	Icon : String
});

module.exports = mg.model('School', School);