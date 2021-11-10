import * as React from 'react';
import {
  isMetaMaskInstalled,
  getMetaMaskProvider,
  getChainName,
  ProviderRpcError,
} from '@bitzlato/ethereum-provider';
import MetaMaskOnboarding from '@metamask/onboarding';
// import sigUtil from '@metamask/eth-sig-util';

export const App = () => {
  const [chainName, setChainName] = React.useState('');
  const [error, setError] = React.useState<string>('');
  const [accounts, setAccounts] = React.useState<string[]>([]);
  const [signature, setSignature] = React.useState('');
  const [signer, setSigner] = React.useState('');

  const onboarding = React.useMemo(() => new MetaMaskOnboarding(), []);

  const data = React.useMemo(() => {
    const nonce = Math.floor(Math.random() * 10000);
    return `Bitzlato welcomes you! Sign this message to prove you have access to this wallet and we'll log you in. This won't const you any Ether.\n\nTo prevent scammers using your wallet, here’s a unique message ID they can’t guess: ${nonce}`;
    // return `0x${Buffer.from(msg, 'utf8').toString('hex')}`;
  }, []);

  React.useEffect(() => {
    const provider = getMetaMaskProvider();
    if (provider) {
      provider
        .request({ method: 'eth_chainId' })
        .then((chainId) => setChainName(getChainName(chainId)));

      const listener = (accounts: string[]) => setAccounts(accounts);
      provider.request({ method: 'eth_accounts' }).then(listener);
      provider.on('accountsChanged', listener);
      return () => {
        provider.removeListener('accountsChanged', listener);
      };
    }
  }, []);

  const connect = async () => {
    setError('');
    const provider = getMetaMaskProvider();
    if (provider) {
      try {
        setAccounts(
          await provider.request({
            method: 'eth_requestAccounts',
          }),
        );
      } catch (e) {
        setError((e as ProviderRpcError).message);
      }
    } else {
      onboarding.startOnboarding();
    }
  };

  const sign = async () => {
    setError('');
    const provider = getMetaMaskProvider();
    if (provider) {
      try {
        setSignature(
          await provider.request({
            method: 'personal_sign',
            params: [data, accounts[0], ''],
          }),
        );
      } catch (e) {
        setError((e as ProviderRpcError).message);
      }
    } else {
      onboarding.startOnboarding();
    }
  };

  const decrypt = async () => {
    // on server side
    // setSigner(sigUtil.recoverPersonalSignature({ data, signature }));
    const provider = getMetaMaskProvider();
    if (provider) {
      try {
        setSigner(
          await provider.request({
            method: 'personal_ecRecover',
            params: [data, signature],
          }),
        );
      } catch (e) {
        setError((e as ProviderRpcError).message);
      }
    }
  };

  return (
    <>
      {accounts[0] ? (
        <>
          <div>
            MetaMask account: {accounts[0]} ({chainName}){' '}
          </div>
          <div>
            <button onClick={sign}>Sign</button>
            {signature && ' - OK'}
          </div>
          <div>
            <button onClick={decrypt}>Verify</button>
            {signer && (accounts[0] === signer ? ' - OK' : 'Wrong!')}
          </div>
        </>
      ) : (
        <button onClick={connect}>
          {!isMetaMaskInstalled() ? 'Install MetaMask' : 'Connect MetaMask'}
        </button>
      )}
      {error ? <div style={{ color: 'red' }}>{error}</div> : null}
    </>
  );
};
