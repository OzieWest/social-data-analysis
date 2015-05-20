/// <reference path="types/project.d.ts" />

var fs = require('fs');
var async = require('async');
var repo = require('./utils/repository');
var logger = require('./utils/log_factory').getLogger();

/* Data */
var selections = require('./selection');
var mockedData = require('./mocked_data');

var tempFolder = 'temp/';

function createProfile(data) {
    var profile = data.user.response[0];
    var friends = data.friends.response || [];
    var subscriptionsCount = data.subscriptions.response.length || 0;

    profile['subscriptions'] = {
        count: subscriptionsCount
    };
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
        place: {
            sameCountry: friends.filter((item) => item.country == profile.country).length,
            sameCity: friends.filter((item) => item.city == profile.city).length
        }
    };
    return profile;
}

function collectProfileData(uid, finalCallback) {
    async.auto({
        'user': [(callback) => {
            repo.getUser(uid, callback);
        }],
        'friends': [(callback) => {
            repo.getFriends(uid, callback);
        }],
        'subscriptions': [(callback) => {
            repo.getSubscriptions(uid, callback);
        }],
        'saveData': ['user', 'friends', 'subscriptions', (callback, results) => {
            fs.writeFile(tempFolder + uid + '.json', JSON.stringify(results), 'utf-8', callback);
        }],
        'profile': ['saveData', (callback, results) => {
            var profile = createProfile(results);
            callback(null, profile);
        }],
        'saveProfile': ['profile', (callback, results) => {
            fs.writeFile(tempFolder + uid + '-profile.json', JSON.stringify(results.profile), 'utf-8', callback);
        }]
    }, finalCallback);
}

/** Run */
var allData = [];
async.eachLimit(selections.humans, 10, function (uid, callback) {
    collectProfileData(uid, function (err, result) {
        logger.debug('Done: ', uid);
        allData.push(result.profile);
        callback(err, result);
    });
}, function (err) {
    if (err) {
        return logger.error(err);
    }
    logger.debug('Data: ', allData.length);
});