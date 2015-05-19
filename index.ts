/// <reference path="types/project.d.ts" />

var fs = require('fs');
var async = require('async');
var repo = require('./utils/repository');
var logger = require('./utils/log_factory').getLogger();

/* Data */
var selections = require('./selection');
var mockedData = require('./mocked_data');

function createProfile(data) {
    var profile = data.usersGet.response[0];
    var friends = data.friendsGet.response || [];

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
        }
    };
    return profile;
}
var tempFolder = 'temp/';

selections.humans.forEach((uid) => {
    async.auto({
        'usersGet': [(callback) => {
            repo.getUser(uid, callback);
        }],
        'friendsGet': [(callback) => {
            repo.getFriends(uid, callback);
        }],
        'saveData': ['usersGet', 'friendsGet', (callback, results) => {
            fs.writeFile(tempFolder + uid + '.json', JSON.stringify(results), 'utf-8', callback);
        }],
        'profile': ['saveData', (callback, results) => {
            var profile = createProfile(results);
            callback(null, profile);
        }],
        'saveProfile': ['profile', (callback, results) => {
            fs.writeFile(tempFolder + uid + '-profile.json', JSON.stringify(results.profile), 'utf-8', callback);
        }]
    }, (err, results) => {
        if (err) {
            return logger.error(err);
        }
        logger.debug('Done: ', uid);
    });
});