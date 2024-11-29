const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketio = require('socket.io');
const config = require('./config');
const transcoder = require('./transcoder');
const channels = require('./channels');
const programs = require('./programs');
const scheduledEvents = require('./scheduled_events');
const scheduler = require('./scheduler');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  path: '/live/socket.io',
});
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
  socket.on('reloadch', () => {
    channels.load().then(() => {
      socket.emit('service', channels.list());
    });
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
app.use('/live', express.static(`${__dirname}/public`));
app.use('/', express.static(`${__dirname}/public`));

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/api/channels', (req, res) => res.json(channels.list()));

app.get('/api/programs', (req, res) => {
  const { days } = req.query;
  programs.getFromToday(days || 2).then((rows) => res.json(rows));
});

app.post('/api/programs/sync', async (req, res) => {
  res.json(await programs.sync());
});

app.get('/api/scheduled_events', (req, res) => {
  const { days } = req.query;
  scheduledEvents.getFromToday(days || 2).then((rows) => res.json(rows));
});

app.post('/api/scheduled_events', async (req, res) => {
  const { startsAt, endsAt, serviceId: fullServiceId } = req.body;
  try {
    await scheduledEvents.create({
      startsAt,
      endsAt,
      fullServiceId,
    });
    res.json({});
  } catch (e) {
    console.error(e);
    res.status(500).json(e);
  }
});

app.delete('/api/scheduled_events/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await scheduledEvents.disable({ id });
    res.json({});
  } catch (e) {
    console.error(e);
    res.status(500).json(e);
  }
});

const listener = server.listen(config.port, () => {
  console.info(`Listening on port ${listener.address().port}!`);
  scheduler.init();
});

process.on('exit', (code) => {
  transcoder.stop();
  console.log(`Exiting with ${code}`);
});
