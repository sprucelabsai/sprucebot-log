// @flow
const SocketIO = require('socket.io-client')

const CLIENT = typeof window !== 'undefined'

module.exports = class Sockets {
	host: string

	constructor() {
		this.host = 'https://metrics.sprucebot.com'
		if (CLIENT && window.METRICS_URL) {
			this.host = window.METRICS_URL
		} else if (!CLIENT && process.env.METRICS_URL) {
			this.host = process.env.METRICS_URL
		}
		this.socket = new SocketIO()
	}
	async sendMetrics(metrics) {}
}
