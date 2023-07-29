import { createHash } from 'crypto'
import { isArray, isObject } from 'js-cool'

const debug = require('debug')('alipaycrypto:md5')

/**
 * md5 encrypt
 *
 * @since 1.0.0
 * @param data - Parameters that need to be md5 encrypted can be either string or object
 * @returns result - encrypted string
 */
const md5 = <T extends Record<string, unknown>>(data: string | T): string => {
	if (isObject(data) || isArray(data)) data = JSON.stringify(data)
	debug('md5: ', data, createHash('md5').update(data).digest('hex'))
	return createHash('md5').update(data).digest('hex')
}

export default md5
