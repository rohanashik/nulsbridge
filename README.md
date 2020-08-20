
<p align="center">
  <a href="https://nuls.io" target="_blank" rel="noopener noreferrer"><img width="220" src="https://wallet.nuls.io/dist/img/logo.ef0bcec3.svg" alt="NULS logo"></a></p>

<h1 align="center">Welcome to NULS Bridge Browser Plugin 👋</h1>
<p align="center">
  <img alt="Version" src="https://img.shields.io/badge/version-0.4.3-blue.svg?cacheSeconds=2592000" />
  <a href="https://github.com/rohanashik/nulsbridge#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/kefranabg/readme-md-generator/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/rohanashik/nulsbridge/blob/master/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-yellow.svg" />
  </a>
  <a href="https://twitter.com/Nuls" target="_blank">
    <img alt="Twitter: Rohanashik" src="https://img.shields.io/twitter/follow/Nuls.svg?style=social" />
  </a>
</p>

> <p align="center">NULS Bridge is Browser extension that supports NULS Blockchain and this extension is for NULS enabled distributed application or Dapps in your browser! The Extension injects NULS API into every website's javascript context, so that dapps can read from the blockchain.</p>


### Features

- Account Management
- Wallet Docking with Web Dapp Applications
- Main & Test Network Wallets


### Installation

- [Get the Chrome Extension](https://github.com/rohanashik/nulsbridge)
- [Get the Firefox Addon](https://github.com/rohanashik/nulsbridge)
- [Get the Microsoft Edge Addon](https://github.com/rohanashik/nulsbridge)



### To Check if Bridge is Installed

```javascript
if (typeof window.bridge !== 'undefined') {
    console.log('Bridge is installed!');
}
```

### Invoke Bridge Permission 

```javascript
await bridge.enable();
```

### To Check is Bridge connected 

```javascript
await bridge.isConnected();
// Output = true or false
```

### Get Connected Wallet Address

```javascript
var wallet = await bridge.getDefaultWallet();
console.log("Default Address ---> "+ wallet.address);
console.log("Default Chain ---> "+ wallet.chain_id);
```

### Switch Wallet Address

```javascript
await bridge.switchAccount();
```
### To Get Wallet Balance

```javascript
await bridge.getBalance(address="tNULSeBaMhmHrnX4XJHbZxR4ypRun52s1uYnJB", chainid=2, assetChainId=2);
```


### To Get Wallet Token Balance

```javascript
await bridge.getTokenBalance(address="tNULSeBaMhmHrnX4XJHbZxR4ypRun52s1uYnJB", chainid=2, "tNULSeBaNBWvMJc6RxtwabsDux3mgPjEKtb3Lm");
```

### Write Contract Data into Blockchain

```javascript
let wallet = await bridge.getDefaultWallet();
var inputs = {
    "contractAddress": "tNULSeBaN2TLFuecRgASzC7KdbfjhbGD9MthHQ",
    "methodName": "issue",
    "args": ["WERTYUI123456"],
    "value":0,
    "sender": wallet.address,
    "chainid": wallet.chain_id
};

txHash = await bridge.contractWrite(inputs);
// Output Tansaction Hash
```

### To Call Contract function from Blockchain

```javascript
var callargs = {
    "contractAddress": "tNULSeBaN2TLFuecRgASzC7KdbfjhbGD9MthHQ",
    "methodName": "isIssued",
    "args": ["WERTYUI123456"],
    "chainid": 2
};

output = await bridge.contractCall(callargs);
// Output Contract function return value
```




## 👤 Author

**Rohan Ashik**

* Website: www.rohanashik.co
* Twitter: [@Rohanashik](https://twitter.com/Rohanashik)
* GitHub: [@rohanashik](https://github.com/rohanashik)
* LinkedIn: [@rohanashik](https://linkedin.com/in/rohanashik)
* Telegram: [https://t.me/rohanashik](https://t.me/rohanashik)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/rohanashik/nulsbridge/issues). You can also take a look at the [contributing guide](https://github.com/rohanashik/nulsbridge/blob/master/CONTRIBUTION.md).

## 👏 Show your support

Give a ⭐ if this project helped you!

NULS Wallet Address:
NULSd6HgTwme2QGaSuJM75XpzfHm5ju33ZCuc


## 📝 License

Copyright © 2020 [Rohan Ashik](https://github.com/rohanashik).<br />
This project is [MIT](https://github.com/rohanashik/nulsbridge/blob/master/LICENSE) licensed.
