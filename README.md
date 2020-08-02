<h1 align="center">Welcome to NULS Bridge Browser Plugin 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-0.2 Beta-blue.svg?cacheSeconds=2592000" />
  <a href="https://github.com/rohanashik/nulsbridge#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/kefranabg/readme-md-generator/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/rohanashik/nulsbridge/blob/master/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-yellow.svg" />
  </a>
  <a href="https://twitter.com/Rohanashik" target="_blank">
    <img alt="Twitter: Rohanashik" src="https://img.shields.io/twitter/follow/Rohanashik.svg?style=social" />
  </a>
</p>

> NULS Bridge is Browser extension that supports NULS Blockchain and this extension is for NULS enabled distributed application or Dapps in your browser! The Extension injects NULS API into every website's javascript context, so that dapps can read from the blockchain.

### 🏠 [Homepage](https://github.com/rohanashik/nulsbridge)


## Features

- Account Management
- Wallet Docking with Web Dapp Applications


## To Check if Bridge is Installed

```javascript
if (typeof window.bridge !== 'undefined') {
    console.log('Bridge is installed!');
}
```

## Invoke Bridge Permission 

```javascript
await bridge.enable();
```

## Get Connected Wallet Address

```javascript
await bridge.getWalletAddress();
```

## Switch Wallet Address

```javascript
await bridge.switchAccount();
```
## To Get Wallet Balance

```javascript
let address = await bridge.getWalletAddress();
await bridge.getBalance(address);
```


## To Get Wallet Token Balance

```javascript
let address = await bridge.getWalletAddress();
await bridge.getTokenBalance(address, "tNULSeBaNBWvMJc6RxtwabsDux3mgPjEKtb3Lm");
```

## Write Contract Data into Blockchain

```javascript
var inputs = {
    "contractAddress": "tNULSeBaN2TLFuecRgASzC7KdbfjhbGD9MthHQ",
    "methodName": "issue",
    "args": ["nulsv2bkjridge"],
    "value":0,
    "sender":"tNULSeBaMhmHrnX4XJHbZxR4ypRun52s1uYnJB"
};

txHash = await bridge.contractWrite(inputs);
// Output Tansaction Hash
```

## To Call Contract function from Blockchain

```javascript
var callargs = {
    "contractAddress": "tNULSeBaN2TLFuecRgASzC7KdbfjhbGD9MthHQ",
    "methodName": "isIssued",
    "args": ["Rohan"]
};

output = await bridge.contractCall(callargs);
// Output Contract function return value
```




## Author

👤 **Rohan Ashik**

* Website: rohanashik.com
* Twitter: [@Rohanashik](https://twitter.com/Rohanashik)
* GitHub: [@rohanashik](https://github.com/rohanashik)
* LinkedIn: [@rohanashik](https://linkedin.com/in/rohanashik)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/rohanashik/nulsbridge/issues). You can also take a look at the [contributing guide](https://github.com/rohanashik/nulsbridge/CONTRIBUTION.md).

## Show your support

Give a ⭐ if this project helped you!

<a href="https://www.patreon.com/rohanashik">
  <img src="https://c5.patreon.com/external/logo/become_a_patron_button@2x.png" width="160">
</a>

## 📝 License

Copyright © 2020 [Rohan Ashik](https://github.com/rohanashik).<br />
This project is [MIT](https://github.com/rohanashik/nulsbridge/LICENCE) licensed.
