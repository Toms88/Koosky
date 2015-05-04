var $div = $('#logform');
var $form = $('#form');
var $username = $('#user');
var $but = $('#button');
var $len = $('#short');
var $dis = $('#nactive');
var $none = $('#nexist');

$len.hide();
$dis.hide();
$none.hide();
$but.click(function(){
	console.log('click');
	var user = $username.val();
	if ((user.length >= 4))
	{
		socket.emit('isactive', user);
	}
	else
	{
		$form.addClass('has_error');
		$len.show(400).delay(2000).hide(400);
		return (false);
	}
});
socket.on('status', function(status){
	if (status == false)
	{
		$form.addClass('has_error');
		$dis.show(400).delay(4000).hide(400);
		return (false);
	}
	else if (status == true)
	{
		$form.submit();
	}
	else if (status == "none")
	{
		$form.addClass('has_error');
		$none.show(400).delay(4000).hide(400);
		return (false);
	}
});