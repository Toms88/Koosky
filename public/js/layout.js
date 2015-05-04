
var socket;

if (!socket)
	socket = io.connect('https://128.78.243.197/'); //distant db
//var socket = io.connect('127.0.0.1:8080');
var $schverif = $('#schverif');
var $typeverif = $('#typeverif');
var $find = $('#find');
var $school = $('#school');
var $schform = $('#schform');

$schverif.hide();
$typeverif.hide();

$(document).ready(function(){
	$find.click(function(){
		var Name = $school.val();
		console.log(typeof Name);
		if ((typeof Name == "string") && (Name.length >= 2))
		{
			socket.emit('school', Name);
		}
		else
		{
			$typeverif.show(400).delay(2000).hide(400);
			return (false);
		}
	});
	socket.on('schooldb', function(bool){
		if (bool == true)
		{
			console.log('we submit');
			$schform.submit();
		}
		else
		{
			$schverif.show(400).delay(2000).hide(400);
			return (false);
		}
	});
});