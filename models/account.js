var mg = require('mongoose');
var Schema = mg.Schema;
var pspLocMg = require('passport-local-mongoose');

var Account = new Schema({
	username: String,
	fname: String,
	name: String,
	phone: String,
	address: String,
	postal: String,
	school: String,
	city : String,
	email: String,
	Type: String,
	birth: Date,
	password: String,
	active : Boolean
});

Account.plugin(pspLocMg);

module.exports = mg.model('Account', Account);