"use strict";

var os = require('os');

function collectMetrics() {
  if (typeof log === 'undefined') {
    console.log('⚠️ Unable to collect stats. Sprucebot logger not initialized.');
    return;
  }

  var loadAvg = os.loadavg();
  var processMem = process.memoryUsage();
  log.metric({
    type: 'nodeStats',
    event: 'nodeStats',
    osHostname: os.hostname(),
    osLoadAvg1m: loadAvg[0],
    osLoadAvg5m: loadAvg[1],
    osLoadAvg15m: loadAvg[2],
    osPlatform: os.platform(),
    osRelease: os.release(),
    osUptime: os.uptime(),
    osTotalMem: os.totalmem(),
    osFreeMem: os.freemem(),
    processRSS: processMem.rss,
    processHeapTotal: processMem.heapTotal,
    processHeapUsed: processMem.heapUsed,
    processExternal: processMem.external,
    processVersion: process.version
  });
}

module.exports = function (interval) {
  if (typeof interval === 'undefined' || !interval || +interval <= 0) {
    interval = 30000;
  }

  setInterval(collectMetrics, interval);
};