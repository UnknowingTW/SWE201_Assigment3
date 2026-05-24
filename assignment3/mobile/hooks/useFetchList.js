// hooks/useFetchList.js
// Generic reusable hook for fetching a list of items.
// Handles loading state, error state, and manual refresh (retry).

import { useState, useEffect, useCallback } from 'react';

/**
 * @param {Function} fetchFn  - Async function that returns an array of items.
 * @param {Array}    deps     - Dependency array that triggers a re-fetch when changed.
 */
export function useFetchList(fetchFn, deps = []) {
  const [data, setData]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
}
