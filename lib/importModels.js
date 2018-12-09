'use strict';

const fs = require('fs');
const path = require('path');

module.exports = (sequelize) => {
  const MODELS_PATH = path.join(global.kernel.ROOT_PATH, 'app', 'models');

  if (!fs.existsSync(MODELS_PATH)) {
    return;
  }

  fs.readdirSync(MODELS_PATH)
    .filter(key => (key[0] !== '_'))
    .forEach(modelName => sequelize.import(path.join(MODELS_PATH, modelName)));
    // .forEach(modelName => sequelize.import(`${MODELS_PATH}/${modelName}`));

  Object.keys(sequelize.models).forEach((modelName) => {
    if (typeof sequelize.models[modelName].associate === 'function') {
      sequelize.models[modelName].associate(sequelize.models);
    }
  });
};
