import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { magicEthereum, magicArbitrum, web3Ethereum, web3Arbitrum } from '../magic';
import { abi } from '../contract/abi.js';
import Loading from './Loading';
import ContractCall from './ContractCall';
import SendTransaction from './SendTransaction';
import Info from './Info';

export default function Home() {
  const [magic, setMagic] = useState(magicEthereum);
  const web3 = magic.network === 'ethereum' ? web3Ethereum : web3Arbitrum;
  const [userMetadata, setUserMetadata] = useState();
  const [balance, setBalance] = useState('...');
  const network = magic.network === 'ethereum' ? 'ethereum' : 'arbitrum';
  const ethContractAddress = '0x7aCDA8b3d17A8680a0033b57A693c97dD2b239c3';
  const arbitrumContractAddress = '0xaFcf48c7e0eABe6Cd77F539Ab2D8e29c8D5197Dc';
  const contract = new web3.eth.Contract(abi, network === 'ethereum' ? ethContractAddress : arbitrumContractAddress);
  const [message, setMessage] = useState('...');
  const history = useHistory();

  useEffect(() => {
    // On mount, we check if a user is logged in.
    // If so, we'll retrieve the authenticated user's profile, balance and contract message.
    magic.user.isLoggedIn().then(magicIsLoggedIn => {
      if (magicIsLoggedIn) {
        magic.user.getMetadata().then(user => {
          setUserMetadata(user);
          fetchBalance(user.publicAddress);
          fetchContractMessage();
        });
      } else {
        // If no user is logged in, redirect to `/login`
        history.push('/login');
      }
    });
  }, [magic]);

   const handleChangeNetwork = (e) => {
    e.target.value === 'ethereum' ? setMagic(magicEthereum) : setMagic(magicArbitrum);
    fetchBalance(userMetadata.publicAddress);
    fetchContractMessage();
  }

  const fetchBalance = (address) => {
    web3.eth.getBalance(address).then(bal => setBalance(web3.utils.fromWei(bal)))
  }

  const fetchContractMessage = () => contract.methods.message().call().then(setMessage)

  return (
    userMetadata ? (
      <>
        <Info handleChangeNetwork={handleChangeNetwork} balance={balance} user={userMetadata} magic={magic} />
        <SendTransaction web3={web3} network={network} publicAddress={userMetadata.publicAddress} fetchBalance={fetchBalance} />
        <ContractCall web3={web3} network={network} contract={contract} publicAddress={userMetadata.publicAddress} fetchBalance={fetchBalance} message={message} fetchContractMessage={fetchContractMessage} />  
      </>
    ) : <Loading />
  );
}

