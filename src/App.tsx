import * as React from 'react';

import { useProvider } from './hooks/useProvider';
import {
  isMetaMaskInstalled,
  getMetaMaskProvider,
  getChainName,
} from './provider';

export const App = () => {
  const [account, activate, error] = useProvider();
  const [chainName, setChainName] = React.useState('');

  React.useEffect(() => {
    const provider = getMetaMaskProvider();
    if (provider) {
      provider
        .request({ method: 'eth_chainId' })
        .then((chainId) => setChainName(getChainName(chainId)));
    }
  }, []);

  const activated = account !== undefined;

  return (
    <div>
      {activated ? (
        <div>
          MetaMask account: {account} ({chainName}){' '}
        </div>
      ) : null}
      {!activated ? (
        <button onClick={() => activate()}>
          {!isMetaMaskInstalled() ? 'Install MetaMask' : 'Login with MetaMask'}
        </button>
      ) : null}
      {error !== undefined ? <div style={{ color: 'red' }}>{error}</div> : null}
    </div>
  );
};
