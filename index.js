var request = require('request')
qs = require('querystring'),
async = require('async');

var uid = process.argv[2];
if (!uid) {
	throw Error('Third paramert should be UID');
}

var uids = uid.split(',');

function method(name) {
	return 'https://api.vk.com/method/' + name;
}

function getData(uid){
	async.auto({
		'users.get': function (callback) {
			usersGet(uid, callback);
		}
	}, function (err, results) {
		if (err) {
			return console.error(err);
		}
		console.log(results);
	});
}

function usersGet(uid, callback) {
	var url = method('users.get') + '?' + qs.stringify({
		uids: uid,
		fields: 'nickname,screen_name,sex,bdate,city,country,timezone,photo,photo_medium,photo_big,has_mobile,contacts,education,online,counters,relation,last_seen,activity,can_write_private_message,can_see_all_posts,can_post,universities'
	});
	request(url, function (e, r, body) {
		callback(e, body);
	});
}

uids.forEach(function (uid) {
	getData(uid);
});
