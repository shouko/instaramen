const { spawn } = require('child_process');
const EventEmitter = require('events');
const config = require('./config');
const channels = require('./channels');

let instance = null;
let streamKey = null;
let next = null;
const emitter = new EventEmitter();

const getServiceMeta = (fullServiceId) => channels.query(fullServiceId);
const buildSourceUrl = (fullServiceId) => {
  const { type, channel } = getServiceMeta(fullServiceId);
  return `${config.upstreamUrl}/api/channels/${type}/${channel}/services/${fullServiceId}/stream?decode=1`;
};
const buildInputParams = (fullServiceId) => `-i ${buildSourceUrl(fullServiceId)} -map 0:v:0 -map 0:a:0`.split(' ');
const buildStreamKey = (fullServiceId) => `${parseInt(fullServiceId, 10).toString(36)}-${Math.random().toString(36).substr(2)}`;
const getViewingUrl = () => (streamKey ? `${config.viewingUrl}/${streamKey}/index.m3u8` : '');

const { decodeParams, filterParams, encodeParams } = config.ffmpeg;

const start = (fullServiceId) => {
  try {
    next = null;
    if (instance) throw new Error('Instance exists');
    streamKey = buildStreamKey(fullServiceId);
    emitter.emit('message', `Spawning FFmpeg instance for ${fullServiceId}`);
    instance = spawn('ffmpeg', [
      '-hide_banner',
      ...decodeParams,
      ...buildInputParams(fullServiceId),
      ...filterParams,
      ...encodeParams,
      `${config.downstreamUrl}/${streamKey}`,
    ].filter((x) => x));

    instance.on('exit', (code) => {
      emitter.emit('message', `FFmpeg exited with code ${code}`);
      instance = null;
      streamKey = null;
      if (typeof next === 'function') {
        next();
      }
    });

    instance.stdout.on('data', (data) => {
      emitter.emit('stdout', data.toString());
    });

    instance.stderr.on('data', (data) => {
      emitter.emit('stderr', data.toString());
    });

    setTimeout(() => {
      emitter.emit('message', getViewingUrl());
    }, 10000);
  } catch (e) {
    emitter.emit('err', e.toString());
  }
};

const stop = () => {
  emitter.emit('message', 'Stopping FFmpeg instance');
  if (!instance) return false;
  return instance.kill();
};

const change = (fullServiceId) => {
  emitter.emit('message', `Changing service to ${fullServiceId}`);
  next = () => {
    start(fullServiceId);
  };
  stop();
};

const getStatus = () => {
  if (!instance || !streamKey) {
    return 'Idle';
  }
  return `Streaming to ${getViewingUrl()}`;
};

const on = (type, listener) => {
  emitter.on(type, listener);
};

module.exports = {
  start,
  stop,
  change,
  on,
  getViewingUrl,
  getStatus,
};
