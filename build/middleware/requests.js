"use strict";

module.exports = function () {
  return function (arg1, arg2, arg3) {
    var isKoa = false;
    var next;
    var req;
    var res;

    if (!next) {
      isKoa = true;
      res = arg1.res;
      req = arg1.request;
      next = arg2;
    } else {
      req = arg1;
      res = arg2;
      next = arg3;
    }

    var startHrTime = process.hrtime();
    res.on('finish', function () {
      var elapsedHrTime = process.hrtime(startHrTime);
      var elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;
      log.metric({
        type: 'httpRequest',
        event: 'httpRequest',
        path: req.path,
        hostname: req.hostname,
        method: req.method,
        fresh: req.fresh,
        statusCode: res.statusCode,
        userAgent: req.headers['user-agent'],
        ip: req.headers['x-forwarded-for'] || req.connection && req.connection.remoteAddress,
        milliseconds: elapsedTimeInMs
      });
    });
    return next();
  };
};