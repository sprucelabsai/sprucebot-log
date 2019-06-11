const { assert } = require('chai')
const faker = require('faker')
const Base = require('./Base')
const Logger = require('../Log/index')
const TestTransport = require('./lib/TestTransport')
global.log = new Logger()

class LoggingTests extends Base {
	setup() {
		it('Uses colors', () => this.useColors())
		it('Can have colors turned off', () => this.noColors())
		// it('Logs warn', () => this.logWarn())
	}

	async before() {
		await super.before()
		this.testTransport = new TestTransport()
		log.setOptions({
			level: 'debug',
			transports: [this.testTransport]
		})
	}

	async useColors() {
		const message = faker.lorem.words()
		let wasLogged = false
		const callbackId = this.testTransport.subscribe(info => {
			wasLogged = true
			assert.isFalse(/^debug/.test(info.level))
		})

		log.debug(message)
		// Logs are async...give a brief wait to make sure it finishes logging before checks
		await this.wait()
		assert.isTrue(wasLogged)
		this.testTransport.unsubscribe(callbackId)
	}

	async noColors() {
		log.setOptions({
			level: 'debug',
			useColors: false,
			transports: [this.testTransport]
		})

		const message = faker.lorem.words()
		let wasLogged = false
		const callbackId = this.testTransport.subscribe(info => {
			wasLogged = true
			assert.isTrue(/^debug/.test(info.level))
			assert.equal(info.message, message)
		})

		log.debug(message)
		// Logs are async...give a brief wait to make sure it finishes logging before checks
		await this.wait()
		assert.isTrue(wasLogged)
		this.testTransport.unsubscribe(callbackId)
	}
}

describe('LoggingTests', function Tests() {
	this.timeout(30000)
	new LoggingTests() // eslint-disable-line
})
