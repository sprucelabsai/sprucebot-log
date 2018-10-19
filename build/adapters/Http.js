"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var request = require('superagent');

var CLIENT = typeof window !== 'undefined';

module.exports =
/*#__PURE__*/
function () {
  function Http(_ref) {
    var appName = _ref.appName,
        appKey = _ref.appKey,
        appEnv = _ref.appEnv,
        metricsUrl = _ref.metricsUrl;
    (0, _classCallCheck2.default)(this, Http);
    this.host = metricsUrl || 'https://metrics.sprucebot.com';
    this.appName = appName;
    this.appKey = appKey;
    this.appEnv = appEnv;

    if (!metricsUrl && CLIENT && window.METRICS_URL) {
      this.host = window.METRICS_URL;
    } else if (!metricsUrl && !CLIENT && process.env.METRICS_URL) {
      this.host = process.env.METRICS_URL;
    }
  }

  (0, _createClass2.default)(Http, [{
    key: "sendMetrics",
    value: function () {
      var _sendMetrics = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee(metrics) {
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return request.post("".concat(this.host, "/api/1.0/metrics")).set({
                  'x-app-name': this.appName,
                  'x-app-key': this.appKey,
                  'x-app-env': this.appEnv
                }).timeout(3000).send(metrics);

              case 2:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function sendMetrics(_x) {
        return _sendMetrics.apply(this, arguments);
      };
    }()
  }]);
  return Http;
}();