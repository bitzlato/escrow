import React from 'react';
import MetaMaskOnboarding from '@metamask/onboarding';
import {
  getMetaMaskProvider,
  ProviderRpcError,
} from '@bitzlato/ethereum-provider';

export function useProvider(): [
  string | undefined,
  () => void,
  string | undefined,
] {
  const [error, setError] = React.useState<string | undefined>('');
  const [accounts, setAccounts] = React.useState<string[]>([]);
  const onboarding = React.useMemo(() => new MetaMaskOnboarding(), []);

  React.useEffect(() => {
    const provider = getMetaMaskProvider();
    if (provider) {
      const listener = (accounts: string[]) => setAccounts(accounts);
      provider.request({ method: 'eth_accounts' }).then(listener);
      provider.on('accountsChanged', listener);
      return () => {
        provider.removeListener('accountsChanged', listener);
      };
    }
  }, []);

  // React.useEffect(() => {
  //   if (isMetaMaskInstalled() && accounts.length > 0) {
  //     onboarding.stopOnboarding();
  //   }
  // }, [accounts]);

  const activate = async () => {
    setError(undefined);
    const provider = getMetaMaskProvider();
    if (provider) {
      try {
        setAccounts(await provider.request({ method: 'eth_requestAccounts' }));
      } catch (e) {
        setError((e as ProviderRpcError).message);
      }
    } else {
      onboarding.startOnboarding();
    }
  };

  return [accounts[0], activate, error];
}
