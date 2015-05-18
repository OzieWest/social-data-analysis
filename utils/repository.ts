/// <reference path="../types/project.d.ts" />

var qs = require('querystring');
var request = require('request');

function method(name: string): string {
	return 'https://api.vk.com/method/' + name;
}

module.exports.getUser = (uid, callback) => {
	var query = qs.stringify({
		uids: uid,
		fields: 'sex,bdate,city,country,timezone,has_mobile,contacts,counters,last_seen'
	});
	var url = method('users.get?') + query;
	request(url, (e, r, body) => {
		if (e) {
			return callback(e);
		}
		var data = JSON.parse(body);
		callback(e, data);
	});
};

module.exports.getFriends = (uid, callback) => {
	var query = qs.stringify({
		user_id: uid,
		order: 'name',
		count: 1000,
		offset: 0,
		fields: 'sex,bdate,city,country,counters,has_mobile'
	});
	var url = method('friends.get?') + query;
	request(url, (e, r, body) => {
		if (e) {
			return callback(e);
		}
		var data = JSON.parse(body);
		callback(e, data);
	});
};