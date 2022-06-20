const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketio = require('socket.io');
const config = require('./config');
const transcoder = require('./transcoder');
const channels = require('./channels');
const programs = require('./programs');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
io.on('connection', (socket) => {
  socket.on('message', (msg) => {
    console.log('message', msg);
    io.emit('message', msg);
  });
  socket.on('transcoder', (msg) => {
    console.log('transcoder', msg);
    const [action, param] = msg.split(' ');
    switch (action) {
      case 'start':
        transcoder.start(param);
        break;
      case 'stop':
        transcoder.stop();
        break;
      case 'change':
        transcoder.change(param);
        break;
      default:
    }
  });
  socket.emit('message', `Transcoder status: ${transcoder.getStatus()}`);
  socket.emit('service', channels.list());
});

const forwardedEventTypes = ['stdout', 'stderr', 'err', 'message'];

forwardedEventTypes.forEach((type) => {
  transcoder.on(type, (data) => {
    if (typeof data !== 'string') return false;
    if (data.indexOf('A decode call did not consume any data') !== -1) return false;
    return io.emit(type, data.replace(config.upstreamUrl, '###').replace(config.downstreamUrl, '###'));
  });
});

app.disable('x-powered-by');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(`${__dirname}/public`));

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/api/channels', (req, res) => res.json(channels.list()));

app.get('/api/programs', (req, res) => {
  programs.getFromToday().then((rows) => res.json(rows));
});

app.post('/api/programs/sync', async (req, res) => {
  res.json(await programs.sync());
});

const listener = server.listen(config.port, () => {
  console.info(`Listening on port ${listener.address().port}!`);
});

process.on('exit', (code) => {
  transcoder.stop();
  console.log(`Exiting with ${code}`);
});
