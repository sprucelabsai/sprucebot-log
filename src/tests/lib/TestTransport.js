const uuid = require('uuid')
const Transport = require('winston-transport')

module.exports = class TestTransport extends Transport {
	subscribe(cb) {
		if (!this.customCallbacks) {
			this.customCallbacks = {}
		}
		const id = uuid.v4()
		this.customCallbacks[id] = cb

		return id
	}
	unsubscribe(id) {
		delete this.customCallbacks[id]
	}
	log(info, callback) {
		setImmediate(() => {
			Object.keys(this.customCallbacks).forEach(callbackId => {
				if (typeof this.customCallbacks[callbackId] === 'function') {
					this.customCallbacks[callbackId](info)
				}
			})
		})

		callback()
	}
}
