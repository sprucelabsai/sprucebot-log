const os = require('os');

module.exports = () => {
	return (req, res, next) => {
		res.on('finish', function() {
			log.metric({
				type: 'httpRequest',
				event: 'httpRequest',
				path: req.path,
				hostname: req.hostname,
				method: req.method,
				fresh: req.fresh,
				statusCode: res.statusCode,
				userAgent: req.headers['user-agent'],
				ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
			});
		});
		next();
	};
};
