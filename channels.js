const fetch = require('node-fetch');
const config = require('./config');

const map = new Map();

const load = () => fetch(`${config.upstreamUrl}/api/services`)
  .then((res) => res.json()).then((body) => {
    if (!Array.isArray(body)) throw new Error();
    body.forEach(({
      id, networkId, name, type, channel
    }) => {
      if (type !== 1 || config.allowedNetworks.indexOf(networkId) === -1) return false;
      return map.set(id, { type: channel.type, channel: channel.channel, name });
    });
    console.log('Services loaded', [...map]);
  }).catch((e) => {
    console.error(e);
  });

const query = (fullServiceId) => map.get(parseInt(fullServiceId, 10));

const list = () => ([...map]);

load();

module.exports = {
  load,
  query,
  list,
};
