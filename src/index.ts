import { createSign } from 'crypto'
import { isObject } from 'js-cool'
// import md5 from './md5'

const debug = require('debug')('alipaycrypto')

export interface OauthOptions {
	// see: https://opendocs.alipay.com/open/02ailc
	app_id: string // 支付宝分配给开发者的应用ID
	method?: 'alipay.system.oauth.token' // 接口名称
	format?: 'JSON' // 仅支持JSON
	charset?: 'utf-8' | 'gbk' | 'gb2312' // 请求使用的编码格式，默认：utf-8
	sign_type?: 'RSA' | 'RSA2' // 商户生成签名字符串所使用的签名算法类型，目前支持RSA2和RSA，推荐使用RSA2
	sign: string // 商户请求参数的签名串 see: https://opendocs.alipay.com/open/291/105974
	timestamp: string // 发送请求的时间，格式"yyyy-MM-dd HH:mm:ss"
	version?: '1.0' | string // 调用的接口版本
	app_auth_token?: string // see: https://opendocs.alipay.com/isv/10467/xldcyq
	// private
	grant_type: 'authorization_code' | 'refresh_token' // 授权方式，用授权码来换取授权令牌: authorization_code；用刷新令牌来换取一个新的授权令牌: refresh_token
	code?: string // 授权码，用户对应用授权后得到。本参数在 grant_type 为 authorization_code 时必填；为 refresh_token 时不填
	refresh_token?: string // 刷新令牌，上次换取访问令牌时得到。本参数在 grant_type 为 authorization_code 时不填；为 refresh_token 时必填，且该值来源于此接口的返回值 app_refresh_token（即至少需要通过 grant_type=authorization_code 调用此接口一次才能获取）
	biz_content?: string // JSON string，请求参数的集合，最大长度不限，除公共参数外所有请求参数都必须放在这个参数中传递，具体参照各产品快速接入文档
}

export interface Options extends OauthOptions {
	privateKey: string
}

export type SerializeParams = Omit<
	Required<OauthOptions>,
	'sign' | 'app_auth_token' | 'refresh_token' | 'scopes'
>

export interface SerializedParams {
	initial: string
	encrypted: string
}

// const a = {
// 	app_id: '20135234674',
// 	method: 'alipay.system.oauth.token',
// 	sign_type: 'RSA2',
// 	version: '1.0',
// 	charset: 'utf-8',
// 	timestamp: '2023-07-29 14:50:22',
// 	_time: '1690613420480',
// 	code: 'xxxx',
// 	grant_type: 'authorization_code',
// 	scopes: 'auth_user',
// 	user_id: undefined
// }

/**
 * 支付宝加解密nodejs版本
 *
 * @example
 * ```
 * const AlipayCrypto = require('alipay-crypto');
 * const alipayCrypto = new AlipayCrypto(token, encodingAESKey, appID);
 *
 * var [err, encryptedXML] = alipayCrypto.encrypt(xml, timestamp, nonce);
 *
 * var [err, decryptedXML] = alipayCrypto.decrypt(signature, timestamp, nonce, encrypted);
 * ```
 */
class AlipayCrypto<T extends Options = Options> {
	// token: string
	// key: Buffer
	// iv: Buffer
	// appID: string
	options: T
	constructor(options: T) {
		// if (!token || !encodingAESKey || !appID) {
		// 	throw new Error('please check arguments')
		// }
		// const AESKey = Buffer.from(encodingAESKey + '=', 'base64')
		// if (AESKey.length !== 32) {
		// 	throw new Error('encodingAESKey invalid')
		// }
		// this.token = token
		// this.appID = appID
		// this.key = AESKey
		// this.iv = AESKey.subarray(0, 16)
		this.options = Object.assign(
			{
				method: 'alipay.system.oauth.token',
				format: 'JSON',
				charset: 'utf-8',
				sign_type: 'RSA2',
				version: '1.0'
			},
			options || {}
		)
		debug('alipay crypto class initialize => ', this.options)
	}

	/**
	 * serializedParams 序列化参数
	 *
	 * @since 1.0.0
	 * @example
	 * ```ts
	 * const data = {
	 *   app_id: '20135234674',
	 *   method: 'alipay.system.oauth.token',
	 *   sign_type: 'RSA2',
	 *   version: '1.0',
	 *   charset: 'utf-8',
	 *   timestamp: '2023-07-29 14:50:22',
	 *   grant_type: 'authorization_code'
	 * }
	 *
	 * serializedParams(data)
	 * // {
	 * //   initial: 'app_id=20135234674&charset=utf-8&grant_type=authorization_code&method=alipay.system.oauth.token&sign_type=RSA2&timestamp=2023-07-29 14:50:22&version=1.0',
	 * //   encrypted: 'app_id=20135234674&charset=utf-8&grant_type=authorization_code&method=alipay.system.oauth.token&sign_type=RSA2&timestamp=2023-07-29%2014%3A50%3A22&version=1.0'
	 * //}
	 * ```
	 * @see https://opendocs.alipay.com/common/02khjm
	 * @param data - Data to be serialized, Strike out the sign field, and strike out parameters with null values.
	 * @returns result - Serialized data
	 */
	serializedParams(data: SerializeParams): SerializedParams {
		if (isObject(data)) {
			const keyList = Object.keys(data).sort() as Array<keyof SerializeParams>
			const initialParams = []
			const encryptedParams = []
			for (const key of keyList) {
				if ([null, undefined, ''].includes(data[key])) continue
				initialParams.push(`${key}=${data[key]}`)
				encryptedParams.push(`${key}=${encodeURIComponent(data[key])}`)
			}
			const initial = initialParams.join('&')
			const encrypted = encryptedParams.join('&')

			return {
				initial,
				encrypted
			}
		}
		throw new Error('"data" must be Object')
	}

	/**
	 * rsa encryption
	 *
	 * @since 1.0.0
	 * @param initial - Serialized data
	 * @returns result - Serialized data
	 */
	encrypt(initial: SerializedParams['initial']): string {
		if (!initial) throw new Error('"initial" is required')
		const sign = createSign('RSA-SHA256')
		sign.update(initial)
		return sign.sign(
			`-----BEGIN RSA PRIVATE KEY-----\n${this.options.privateKey}\n-----END RSA PRIVATE KEY-----`,
			'base64'
		)
	}
}

export default AlipayCrypto
