const { assert } = require('chai')
const faker = require('faker')
const Base = require('./Base')
const Logger = require('../Log/index')
const TestTransport = require('./lib/TestTransport')
global.log = new Logger()

class LoggingTests extends Base {
	setup() {
		it('Handle log=trace, level=trace', () => this.handleLog('trace', 'trace'))
		it('Handle log=trace, level=debug', () => this.handleLog('trace', 'debug'))
		it('Handle log=trace, level=info', () => this.handleLog('trace', 'info'))
		it('Handle log=trace, level=warn', () => this.handleLog('trace', 'warn'))
		it('Handle log=trace, level=error', () => this.handleLog('trace', 'error'))
		it('Handle log=trace, level=crit', () => this.handleLog('trace', 'crit'))
		it('Handle log=trace, level=fatal', () => this.handleLog('trace', 'fatal'))
		it('Handle log=trace, level=superInfo', () =>
			this.handleLog('trace', 'superInfo'))

		it('Handle log=debug, level=trace', () => this.handleLog('debug', 'trace'))
		it('Handle log=debug, level=debug', () => this.handleLog('debug', 'debug'))
		it('Handle log=debug, level=info', () => this.handleLog('debug', 'info'))
		it('Handle log=debug, level=warn', () => this.handleLog('debug', 'warn'))
		it('Handle log=debug, level=error', () => this.handleLog('debug', 'error'))
		it('Handle log=debug, level=crit', () => this.handleLog('debug', 'crit'))
		it('Handle log=debug, level=fatal', () => this.handleLog('debug', 'fatal'))
		it('Handle log=debug, level=superInfo', () =>
			this.handleLog('debug', 'superInfo'))

		it('Handle log=info, level=trace', () => this.handleLog('info', 'trace'))
		it('Handle log=info, level=debug', () => this.handleLog('info', 'debug'))
		it('Handle log=info, level=info', () => this.handleLog('info', 'info'))
		it('Handle log=info, level=warn', () => this.handleLog('info', 'warn'))
		it('Handle log=info, level=error', () => this.handleLog('info', 'error'))
		it('Handle log=info, level=crit', () => this.handleLog('info', 'crit'))
		it('Handle log=info, level=fatal', () => this.handleLog('info', 'fatal'))
		it('Handle log=info, level=superInfo', () =>
			this.handleLog('info', 'superInfo'))

		it('Handle log=warn, level=trace', () => this.handleLog('warn', 'trace'))
		it('Handle log=warn, level=debug', () => this.handleLog('warn', 'debug'))
		it('Handle log=warn, level=info', () => this.handleLog('warn', 'info'))
		it('Handle log=warn, level=warn', () => this.handleLog('warn', 'warn'))
		it('Handle log=warn, level=error', () => this.handleLog('warn', 'error'))
		it('Handle log=warn, level=crit', () => this.handleLog('warn', 'crit'))
		it('Handle log=warn, level=fatal', () => this.handleLog('warn', 'fatal'))
		it('Handle log=warn, level=superInfo', () =>
			this.handleLog('warn', 'superInfo'))

		it('Handle log=error, level=trace', () => this.handleLog('error', 'trace'))
		it('Handle log=error, level=debug', () => this.handleLog('error', 'debug'))
		it('Handle log=error, level=info', () => this.handleLog('error', 'info'))
		it('Handle log=error, level=warn', () => this.handleLog('error', 'warn'))
		it('Handle log=error, level=error', () => this.handleLog('error', 'error'))
		it('Handle log=error, level=crit', () => this.handleLog('error', 'crit'))
		it('Handle log=error, level=fatal', () => this.handleLog('error', 'fatal'))
		it('Handle log=error, level=superInfo', () =>
			this.handleLog('error', 'superInfo'))

		it('Handle log=crit, level=trace', () => this.handleLog('crit', 'trace'))
		it('Handle log=crit, level=debug', () => this.handleLog('crit', 'debug'))
		it('Handle log=crit, level=info', () => this.handleLog('crit', 'info'))
		it('Handle log=crit, level=warn', () => this.handleLog('crit', 'warn'))
		it('Handle log=crit, level=error', () => this.handleLog('crit', 'error'))
		it('Handle log=crit, level=crit', () => this.handleLog('crit', 'crit'))
		it('Handle log=crit, level=fatal', () => this.handleLog('crit', 'fatal'))
		it('Handle log=crit, level=superInfo', () =>
			this.handleLog('crit', 'superInfo'))

		it('Handle log=fatal, level=trace', () => this.handleLog('fatal', 'trace'))
		it('Handle log=fatal, level=debug', () => this.handleLog('fatal', 'debug'))
		it('Handle log=fatal, level=info', () => this.handleLog('fatal', 'info'))
		it('Handle log=fatal, level=warn', () => this.handleLog('fatal', 'warn'))
		it('Handle log=fatal, level=error', () => this.handleLog('fatal', 'error'))
		it('Handle log=fatal, level=crit', () => this.handleLog('fatal', 'crit'))
		it('Handle log=fatal, level=fatal', () => this.handleLog('fatal', 'fatal'))
		it('Handle log=fatal, level=superInfo', () =>
			this.handleLog('fatal', 'superInfo'))

		it('Handle log=superInfo, level=trace', () =>
			this.handleLog('superInfo', 'trace'))
		it('Handle log=superInfo, level=debug', () =>
			this.handleLog('superInfo', 'debug'))
		it('Handle log=superInfo, level=info', () =>
			this.handleLog('superInfo', 'info'))
		it('Handle log=superInfo, level=warn', () =>
			this.handleLog('superInfo', 'warn'))
		it('Handle log=superInfo, level=error', () =>
			this.handleLog('superInfo', 'error'))
		it('Handle log=superInfo, level=crit', () =>
			this.handleLog('superInfo', 'crit'))
		it('Handle log=superInfo, level=fatal', () =>
			this.handleLog('superInfo', 'fatal'))
		it('Handle log=superInfo, level=superInfo', () =>
			this.handleLog('superInfo', 'superInfo'))
	}

	async before() {
		await super.before()
		this.customLevels = {
			levels: {
				trace: 7,
				debug: 6,
				info: 5,
				warn: 4,
				error: 3,
				crit: 2,
				fatal: 1,
				superInfo: 0
			},
			colors: {
				trace: 'gray',
				debug: 'green',
				info: 'cyan',
				warn: 'yellow',
				error: 'red',
				crit: 'red',
				fatal: 'red',
				superInfo: 'cyan'
			}
		}
		this.testTransport = new TestTransport()
		log.setOptions({
			level: 'trace',
			useColors: false,
			transports: [this.testTransport]
		})
	}

	async handleLog(level, logLevel) {
		const message = faker.lorem.words()
		const shouldLog =
			this.customLevels.levels[logLevel] >= this.customLevels.levels[level]
		let wasLogged = false

		log.setOptions({
			level: logLevel,
			useColors: false,
			transports: [this.testTransport]
		})

		const callbackId = this.testTransport.subscribe(info => {
			wasLogged = true
			if (!shouldLog) {
				throw new Error(
					`Level ${level} should not log for log level ${logLevel}`
				)
			}
			assert.equal(info.level, level)
			assert.equal(info.message, message)
		})

		log[level](message)
		// Logs are async...give a brief wait to make sure it finishes logging before checks
		await this.wait()
		assert.equal(wasLogged, shouldLog)
		this.testTransport.unsubscribe(callbackId)
	}
}

describe('LoggingTests', function Tests() {
	this.timeout(30000)
	new LoggingTests() // eslint-disable-line
})
