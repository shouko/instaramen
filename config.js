require('dotenv').config();

module.exports = {
  port: process.env.PORT,
  upstreamUrl: process.env.UPSTREAM_URL,
  downstreamUrl: process.env.DOWNSTREAM_URL,
  viewingUrl: process.env.VIEWING_URL,
  allowedNetworks: process.env.ALLOWED_NETWORKS.split(',').map((e) => parseInt(e, 10)),
  ffmpeg: {
    decodeParams: process.env.FFMPEG_DECODE_PARAMS.split(' '),
    encodeParams: process.env.FFMPEG_ENCODE_PARAMS.split(' '),
    filterParams: process.env.FFMPEG_FILTER_PARAMS.split(' '),
  },
};
