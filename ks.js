var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expSession = require('express-session');
var layouts = require('ejs-layouts');
var http = require('http');
var https = require('https');
var nm = require('nodemailer');
var mg = require('mongoose');
var psp = require('passport');
var logger = require('morgan');
var fs = require('fs');
var methodOverride = require('method-override');
var LocalStrategy = require('passport-local').Strategy;
var db = mg.connection;

var ks = express();

var options2 = {
	key : fs.readFileSync('./cert/key.pem'),
	cert : fs.readFileSync('./cert/cert.pem')
};

var server = https.Server(options2, ks);
//var server = http.Server(ks);
var io = require('socket.io')(server);

ks.set('port', process.env.PORT || 443);
ks.set('views', __dirname + '/views');
ks.set('view engine', 'ejs');
ks.use(layouts.express);

ks.use(logger('combined'));
ks.use(bodyParser.urlencoded({ extended: false}));
ks.use(methodOverride());
ks.use(cookieParser('secret'));
ks.use(expSession({ 
	secret: 'r409l4210u',
	resave: false,
	saveUninitialized: true
}));
ks.use(psp.initialize());
ks.use(psp.session());
ks.use(express.static(__dirname + '/public'));

var acc = require('./models/account');
var school = require('./models/school')
var city = require('./models/villes');
psp.use(new LocalStrategy(acc.authenticate()));
psp.serializeUser(acc.serializeUser());
psp.deserializeUser(acc.deserializeUser());

var options = {
	user : 'fullaccess',
	pass : 'mCQHqtZMNQCczt0zhYWuU6rkxOdQCNJBVNOcoU6M'
}
//mg.connect('mongodb://127.0.0.1:27017/koosky', options);
mg.connect('mongodb://128.78.243.197:27017/koosky', options); //distant server

require('./routes')(ks);

var users = {};
var sockets = {};

io.sockets.on('connection', function(socket){
	socket.on('delete', function(username){
			acc.remove({
				"username" : username 
			}, function(err, removed)
			{
				console.log(removed);
			});
	});
	socket.on('isactive', function(user){
		acc.find({ username : user }, { salt : 0, hash : 0, username : 0, email : 0, type : 0, _id : 0, __v : 0}, function(err, active){
			var status;
			var tmp;
			if (err)
				throw err;
			if (active.length != 0)
				tmp = active[0].active;
			if (tmp == undefined)
				status = "none";
			else if ((typeof tmp) == "boolean")
				status = tmp;
			if (status != null)
				socket.emit('status', status);
		});
	});
	socket.on('add', function(name, address, phone){
		var img = name.replace(" ", "_");
		var Icon = "/img/" + img + ".jpg";
		var newschool = new school({ Name : name, Address : address, Phone : "0642609794", Icon : Icon });
		newschool.save(function(err){
			if (err)
				throw (err);
			else
				console.log('a new school was added, her name is : ' + name);
		});
	});

	socket.on('school', function(Name){
		school.find({ $text : { $search : Name } }, { _id : 0, __v : 0}, function(err, school){
			if (err)
				throw (err);
			else
			{
				if (school.length >= 1)
				{
					console.log('true');
					socket.emit('schooldb', true);
				}
				else if (school.length == 0)
				{
					console.log('false');
					socket.emit('schooldb', false);
				}
			}
		});
	});

	socket.on('veruser', function(veruser){
		acc.find({ username : veruser }, function(err, whuser){
			if (err)
				throw (err);
			if (whuser.length == 0)
				socket.emit('userdb', true);
			else
				socket.emit('userdb', false);
		});
	});

	socket.on('vercity', function(vercity){
		city.find({ Name : vercity }, function(err, whcity){
			if (whcity.length == 1)
			{
				console.log(whcity[0].Postal_Code);
				socket.emit('citydb', true, whcity[0].Postal_Code);
			}
			else
				socket.emit('citydb', false);
		});
	});

	socket.on('veremail', function(veremail){
		acc.find({ email : veremail }, function(err, whemail){
			if (err)
				throw (err);
			if (whemail.length == 0)
				socket.emit('emaildb', true);
			else
				socket.emit('emaildb', false);
		});
	});

	/*socket.on('address', function(address){
		console.log(address);
	});*/
	socket.on('city', function(Name, Postal){
		console.log('Name : ' + Name);
		console.log('Postal : ' + Postal);
		console.log(typeof Name);
		if ((Name != null) && ((typeof Name) == "string") && (Postal != null) && ((typeof Postal) == "string"))
		{
			console.log('ok');
			var newcity = new city({ Name : Name, Postal_Code : Postal });
			newcity.save(function(err){
				if (err)
					console.log(err);
				else
					console.log('an other city was added ! ' + Name);
			});
		}
	});

	socket.on('connected', function(username){
		if (username)
		{
			console.log('username : ' + username);
			users[username] = socket.id; //on à l'id qui renvoi au compte
			console.log('socket.id : ' + socket.id);
			sockets[socket.id] = { username : username, socket : socket };
			console.log("socket : " + sockets); 
			//on se sert de l'id pour stocker notre username et notre socket
		}
	});

	socket.on('private', function(to, msg, me){
		if (sockets[users[to]])
		{
			console.log("socket.id : " + socket.id);
			var from = sockets[users[me]].username
			sockets[users[to]].socket.emit('msg', msg, from);
		}
	});

	//socket.on('check', function(req, res){
	//	res.redirect('/check', { mail : req.mail });
	//});
});

server.listen(ks.get('port'), function(){
	console.log('the server is listening on port ' + ks.get('port'));
});