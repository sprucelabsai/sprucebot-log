module.exports = () => {
	return (arg1, arg2, arg3) => {
		let isKoa = false;
		let next;
		let req;
		let res;

		if (!arg3) {
			isKoa = true;
			res = arg1.res;
			req = arg1.request;
			next = arg2;
		} else {
			req = arg1;
			res = arg2;
			next = arg3;
		}
		const startTime = log.timerStart();

		res.on('finish', () => {
			const elapsedTimeInMs = log.timerEnd(startTime);

			log.metric({
				type: 'httpRequest',
				event: 'httpRequest',
				path: req.path,
				hostname: req.hostname,
				method: req.method,
				fresh: req.fresh,
				statusCode: res.statusCode,
				userAgent: req.headers['user-agent'],
				ip: req.headers['x-forwarded-for'] || (req.connection && req.connection.remoteAddress),
				milliseconds: elapsedTimeInMs
			});
		});
		return next();
	};
};
