// @flow
// Modified version of https://github.com/barbershop/iso-log
const debug = require('debug')('@sprucelabs/log')
const chalk = require('chalk')
const sourceMap = require('source-map')
const request = require('superagent')
const winston = require('winston')

let fs
const CLIENT =
	typeof window !== 'undefined' || typeof __webpack_require__ === 'function'

if (!CLIENT) {
	fs = require('fs') // eslint-disable-line
}

module.exports = class Log {
	useTrace: boolean
	useSourcemaps: boolean
	useColors: boolean
	asJSON: boolean
	level: string
	levels: Object
	sources: Object
	sourceMaps: Object
	originalPositionQueue: Object
	logs: Array<any>
	userAgent: string

	constructor() {
		this.levels = {
			trace: {
				i: 0,
				hex: '#404040',
				hexFallBack: 'gray',
				bgHex: null,
				bgHexFallBack: null
			},
			debug: {
				i: 1,
				hex: '#009933',
				hexFallBack: 'green',
				bgHex: null,
				bgHexFallBack: null
			},
			log: {
				i: 2,
				hex: '#404040',
				hexFallBack: 'gray',
				bgHex: null,
				bgHexFallBack: null
			},
			info: {
				i: 2,
				hex: '#0033cc',
				hexFallBack: 'cyan',
				bgHex: null,
				bgHexFallBack: null
			},
			warn: {
				i: 3,
				hex: '#ff6600',
				hexFallBack: 'red',
				bgHex: null,
				bgHexFallBack: null
			},
			error: {
				i: 4,
				hex: '#cc3300',
				hexFallBack: 'red',
				bgHex: null,
				bgHexFallBack: null
			},
			crit: {
				i: 5,
				hex: '#cc3300',
				hexFallBack: 'red',
				bgHex: null,
				bgHexFallBack: null
			},
			fatal: {
				i: 6,
				hex: '#cc3300',
				hexFallBack: 'red',
				bgHex: null,
				bgHexFallBack: null
			},
			superInfo: {
				i: 7,
				hex: '#0033cc',
				hexFallBack: 'cyan',
				bgHex: null,
				bgHexFallBack: null
			}
		}

		this.useTrace = true
		if (CLIENT) {
			this.traceTreeDepth = 2
		} else {
			this.traceTreeDepth = 3
		}
		this.useSourcemaps = false
		this.sources = {}
		this.sourceMaps = {}
		this.originalPositionQueue = {}
		this.useColors = true
		this.asJSON = false
		global.sources = this.sources
		global.sourceMaps = this.sourceMaps
		this.logs = []
		this.setupWinston()
	}

	setOptions(options: {
		level?: string,
		formatters?: Array<any>,
		transports?: Array<any>,
		useTrace?: boolean,
		asJSON?: boolean,
		useSourcemaps?: boolean,
		useColors?: boolean,
		userAgent: string
	}) {
		debug('Initializing options', { options })

		if (options.level) {
			this.setLevel(options.level)
		}

		if (options.useTrace === true) {
			this.useTrace = true
		} else {
			this.useTrace = false
		}

		if (options.useSourcemaps === true) {
			this.useSourcemaps = true
		} else {
			this.useSourcemaps = false
		}

		if (options.useColors === false) {
			this.useColors = false
		} else {
			this.useColors = true
		}

		this.userAgent = options.userAgent || 'unknown'

		if (typeof options.asJSON !== 'undefined') {
			this.asJSON = options.asJSON === true
		}

		if (options.transports && Array.isArray(options.transports)) {
			this.customTransports = options.transports
		}

		if (options.formatters && Array.isArray(options.formatters)) {
			this.customFormatters = options.formatters
		}

		this.setupWinston()
	}

	setLevel(level: string) {
		switch (level) {
			case 'trace':
			case 'debug':
			case 'info':
			case 'warn':
			case 'error':
			case 'crit':
			case 'fatal':
			case 'superInfo':
				this.level = level
				break
			default:
				this.level = 'warn'
				break
		}
	}

	setupWinston() {
		debug('Setting up new winston logger', { level: this.level })

		const customLevels = {
			levels: {
				trace: 7,
				debug: 6,
				info: 5,
				warn: 4,
				error: 3,
				crit: 2,
				fatal: 1,
				superInfo: 0
			},
			colors: {
				trace: 'gray',
				debug: 'green',
				info: 'cyan',
				warn: 'yellow',
				error: 'red',
				crit: 'red',
				fatal: 'red',
				superInfo: 'cyan'
			}
		}

		winston.addColors(customLevels.colors)

		const transports = this.customTransports || [
			new winston.transports.Console()
		]
		let formatters = []
		if (this.useColors) {
			formatters.push(winston.format.colorize({ all: this.useColors }))
		}

		formatters.push(
			winston.format.timestamp({
				format: 'YYYY-MM-DD HH:mm:ss:SSS'
			})
		)

		if (this.asJSON) {
			formatters.push(winston.format.json())
		} else {
			formatters.push(
				winston.format.printf(info => {
					// Available data passed through to custom formatter. Note that SOME OF THESE ITEMS MAY NOT BE DEFINED.
					// The only info items guarenteed to be set are "message" and "level"
					//
					// info.message - This is a string that has the log message(s). If an object was passed as any log argument it will all be stringified into info.message
					// info.level - The log level for the message. Levels are (lowest -> highest): trace, debug, info, warn, error, crit, fatal, superInfo
					// info.timestamp - The timestamp (see above for formatting)
					// info.thingType - The type of the item being logged
					// info.callerFunc - Detailed info on where this log was called from if useTrace=true. This combines the source path, filename, line number, and column. It will also take into account sourcemaps if enabled.
					// info.sourceRoot - The path to the source file where the log was called if useTrace=true
					// info.sourceFile - The source filename where the log was called if useTrace=true
					// info.mapFile - The filename of the sourcemap file
					// info.lineNumber - The line number this log was called on
					// info.position - The column / position of where the log was called
					// info.originalFile - The original filename where the log was called from if using sourcemaps
					// info.originalLine - The original line where the log was called from if using sourcemaps
					// info.originalColumn - The original column where the log was called from if using sourcemaps

					return `${info.timestamp} ${info.level} (${info.thingType}):${
						info.callerFunc ? ` (${info.callerFunc})` : ''
					} ${info.message}`
				})
			)
		}

		if (this.customFormatters) {
			formatters = this.customFormatters
		}

		const logger = winston.createLogger({
			level: this.level || 'warn',
			levels: customLevels.levels,
			transports,
			format: winston.format.combine(...formatters)
		})

		this.winstonLogger = logger
	}

	doLog(level: string, args: any, saveLog: boolean) {
		if (
			this.levels[level] &&
			this.levels[level].i >= this.levels[this.level].i
		) {
			let thingToLog
			let rawThingToLog

			if (args && args.length === 1) {
				if (typeof args[0] !== 'string') {
					thingToLog = [args[0]]
					rawThingToLog = [args[0]]
				} else {
					thingToLog = args[0]
					rawThingToLog = args[0]
				}
			} else {
				thingToLog = []
				rawThingToLog = []
				for (let i = 0, len = args.length; i < len; i += 1) {
					thingToLog.push(args[i])
					rawThingToLog.push(args[i])
				}
			}

			const now = this.getDatetimeString()

			const thingType = typeof thingToLog
			this.getLine()
				.then(
					({
						callerFunc,
						sourceRoot,
						sourceFile,
						mapFile,
						lineNumber,
						position,
						originalFile,
						originalLine,
						originalColumn
					}) => {
						// default noop
						let consoleMethod = () => {}
						if (typeof console !== 'undefined') {
							if (
								!CLIENT &&
								level === 'debug' &&
								typeof console.log !== 'undefined'
							) {
								// Node has a dummy 'debug' console method (in v8) that doesn't print anything to console.  Use console.log instead
								consoleMethod = console.log
							} else if (typeof console[level] !== 'undefined') {
								consoleMethod = console[level]
							} else if (typeof console.log !== 'undefined') {
								consoleMethod = console.log
							}
						}

						const rawAboutStr = callerFunc
							? `(${level.toUpperCase()} | ${now} | ${callerFunc} | ${thingType}): `
							: `(${level.toUpperCase()} | ${now} | ${thingType}): `

						const aboutStr = this.decorateLogMessage(level, rawAboutStr)

						const colorizedLevel = this.colorize(level, aboutStr)

						if (CLIENT) {
							console.log.apply(this, colorizedLevel)
						}

						if (CLIENT) {
							if (thingType === 'string') {
								consoleMethod.call(this, thingToLog)
							} else {
								consoleMethod.apply(this, thingToLog)
							}
						} else {
							if (
								!this.asJSON &&
								!this.customFormatters &&
								thingType !== 'string'
							) {
								try {
									thingToLog = `\n${JSON.stringify(
										thingToLog,
										this.replaceErrors,
										4
									)}`
								} catch (e) {
									debug('Error stringifying thingToLog', e)
								}
							} else if (
								this.asJSON &&
								!this.customFormatters &&
								thingType !== 'string'
							) {
								try {
									// Stringify the log so it can properly get Error object properties and then re-parse it to JSON
									thingToLog = JSON.parse(
										`${JSON.stringify(thingToLog, this.replaceErrors)}`
									)
								} catch (e) {
									debug('Error stringifying thingToLog', e)
								}
							}

							this.winstonLogger[level](thingToLog, {
								thingType,
								callerFunc,
								sourceRoot,
								sourceFile,
								mapFile,
								lineNumber,
								position,
								originalFile,
								originalLine,
								originalColumn
							})
						}

						if (saveLog && CLIENT && this.logs && Array.isArray(this.logs)) {
							const thingToSave = JSON.parse(
								`${JSON.stringify(rawThingToLog, this.replaceErrors)}`
							)

							this.logs.push({
								userAgent: this.userAgent,
								path:
									window && window.location && window.location.pathname
										? window.location.pathname
										: 'unknown',
								timestamp: now,
								level,
								item: thingToSave,
								thingType,
								callerFunc,
								sourceRoot,
								sourceFile,
								mapFile,
								lineNumber,
								position,
								originalFile,
								originalLine,
								originalColumn
							})
						}
					}
				)
				.catch(e => {
					console.warn(e)
				})
		} else {
			debug('Log suppressed because log level was not met', { level, args })
		}
	}

	getDatetimeString() {
		const now = new Date()
		const year = now.getFullYear()
		let month = now.getMonth() + 1
		if (month < 10) {
			month = '0' + month
		}
		let day = now.getDate()
		if (day < 10) {
			day = '0' + day
		}
		let hour = now.getHours()
		if (hour < 10) {
			hour = '0' + hour
		}
		let minute = now.getMinutes()
		if (minute < 10) {
			minute = '0' + minute
		}
		let second = now.getSeconds()
		if (second < 10) {
			second = '0' + second
		}
		const millisecond = now.getMilliseconds()
		const nowStr = `${year}-${month}-${day} ${hour}:${minute}:${second}:${millisecond}`

		return nowStr
	}

	colorize(level: string, str: string, bold: boolean) {
		if (!this.useColors) {
			return str
		}
		let colorizedStr = str
		if (CLIENT) {
			let style = ''
			if (this.levels[level].bgHex) {
				style += `background: ${this.levels[level].bgHex};`
			}
			if (this.levels[level].hex) {
				style += `color: ${this.levels[level].hex};`
			}
			if (bold) {
				style += `font-weight: bold;`
			}

			colorizedStr = [`%c${str}`, style]
		} else {
			if (this.levels[level].bgHexFallBack) {
				colorizedStr = chalk[this.levels[level].bgHexFallBack](colorizedStr)
			}
			if (this.levels[level].hexFallBack) {
				colorizedStr = chalk[this.levels[level].hexFallBack](colorizedStr)
			}
			if (bold) {
				colorizedStr = chalk.bold(colorizedStr)
			}
		}
		return colorizedStr
	}

	getLine(): Promise<?string> {
		return new Promise(resolve => {
			if (!this.useTrace) {
				debug('Suppressing file / line numbers because useTrace === false')
				resolve({})
				return
			}

			let callerFunc = ''
			try {
				throw new Error()
			} catch (e) {
				const matches = e.stack.match(/\sat[^\n]*\n/g)
				let depth = 0

				for (let i = 0, len = matches.length; i < len; i += 1) {
					if (matches[i].indexOf('at Log.getLine') > -1) {
						depth = i + 3
						break
					}
				}

				if (matches && matches[depth]) {
					const matches2 = matches[depth].match(
						/at (.*)\((.*\/)(.*\.js):([^:]*):([^:]*)\)\n$/
					)

					if (matches2 && matches2[1]) {
						const sourceRoot = matches2[2]
						const sourceFile = matches2[3]
						const mapFile = `${sourceFile}.map`
						const lineNumber = matches2[4]
						const position = matches2[5]

						const sourceRootPaths = sourceRoot && sourceRoot.split('/')

						let lastSourceRootPath = ''

						if (sourceRootPaths && sourceRootPaths.length > 1) {
							for (let i = 0; i < this.traceTreeDepth; i += 1) {
								if (sourceRootPaths[sourceRootPaths.length - 1 - i]) {
									lastSourceRootPath = `${
										sourceRootPaths[sourceRootPaths.length - 1 - i]
									}/${lastSourceRootPath}`
								}
							}
						}

						if (!this.useSourcemaps) {
							// Do not try to resolve from sourcemap.  Just use
							callerFunc = `/${lastSourceRootPath}${sourceFile}:${lineNumber}:${position}`
							return resolve({
								callerFunc,
								sourceRoot,
								sourceFile,
								mapFile,
								lineNumber,
								position
							})
						}

						this.getSource({
							sourceRoot,
							sourceFile,
							mapFile,
							lineNumber,
							position
						}).then(original => {
							if (original) {
								const originalMatches = original.source.match(/([^/]+)$/)
								let originalFile = ''
								if (originalMatches && originalMatches[1]) {
									originalFile = originalMatches[1]
								}

								callerFunc = `/${lastSourceRootPath}${originalFile}:${original.line}:${original.column}`
								return resolve({
									callerFunc,
									sourceRoot,
									sourceFile,
									mapFile,
									lineNumber,
									position,
									originalFile,
									originalLine: original.line,
									originalColumn: original.column
								})
							}

							callerFunc = `${matches2[1]} | ${matches2[2]}`
							return resolve({
								callerFunc,
								sourceRoot,
								sourceFile,
								mapFile,
								lineNumber,
								position
							})
						})
					} else {
						debug('Unable to parse stack trace to get file / line number')
						return resolve({})
					}
				} else {
					debug('Unable to get stack trace for file / line number')
					return resolve({})
				}
			}
		})
	}

	trace() {
		this.doLog('trace', arguments)
	}

	debug() {
		this.doLog('debug', arguments)
	}

	log() {
		this.doLog('log', arguments)
	}

	info() {
		this.doLog('info', arguments)
	}

	warn() {
		this.doLog('warn', arguments)
	}

	error() {
		this.doLog('error', arguments)
	}

	crit() {
		this.doLog('crit', arguments)
	}

	fatal() {
		this.doLog('fatal', arguments)
	}

	superInfo() {
		this.doLog('superInfo', arguments)
	}

	getSource({
		sourceRoot,
		sourceFile,
		mapFile,
		lineNumber,
		position
	}): Promise<any> {
		return new Promise(resolve => {
			const fullSource = `${sourceRoot}${sourceFile}`
			const fullMapSource = `${sourceRoot}${mapFile}`
			if (!this.sources[fullSource]) {
				this.sources[fullSource] = true

				if (CLIENT) {
					request.get(fullMapSource).end((err, res) => {
						if (err || !res.ok) {
							console.warn(err)
							return resolve()
						}
						this.sources[fullSource] = res.body
						this.sourceMaps[fullSource] = new sourceMap.SourceMapConsumer(
							this.sources[fullSource]
						)
						const original = this.sourceMaps[fullSource].originalPositionFor({
							line: parseInt(lineNumber, 10),
							column: parseInt(position, 10)
						})

						resolve(original)
						this.resolveQueue(fullSource)
					})
				} else {
					// Server
					if (!fs) {
						return resolve()
					}
					fs.readFile(fullMapSource, 'utf8', (err, data) => {
						if (err) {
							resolve()
							this.resolveQueue(fullSource)
							return
						}
						this.sources[fullSource] = data
						this.sourceMaps[fullSource] = new sourceMap.SourceMapConsumer(
							this.sources[fullSource]
						)
						const original = this.sourceMaps[fullSource].originalPositionFor({
							line: parseInt(lineNumber, 10),
							column: parseInt(position, 10)
						})

						resolve(original)
						this.resolveQueue(fullSource)
					})
				}
			} else if (!this.sourceMaps[fullSource]) {
				if (!this.originalPositionQueue[fullSource]) {
					this.originalPositionQueue[fullSource] = []
				}
				this.originalPositionQueue[fullSource].push({
					resolve,
					line: lineNumber,
					column: position
				})
			} else {
				const original = this.sourceMaps[fullSource].originalPositionFor({
					line: parseInt(lineNumber, 10),
					column: parseInt(position, 10)
				})

				return resolve(original)
			}
		})
	}

	resolveQueue(fullSource: string) {
		try {
			if (this.originalPositionQueue[fullSource]) {
				this.originalPositionQueue[fullSource].forEach(queueItem => {
					if (this.sourceMaps && this.sourceMaps[fullSource]) {
						const queueOriginal = this.sourceMaps[
							fullSource
						].originalPositionFor({
							line: parseInt(queueItem.line, 10),
							column: parseInt(queueItem.column, 10)
						})
						queueItem.resolve(queueOriginal)
					}
				})
			}

			this.originalPositionQueue[fullSource] = []
		} catch (e) {
			console.log(e)
		}
	}

	decorateLogMessage(level: string, msg: string) {
		let logStr = msg
		switch (level) {
			case 'info':
				logStr = 'ℹ️  ' + msg
				break

			case 'debug':
				logStr = '❇️  ' + msg
				break

			case 'warn':
				logStr = '⚠️  ' + msg
				break

			case 'error':
			case 'crit':
			case 'fatal':
				logStr = '💥  ' + msg
				break

			case 'superInfo':
				logStr = '🤖 🤖 🤖  ' + msg
				break

			default:
				break
		}
		return logStr
	}

	replaceErrors(key, value) {
		if (value instanceof Error) {
			let error = {}

			Object.getOwnPropertyNames(value).forEach(function(key) {
				error[key] = value[key]
			})

			return error
		}

		return value
	}
}
