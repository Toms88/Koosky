var psp = require('passport');
var acc = require('./models/account');
var city = require('./models/villes');
var school = require('./models/school');
var nodemailer = require('nodemailer');

module.exports = function(ks)
{
	var smtpTransport = nodemailer.createTransport("SMTP", {
		service: "Hotmail",
		auth: {
			user: "koosky-beta@outlook.fr",
			pass: "Azerty88000"
		}
	});
	var rand;
	var mailOptions;
	var host;
	var link;
	ks.get('/', function(req, res){
		//res.render('home', { title : "Welcome into KooSky", user : req.user })
		res.layout('layout', { user : req.user }, { content : { block : "home", data : { user : req.user } } });
		//res.render('index', { user : req.user });
	});
	
	ks.get('/school/:id', function(req, res){
		console.log('ok');
		if (req.params.id != '')
		{
			if (req.user)
			{
				id = req.params.id;
				school.find({ _id : id }, { __v : 0 }, function(err, myschool){
					if (err)
						throw (err);
					else if (myschool.length == 1)
					{
						acc.find({ school : myschool[0].Name, active : true, Type : "étudiant" }, function(err, helpers){
							if (err)
								throw err;
							console.log('helpers : ' + helpers);
							res.layout('layout', { title : myschool[0].Name, user : req.user }, { content : { block : "school", data : { title : myschool[0].Name, school : myschool[0], Type : req.user.Type, helpers : helpers } } });
						});
					}
					else
						res.render('error')
				});
			}
			else
				res.render('error', { scherror : true });
		}
	});

	ks.get('/register', function(req, res){
		var user;
		if (typeof req.user != "undefined")
			user = req.user;
		res.layout('layout', { title : "Register", user : user }, { content : { block : "register", data : { user : user } } });
		//res.render('register', { });
	});
	
	ks.post('/register', function(req, res){
		acc.register(new acc({ username : req.body.username, fname : req.body.firstname, name : req.body.lastname, phone : req.body.cell, address : req.body.addr, postal : req.body.postal, school : req.body.school, city : req.body.city,born : req.body.born, email : req.body.email, Type : req.body.acctype, active : false, birth : req.body.birth}), req.body.password, function(err, acc){
			if (err){
				return (res.render('register'));
			}
			else
				console.log('register in progress...');
		});
	});

	ks.get('/login', function(req, res){
		res.layout('layout', { title : "Log in", user : req.user }, { content : { block : "login", data : { title : "Log in", error : false, user : req.user } } });
		//res.render('login', { user : req.user });
	});

	ks.post('/login', function(req, res){
		psp.authenticate('local', function(err, user){
			if (err)
				throw (err);
			if (!user)
					res.layout('layout', { title : "Log in", user : req.user }, { content : { block : "login", data : { title : "Log in", error : true, user : req.user } } });
			else
			{
				req.logIn(user, function(err){
					if (err)
						throw (err);
					return (res.redirect('/'));
				});
			}
		})(req, res);
	});

	ks.post('/search', function(req, res){
		var Name = req.body.school;
		var user;
		var Type;
		school.find({ $text : { $search : Name } }, { __v : 0}, function(err, newschool){
			if (err)
				throw (err);
			else if (newschool.length == 1)
			{
				if(typeof req.user != "undefined")
				{
					user = req.user;
					Type = user.Type;
				}
				var helpers;
				acc.find({ school : newschool[0].Name, active : true, Type : "étudiant" }, function(err, users){
					if (err)
						throw err;
					else if (users)
						helpers = users;
				});
				res.layout('layout', { title : newschool[0].Name, user : user }, { content : { block : "school", data : { school : newschool[0], title : newschool[0].Name, Type : Type , helpers : helpers } } });
				//res.redirect('/school');
			}
			else
			{
				if(typeof req.user != "undefined")
				{
					user = req.user;
					Type = user.Type;
				}
				console.log('schools : ' + newschool);
				console.log('school 1 : ' + newschool[0]);
				console.log('school 2 : ' + newschool[1]);
				res.layout('layout', { title : "Resultats", user : user }, { content : { block : "search", data : { schools : newschool, title : "choisissez une école parmis celles-ci" } } });
			}
		});
	});

	ks.get('/logout', function(req, res){
		req.logout();
		res.redirect('/');
	});

	ks.get('/send', function(req, res){
		rand = Math.floor((Math.random() * 1000) + 42);
		host = req.get('host');
		link = "https://" + req.get('host') + "/verify?id=" + rand;
		mailOptions = {
			from: ' "Thomas Chezieres" <koosky-beta@outlook.fr>',
			to : req.query.to,
			subject : "Please verify your email for your KooSky account",
			html : "Hello young KooSkyer, <br /> if you really want to be one of us, you have to <a href=" + link + "> click on the following link ! </a>"
		}
		smtpTransport.sendMail(mailOptions, function(err, resp){
			if(err)
			{
				console.log(err);
				res.end("fail");
			}else
			{
				console.log('message was sent' + resp.message);
				res.end("success");
			}
		});
	});
	ks.get('/verify', function(req, res){
		console.log(req.protocol + "://" + req.get('host'));
		if ((req.protocol + "://" + req.get('host')) == ("https://" + host)){
			console.log('each domains matched')
			var verify = 0;
			if(req.query.id == rand)
			{
				verify = 1;
				acc.update({ email : mailOptions.to }, { $set : { active : true } }, { multi : false }, function(err){
					if (err)
						throw err;
					console.log('status was updated ! ');
				});
			}
			else
				verify = 0;
		}
		else
			verify = -1;
		console.log(mailOptions.to);
		var data = { verify : verify , mail : mailOptions.to };
		console.log('data.mail : ' + data.mail);
		res.render('verify', { data : data });
	});
	ks.get('/check', function(req, res){
		res.render('check', {mail : req.mail });
	});
	ks.get('/addschool', function(req, res){
		var name = req.user.username;
		console.log('name ' + name);
		acc.find({ username : name }, { active : 0, name : 0, fname : 0, phone : 0, postal : 0, school : 0, salt : 0, address : 0, hash : 0, email : 0, _id : 0, __v : 0 }, function(err, tab){
			console.log(tab[0].Type);
			if ((tab[0].Type) == "admin")
				res.layout('layout', { title : "add a school", user : name }, { content : { block : "add", data : { title : "Adding school", user : name } } });
		});
	});
	ks.get('/comp', function(req, res){
		var sch = req.query.Name;
		console.log('sch : ' + sch);
		var sch2;
		var i = 0;
		while (i < (sch.length - 1))
		{
			if (i == 0)
				sch2 = sch[i];
			else
				sch2 = sch2 + sch[i];
			i++;
		}
		sch2 = sch2 + String.fromCharCode(sch.charCodeAt((sch.length) - 1) + 1);
		console.log('sch2 : ' + sch2);
		city.find( { Name : { $gte : sch.toUpperCase(), $lt : sch2.toUpperCase() } }, {_id : 0, __v : 0}, function(err, Name){
			if (err)
				throw err;
			else
			{
				Name.sort({ Name : 1 });
				if (Name.length > 5)
				{
					var tab = [];
					i = 0;
					while (i < 5)
					{
						tab.push(Name[i]);
						i++;
					}
					res.json(tab);
				}
				else
				res.json(Name);
			}
		});
	});

	ks.get('/city', function(req, res){
		res.render('villes');
	});

	ks.get('/profile', function(req, res){
		if (req.user)
		{
			var user = req.user;
			var age;
			var date = new Date();
			var ynow = date.getFullYear();
			var mnow = date.getMonth();
			var dnow = date.getDay();
			var ybirth = user.birth.getFullYear();
			var mbirth = user.birth.getMonth();
			var dbirth = user.birth.getDay();
			age = ynow - ybirth;
			if (mnow < mbirth)
				age--;
			else if (mnow == mbirth)
			{
				if (dnow < dbirth)
					age--;
			}
			console.log('age : ' + age);
			res.layout('layout', { title : "Your Profile", user : user }, { content : { block : "profile", data : { user : user, age : age } } });
		}
		else if(!req.user)
			res.render('error', { proferr : true, scherror : false });
	});
	ks.get('/talk/:username', function(req, res) {
		if (req.user)
			var user = req.user;
		var to = req.params.username;
		res.layout('layout', { title : "Talks", user : user }, { content : { block : "talk", data : { user : user, to : to } } });
		//res.render('talk', { to : to, user : req.user });
	});
}