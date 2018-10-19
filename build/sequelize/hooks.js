"use strict";

module.exports = function (sequelize) {
  sequelize.addHook('afterUpdate', function (instance, hookOptions, cb) {
    try {
      var modelName = instance.constructor.name;
      log.metric({
        type: 'sequelizeHook',
        event: 'updated',
        fields: hookOptions.fields,
        modelName: modelName,
        modelId: instance.id
      });
    } catch (e) {
      console.log(e);
    }

    if (typeof cb === 'function') {
      return cb();
    }
  });
  sequelize.addHook('afterCreate', function (instance, hookOptions, cb) {
    try {
      var modelName = instance.constructor.name;
      log.metric({
        type: 'sequelizeHook',
        event: 'created',
        modelName: modelName,
        modelId: instance.id
      });
    } catch (e) {
      console.log(e);
    }

    if (typeof cb === 'function') {
      return cb();
    }
  });
  sequelize.addHook('afterDestroy', function (instance, hookOptions, cb) {
    try {
      var modelName = instance.constructor.name;
      log.metric({
        type: 'sequelizeHook',
        event: 'destroyed',
        modelName: modelName,
        modelId: instance.id
      });
    } catch (e) {
      console.log(e);
    }

    if (typeof cb === 'function') {
      return cb();
    }
  }); // async afterUpdate(instance, hookOptions, cb) {
  // 	try {
  // 		log.debug(`${this.modelName} afterUpdate`);
  // 		log.debug(instance.constructor.name);
  // 		log.debug(hookOptions);
  // 	} catch (e) {
  // 		console.log(e);
  // 	}
  // 	if (typeof cb === 'function') {
  // 		return cb();
  // 	}
  // },
  // async afterDestroy(instance, hookOptions, cb) {
  // 	try {
  // 		// log.debug(`${this.modelName} afterDestroy`);
  // 	} catch (e) {
  // 		console.log(e);
  // 	}
  // 	if (typeof cb === 'function') {
  // 		return cb();
  // 	}
  // }
};