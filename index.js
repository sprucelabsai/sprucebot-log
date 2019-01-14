const CLIENT =
	typeof window !== 'undefined' || typeof __webpack_require__ === 'function'

if (CLIENT) {
	const Log = require('./build/Log')
	module.exports = new Log()
} else {
	const Log = require('./build-es6/Log')
	module.exports.log = new Log()
	module.exports.middleware = {
		requests: require('./build-es6/middleware/requests')
		// TODO: Implement koa request middleware
		// koaRequests: require('./build-es6/middleware/koaRequests')
	}
	module.exports.nodeMetrics = require('./build-es6/collectors/node')
	module.exports.sequelizeHooks = require('./build-es6/sequelize/hooks')
}
