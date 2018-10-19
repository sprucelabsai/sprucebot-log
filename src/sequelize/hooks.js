// @flow
module.exports = sequelize => {
	sequelize.addHook('afterUpdate', (instance, hookOptions, cb) => {
		try {
			const modelName = instance.constructor.name;
			log.metric({
				type: 'sequelizeHook',
				event: 'updated',
				fields: hookOptions.fields,
				modelName,
				modelId: instance.id
			});
		} catch (e) {
			console.log(e);
		}
		if (typeof cb === 'function') {
			return cb();
		}
	});
	sequelize.addHook('afterCreate', (instance, hookOptions, cb) => {
		try {
			const modelName = instance.constructor.name;
			log.metric({
				type: 'sequelizeHook',
				event: 'created',
				modelName,
				modelId: instance.id
			});
		} catch (e) {
			console.log(e);
		}
		if (typeof cb === 'function') {
			return cb();
		}
	});
	sequelize.addHook('afterDestroy', (instance, hookOptions, cb) => {
		try {
			const modelName = instance.constructor.name;
			log.metric({
				type: 'sequelizeHook',
				event: 'destroyed',
				modelName,
				modelId: instance.id
			});
		} catch (e) {
			console.log(e);
		}
		if (typeof cb === 'function') {
			return cb();
		}
	});
};
