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
  });
};