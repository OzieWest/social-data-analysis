/// <reference path="../types/project.d.ts" />

var qs = require('querystring');
var request = require('request');

function method(name: string): string {
	return 'https://api.vk.com/method/' + name;
}

function getUserQuery(uid: string): Query {
	return {
		uids: uid,
		fields: 'nickname,screen_name,sex,bdate,city,country,timezone,photo,photo_medium,photo_big,has_mobile,contacts,education,online,counters,relation,last_seen,activity,can_write_private_message,can_see_all_posts,can_post,universities'
	};
}

module.exports.getUserData = (uid, callback) => {
	var query = getUserQuery(uid);
	var url = method('users.get?') + qs.stringify(query);
	request(url, (e, r, body) => {
		callback(e, body);
	});
};