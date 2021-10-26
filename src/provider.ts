/**
 * @see https://eips.ethereum.org/EIPS/eip-1193
 */

export interface EventEmitter {
  on(eventName: 'accountsChanged', listener: (accounts: string[]) => void): this;
  on(eventName: 'message', listener: (message: ProviderMessage | EthSubscription) => void): this;
  on(eventName: 'connect', listener: (message: ProviderConnectInfo) => void): this;
  on(eventName: 'disconnect', listener: (error: ProviderRpcError) => void): this;
  on(eventName: 'chainChanged', listener: (chainId: string) => void): this;
  on(eventName: string | symbol, listener: (...args: any[]) => void): this;
  removeListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
}

export interface MetaMaskProvider extends EventEmitter {
  isMetaMask?: boolean;

  isConnected(): boolean;

  request(args: { method: 'eth_accounts' }): Promise<string[]>;
  request(args: { method: 'eth_requestAccounts' }): Promise<string[]>;
  request(args: RequestArguments): Promise<unknown>;
}

interface RequestArguments {
  readonly method: string;
  readonly params?: readonly unknown[] | object;
}

export interface ProviderRpcError extends Error {
  message: string;
  code: number;
  data?: unknown;
}

export interface ProviderMessage {
  readonly type: string;
  readonly data: unknown;
}

export interface EthSubscription extends ProviderMessage {
  readonly type: 'eth_subscription';
  readonly data: {
    readonly subscription: string;
    readonly result: unknown;
  };
}

export interface ProviderConnectInfo {
  readonly chainId: string;
}

declare global {
  interface Window {
    ethereum?: MetaMaskProvider;
  }
}

export function isMetaMaskInstalled(): boolean {
  return window?.ethereum?.isMetaMask === true;
}

export function getMetaMaskProvider(): MetaMaskProvider | undefined {
  return isMetaMaskInstalled() ? window.ethereum : undefined;
}
