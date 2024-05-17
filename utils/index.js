const formatToTwoDigits = (num) => {
  return num.toString().length === 1 ? `0${num}` : num;
};

const getFormattedTimestamp = (timestamp) => {
  const s = formatToTwoDigits(Math.floor((timestamp / 1000) % 60));
  const m = formatToTwoDigits(Math.floor((timestamp / (1000 * 60)) % 60));
  const h = formatToTwoDigits(Math.floor((timestamp / (1000 * 60 * 60)) % 24));
  return `${h}h ${m}m ${s}s`;
};

const getMilliseconds = (timestamp) => {
  const hrs = Number(timestamp.substr(0, 2));
  const mins = Number(timestamp.substr(4, 2));
  const secs = Number(timestamp.substr(8, 2));
  return hrs * 3600000 + mins * 60000 + secs * 1000;
};

module.exports = { getFormattedTimestamp, getMilliseconds };
