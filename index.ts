/// <reference path="types/project.d.ts" />

var async: Async = require('async');
var repo = require('./utils/repository');
var logger = require('./utils/log_factory').getLogger();

/* Data */
var selections = require('./selection');
var mockedData = require('./mocked_data');

function collectData(data) {
	data.forEach((uid) => {
		async.auto({
			'users.get': (callback) => {
				repo.getUser(uid, callback);
			},
			'friends.get': (callback) => {
				repo.getFriends(uid, callback);
			}
		}, (err, results) => {
				if (err) {
					return logger.error(err);
				}
				var data = createProfile(results);
				logger.debug("profile: ", data);
			});
	});
}

function createProfile(data) {
	var profile = data['users.get'].response[0];
	var friends = data['friends.get'].response;

	profile['friends'] = {
		count: friends.length,
		man: {
			count: friends.filter((item) => item.sex === 2).length,
			mobile: friends.filter((item) => item.sex === 2 && item.has_mobile === 1).length
		},
		woman: {
			count: friends.filter((item) => item.sex === 1).length,
			mobile: friends.filter((item) => item.sex === 1 && item.has_mobile === 1).length
		},
		other: {
			count: friends.filter((item) => item.sex !== 1 && item.sex !== 2).length,
			mobile: friends.filter((item) => item.sex !== 1 && item.sex !== 2 && item.has_mobile === 1).length
		},
		noMobile: {
			count: friends.filter((item) => item.has_mobile !== 1).length,
			uids: friends.filter(item => item.has_mobile !== 1).map((item) => item.uid)
		},
	};
	return profile;
}

var profile = createProfile(mockedData);
logger.debug('profile: ', profile);

//collectData(selections.bots);