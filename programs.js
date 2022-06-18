/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
const fetch = require('node-fetch');
const { Op } = require('sequelize');
const jaconv = require('jaconv');
const { scheduleApiUrl } = require('./config');
const { Program, sequelize } = require('./db');
const keywords = require('./data/keywords.json');

const sync = async () => {
  try {
    const reserved = await fetch(`${scheduleApiUrl}/api/reserves.json`).then((r) => r.json());
    if (!Array.isArray(reserved)) {
      throw new Error('Malformed reserve data from API');
    }
    await sequelize.transaction(async (transaction) => {
      await Program.update({
        active: false,
      }, {
        where: {
          startsAt: {
            [Op.gte]: new Date().getTime(),
          },
        },
      }, { transaction });
      for (let i = 0; i < reserved.length; i++) {
        const {
          id, channel: {
            id: channelId,
          },
          fullTitle: fullTitleRaw,
          detail: detailRaw,
          start: startsAt, end: endsAt, seconds: durationInSeconds,
          isSkip: skipped,
        } = reserved[i];
        const eid = parseInt(id, 36);
        const detail = jaconv.normalize(detailRaw);
        const fullTitle = jaconv.normalize(fullTitleRaw);
        const matchedKeywords = keywords.filter((k) => {
          if (fullTitle.indexOf(k) !== -1) return true;
          if (detail.indexOf(k) !== -1) return true;
          return false;
        });
        const payload = {
          serviceId: parseInt(channelId, 36),
          eid,
          startsAt,
          endsAt,
          durationInSeconds,
          detail,
          title: fullTitle,
          keywords: matchedKeywords.join(','),
          active: true,
          skipped,
        };
        const existied = await Program.findOne({
          where: {
            eid,
            endsAt: {
              [Op.gte]: new Date().getTime() - 86400 * 1000,
            },
          },
        }, { transaction });
        if (existied) {
          await existied.update(payload, { transaction });
        } else {
          await Program.create(payload, { transaction });
        }
      }
    });
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

module.exports = {
  sync,
};
