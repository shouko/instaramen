const getTodayStartJST = () => {
  const now = new Date();
  const timeZone = 'Asia/Tokyo';
  const jstYYYY = now.toLocaleString('en-US', {
    timeZone,
    year: 'numeric',
  });
  const jstMM = now.toLocaleString('en-US', {
    timeZone,
    month: '2-digit',
  });
  const jstDD = now.toLocaleString('en-US', {
    timeZone,
    day: '2-digit',
  });
  const todayStartJst = new Date(`${jstYYYY}/${jstMM}/${jstDD} 00:00:00 +09:00`);
  return todayStartJst;
};

module.exports = {
  getTodayStartJST,
};
