'use strict';

const Sequelize = require('sequelize');

const importModels = require('./importModels');

global.kernel.on('booting_backing', () => new Promise((resolve, reject) => {
  const config = {
    ...global.kernel.config.database,

    // logging, // See below
    operatorsAliases: false,
    //
  };
  // Since 'logging' option is a special case (i.e., either `false` or a function)
  // we handle it here depending on some ('NODE_ENV') environment variable.
  if (process.env.NODE_ENV && process.env.NODE_ENV === 'development') {
    config.logging = console.log;
  } else {
    config.logging = false;
  }

  let sequelize;
  try {
    sequelize = new Sequelize(config);
  } catch (err) {
    reject(err);
  }

  sequelize.authenticate()
    .then(() => {
      importModels(sequelize);

      // Store reference in the kernel
      global.kernel.database = sequelize;
      // `SequelizeOp` can be used by CASL's `ruleToQuery` w/o `require`ing the 'sequelize' package
      global.kernel.SequelizeOp = Sequelize.Op;

      global.kernel.once('server::initialized', (/** @type {import('koa')} */ server) => {
        Object.defineProperty(server.context, 'models', { value: sequelize.models });
      });

      resolve();
    })
    .catch((err) => {
      reject(err);
    });
}));
