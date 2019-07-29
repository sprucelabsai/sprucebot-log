process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

// The base test model that all others will extend
module.exports = class Base {
	constructor() {
		this.mocks = {}
		before(() => this.before())
		after(() => this.after())
		beforeEach(() => this.beforeEach())
		afterEach(() => this.afterEach())
		this.setup()
	}

	setup() {}

	async beforeEach() {
		global.consoleCallback = null
	}

	async afterEach() {}

	async before(options) {}

	async after() {}

	async wait() {
		return new Promise(resolve => {
			setTimeout(() => resolve(), 50)
		})
	}
}
