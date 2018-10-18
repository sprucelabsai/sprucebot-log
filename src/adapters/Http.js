// @flow
import type { Metric } from '../types/Metric';

const request = require('superagent');

const CLIENT = typeof window !== 'undefined';

module.exports = class Http {
	host: string;
	appName: string;
	appKey: ?string;
	appEnv: string;

	constructor({ appName, appKey, appEnv }: { appName: string, appKey?: string, appEnv: string }) {
		this.host = 'https://metrics.sprucebot.com';
		this.appName = appName;
		this.appKey = appKey;
		this.appEnv = appEnv;
		if (CLIENT && window.METRICS_URL) {
			this.host = window.METRICS_URL;
		} else if (!CLIENT && process.env.METRICS_URL) {
			this.host = process.env.METRICS_URL;
		}
	}
	async sendMetrics(metrics: Array<Metric>) {
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
