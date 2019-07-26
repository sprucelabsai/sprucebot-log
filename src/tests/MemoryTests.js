const { assert } = require('chai')
const faker = require('faker')
const Base = require('./Base')
const Logger = require('../Log/index')

class LoggingTests extends Base {
	setup() {
		it('Does not grow memory', () => this.lotsOfLogs())
	}

	async before() {
		await super.before()
	}

	async lotsOfLogs() {
		const log = new Logger({ level: 'debug' })
		const loopCount = 100
		const logCount = 100000
		const wordCount = 1000

		console.log('starting heap usage', `${this.heapUsedMB()}MB`)

		for (let i = 0; i < logCount; i += 1) {
			log.debug(faker.lorem.words(wordCount))

			if (i % loopCount === 0) {
				const heapUsed = this.heapUsedMB()
				console.log(`heap usage at ${i}`, `${heapUsed}MB`)
				assert.isBelow(heapUsed, 75)
			}
		}
	}

	heapUsedMB() {
		return parseInt(process.memoryUsage().heapUsed / 1024 / 1024, 10)
	}
}

describe('MemoryTests', function Tests() {
	this.timeout(3000000)
	new LoggingTests()
})
