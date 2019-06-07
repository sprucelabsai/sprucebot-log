# Sprucebot Logger

An isomorphic logger (based on [iso-log](https://github.com/barbershop/iso-log)) and metrics collection utilities for the [Sprucebot](https://sprucebot.com/) platform.

## Installation

`yarn add @sprucelabs/log`

## Usage

In browser console:

![Console](https://raw.githubusercontent.com/kengoldfarb/iso-log/master/screenshots/console.png)

And in terminal:

![Terminal](https://raw.githubusercontent.com/kengoldfarb/iso-log/master/screenshots/terminal.png)

### Features

- Works both client and server side

- Log levels

- Outputs logs using native `console` methods

- Trace log statements to files and lines

- Sourcemap support

- Collect and send metrics from the browser to your server

- Integration with [winston](https://github.com/winstonjs/winston) for server side logs

## Browser (client) Installation

```javascript
const log = require('@sprucelabs/log/client')
```

## NodeJS (server) Installation

```js
const logger = require('@sprucelabs/log')
const log = logger.log
```

## Usage

```js
// After the logger is initialized, set some options.
log.setOptions({
	level: 'debug', // (default: 'warn')
	useTrace: false, // (default: false) If true, the logger will attempt to log the filename and line number where the log originated. THIS SHOULD ONLY BE SET true in development environments. Setting it to true has performance implications.
	useSourcemaps: false, // (default: false) Whether to try using sourcemaps. You will also need to set useTrace=true. THIS SHOULD ONLY BE SET true in development environments. Setting it to true has performance implications.
	traceTreeDepth: 3, // (default: 3) If useTrace=true, this sets the max number path levels to output with the filename
	useColors: true, // (default: true) Colorize log messages
	asJSON: false, // (default: false) Output log messages as JSON (server side only)
	formatters: undefined, // (default: see IsoLog.js setupWinston() method) Array of custom formatters to use for server side logs. https://github.com/winstonjs/winston#formats
	transports: undefined, // (default: [new winston.transports.Console()]) Array of custom transports to use for server side logs. https://github.com/winstonjs/winston#transports
	appName: 'myskill', // (default: undefined) You choose an app name. This will bucket your metrics together
	appEnv: 'production' // (default: undefined) Set the current environment which will allow us to segment metrics from different environments.
	// (default: undefined) SERVER OPTION ONLY! Your app key should only be set when using this from your server. This should be treated like a password and NEVER exposed publicly
	appKey: 'ec858f58-0978-4fa7-8cdb-704902f30692'
	flushAt: 10, // (default: 10) The number of metrics to collect before sending them (default 10)
	flushIntervalSec: 10, // (default: 10) How often to send metrics (if any have been collected) (default 10)
	userAgent: navigator.userAgent(), // (default: undefined) The user agent making the request
	packageName: 'myskill', // (default: undefined) Your app's package name
	packageVersion: 'v1.4.34', // (default: undefined) Your apps's package version
	metricsUrl: 'https://metrics.sprucebot.com' // (default: 'https://metrics.sprucebot.com') The server where metrics are sent
});

log.debug('All set!');

log.metric({
	event: 'user-did-something', // The event name to track
	value: 3, // Optional: If set, must be a number
	// All the following parameters are optional and allows you to override what was automatically detected or set in log.setOptions()
	userAgent: navigator.userAgent(), // The user agent making the request
	packageName: 'myskill', // Your app's package name
	packageVersion: 'v1.4.34', // Your apps's package version
	time: Date.now(), // The unix timestamp for this event (default is now)
	hostname: window.location.hostname // The current hostname
})
```

### Timers

This library also provides a couple helper functions for timers:

```js
const startTime = log.timerStart()
// Do some stuff
const milliseconds = log.timerEnd(startTime)
log.metric({
	event: 'timeToDoSomething',
	value: milliseconds
})
```

## Additional NodeJS (server) Features

### Server Metrics Collection

We can collect server metrics like CPU and memory usage automatically. After you've initialized the logger and called `setOptions()` just call:

```js
logger.nodeMetrics()
```

### Request Metrics (for express-based apps)

We can collect stats on the type of HTTP requests being made by installing the request middleware. After you've initialized the logger and called `setOptions()` initialize your express app and the add the middleware:

```js
const app = express()

app.use(logger.middleware.requests())
```

### Sequelize Middleware Metrics Collection

We can collect stats on create/update/delete methods of models. After you've initialized the logger and called `setOptions()` initialize Sequelize and add the metrics hooks:

```js
const sequelize = new Sequelize(this.uri, this.options)

logger.sequelizeHooks(sequelize)
```

### Options

`level` - The log level to use. Default: 'debug'

Valid levels are:

```
trace
debug
log
info
warn
error
superInfo
```

If the level specified is `info`, then `info`, `warn`, `error`, and `superInfo` logs would be written to the console. `trace` and `debug` logs would NOT be written to the console.

`useTrace` - Whether to run a trace which will add the file and line number. Default: true

`useSourcemaps` - Whether to try to resolve the original file and line number. Will look for the sourcemap in the corresponding `.map` file. For example, `/some/js/file.js.map`. Default: true

### Logging Examples

```javascript
log.trace('log at level trace')
log.debug('log at level debug')
log.log('log at level log')
log.info('log at level info')
log.warn('log at level warn')
log.error('log at level error')
log.superInfo('log at level error')

log.crit('log at level error') // alias of 'error'
log.fatal('log at level error') // alias of 'error'

// Anything that can be passed to console.log can be passed to the logger
log.debug({ some: 'object here' })
log.debug('multiple things', 'getting logged here', { some: 'object here' })
```

### Sourcemaps and Webpack

For source maps to properly work you'll need to make sure you're generating them (with the original source info). If you're using webpack you can add this to your config:

```javascript
{
	devtool: 'cheap-module-source-map'
}
```

If you're using webpack and receive a `Module not found: Error: Can't resolve 'fs'`, just add the following to your webpack config:

```javascript
node: {
	fs: 'empty'
}
```
