const { formatToTimeZone } = require('date-fns-timezone');

const buildPath = (dateObj, slug) => {
  const date = formatToTimeZone(dateObj, 'YYYY/MM/DD', { timeZone: 'Asia/Tokyo' });
  return `/blog/${date}/${slug}/`;
};

module.exports = {
  buildPath
};
