const { assert } = require('chai')
const faker = require('faker')
const Base = require('./Base')
const Logger = require('../Log/index')
const fill = require('lodash/fill')

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
		const logCount = 1000
		const wordCount = 1000

		console.log('starting heap usage', this.heapUsed())
		const run = async (resolve, count) => {
			const messages = fill(new Array(logCount), faker.lorem.words(wordCount))

			await Promise.all(
				messages.map(message => {
					log.debug(message)
				})
			)
			const progress = count * logCount

			if (count < loopCount) {
				console.log(`heap usage at ${progress}`, this.heapUsed())
				setImmediate(() => run(resolve, ++count))
			} else {
				const end = count => {
					if (count < 60) {
						const test = 'test'
						console.log(`heap usage at ${test} ${count}`, this.heapUsed())
						setTimeout(() => end(++count), 1000)
					} else {
						resolve()
					}
				}
				setTimeout(() => end(0), 1000)
				console.log('endings heap usage', this.heapUsed())
			}
		}

		return new Promise(resolve => {
			setImmediate(() => run(resolve, 1))
		})
	}

	heapUsed() {
		return `${parseInt(process.memoryUsage().heapUsed / 1024 / 1024, 10)}MB`
	}
}

describe('MemoryTests', function Tests() {
	this.timeout(3000000)
	new LoggingTests() // eslint-disable-line
})
