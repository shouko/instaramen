const {
  setStarted,
  setEnded,
  getCurrentActive,
} = require('./scheduled_events');
const transcoder = require('./transcoder');

let loopId = false;
let stopTimer = false;

const loop = async () => {
  console.log('Checking events');
  const nowTS = new Date().getTime();
  const currentActiveEvents = await getCurrentActive();
  if (currentActiveEvents.length === 0) return;
  console.log(currentActiveEvents);
  const {
    id, startsAt, startedAt, fullServiceId, durationInSeconds,
  } = currentActiveEvents.shift();
  if (startedAt === 0) {
    transcoder.start(fullServiceId);
    await setStarted({ id });
    stopTimer = setTimeout(async () => {
      stopTimer = false;
      transcoder.stop();
      await setEnded({ id });
    }, startsAt + durationInSeconds * 1000 - nowTS);
  }
  if (currentActiveEvents.length > 0) {
    const next = currentActiveEvents.shift();
    const msToNext = next.startsAt - nowTS;
    if (msToNext > 90 * 1000 && msToNext < 120 * 1000) {
      setTimeout(() => loop(), 15 * 1000);
      return;
    }
    if (stopTimer) clearTimeout(stopTimer);
    transcoder.change(next.id);
    await Promise.all([
      setEnded({ id }),
      setStarted({ id: next.id }),
    ]);
  }
};

const init = () => {
  if (loopId !== false) clearInterval(loopId);
  loopId = setInterval(() => loop(), 60 * 1000);
  loop();
};

module.exports = {
  init,
};
