import { useState, useCallback, useEffect } from 'react';
import { getTransactions } from '../utils/stellar';
import { getCache, setCache } from '../utils/cache';

export const useTransactions = (address, network) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async (force = false) => {
    if (!address) return;
    const cacheKey = `txns_${network}_${address}`;
    
    if (!force) {
      const cached = getCache(cacheKey);
      if (cached !== null) {
        setTransactions(cached);
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      const txs = await getTransactions(address, network);
      setCache(cacheKey, txs, 60);
      setTransactions(txs);
    } catch (err) {
      setError(err.message || 'Failed to fetch txs');
    } finally {
      setLoading(false);
    }
  }, [address, network]);

  useEffect(() => {
    setTransactions([]);
    if (address) {
      fetchTransactions();
    }
  }, [address, network, fetchTransactions]);

  return { transactions, loading, error, fetchTransactions };
};
