//var socket = io.connect('http://127.0.0.1:1337');
var $send = $('#send');
var $email = $('#email');
var $register = $('#regform');
var $mess = $('#message');
var $user = $('#user');
var $first = $('#first');
var $last = $('#last')
var $tel = $('#tel');
var $address = $('#address');
var $postal = $('#postal');
var $city = $('#city');
var $born = $('#born');
var $pass1 = $('#pass1');
var $pass2 = $('#pass2');
var $ulen = $('#ulen');
var $flen = $('#flen');
var $llen = $('#llen');
var $tlen = $('#tlen');
var $vlen = $('#vlen');
var $adlen = $('#adlen');
var $polen = $('#polen');
var $pwlen = $('#pwlen');
var $verpass = $('#verpass');
var $everif = $('#everif');
var $averif = $('#averif');
var $cityverif = $('#cityverif');
var $veruser = $('#veruser');
var $veremail = $('#veremail');
var $verbirth = $('#verbirth');
var username;
var fname;
var lname;
var tel;
var city;
var address;
var email;
var type;
$ulen.hide();
$flen.hide();
$llen.hide();
$tlen.hide();
$vlen.hide();
$adlen.hide();
$polen.hide();
$pwlen.hide();
$everif.hide();
$averif.hide();
$cityverif.hide();
$veruser.hide();
$veremail.hide();
$verpass.hide();
$verbirth.hide();

function test(email)
{
	var reg = new RegExp('^[a-z0-9]+([_|\.|-]{1}[a-z0-9]+)*@[a-z0-9]+([_|\.|-]{1}[a-z0-9]+)*[\.]{1}[a-z]{2,6}$', 'i');
	if(reg.test(email))
	{
		return(true);
	}
	else
	{
		return(false);
	}	
}

function birth(date)
{
	if (typeof date == "string")
	{
		var year = parseInt(date[0] + date[1] + date[2] + date[3]);
		var month = parseInt(date[5] + date[6]);
		var day = parseInt(date[8] + date[9]);
		if ((year > 1930) && ((day >= 01) && (day <= 31)) && ((month >= 01) && (month <= 12)))
			return (true);
		else
			return (false);
	}
	else
		return (false);
}

$(document).ready(function(){
	var to;

	$city.autocomplete({
		source : function(req, res){
			$.ajax({
				url : '/comp',
				dataType : 'json',
				data : { Name : $city.val(), maxRows : 5 }
			})
			.done(function(Name){
				var i = 1;
				res($.map(Name, function(object){
					return(object.Name);
				}));
			})
			.fail(function(){
				//fail
			})
			.always(function(){
				//recherche terminée
			});
		},
		minLength : 2
	});

	$send.click(function(){
		console.log('ok ' + $user.val());
		username = $user.val();
		if ((username.length < 4) || (username == null) || (typeof username == undefined))
		{
			$register.addClass('has_error');
			$ulen.show(400).delay(2000).hide(400);
			$register.removeClass('has_error');
			return (false);
		}
		else
			socket.emit('veruser', username);
	});

	socket.on('userdb', function(ubool)
	{
		if (ubool == false)
		{
			$register.addClass('has_error');
			$veruser.show(400).delay(2000).hide(400);
			$register.removeClass('has_error');
			return (false);
		}
		else
		{
			fname = $first.val();
			if ((fname.length < 2) || (fname == null) || (typeof fname == undefined))
			{
				$register.addClass('has_error');
				$flen.show(400).delay(2000).hide(400);
				$register.removeClass('has_error');
				return (false);
			}
			else
			{
				lname = $last.val();
				if ((lname.length < 2) || (lname == null) || (typeof lname == undefined))
				{
					$register.addClass('has_error');
					$llen.show(400).delay(2000).hide(400);
					$register.removeClass('has_error');
					return (false);
				}
				else
				{
					tel = $tel.val();
					if ((tel.length != 10) || (tel == null) || (typeof tel == undefined))
					{
						$register.addClass('has_error');
						$tlen.show(400).delay(2000).hide(400);
						$register.removeClass('has_error');
						return (false);
					}
					else if (tel[0] != "0")
					{
						$register.addClass('has_error');
						$vlen.show(400).delay(2000).hide(400);
						$register.removeClass('has_error');
						return (false);
					}
					else
					{
						address = $address.val();
						if ((address.charCodeAt(0) < 48) || (address.charCodeAt(0) > 57) || 
							(typeof address == "undefined") || (address == null))
						{
							$register.addClass('has_error');
							$adlen.show(400).delay(2000).hide(400);
							$register.removeClass('has_error');
							return (false);
						}
						else
						{
							city = $city.val();
							if (typeof city != "undefined")
								socket.emit('vercity', city);
							else
							{
								$register.addClass('has_error');
								$cityverif.show(400).delay(2000).hide(400);
								$register.removeClass('has_error');
								return (false);
							}
						}
					}
				}
			}
		}
	});
							
	socket.on('citydb', function(bool, postal){
		if (bool == false)
		{
			$register.addClass('has_error');
			$cityverif.show(400).delay(2000).hide(400);
			$register.removeClass('has_error');
			return (false);
		}
		else
		{
			if ($postal.val() != postal || ((typeof $postal.val()) == "undefined"))
			{
				$postal.val(postal);
			}
			//ici vérifier le mot de passe
			console.log(typeof $born.val());
			console.log(birth($born.val()));
			if (birth($born.val()) == false)
			{
				$register.addClass('has_error');
				$verbirth.show(400).delay(2000).hide(400);
				$register.removeClass('has_error');
				return (false);
			}
			else
			{
				if ((CryptoJS.SHA1($pass1.val()).toString(CryptoJS.enc.Base64)) != (CryptoJS.SHA1($pass2.val()).toString(CryptoJS.enc.Base64)))
				{
					$register.addClass('has_error');
					$verpass.show(400).delay(2000).hide(400);
					$register.removeClass('has_error');
					return (false);
				}
				else
				{
					email = $email.val();
					if (test(email) == false)
					{
						$register.addClass('has_error');
						$everif.show(400).delay(2000).hide(400);
						$register.removeClass('has_error');
						return (false);
					}
					else
						socket.emit('veremail', email);
				}
			}
		}
	});
	socket.on('emaildb', function(bool){
		if (bool == false)
		{
			$register.addClass('has_error');
			$veremail.show(400).delay(2000).hide(400);
			$register.removeClass('has_error');
			return (false);
		}
		else
		{
			type = document.getElementById("type").value;
			if ((type == "visiteur") || (type == "étudiant"))
			{
				$register.css("display", $register.css("display") === 'none' ? 'none' : 'none');
				$mess.empty().html("<p>Please wait a few time... </p>");
				to = $email.val();
				var jqxhr = $.get("https://128.78.243.197/send", { to : to })
				.done(function(){
					$register.submit();
					$mess.empty().html("<p>email was sent ! </p><br /><p>if you click <a href=\"/\">here</a> you will go to Homepage ! </p>");
				})
				.fail(function(){
					$mess.empty().html("<p>an error occured ! </p>");
				});
			}
			else
			{
				$register.addClass('has_error');
				$averif.show(400).delay(2000).hide(400);
				$register.removeClass('has_error');
				return (false);
			}
		}
	});
});