/// <reference path="../types/project.d.ts" />

var log4js = require('log4js');
log4js.configure({
    appenders: [
        {
            type: 'console'
        },
        {
            type: 'file',
            filename: 'logs/' + new Date().toDateString() + '.log'
        }
    ]
});

module.exports = log4js;