# Resources
- [GitHub Repo](https://github.com/magiclabs/example-arbitrum-guide)
- [Demo](https://magic-arbitrum.vercel.app/login)

# Quick Start

```
$ git clone https://github.com/magiclabs/example-arbitrum-guide.git
$ cd example-arbitrum-guide
$ mv .env.local .env // enter your LIVE API Key (from https://dashboard.magic.link)
$ yarn install
$ yarn start
```

# Introduction

## What is Arbitrum

[Arbitrum](https://arbitrum.io) is a new Layer 2 scaling solution for Ethereum, which just launched it's mainnet beta in May 2021. It uses "optimistic rollups" technology where transactions are submitted directly to the L2, "rolled up" into a single proof, then sent to the layer one chain (Ethereum) to be verified. With smart contract computations being done on L2 rather than L1, it allows for significantly faster and cheaper transactions.

Arbitrum is also interoperable with Ethereum and the Ethereum Virtual Machine (EVM) so smart contracts can easily be depolyed on Arbitrum without much/any refactoring.

With Magic, developers can connect to the Arbitrum network by simply specifying the network URL when initiating a Magic instance. This guide will show how you can create a web3-enabled app, allow users to switch between the Ethereum and Arbitrum networks, call smart contracts, and send transactions. 

## Connecting to Ethereum / Arbitrum

In `magic.js`, we will need two `Magic` and two `Web3` instances, one for each network, since we're allowing users to switch between the two. If you're only interested in connecting to Arbitrum, then only one instance of `Magic` and `Web3` should be created. We also are adding `magicEthereum.network = 'ethereum'` to be able to identify the Magic network we're creating.

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
magicArbitrum.network = 'arbitrum'

export const web3Arbitrum = new Web3(magicArbitrum.rpcProvider);

// Setting network to Ethereum (Rinkeby Testnet)
export const magicEthereum = new Magic(process.env.REACT_APP_MAGIC_PUBLISHABLE_KEY, { network: 'rinkeby' });
magicEthereum.network = 'ethereum'

export const web3Ethereum = new Web3(magicEthereum.rpcProvider);
```

## Switching Between Networks

Users are able to switch between the Ethereum and Arbitrum networks with the `select` element dropdown list. Since one `Magic` instance points towards Ethereum, and the other Arbitrum, we simply update the instance that we’re using for our app based on whichever network the user selects.

```js
import { magicEthereum, magicArbitrum } from '../magic';

  const [magic, setMagic] = useState(magicEthereum);

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

Sending a transaction is also very simple and similar for both networks. However, one important difference between the two is gas estimates. The gas limit for `sendTransaction` on Ethereum will always be 21000. However Arbitrum uses ArbGas and is calculated differently (see [Arbitrum Docs](https://developer.offchainlabs.com/docs/arbgas)). For this we set a fallback price of `1000000`.

```js
const web3 = magic.network === "ethereum" ? web3Ethereum : web3Arbitrum;

const sendTransaction = async () => {
  if (!toAddress || !amount) return;
  const { transactionHash } = await web3.eth.sendTransaction({
    from: publicAddress,
    to: toAddress,
    value: web3.utils.toWei(amount),
    gasLimit: network === 'ethereum' ? 21000 : 1000000
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

Separate smart contracts will need to be deployed on each Ethereum and Arbitrum for your users to interact with them, so you'll need to know the address of each in order to call it. 

```js
const [message, setMessage] = useState('...');
const [newMessage, setNewMessage] = useState('');
const network = magic.network === 'ethereum' ? 'ethereum' : 'arbitrum';
const ethContractAddress = '0x7aCDA8b3d17A8680a0033b57A693c97dD2b239c3';
const arbitrumContractAddress = '0xaFcf48c7e0eABe6Cd77F539Ab2D8e29c8D5197Dc';
const contract = new web3.eth.Contract(abi, network === 'ethereum' ? ethContractAddress : arbitrumContractAddress);

// Grabbing `message` variable value stored in the smart contract
const fetchContractMessage = () => contract.methods.message().call().then(setMessage)

// Update contract `message` value on the blockchain
const updateContractMessage = async () => {
  if (!newMessage) return;
  const { transactionHash } = await contract.methods.update(newMessage).send({ 
    from: publicAddress, 
    gasLimit: network === 'ethereum' ? web3.eth.getBlock("latest").gasLimit : 1000000 
  });
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

That's all there is to it! You've now got an app that allows users to create a wallet with just their email, and connect to the Arbitrum L2 and Ethereum networks within your app.
