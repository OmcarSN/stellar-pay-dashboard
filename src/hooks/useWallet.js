import { useState, useCallback } from 'react';

const WALLET_KEY = 'stellar_wallet_address';

export const useWallet = () => {
  const [address, setAddress] = useState(() => localStorage.getItem(WALLET_KEY) || null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const { requestAccess, isConnected } = await import('@stellar/freighter-api');
      const conn = await isConnected();
      if (!conn.isConnected) {
        setError('Freighter is not installed or connected.');
        return;
      }
      const res = await requestAccess();
      if (res.error) {
        setError(res.error);
        return;
      }
      setAddress(res.address);
      localStorage.setItem(WALLET_KEY, res.address);
    } catch (e) {
      setError(e.message || 'Connection failed.');
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem(WALLET_KEY);
    setAddress(null);
  }, []);

  return { address, connecting, error, connect, disconnect };
};
