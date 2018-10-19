"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var SocketIO = require('socket.io-client');

var CLIENT = typeof window !== 'undefined';

module.exports =
/*#__PURE__*/
function () {
  function Sockets() {
    (0, _classCallCheck2.default)(this, Sockets);
    this.host = 'https://metrics.sprucebot.com';

    if (CLIENT && window.METRICS_URL) {
      this.host = window.METRICS_URL;
    } else if (!CLIENT && process.env.METRICS_URL) {
      this.host = process.env.METRICS_URL;
    }

    this.socket = new SocketIO();
  }

  (0, _createClass2.default)(Sockets, [{
    key: "sendMetrics",
    value: function () {
      var _sendMetrics = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee(metrics) {
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
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
  return Sockets;
}();