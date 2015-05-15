/// <reference path="types/project.d.ts" />

var async: Async = require('async');
var repo = require('./utils/repository');

/* Params */
var uid = process.argv[2];
if (!uid) {
	throw Error('Third parameter should be UIDs');
}
var uids = uid.split(',');

/* Run */
uids.forEach((uid) => {
	async.auto({
		'users.get': (callback) => {
			repo.getUserData(uid, callback);
		}
	}, (err, results) => {
			if (err) {
				return console.error(err);
			}
			console.log(results);
		});
});
