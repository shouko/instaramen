const { Op } = require('sequelize');
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

module.exports = {
  create,
  disable,
  getFromToday,
};
