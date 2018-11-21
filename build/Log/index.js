"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var IsoLog = require('./IsoLog');

var HttpAdapter = require('../adapters/Http');

var SocketAdapter = require('../adapters/Sockets');

var getTimes = require('../collectors/browser');

var CLIENT = typeof window !== 'undefined';
var os;
var packageName;
var packageVersion;
var userAgent;

if (CLIENT) {
  os = {
    hostname: function hostname() {
      return '';
    }
  };
  userAgent = typeof navigator !== 'undefined' && navigator && navigator.userAgent ? navigator.userAgent : 'unknown';
} else {
  os = require('os'); // eslint-disable-line

  try {
    // $FlowIgnore
    var packageJSON = require("".concat(process.env.PWD, "/package.json")); // eslint-disable-line


    packageName = packageJSON.name;
    packageVersion = packageJSON.version;
  } catch (e) {// Do nothing
  }
}

module.exports =
/*#__PURE__*/
function (_IsoLog) {
  (0, _inherits2.default)(Log, _IsoLog);

  function Log() {
    var _this;

    (0, _classCallCheck2.default)(this, Log);
    _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(Log).call(this));

    _this.setLevel('warn');

    _this.flushInterval = 10000;
    _this.maxQueueLength = 1000;
    _this.hostname = _this.getHostname();
    setInterval(_this.flushData.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this))), _this.flushInterval);
    _this.metricsQueue = [];
    return _this;
  }

  (0, _createClass2.default)(Log, [{
    key: "setOptions",
    value: function setOptions(options) {
      (0, _get2.default)((0, _getPrototypeOf2.default)(Log.prototype), "setOptions", this).call(this, options);

      if (options) {
        if (options.level) {
          this.setLevel(options.level);
        }

        if (options.flushAt && +options.flushAt > 0) {
          this.flushAt = +options.flushAt;
        } else {
          this.flushAt = 10;
        }

        if (options.flushIntervalSec && +options.flushIntervalSec > 0) {
          this.flushInterval = +options.flushIntervalSec * 1000;
        }

        if (options.userAgent) {
          this.userAgent = options.userAgent;
        }

        if (options.packageName) {
          this.packageName = options.packageName;
        }

        if (options.packageVersion) {
          this.packageVersion = options.packageVersion;
        }

        if (options.metricsUrl) {
          this.metricsUrl = options.metricsUrl;
        }

        if (options.appName && options.appEnv) {
          this.appName = options.appName;
          this.appKey = options.appKey;
          this.appEnv = options.appEnv;
        }

        if (options.metricsEnabled === true) {
          this.metricsEnabled = true;
        } else {
          this.metricsEnabled = false;
        }

        if (options.useColors === false) {
          this.useColors = false;
        } else {
          this.useColors = true;
        }

        if (options.captureFELogs === true) {
          this.captureFELogs = true;
        } else {
          this.captureFELogs = false;
        }

        if (options.logUrl) {
          this.logUrl = options.logUrl;
        }

        this.adapter = this.getAdapter();
      }
    }
  }, {
    key: "collectBrowserMetrics",
    value: function collectBrowserMetrics() {
      if (typeof window !== 'undefined') {
        var stats = getTimes();
        this.metric((0, _objectSpread2.default)({
          type: 'browserPageLoadStats',
          event: 'browserPageLoadStats',
          path: window.location.pathname
        }, stats));
      }
    }
  }, {
    key: "times",
    value: function times() {
      return getTimes();
    }
  }, {
    key: "routeChangeStart",
    value: function routeChangeStart() {
      this.routeChangeStartTime = Date.now();
    }
  }, {
    key: "routeChangeComplete",
    value: function routeChangeComplete() {
      var diff = Date.now() - this.routeChangeStartTime;

      if (typeof window !== 'undefined') {
        var stats = getTimes();
        this.metric({
          type: 'browserPageLoadStats',
          event: 'routeChange',
          path: window.location.pathname,
          loadTime: diff
        });
      }
    }
  }, {
    key: "getAdapter",
    value: function getAdapter() {
      return new HttpAdapter({
        appName: this.appName,
        appKey: this.appKey,
        appEnv: this.appEnv,
        metricsUrl: this.metricsUrl,
        logUrl: this.logUrl
      });
    }
  }, {
    key: "timerStart",
    value: function timerStart() {
      return process.hrtime();
    }
  }, {
    key: "timerEnd",
    value: function timerEnd(timeStart) {
      var elapsedHrTime = process.hrtime(timeStart);
      var elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;
      return elapsedTimeInMs;
    }
  }, {
    key: "metric",
    value: function metric(data) {
      var time;
      var event;
      var hostname;
      var value;
      var rest = {};

      if (typeof data === 'string') {
        event = data;
      } else if ((0, _typeof2.default)(data) === 'object') {
        rest = data;
        event = data.event;
        time = data.time;
        hostname = data.hostname;
        value = data.value;

        if (data.packageName) {
          packageName = data.packageName;
        }

        if (data.packageVersion) {
          packageVersion = data.packageVersion;
        }

        if (data.userAgent) {
          userAgent = data.userAgent;
        }
      }

      if (!event) {
        // $FlowIgnore
        this.warn('Unable to collect metric because "event" was not specified');
        return;
      }

      if (!time) {
        time = Date.now();
      }

      if (!hostname) {
        hostname = this.hostname;
      }

      if (!packageName) {
        packageName = this.packageName;
      }

      if (!packageVersion) {
        packageVersion = this.packageVersion;
      }

      this.metricsQueue.push((0, _objectSpread2.default)({}, rest, {
        userAgent: userAgent,
        packageName: packageName,
        packageVersion: packageVersion,
        time: time,
        event: event,
        value: value,
        hostname: hostname
      }));
    }
  }, {
    key: "flushData",
    value: function flushData() {
      this.flushMetrics();
      this.flushLogs();
    }
  }, {
    key: "flushMetrics",
    value: function () {
      var _flushMetrics = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee() {
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (this.metricsEnabled) {
                  _context.next = 4;
                  break;
                }

                this.trace('Metrics disabled');
                this.metricsQueue = [];
                return _context.abrupt("return");

              case 4:
                if (this.adapter) {
                  _context.next = 8;
                  break;
                }

                this.warn('flushMetrics: ...Unable to send because no adapter has been set. Ensure log.setOptions({appName, appEnv}) has been called');
                _context.next = 21;
                break;

              case 8:
                if (!(this.metricsQueue.length > 0)) {
                  _context.next = 20;
                  break;
                }

                _context.prev = 9;
                _context.next = 12;
                return this.adapter.sendMetrics(this.metricsQueue);

              case 12:
                this.metricsQueue = [];
                _context.next = 18;
                break;

              case 15:
                _context.prev = 15;
                _context.t0 = _context["catch"](9);
                this.warn(_context.t0);

              case 18:
                _context.next = 21;
                break;

              case 20:
                this.trace('flushMetrics: No metrics to send');

              case 21:
                // Ensure we don't have a queue that gets out of control
                if (this.metricsQueue.length > this.maxQueueLength) {
                  // Reset the queue
                  this.metricsQueue = [];
                }

              case 22:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[9, 15]]);
      }));

      return function flushMetrics() {
        return _flushMetrics.apply(this, arguments);
      };
    }()
  }, {
    key: "flushLogs",
    value: function () {
      var _flushLogs = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee2() {
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (this.captureFELogs) {
                  _context2.next = 4;
                  break;
                }

                this.trace('FE Metrics Capture Disabled');
                this.logs = [];
                return _context2.abrupt("return");

              case 4:
                if (this.adapter) {
                  _context2.next = 8;
                  break;
                }

                this.warn('flushLogs: ...Unable to send because no adapter has been set. Ensure log.setOptions({appName, appEnv}) has been called');
                _context2.next = 21;
                break;

              case 8:
                if (!(this.logs.length > 0)) {
                  _context2.next = 20;
                  break;
                }

                _context2.prev = 9;
                _context2.next = 12;
                return this.adapter.sendLogs(this.logs);

              case 12:
                _context2.next = 17;
                break;

              case 14:
                _context2.prev = 14;
                _context2.t0 = _context2["catch"](9);
                this.warn(_context2.t0);

              case 17:
                this.logs = [];
                _context2.next = 21;
                break;

              case 20:
                this.trace('flushLogs: No metrics to send');

              case 21:
                // Ensure we don't have a queue that gets out of control
                if (this.logs.length > this.maxQueueLength) {
                  // Reset the queue
                  this.logs = [];
                }

              case 22:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[9, 14]]);
      }));

      return function flushLogs() {
        return _flushLogs.apply(this, arguments);
      };
    }()
  }, {
    key: "getHostname",
    value: function getHostname() {
      var hostname = 'unknown';

      try {
        if (CLIENT) {
          hostname = window.location.hostname;
        } else {
          if ((typeof config === "undefined" ? "undefined" : (0, _typeof2.default)(config)) === 'object' && config.baseUrl) {
            hostname = config.baseUrl;
          } else if (process.env.SERVER_HOST) {
            hostname = process.env.SERVER_HOST;
          } else {
            hostname = os.hostname();
          }

          hostname = hostname.replace(/https?:\/\//, '');
          hostname = hostname.replace('/', '');
        }
      } catch (e) {
        this.warn(e);
      }

      return hostname;
    }
  }, {
    key: "trackLog",
    value: function trackLog(level, args) {
      this.metric("log-".concat(level));
    }
  }, {
    key: "trace",
    value: function trace() {
      this.doLog('trace', arguments);
    }
  }, {
    key: "debug",
    value: function debug() {
      this.doLog('debug', arguments);
    }
  }, {
    key: "log",
    value: function log() {
      this.doLog('log', arguments);
    }
  }, {
    key: "info",
    value: function info() {
      this.doLog('info', arguments);
    }
  }, {
    key: "warn",
    value: function warn() {
      this.trackLog('warn', arguments);
      this.doLog('warn', arguments, this.captureFELogs);
    }
  }, {
    key: "error",
    value: function error() {
      this.trackLog('error', arguments);
      this.doLog('error', arguments, this.captureFELogs);
    }
  }, {
    key: "crit",
    value: function crit() {
      this.trackLog('error', arguments);
      this.doLog('error', arguments, this.captureFELogs);
    }
  }, {
    key: "fatal",
    value: function fatal() {
      this.trackLog('error', arguments);
      this.doLog('error', arguments, this.captureFELogs);
    }
  }, {
    key: "superInfo",
    value: function superInfo() {
      this.doLog('superInfo', arguments);
    }
  }]);
  return Log;
}(IsoLog);