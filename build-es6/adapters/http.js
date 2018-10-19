//      
                                              

const request = require('superagent');

const CLIENT = typeof window !== 'undefined';

module.exports = class Http {
	             
	                
	                
	               

	constructor({ appName, appKey, appEnv, metricsUrl }                                                                           ) {
		this.host = metricsUrl || 'https://metrics.sprucebot.com';
		this.appName = appName;
		this.appKey = appKey;
		this.appEnv = appEnv;
		if (CLIENT && window.METRICS_URL) {
			this.host = window.METRICS_URL;
		} else if (!CLIENT && process.env.METRICS_URL) {
			this.host = process.env.METRICS_URL;
		}
	}
	async sendMetrics(metrics               ) {
		await request
			.post(`${this.host}/api/1.0/metrics`)
			.set({
				'x-app-name': this.appName,
				'x-app-key': this.appKey,
				'x-app-env': this.appEnv
			})
			.timeout(3000)
			.send(metrics);
	}
};
