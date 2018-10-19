"use strict";

module.exports = function () {
  return function (ctx, next) {
    ctx.res.on('finish', function () {
      console.log('****** FINISH *******'); // log.metric({
      // 	type: 'httpRequest',
      // 	event: 'httpRequest',
      // 	path: req.path,
      // 	hostname: req.hostname,
      // 	method: req.method,
      // 	fresh: req.fresh,
      // 	statusCode: res.statusCode,
      // 	userAgent: req.headers['user-agent'],
      // 	ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
      // });
    }); // next();
  };
};