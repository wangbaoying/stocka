var moment = require('./moment-with-locales&tz');

moment.locale('en', {
  relativeTime: {
    future: "in %s",
    past: "%s Ago",
    s: "Seconds",
    m: "A Min",
    mm: "%d Mins",
    h: "An Hour",
    hh: "%d Hours",
    d: "A Day",
    dd: "%d Days",
    M: "A Month",
    MM: "%d Months",
    y: "A Year",
    yy: "%d Years"
  }
});

module.exports = moment;