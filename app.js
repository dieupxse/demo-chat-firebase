var myAppRoot = new Firebase("https://jacob-demo-chat-app.firebaseio.com/");
var myAppChat = myAppRoot.child('chat');
var myAppGuest = myAppRoot.child('guest');
var myAppCountOnline = myAppRoot.child('online');

$(function() {
	var chatForm = $('#chatform');
	var result = $('#result');
	var myAppChatCon = myAppChat.child('conversation');
	var guest;
	//get user
	$.getJSON('//freegeoip.net/json/?callback=?', function(data) {
	  guest = data;
	  console.log(guest);
	  myAppGuest.orderByChild("ip").equalTo(guest.ip).limitToLast(1).on('value',function(snapshot,key) {
	  	var item = snapshot.val();
	  	if(item!=='null' && item) {
	  		console.log("User existed ");
	  	} else {
	  		console.log('Not exist - add new user');
	  		var user = {
	  			ip: guest.ip,
	  			isChating : false,
	  			isConnected: true,
	  			isOwner: false,
	  			chatWith: "",
	  			data: guest,

	  		};
	  		myAppGuest.push().set(user);
	  	}
	  });
	});
	var count = 0;
	myAppCountOnline.once("value",function(online) {
	    	if(online.val() && online.val()!=='null') {
    			count = online.val().count;	
    			myAppCountOnline.set({count: count++});
    		} else {
    			count=1;
    		}
	    });
	myAppCountOnline.onDisconnect().set({count: count});	
	//set chat name
	$('#setname').on('click',function(e) {
		e.preventDefault();
		var name = $('#name').val();
		var chatTo = $('#chatto').val();
		if(name=='' || chatTo=='') {
			alert('Please enter your name and the one who you want to talk to !');
			$('#name').focus();
			return false;
		}
		$('#chatID').val(name);
		$('#recID').val(chatTo);
		// Retrieve new posts as they are added to our database
		myAppChatCon.orderByChild("user/userId").equalTo(name).once("value", function(snapshot,key) {
			result.html('');
			console.log('run first time');
		  	var ref = myAppChatCon.orderByChild("artist/artistId").equalTo(chatTo);	
		  	ref.on('child_added',function(snapshot,key) {
		  		var chat = snapshot.val();
	  			var html="";
			  	html+="<li><b>"+chat.user.userId+"</b> -  chat to <b>"+chat.artist.artistId+"</b>: "+chat.message.msg+"</li>";
			  	result.prepend(html);	
			  	console.log('run add value');
		  	});
		  	
		});
		
	});

	//submit chatform
	chatForm.on('submit',function(e) {
		e.preventDefault();
		var d = new Date();
		var n = d.getTime();
		if($('#chatID').val()=='' || $('#recID').val()=='') {
			alert('Please enter your name and the one who you want to talk to !');
			$('#name').focus();
			return false;
		}
		var node = {
				user: {
					userId: $('#chatID').val()
				},
				artist: {
					artistId: $('#recID').val()
				},
				message: {
					msg: $('#text').val(),
					time: n
				}
			};
		myAppChatCon.push().set(node);
		$('#text').val('');
	});

	
});