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

## 安装

```bash
# 使用pnpm
$ pnpm i alipay-crypto

# 使用yarn
$ yarn add alipay-crypto
```

## 使用

> 在实例化和加解密方法均支持传入 options: `normalizeTags`, `buildXmlOptions`, `xmlOptions`，加解密方法里面传入的 options 优先级更高。

> `normalizeTags` 支持将 xml 属性由驼峰转下划线分隔的小写形式；`buildXmlOptions` 透传用于生成 xml 字符串的配置；`xmlOptions` 透传用于解析 xml 字符串的配置。

> 注意：`normalizeTags` 会全量覆盖 `xmlOptions` 里面的 `tagNameProcessors` 方法，如果想要自定义 `tagNameProcessors`，请不要传入 `normalizeTags`

### 引入和使用

1. require 引入

```js
const { AlipayCrypto } = require('alipay-crypto')

/**
 * class AlipayCrypto
 *
 * @param {string} token 消息校验Token，开发者在代替公众号或小程序接收到消息时，用此Token来校验消息。
 * @param {string} aesKey 消息加解密Key，在代替公众号或小程序收发消息过程中使用。必须是长度为43位的字符串，只能是字母和数字。
 * @param {string} appID 小程序appID
 * @param {object} options Options
 * @return {Object} AlipayCrypto instance
 */
const alipayCrypto = new AlipayCrypto(token, aesKey, appID, options)

/**
 * decrypt data
 *
 * @param {string} encrypt encrypt data
 * @param {string} timestamp timestamp
 * @param {string} nonce nonce
 * @param {object} options Options
 * @return {Object} decrypt data
 */
const data = await alipayCrypto.decrypt(encrypt, timestamp, nonce, options)
```

2. import 引入

```js
import {
  // PKCS7Decode,
  // PKCS7Encode,
  AlipayCrypto
  // aes256Decrypt,
  // aes256Encrypt,
  // buildXML,
  // buildXMLSync,
  // parseXML,
  // parseXMLSync,
  // sha1
} from 'alipay-crypto'

const alipayCrypto = new AlipayCrypto(token, aesKey, appID, options)
const data = await alipayCrypto.decrypt(encrypt, timestamp, nonce, options)
```

### 使用配置

持将 xml 属性由驼峰转下划线分隔的小写形式：`ComponentVerifyTicket => component_verify_ticket`

```js
// normalizeTags可传入布尔值或者字符串，传入字符串时使用该字符串分隔，例如：normalizeTags = "__"，得到：`ComponentVerifyTicket => component__verify__ticket`
const alipayCrypto = new AlipayCrypto(token, aesKey, appID, {
  normalizeTags: true,
  buildXmlOptions: {}, // 透传用于生成 xml 字符串的配置
  xmlOptions: {} // 透传用于解析 xml 字符串的配置
})
const data = await alipayCrypto.decrypt(encrypt, timestamp, nonce, options)
```

## 问题和支持

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
