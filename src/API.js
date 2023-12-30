// Module imports
import Koa from 'koa'
import KoaRouter from 'koa-router'
import shutdown from 'http-graceful-shutdown'





/**
 * @typedef {object} APIConfig
 * @property {object} [logger] A Winston-compatible logger.
 * @property {Function[]} [middleware] Default middleware to be run for every route.
 * @property {Function} [onStart] A function to be called when the API has been started.
 * @property {number} [port] The port to bind the server to.
 * @property {import('./Route.js').Route[]} [routes] Routes to be mounted.
 */





/**
 * An instance of the REST API.
 */
export class API {
	/****************************************************************************\
	 * Private instance properties
	\****************************************************************************/

	#client = new Koa

	#config = {
		middleware: [],
		port: process.env.PORT ?? 3000,
		routes: [],
	}

	#isRunning = false

	#router = new KoaRouter





	/****************************************************************************\
	 * Constructor
	\****************************************************************************/

	/**
	 * Creates a new API.
	 *
	 * @param {APIConfig} [config] API configuration.
	 */
	constructor(config = {}) {
		this.updateConfig(config)

		this.#mountMiddleware()
		this.#mountRoutes()
		this.#mountRouter()
	}





	/****************************************************************************\
	 * Private instance methods
	\****************************************************************************/

	/**
	 * Connects middleware to the Koa server.
	 */
	#mountMiddleware() {
		this.#config.middleware.forEach(middleware => {
			this.#client.use(middleware)
		})
	}

	/**
	 * Connects routes to the Koa router.
	 */
	#mountRoutes() {
		this.#config.routes.forEach(route => route.mount(this.#router))
	}

	/**
	 * Connects the Koa router to the Koa server.
	 */
	#mountRouter() {
		this.#client.use(this.#router.routes())
		this.#client.use(this.#router.allowedMethods())
	}





	/****************************************************************************\
	 * Public instance methods
	\****************************************************************************/

	/**
	 * Starts the Koa server.
	 *
	 * @param {object} [config] All config.
	 * @param {object} [config.logger] A custom logger to be used for debugging output.
	 * @param {Function} [config.onStart] Called when the server is started.
	 * @param {number} [config.port] The port to start the server on.
	 */
	async start(config = {}) {
		this.updateConfig(config)

		const {
			logger,
			onStart,
			port,
		} = this.#config

		this.#client.listen(port)

		this.#isRunning = true

		if (onStart) {
			await onStart(this)
		}

		logger.info(`API is ready; listening on port ${port}.`)
	}

	/**
	 * Stops the server if it's running.
	 */
	stop() {
		shutdown(this.#client)
	}

	/**
	 * Updates the configuration for this API.
	 *
	 * @param {APIConfig} [config] API configuration.
	 */
	updateConfig(config = {}) {
		if (this.isRunning) {
			if (typeof config.port !== 'undefined') {
				throw new Error('Cannot change port once server is running.')
			}
			if (typeof config.middleware !== 'undefined') {
				throw new Error('Cannot change middleware once server is running.')
			}
			if (typeof config.routes !== 'undefined') {
				throw new Error('Cannot change routes once server is running.')
			}
		}

		this.#config = {
			logger: config.logger ?? this.#config.logger,
			middleware: config.middleware ?? this.#config.middleware,
			onStart: config.onStart ?? this.#config.onStart,
			port: config.port ?? this.#config.port,
			routes: config.routes ?? this.#config.routes,
		}
	}





	/****************************************************************************\
	 * Public instance getters/setters
	\****************************************************************************/

	/** @returns {Koa} The internal Koa client. */
	get client() {
		return this.#client
	}

	/** @returns {boolean} Whether the server is currently running. */
	get isRunning() {
		return this.#isRunning
	}

	/**
	 * @param {object} logger The custom logger to be used.
	 */
	set logger(logger) {
		this.#config.logger = logger
	}

	/** @returns {KoaRouter} The internal Koa Router. */
	get router() {
		return this.#router
	}
}
