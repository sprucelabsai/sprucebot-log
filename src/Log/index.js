// @flow
const debug = require('debug')('@sprucelabs/log')
const IsoLog = require('./IsoLog')
const HttpAdapter = require('../adapters/Http')
const SocketAdapter = require('../adapters/Sockets')
const getTimes = require('../collectors/browser')

const CLIENT = typeof window !== 'undefined'

let os
let packageName
let packageVersion
let userAgent

if (CLIENT) {
	os = {
		hostname: () => ''
	}
	userAgent =
		typeof navigator !== 'undefined' && navigator && navigator.userAgent
			? navigator.userAgent
			: 'unknown'
} else {
	os = require('os') // eslint-disable-line
	try {
		// $FlowIgnore
		const packageJSON = require(`${process.env.PWD}/package.json`) // eslint-disable-line
		packageName = packageJSON.name
		packageVersion = packageJSON.version
	} catch (e) {
		// Do nothing
		debug('Unable to parse package.json')
		debug(e)
	}
}

module.exports = class Log extends IsoLog {
	metricsQueue: Array<Object>
	flushAt: number
	flushInterval: number
	hostname: string
	adapter: HttpAdapter | SocketAdapter
	appName: string
	appKey: ?string
	appEnv: string
	maxQueueLength: number
	userAgent: string
	packageName: string
	packageVersion: string
	metricsUrl: string
	metricsEnabled: boolean
	routeChangeStartTime: ?Date
	captureFELogs: boolean
	logUrl: ?string

	constructor() {
		super()
		this.setLevel('warn')
		this.flushInterval = 10000
		this.maxQueueLength = 1000

		this.hostname = this.getHostname()

		setInterval(this.flushData.bind(this), this.flushInterval)

		this.metricsQueue = []
	}

	setOptions(options: {
		level?: string,
		formatters?: Array<any>,
		transports?: Array<any>,
		flushAt?: number,
		flushIntervalSec?: number,
		appName?: string,
		appEnv?: string,
		appKey?: string,
		userAgent: string,
		packageVersion: string,
		packageName: string,
		metricsUrl: string,
		metricsEnabled?: boolean,
		useColors?: boolean
	}) {
		super.setOptions(options)

		if (options) {
			if (options.level) {
				this.setLevel(options.level)
			}

			if (options.flushAt && +options.flushAt > 0) {
				this.flushAt = +options.flushAt
			} else {
				this.flushAt = 10
			}
			if (options.flushIntervalSec && +options.flushIntervalSec > 0) {
				this.flushInterval = +options.flushIntervalSec * 1000
			}

			if (options.userAgent) {
				this.userAgent = options.userAgent
			}

			if (options.packageName) {
				this.packageName = options.packageName
			}

			if (options.packageVersion) {
				this.packageVersion = options.packageVersion
			}

			if (options.metricsUrl) {
				this.metricsUrl = options.metricsUrl
			}

			if (options.appName && options.appEnv) {
				this.appName = options.appName
				this.appKey = options.appKey
				this.appEnv = options.appEnv
			}

			if (options.metricsEnabled === true) {
				this.metricsEnabled = true
			} else {
				this.metricsEnabled = false
			}

			if (options.useColors === false) {
				this.useColors = false
			} else {
				this.useColors = true
			}

			if (options.captureFELogs === true) {
				this.captureFELogs = true
			} else {
				this.captureFELogs = false
			}

			if (options.logUrl) {
				this.logUrl = options.logUrl
			}

			this.adapter = this.getAdapter()
		}
	}

	collectBrowserMetrics() {
		if (typeof window !== 'undefined') {
			const stats = getTimes()
			this.metric({
				type: 'browserPageLoadStats',
				event: 'browserPageLoadStats',
				path: window.location.pathname,
				...stats
			})
		}
	}

	times() {
		return getTimes()
	}

	routeChangeStart() {
		this.routeChangeStartTime = Date.now()
	}

	routeChangeComplete() {
		const diff = Date.now() - this.routeChangeStartTime
		if (typeof window !== 'undefined') {
			const stats = getTimes()
			this.metric({
				type: 'browserPageLoadStats',
				event: 'routeChange',
				path: window.location.pathname,
				loadTime: diff
			})
		}
	}

	getAdapter() {
		return new HttpAdapter({
			appName: this.appName,
			appKey: this.appKey,
			appEnv: this.appEnv,
			metricsUrl: this.metricsUrl,
			logUrl: this.logUrl
		})
	}

	timerStart() {
		return process.hrtime()
	}

	timerEnd(timeStart: [number, number]) {
		const elapsedHrTime = process.hrtime(timeStart)
		const elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6
		return elapsedTimeInMs
	}

	metric(data: string | Object) {
		let time
		let event
		let hostname
		let value
		let rest = {}
		if (typeof data === 'string') {
			event = data
		} else if (typeof data === 'object') {
			rest = data
			event = data.event
			time = data.time
			hostname = data.hostname
			value = data.value
			if (data.packageName) {
				packageName = data.packageName
			}
			if (data.packageVersion) {
				packageVersion = data.packageVersion
			}
			if (data.userAgent) {
				userAgent = data.userAgent
			}
		}

		if (!event) {
			// $FlowIgnore
			debug('Unable to collect metric because "event" was not specified')
			return
		}

		if (!time) {
			time = Date.now()
		}
		if (!hostname) {
			hostname = this.hostname
		}
		if (!packageName) {
			packageName = this.packageName
		}
		if (!packageVersion) {
			packageVersion = this.packageVersion
		}
		this.metricsQueue.push({
			...rest,
			userAgent,
			packageName,
			packageVersion,
			time,
			event,
			value,
			hostname
		})
	}

	flushData() {
		debug('Logger: flushing data')
		this.flushMetrics()
		this.flushLogs()
	}

	async flushMetrics() {
		debug('Logger: flushing metrics')
		if (!this.metricsEnabled) {
			debug('Metrics disabled')
			this.metricsQueue = []
			return
		}

		if (!this.adapter) {
			debug(
				'flushMetrics: ...Unable to send because no adapter has been set. Ensure log.setOptions({appName, appEnv}) has been called'
			)
		} else if (this.metricsQueue.length > 0) {
			try {
				await this.adapter.sendMetrics(this.metricsQueue)
				this.metricsQueue = []
			} catch (e) {
				debug(e)
			}
		} else {
			debug('flushMetrics: No metrics to send')
		}

		// Ensure we don't have a queue that gets out of control
		if (this.metricsQueue.length > this.maxQueueLength) {
			// Reset the queue
			this.metricsQueue = []
		}
	}

	async flushLogs() {
		debug('Logger: flushing logs')
		if (!this.captureFELogs) {
			debug('FE Metrics Capture Disabled')
			this.logs = []
			return
		}

		if (!this.adapter) {
			debug(
				'flushLogs: ...Unable to send because no adapter has been set. Ensure log.setOptions({appName, appEnv}) has been called'
			)
		} else if (this.logs.length > 0) {
			try {
				await this.adapter.sendLogs(this.logs)
			} catch (e) {
				console.log(e)
			}
			this.logs = []
		} else {
			debug('flushLogs: No metrics to send')
		}

		// Ensure we don't have a queue that gets out of control
		if (this.logs.length > this.maxQueueLength) {
			// Reset the queue
			this.logs = []
		}
	}

	getHostname() {
		let hostname = 'unknown'
		try {
			if (CLIENT) {
				hostname = window.location.hostname
			} else {
				if (typeof config === 'object' && config.baseUrl) {
					hostname = config.baseUrl
				} else if (process.env.SERVER_HOST) {
					hostname = process.env.SERVER_HOST
				} else {
					hostname = os.hostname()
				}

				hostname = hostname.replace(/https?:\/\//, '')
				hostname = hostname.replace('/', '')
			}
		} catch (e) {
			debug(e)
		}
		return hostname
	}

	trackLog(level: string, args: any) {
		this.metric(`log-${level}`)
	}

	trace() {
		this.doLog('trace', arguments)
	}

	debug() {
		this.doLog('debug', arguments)
	}

	log() {
		this.doLog('log', arguments)
	}

	info() {
		this.doLog('info', arguments)
	}

	warn() {
		this.trackLog('warn', arguments)
		this.doLog('warn', arguments, this.captureFELogs)
	}

	error() {
		this.trackLog('error', arguments)
		this.doLog('error', arguments, this.captureFELogs)
	}

	crit() {
		this.trackLog('crit', arguments)
		this.doLog('crit', arguments, this.captureFELogs)
	}

	fatal() {
		this.trackLog('fatal', arguments)
		this.doLog('fatal', arguments, this.captureFELogs)
	}

	superInfo() {
		this.doLog('superInfo', arguments)
	}
}
