/// <reference path="types/project.d.ts" />
var async = require('async');
var repo = require('./utils/repository');
var logger = require('./utils/log_factory').getLogger();
/* Data */
var selections = require('./selection');
var mockedData = require('./mocked_data');
function collectData(data) {
    /* Run */
    data.forEach(function (uid) {
        async.auto({
            'users.get': function (callback) {
                repo.getUser(uid, callback);
            },
            'friends.get': function (callback) {
                repo.getFriends(uid, callback);
            }
        }, function (err, results) {
            if (err) {
                return logger.error(err);
            }
            //logger.debug(JSON.stringify(results));
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
            count: friends.filter(function (item) { return item.sex === 2; }).length,
            mobile: friends.filter(function (item) { return item.sex === 2 && item.has_mobile === 1; }).length
        },
        woman: {
            count: friends.filter(function (item) { return item.sex === 1; }).length,
            mobile: friends.filter(function (item) { return item.sex === 1 && item.has_mobile === 1; }).length
        },
        other: {
            count: friends.filter(function (item) { return item.sex !== 1 && item.sex !== 2; }).length,
            mobile: friends.filter(function (item) { return item.sex !== 1 && item.sex !== 2 && item.has_mobile === 1; }).length
        },
        noMobile: {
            count: friends.filter(function (item) { return item.has_mobile !== 1; }).length,
            uids: friends.filter(function (item) { return item.has_mobile !== 1; }).map(function (item) { return item.uid; })
        }
    };
    return profile;
}
var profile = createProfile(mockedData);
logger.debug('profile: ', profile);
//collectData(selections.bots); 
