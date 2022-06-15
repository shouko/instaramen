require('dotenv').config();

module.exports = {
  port: process.env.PORT,
  upstreamUrl: process.env.UPSTREAM_URL,
  downstreamUrl: process.env.DOWNSTREAM_URL,
  downstreamUseStreamKey: Number.parseInt(process.env.DOWNSTREAM_USE_STREAM_KEY),
  viewingUrl: process.env.VIEWING_URL,
  allowedNetworks: process.env.ALLOWED_NETWORKS.split(',').map((e) => parseInt(e, 10)),
  ffmpeg: {
    path: process.env.FFMPEG_PATH || 'ffmpeg',
    decodeParams: process.env.FFMPEG_DECODE_PARAMS.split(' '),
    encodeParams: process.env.FFMPEG_ENCODE_PARAMS.split(' '),
    filterParams: process.env.FFMPEG_FILTER_PARAMS.split(' '),
  },
};
