# Resources
- [GitHub Repo](https://github.com/magiclabs/example-arbitrum)
- [Demo](https://magic-arbitrum.vercel.app/login)

# Quick Start

```
$ git clone https://github.com/magiclabs/example-arbitrum.git
$ cd example-arbitrum
$ mv .env.local .env // enter your Magic Publishable Key (from https://dashboard.magic.link)
$ yarn install
$ yarn start
```

# Introduction

## What is Arbitrum

With the rising gas costs on Ethereum, many developers are looking towards Layer 2 scaling solutions to help with both improved transaction speed, as well as cheaper gas costs for users. Arbitrum is one such solution. 

With a mainnet launch in May, it's quickly becoming a new standard for top decentralized applications, such as Uniswap. Unlike sidechains such as Polygon, Arbitrum uses rollups technology and the security of the Layer 1 Ethereum blockchain.

With Magic, developers can connect to Arbitrum by simply specifying the network URL when initiating a Magic instance. This guide will show how you can create a web3-enabled app, allow users to switch between Ethereum and Arbitrum networks, call smart contracts, and send transactions. 

## How does Arbitrum work



## Connecting to Ethereum / Arbitrum

In `magic.js`, we will need two `Magic` and two `Web3` instances, one for each network, since we're allowing users to switch between the two. If you're only interested in connecting to Arbitrum, then only one instance of `Magic` and `Web3` should be created. We also are adding `magicEthereum.network = "ethereum"` to be able to identify the Magic network we're creating.

You’ll use the same API key for both `Magic` instances so that the user’s public address does not change. 

```js
import { Magic } from 'magic-sdk';
import Web3 from 'web3';

const customNodeOptions = {
  rpcUrl: 'https://rinkeby.arbitrum.io/rpc',
  chainId: 421611
}

// Setting network to Arbitrum Testnet
export const magicArbitrum = new Magic(process.env.REACT_APP_MAGIC_PUBLISHABLE_KEY, { network: customNodeOptions });
magicArbitrum.network = "arbitrum"

export const arbitrumWeb3 = new Web3(magicArbitrum.rpcProvider);

/** 
 * NOTE: when connecting to a testnet, TEST API keys must be used from the Magic dashboard (live API keys for mainnet)
 */

// Setting network to Ethereum (Rinkeby Testnet)
export const magicEthereum = new Magic(process.env.REACT_APP_MAGIC_PUBLISHABLE_KEY, { network: 'rinkeby' });
magicEthereum.network = "ethereum"

export const ethWeb3 = new Web3(magicEthereum.rpcProvider);
```

## Switching Between Networks

Users are able to switch between the Ethereum and Arbitrum networks with the `select` element dropdown list. Since one `Magic` instance points towards Ethereum, and the other Arbitrum, we simply update the instance that we’re using for our app based on whichever network the user selects.

```js
import { magicEthereum, magicArbitrum, ethWeb3, arbitrumWeb3 } from "../magic";

  const handleChangeNetwork = (e) => {
    e.target.value === 'ethereum' ? setMagic(magicEthereum) : setMagic(magicArbitrum);
    fetchBalance(userMetadata.publicAddress);
    fetchContractMessage();
  }

  return (
    <div className="info">
      <select name="network" onChange={(e) => handleChangeNetwork(e)}>
        <option value="ethereum">Ethereum Testnet (Rinkeby)</option>
        <option value="arbitrum">Arbitrum Testnet</option>
      </select>
    </div>
  )
```

## Viewing User Balance

A user's public address will be the same on both Ethereum and Arbitrum (as long as you are using the same API key for each instance) so a simple `web3.eth.getBalance` call is all that is needed for either network.

```js
const fetchBalance = (address) => {
  web3.eth.getBalance(address).then(bal => setBalance(web3.utils.fromWei(bal)))
}

return (
<h1>Balance</h1>
<div className="info">
  {balance.toString().substring(0, 6)} ETH
</div>
)
```

## Send Transaction

Sending a transaction is also very simple and the same for either network you're connected to. All that's needed is to provide an amount to send, and  `from` and `to` addresses. 

/////////////////////////////////
If no `gas` or `gasPrice` are explicitly passed in, the gas limit and price will be calculated automatically. Otherwise, the values passed in will be used.
/////////////////////////////////

```js
const web3 = magic.network === "ethereum" ? ethWeb3 : arbitrumWeb3;

const sendTransaction = async () => {
  if (!toAddress || !amount) return;
  const receipt = await web3.eth.sendTransaction({
    from: publicAddress,
    to: toAddress,
    value: web3.utils.toWei(amount),
    gas: 287938372
  });
}

return (
 <div className="container">
  <h1>Send Transaction</h1>
  <input 
    type="text" 
    value={toAddress} 
    onChange={(e) => setToAddress(e.target.value)} 
    placeholder="To Address" 
  />
  <input 
    type="text" 
    value={amount} 
    onChange={(e) => setAmount(e.target.value)} 
    placeholder="Amount" 
  />
  <button onClick={sendTransaction}>Send Transaction</button>
</div>
)
```

## Calling Smart Contracts

Separate smart contracts will need to be deployed on each Ethereum and Arbitrum for your users to interact with them. So you'll also need to dynamically know the correct address that the contract is deployed to in order to call it. 

```js
const network = magic.network === 'ethereum' ? 'ethereum' : 'arbitrum';
const rinkebyContractAddress = '0x7aCDA8b3d17A8680a0033b57A693c97dD2b239c3';
const arbitrumContractAddress = '0xaFcf48c7e0eABe6Cd77F539Ab2D8e29c8D5197Dc';
const contract = new web3.eth.Contract(abi, network === 'ethereum' ? rinkebyContractAddress : arbitrumContractAddress);

// Grabbing `message` variable value stored in the smart contract
const fetchContractMessage = () => contract.methods.message().call().then(setMessage)

// Update contract `message` value on the blockchain
const updateContractMessage = async () => {
  if (!newMessage) return;
  const receipt = await contract.methods.update(newMessage).send({ from: user.publicAddress, gas: 287938372 });
}

return (
  <h1>Contract Message</h1>
  <div className="info">{message}</div>

  <h1>Update Message</h1>
  <input 
    type="text" 
    value={newMessage} 
    onChange={(e) => setNewMessage(e.target.value)} 
    placeholder="New Message" />

  <button onClick={updateContractMessage}>Update</button>
)
```

## Done

That's all there is to it! You've now got an app that allows users to create a wallet with just their email, and connect to multiple networks within your app.
