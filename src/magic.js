import { Magic } from 'magic-sdk';
import Web3 from 'web3';

const customNodeOptions = {
  rpcUrl: 'https://goerli-rollup.arbitrum.io/rpc',
  chainId: 421613,
};

// Setting network to Arbitrum Testnet
export const magicArbitrum = new Magic(process.env.REACT_APP_MAGIC_PUBLISHABLE_KEY, 
  { 
    network: customNodeOptions,
  },
);
magicArbitrum.network = 'arbitrum';

export const web3Arbitrum = new Web3(magicArbitrum.rpcProvider);

// Setting network to Ethereum via Custom Node (Goerli Testnet)
export const magicEthereum = new Magic(
  process.env.REACT_APP_MAGIC_PUBLISHABLE_KEY, 
  { 
    network: {
      rpcURL: `https://eth-goerli.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}`,
      chainId: 5,
    },
  },
);
magicEthereum.network = 'ethereum';

export const web3Ethereum = new Web3(magicEthereum.rpcProvider);