/// <reference path="types/project.d.ts" />

var fs = require('fs');
var async = require('async');
var repo = require('./utils/repository');
var logger = require('./utils/log_factory').getLogger();
var brain = require('brain');

/* Data */
var selections = require('./selection');
var mockedData = require('./mocked_data');

var tempFolder = 'temp/';

function createProfile(data) {
    var profile = data.user.response[0];
    var friends = data.friends.response || [];
    var subscriptionsCount = data.subscriptions.response.length || 0;

    profile.last_seen = profile.last_seen || {};
    profile.counters = profile.counters || {};

    profile.subscriptions = {
        count: subscriptionsCount
    };
    profile.friends = {
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

function normalizeValue(value) {
    return (value || 0) / 100000;
}

function createTrainData(profile, human: Boolean) {
    var uid = profile.uid;

    var input = {
        hasMobile: normalizeValue(profile.has_mobile),
        lastSeenPlatform: normalizeValue(profile.last_seen.platform),
        albums: normalizeValue(profile.counters.albums),
        videos: normalizeValue(profile.counters.videos),
        audios: normalizeValue(profile.counters.audios),
        notes: normalizeValue(profile.counters.notes),
        photos: normalizeValue(profile.counters.photos),
        gifts: normalizeValue(profile.counters.gifts),
        followers: normalizeValue(profile.counters.followers),
        subscriptions: normalizeValue(profile.subscriptions.count),
        friends: normalizeValue(profile.friends.count),
        friendsMan: normalizeValue(profile.friends.man.count),
        friendsManMobile: normalizeValue(profile.friends.man.mobile),
        friendsWoman: normalizeValue(profile.friends.woman.count),
        friendsWomanMobile: normalizeValue(profile.friends.woman.mobile),
        friendsOther: normalizeValue(profile.friends.other.count),
        friendsOtherMobile: normalizeValue(profile.friends.other.mobile),
        friendsNoMobile: normalizeValue(profile.friends.noMobile.count),
        friendsCountry: normalizeValue(profile.friends.place.sameCountry),
        friendsCity: normalizeValue(profile.friends.place.sameCity)
    };

    var output = {
        sex: profile.sex === 1 ? 0 : 1,
        human: human
    };

    return { input: input, output: output };
}

function collectProfileData(uid, human, finalCallback) {
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
        }],
        'trainData': ['saveProfile', (callback, results) => {
            var data = createTrainData(results.profile, human);
            callback(null, data);
        }],
        'saveTrainData': ['trainData', (callback, results) => {
            fs.writeFile(tempFolder + uid + '-trainData.json', JSON.stringify(results.trainData), 'utf-8', callback);
        }]
    }, finalCallback);
}

function prepareData(name: string, human: number) {
    var allData = [];
    async.eachLimit(selections[name], 10, function(uid, callback) {
        collectProfileData(uid, human, function(err, result) {
            logger.debug('Done: ', uid);
            allData.push(result.trainData);
            callback(err, result);
        });
    }, function(err) {
            if (err) {
                return logger.error(err);
            }
            fs.writeFile(tempFolder + name + '.json', JSON.stringify(allData), 'utf-8', function() {
                logger.debug('Data: ', allData.length);
            });
        });
}

// prepareData('humanOne', 1);
// prepareData('humanFull', 1);
// prepareData('botTest', 0);