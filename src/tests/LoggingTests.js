const { assert } = require('chai')
const faker = require('faker')
const Base = require('./Base')
const Logger = require('../Log/index')
global.log = new Logger()

class LoggingTests extends Base {
	setup() {
		it('Uses colors', () => this.useColors())
		it('Can have colors turned off', () => this.noColors())
		// it('Logs warn', () => this.logWarn())
	}

	async before() {
		await super.before()
		log.setOptions({
			level: 'debug'
		})
	}

	async useColors() {
		let wasLogged = false
		global.consoleCallback = logMessage => {
			console.log(logMessage)
			assert.isTrue(/\[32/.test(logMessage))
			wasLogged = true
		}
		const message = faker.lorem.words()

		log.debug(message)
		assert.isTrue(wasLogged)
	}

	async noColors() {
		log.setOptions({
			level: 'debug',
			useColors: false
		})

		let wasLogged = false
		global.consoleCallback = logMessage => {
			console.log(logMessage)
			assert.isFalse(/\[32/.test(logMessage))
			wasLogged = true
		}
		const message = faker.lorem.words()

		log.debug(message)
		assert.isTrue(wasLogged)
	}
}

describe('LoggingTests', function Tests() {
	this.timeout(30000)
	new LoggingTests() // eslint-disable-line
})
