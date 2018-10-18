//      

const IsoLog = require('./IsoLog');
const HttpAdapter = require('../adapters/Http');
const SocketAdapter = require('../adapters/Sockets');

const CLIENT = typeof window !== 'undefined';

let os;
let packageName = 'unknown';
let packageVersion = 'unknown';

if (CLIENT) {
	os = {
		hostname: () => ''
	};
} else {
	os = require('os');
	try {
		const packageJSON = require(`${process.env.PWD}/package.json`);
		packageName = packageJSON.name;
		packageVersion = packageJSON.version;
	} catch (e) {}
}

module.exports = class Log extends IsoLog {
	                            
	                
	                      
	                 
	                                     
	                
	                
	               
	                       

	constructor() {
		super();
		this.setLevel('warn');
		this.flushInterval = 10000;
		this.maxQueueLength = 1000;

		this.hostname = this.getHostname();

		setInterval(this.flushMetrics.bind(this), this.flushInterval);

		this.metricsQueue = [];
	}

	setOptions(options                                                                                                                     ) {
		super.setOptions(options);

		if (options) {
			if (options.level) {
				this.setLevel(options.level);
			}

			if (options.flushAt && +options.flushAt > 0) {
				this.flushAt = +options.flushAt;
			} else {
				this.flushAt = 10;
			}
			if (options.flushIntervalSec && +options.flushIntervalSec > 0) {
				this.flushInterval = +options.flushIntervalSec * 1000;
			}

			if (options.appName && options.appEnv) {
				this.appName = options.appName;
				this.appKey = options.appKey;
				this.appEnv = options.appEnv;

				this.adapter = this.getAdapter();
			}
		}
	}

	getAdapter() {
		return new HttpAdapter({
			appName: this.appName,
			appKey: this.appKey,
			appEnv: this.appEnv
		});
	}

	audit() {}

	metric(data                 ) {
		let time;
		let event;
		let hostname;
		let value;
		let rest = {};
		if (typeof data === 'string') {
			event = data;
		} else if (typeof data === 'object') {
			rest = data;
			event = data.event;
			time = data.time;
			hostname = data.hostname;
			value = data.value;
		}

		if (!event) {
			// $FlowIgnore
			this.warn('Unable to collect metric because "event" was not specified');
			return;
		}

		if (!time) {
			time = Date.now();
		}
		if (!hostname) {
			hostname = this.hostname;
		}
		this.metricsQueue.push({
			...rest,
			packageName,
			packageVersion,
			time,
			event,
			value,
			hostname
		});
	}

	async flushMetrics() {
		if (!this.adapter) {
			this.warn('flushMetrics: Unable to send because no adapter has been set. Ensure log.setOptions({appName, appEnv}) has been called');
		} else if (this.metricsQueue.length > 0) {
			try {
				await this.adapter.sendMetrics(this.metricsQueue);
				this.metricsQueue = [];
			} catch (e) {
				this.warn(e);
			}
		} else {
			this.trace('flushMetrics: No metrics to send');
		}

		// Ensure we don't have a queue that gets out of control
		if (this.metricsQueue.length > this.maxQueueLength) {
			// Reset the queue
			this.metricsQueue = [];
		}
	}

	getHostname() {
		let hostname = 'unknown';
		try {
			if (CLIENT) {
				hostname = window.location.hostname;
			} else {
				if (typeof config === 'object' && config.baseUrl) {
					hostname = config.baseUrl;
				} else if (process.env.SERVER_HOST) {
					hostname = process.env.SERVER_HOST;
				} else {
					hostname = os.hostname();
				}

				hostname = hostname.replace(/https?:\/\//, '');
				hostname = hostname.replace('/', '');
			}
		} catch (e) {
			this.warn(e);
		}
		return hostname;
	}

	trackLog(level        , args     ) {}

	trace() {
		this.trackLog('trace', arguments);
		this.doLog('trace', arguments);
	}

	debug() {
		this.trackLog('debug', arguments);
		this.doLog('debug', arguments);
	}

	log() {
		this.trackLog('log', arguments);
		this.doLog('log', arguments);
	}

	info() {
		this.trackLog('info', arguments);
		this.doLog('info', arguments);
	}

	warn() {
		this.trackLog('warn', arguments);
		this.doLog('warn', arguments);
	}

	error() {
		this.trackLog('error', arguments);
		this.doLog('error', arguments);
	}

	crit() {
		this.trackLog('error', arguments);
		this.doLog('error', arguments);
	}

	fatal() {
		this.trackLog('error', arguments);
		this.doLog('error', arguments);
	}

	superInfo() {
		this.trackLog('superInfo', arguments);
		this.doLog('superInfo', arguments);
	}
};
