const { Op, Sequelize } = require('sequelize');
const { ScheduledEvent } = require('./db');
const { getTodayStartJST } = require('./utils');

const create = async ({ startsAt, endsAt, fullServiceId }) => ScheduledEvent.create({
  startsAt,
  durationInSeconds: (endsAt - startsAt) / 1000,
  fullServiceId,
});

const disable = async ({ id }) => {
  const event = await ScheduledEvent.findOne({
    where: {
      id,
    },
  });
  if (event) {
    await event.update({
      active: false,
    });
  }
};

const getFromToday = async (days) => {
  const todayStartJst = getTodayStartJST();
  return ScheduledEvent.findAll({
    where: {
      startsAt: {
        [Op.between]: [
          todayStartJst.getTime(),
          todayStartJst.getTime() + 86400 * 1000 * parseInt(days || 2, 10),
        ],
      },
      active: true,
    },
    raw: true,
  });
};

const getCurrentActive = async () => {
  const nowTS = new Date().getTime();
  return ScheduledEvent.findAll({
    where: {
      startsAt: {
        // Starts in less than 5 minutes or already started
        [Op.lte]: nowTS + 5 * 60 * 1000,
        // Not ended yet
        [Op.gte]: Sequelize.literal(`${nowTS} - durationInSeconds * 1000`),
      },
      endedAt: 0, // Not ended yet
      active: true,
    },
    order: [
      ['startsAt', 'ASC'],
    ],
    raw: true,
  });
};

const setStarted = async ({ id }) => {
  const event = await ScheduledEvent.findOne({
    where: {
      id,
    },
  });
  if (!event) return false;
  await event.update({
    startedAt: new Date().getTime(),
  });
  return true;
};

const setEnded = async ({ id }) => {
  const event = await ScheduledEvent.findOne({
    where: {
      id,
    },
  });
  if (!event) return false;
  await event.update({
    endedAt: new Date().getTime(),
  });
  return true;
};

module.exports = {
  create,
  disable,
  getFromToday,
  getCurrentActive,
  setStarted,
  setEnded,
};
