import { useState, useCallback, useEffect } from 'react';
import { getBalance } from '../utils/stellar';
import { getCache, setCache } from '../utils/cache';

export const useBalance = (address, network) => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBalance = useCallback(async (force = false) => {
    if (!address) return;
    const cacheKey = `balance_${network}_${address}`;
    
    if (!force) {
      const cached = getCache(cacheKey);
      if (cached !== null) {
        setBalance(cached);
        return;
      }
    }
    
    setLoading(true);
    setError(null);
    try {
      const bal = await getBalance(address, network);
      setCache(cacheKey, bal, 30);
      setBalance(bal);
    } catch (err) {
      setError(err.message || 'Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  }, [address, network]);

  useEffect(() => {
    setBalance(null); // Clear previous state when address/network changes before fetching
    if (address) {
      fetchBalance();
    }
  }, [address, network, fetchBalance]);

  return { balance, loading, error, fetchBalance };
};
