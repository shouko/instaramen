const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  'ramen', '', '', {
    dialect: 'sqlite',
    storage: './data/data.db',
    logging: false,
  },
);

const ScheduledEvent = sequelize.define('ScheduledEvent', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  startsAt: {
    type: Sequelize.INTEGER,
  },
  durationInSeconds: {
    type: Sequelize.INTEGER,
  },
  fullServiceId: {
    type: Sequelize.INTEGER,
  },
  startedAt: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  endedAt: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  active: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
});

const Program = sequelize.define('Program', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  serviceId: {
    type: Sequelize.INTEGER,
  },
  eid: {
    type: Sequelize.INTEGER,
  },
  startsAt: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  durationInSeconds: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  endsAt: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  title: {
    type: Sequelize.STRING,
    defaultValue: '',
  },
  detail: {
    type: Sequelize.STRING,
    defaultValue: '',
  },
  keywords: {
    type: Sequelize.STRING,
    defaultValue: '',
  },
  active: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
  },
  skipped: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
});

module.exports = {
  ScheduledEvent,
  Program,
  sequelize,
};
