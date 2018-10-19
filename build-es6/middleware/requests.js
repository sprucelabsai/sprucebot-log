module.exports = () => {
	return (arg1, arg2, arg3) => {
		let isKoa = false;
		let next;
		let req;
		let res;

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

		res.on('finish', () => {
			log.metric({
				type: 'httpRequest',
				event: 'httpRequest',
				path: req.path,
				hostname: req.hostname,
				method: req.method,
				fresh: req.fresh,
				statusCode: res.statusCode,
				userAgent: req.headers['user-agent'],
				ip: req.headers['x-forwarded-for'] || (req.connection && req.connection.remoteAddress)
			});
		});
		return next();
	};
};
