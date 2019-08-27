type timer = any

// @ts-ignore
interface ISetOptionsType {
	appEnv?: string
	appKey?: string
	appName?: string
	level?: string
	metricsEnabled?: boolean
	metricsUrls?: string
	packageName?: string
	packageVersion?: string
	useSourcemaps?: boolean
}

export interface ISpruceLogger {
	sequelizeHooks: (sequelize: any) => any
	middleware: {
		requests: () => any
	}
	nodeMetrics: () => any
}

export interface ISpruceLog {
	crit: (...any: any[]) => any
	debug: (...any: any[]) => any
	error: (...any: any[]) => any
	fatal: (...any: any[]) => any
	info: (...any: any[]) => any
	metric: (...any: any[]) => any
	setOptions: (options: ISetOptionsType) => any
	superInfo: (...any: any[]) => any
	timerEnd: (timer: timer) => number
	timerStart: (key?: string) => timer
	trace: (...any: any[]) => any
	warn: (...any: any[]) => any
}
