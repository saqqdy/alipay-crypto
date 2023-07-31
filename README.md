<div style="text-align: center;" align="center">

# alipay-crypto

支付宝加解密 nodejs 版本

[![NPM version][npm-image]][npm-url]
[![Codacy Badge][codacy-image]][codacy-url]
[![tree shaking][tree-shaking-image]][tree-shaking-url]
![typescript][typescript-url]
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]
[![License][license-image]][license-url]

[![Sonar][sonar-image]][sonar-url]

</div>

<div style="text-align: center; margin-bottom: 20px;" align="center">

### **[Documentation](https://www.saqqdy.com/alipay-crypto)** • **[Change Log](./CHANGELOG.md)**

</div>

## Installation

```bash
# use pnpm
$ pnpm i alipay-crypto

# use yarn
$ yarn add alipay-crypto
```

## Usage

### 1. Nodejs require

```js
const AlipayCrypto = require('alipay-crypto')

const alipayCrypto = new AlipayCrypto({ privateKey: 'xxxxxx' })

const data = {
  app_id: '20135234674',
  method: 'alipay.system.oauth.token',
  sign_type: 'RSA2',
  version: '1.0',
  charset: 'utf-8',
  timestamp: '2023-07-29 14:50:22',
  grant_type: 'authorization_code',
  biz_content: ''
}

const initial = alipayCrypto.serializedParams(data) // 'app_id=20135234674&charset=utf-8&grant_type=authorization_code&method=alipay.system.oauth.token&sign_type=RSA2&timestamp=2023-07-29 14:50:22&version=1.0'
const sign = alipayCrypto.encrypt(initial)
// or
const sign = alipayCrypto.encrypt(data)
```

### 2. ES6 module

```js
import AlipayCrypto from 'alipay-crypto'

const alipayCrypto = new AlipayCrypto({ privateKey: 'xxxxxx' })
```

### Configuration

active debug mode

```js
const alipayCrypto = new AlipayCrypto({ privateKey: 'xxxxxx', debug: true })
```

### Types

```ts
declare class AlipayCrypto<T extends Options = Options> {
  defaults: PickPartial<OauthCommonOptions, 'app_id' | 'sign' | 'timestamp'>
  options: T
  constructor(options: T)
  serializedParams(data: SignOptions, encrypt?: boolean): string
  encrypt(initial: string, privateKey?: string): string
  encrypt<T extends SignOptions = SignOptions>(initial: T, privateKey?: string): string
  md5<T extends Record<string, unknown> = Record<string, unknown>>(data: string | T): string
}
export default AlipayCrypto

export declare interface OauthCodeOptions {
  grant_type: 'authorization_code'
  code: string
}

export declare interface OauthCommonOptions {
  app_id: string
  method: 'alipay.system.oauth.token'
  format?: 'JSON'
  charset: 'utf-8' | 'gbk' | 'gb2312'
  sign_type: 'RSA' | 'RSA2'
  sign: string
  timestamp: string
  version: '1.0' | string
  app_auth_token?: string
}

export declare type OauthOptions = OauthCodeOptions | OauthRefreshOptions

export declare interface OauthRefreshOptions {
  grant_type: 'refresh_token'
  refresh_token: string
}

export declare type PickPartial<T, K extends keyof T> = {
  [P in K]?: T[P]
} & Omit<T, K>

export declare type SerializeParams = Omit<Required<SignOptions>, 'sign'>

export declare interface SignOptions extends OauthCommonOptions {
  biz_content?: string
}
```

## Support & Issues

Please open an issue [here](https://github.com/saqqdy/alipay-crypto/issues).

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/alipay-crypto.svg?style=flat-square
[npm-url]: https://npmjs.org/package/alipay-crypto
[codacy-image]: https://app.codacy.com/project/badge/Grade/f70d4880e4ad4f40aa970eb9ee9d0696
[codacy-url]: https://www.codacy.com/gh/saqqdy/alipay-crypto/dashboard?utm_source=github.com&utm_medium=referral&utm_content=saqqdy/alipay-crypto&utm_campaign=Badge_Grade
[tree-shaking-image]: https://badgen.net/bundlephobia/tree-shaking/alipay-crypto
[tree-shaking-url]: https://bundlephobia.com/package/alipay-crypto
[typescript-url]: https://badgen.net/badge/icon/typescript?icon=typescript&label
[codecov-image]: https://img.shields.io/codecov/c/github/saqqdy/alipay-crypto.svg?style=flat-square
[codecov-url]: https://codecov.io/github/saqqdy/alipay-crypto?branch=master
[download-image]: https://img.shields.io/npm/dm/alipay-crypto.svg?style=flat-square
[download-url]: https://npmjs.org/package/alipay-crypto
[license-image]: https://img.shields.io/badge/License-MIT-blue.svg
[license-url]: LICENSE
[sonar-image]: https://sonarcloud.io/api/project_badges/quality_gate?project=saqqdy_alipay-crypto
[sonar-url]: https://sonarcloud.io/dashboard?id=saqqdy_alipay-crypto
