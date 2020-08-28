const fetch = require('node-fetch');
const config = require('./config');

const map = new Map();

const load = () => fetch(`${config.upstreamUrl}/api/channels`)
  .then((res) => res.json()).then((body) => {
    if (!Array.isArray(body)) throw new Error();
    body.forEach(({
      type, channel, name, services,
    }) => {
      if (!Array.isArray(services) || services.length === 0) return false;
      if (config.allowedNetworks.indexOf(services[0].networkId) === -1) return false;
      return map.set(services[0].id, { type, channel, name });
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
