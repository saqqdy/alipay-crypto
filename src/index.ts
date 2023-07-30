import { createSign } from 'crypto'
import { isObject } from 'js-cool'
// import md5 from './md5'

const debug = require('debug')('alipaycrypto')

export type PickRequired<T, K extends keyof T> = {
	[P in K]-?: T[P]
} & Omit<T, K>

export type OmitRequired<T, K extends keyof T> = {
	[P in K]: T[P]
} & Omit<Required<T>, K>

export type PickPartial<T, K extends keyof T> = {
	[P in K]?: T[P]
} & Omit<T, K>

export type OmitPartial<T, K extends keyof T> = {
	[P in K]: T[P]
} & Omit<Partial<T>, K>

export interface OauthCommonOptions {
	// see: https://opendocs.alipay.com/open/02ailc
	app_id: string // 支付宝分配给开发者的应用ID
	method: 'alipay.system.oauth.token' // 接口名称
	format?: 'JSON' // 仅支持JSON
	charset: 'utf-8' | 'gbk' | 'gb2312' // 请求使用的编码格式，默认：utf-8
	sign_type: 'RSA' | 'RSA2' // 商户生成签名字符串所使用的签名算法类型，目前支持RSA2和RSA，推荐使用RSA2
	sign: string // 商户请求参数的签名串 see: https://opendocs.alipay.com/open/291/105974
	timestamp: string // 发送请求的时间，格式"yyyy-MM-dd HH:mm:ss"
	version: '1.0' | string // 调用的接口版本
	app_auth_token?: string // see: https://opendocs.alipay.com/isv/10467/xldcyq
}

// export interface OauthCommonOptions {
// 	// see: https://opendocs.alipay.com/open/02ailc
// 	app_id: string // 支付宝分配给开发者的应用ID
// 	method?: 'alipay.system.oauth.token' // 接口名称
// 	format?: 'JSON' // 仅支持JSON
// 	charset?: 'utf-8' | 'gbk' | 'gb2312' // 请求使用的编码格式，默认：utf-8
// 	sign_type?: 'RSA' | 'RSA2' // 商户生成签名字符串所使用的签名算法类型，目前支持RSA2和RSA，推荐使用RSA2
// 	sign: string // 商户请求参数的签名串 see: https://opendocs.alipay.com/open/291/105974
// 	timestamp: string // 发送请求的时间，格式"yyyy-MM-dd HH:mm:ss"
// 	version?: '1.0' | string // 调用的接口版本
// 	app_auth_token?: string // see: https://opendocs.alipay.com/isv/10467/xldcyq
// }

// see: https://opendocs.alipay.com/open/02ailc
export interface OauthCodeOptions {
	grant_type: 'authorization_code' // 授权方式，用授权码来换取授权令牌: authorization_code；用刷新令牌来换取一个新的授权令牌: refresh_token
	code: string // 授权码，用户对应用授权后得到。本参数在 grant_type 为 authorization_code 时必填；为 refresh_token 时不填
}
export interface OauthRefreshOptions {
	grant_type: 'refresh_token' // 授权方式，用授权码来换取授权令牌: authorization_code；用刷新令牌来换取一个新的授权令牌: refresh_token
	refresh_token: string // 刷新令牌，上次换取访问令牌时得到。本参数在 grant_type 为 authorization_code 时不填；为 refresh_token 时必填，且该值来源于此接口的返回值 app_refresh_token（即至少需要通过 grant_type=authorization_code 调用此接口一次才能获取）
}
export type OauthOptions = OauthCodeOptions | OauthRefreshOptions

export interface SignOptions extends OauthCommonOptions {
	biz_content?: string // JSON string，请求参数的集合，最大长度不限，除公共参数外所有请求参数都必须放在这个参数中传递，具体参照各产品快速接入文档
}

export interface Options {
	debug?: boolean
	privateKey: string
}

export type SerializeParams = Omit<
	Required<SignOptions>,
	'sign' // | 'app_auth_token' | 'refresh_token' | 'scopes'
>

// export interface SerializedParams {
// 	initial: string
// 	encrypted: string
// }

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
	defaults: PickPartial<OauthCommonOptions, 'app_id' | 'sign' | 'timestamp'> = {
		method: 'alipay.system.oauth.token',
		format: 'JSON',
		charset: 'utf-8',
		sign_type: 'RSA2',
		version: '1.0'
	}

	options: T
	constructor(options: T) {
		this.options = Object.assign(
			{
				debug: false
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
	serializedParams(data: SignOptions, encrypt?: boolean): string {
		if (isObject(data)) {
			const keyList = Object.keys(data).sort() as Array<keyof SignOptions>
			const initialParams = []
			const encryptedParams = []
			for (const key of keyList) {
				if (key === 'sign' || [null, undefined, ''].includes(data[key])) continue
				initialParams.push(`${key}=${data[key]}`)
				encryptedParams.push(`${key}=${encodeURIComponent(data[key]!)}`)
			}
			const initial = initialParams.join('&')
			const encrypted = encryptedParams.join('&')

			return encrypt === true ? encrypted : initial
		}
		throw new Error('"data" must be Object')
	}

	/**
	 * rsa encryption
	 *
	 * @since 1.0.0
	 * @param initial - Serialized data
	 * @param privateKey - private key, default: options.privateKey
	 * @returns result - signature
	 */
	encrypt(initial: string, privateKey?: string): string
	encrypt<T extends SignOptions = SignOptions>(initial: T, privateKey?: string): string
	encrypt<T extends SignOptions = SignOptions>(initial: string | T, privateKey?: string): string {
		privateKey ??= this.options.privateKey
		if (!initial) throw new Error('"initial" is required')
		if (!privateKey) throw new Error('"privateKey" is required')
		if (typeof initial === 'object') initial = this.serializedParams(initial)

		const sign = createSign('RSA-SHA256')
		sign.update(initial)

		return sign.sign(
			`-----BEGIN RSA PRIVATE KEY-----\n${privateKey}\n-----END RSA PRIVATE KEY-----`,
			'base64'
		)
	}
}

export default AlipayCrypto
