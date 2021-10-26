import * as React from 'react';

import { useProvider } from './hooks/useProvider';
import { isMetaMaskInstalled } from './provider';

export const App = () => {
  const [account, activate, error] = useProvider();

  const activated = account !== undefined;

  return (
    <div>
      {activated ? <div>MetaMask account: {account} </div> : null}
      {!activated ? (
        <button onClick={() => activate()}>
          {!isMetaMaskInstalled() ? 'Install MetaMask' : 'Login with MetaMask'}
        </button>
      ) : null}
      {error !== undefined ? <div style={{ color: 'red' }}>{error}</div> : null}
    </div>
  );
};
