const Log = require('./build-es6/Log')

module.exports.log = new Log()
module.exports.middleware = {
	requests: require('./build-es6/middleware/requests'),
	koaRequests: require('./build-es6/middleware/koaRequests')
}
module.exports.nodeMetrics = require('./build-es6/collectors/node')
module.exports.sequelizeHooks = require('./build-es6/sequelize/hooks')
