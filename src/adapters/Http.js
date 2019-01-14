// @flow
import type { Metric } from '../types/Metric'
import type { Log } from '../types/Log'

const request = require('superagent')

const CLIENT = typeof window !== 'undefined'

module.exports = class Http {
	host: string
	logUrl: string
	appName: string
	appKey: ?string
	appEnv: string

	constructor({
		appName,
		appKey,
		appEnv,
		metricsUrl,
		logUrl
	}: {
		appName: string,
		appKey?: string,
		appEnv: string,
		metricsUrl?: string,
		logUrl?: string
	}) {
		this.host = metricsUrl || 'https://metrics.sprucebot.com'
		this.logUrl = logUrl
		this.appName = appName
		this.appKey = appKey
		this.appEnv = appEnv
		if (!metricsUrl && CLIENT && window.METRICS_URL) {
			this.host = window.METRICS_URL
		} else if (!metricsUrl && !CLIENT && process.env.METRICS_URL) {
			this.host = process.env.METRICS_URL
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
			.send(metrics)
	}
	async sendLogs(logs: Array<Log>) {
		if (!this.logUrl) {
			console.warn('Unable to send logs because log host is not set')
			return
		}
		await request
			.post(this.logUrl)
			.set({
				'x-app-name': this.appName,
				'x-app-key': this.appKey,
				'x-app-env': this.appEnv
			})
			.timeout(3000)
			.send(logs)
	}
}
