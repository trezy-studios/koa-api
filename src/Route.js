/**
 * @callback handler
 * @param {import('koa').Context} context The Koa context for this request.
 * @param {import('koa').Next} next Called to continue down the middleware stack.
 */

/**
 * Wraps functionality for an API route.
 */
export class Route {
	defaultOptions = {
		methods: ['get'],
		middlewares: [],
	}

	/**
	 * Creates a new route.
	 *
	 * @param {object} options All options.
	 * @param {handler} options.handler The function to be executed when this route is accessed.
	 * @param {Function[]} [options.middlewares] Additional middlewares.
	 * @param {string} options.path The path at which this route will be mounted.
	 */
	constructor(options) {
		const allOptions = {
			...this.defaultOptions,
			...options,
		}
		this.options = allOptions

		const {
			handler,
			path,
		} = allOptions

		if (!path) {
			throw new Error('`route` is required')
		}

		if (typeof path !== 'string') {
			throw new Error('`handler` must be a string')
		}

		if (!handler) {
			throw new Error('`handler` is required')
		}

		if (typeof handler !== 'function') {
			throw new Error('`handler` must be a function')
		}
	}

	/**
	 * Attaches this route to a router.
	 *
	 * @param {import('koa-router')} router The router to which this route will be attached.
	 */
	mount(router) {
		const {
			handler,
			middlewares,
			path,
		} = this.options

		let { methods } = this.options

		if (!Array.isArray(methods)) {
			methods = [methods]
		}

		methods.forEach(method => {
			router[method](path, ...middlewares, handler)
		})
	}
}
