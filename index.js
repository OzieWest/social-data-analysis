/// <reference path="types/project.d.ts" />
var async = require('async');
var repo = require('./utils/repository');
/* Params */
var uid = process.argv[2];
if (!uid) {
    throw Error('Third parameter should be UIDs');
}
var uids = uid.split(',');
/* Run */
uids.forEach(function (uid) {
    async.auto({
        'users.get': function (callback) {
            repo.getUserData(uid, callback);
        }
    }, function (err, results) {
        if (err) {
            return console.error(err);
        }
        console.log(results);
    });
});
