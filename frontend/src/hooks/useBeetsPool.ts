import { useState, useEffect } from 'react';

const SUBGRAPH_URL = 'https://backend-v3.beets-ftm-node.com/';

// Update this with your actual pool ID
const POOL_ID: string = '0x0000000000000000000000000000000000000000000000000000000000000000';

const POOL_QUERY = `
  query GetPool($poolId: String!) {
    pool(id: $poolId) {
      id
      name
      type
      dynamicData {
        totalLiquidity
        swapVolume24h
        swapFee
        apr
      }
      tokens {
        address
        symbol
        balance
        weight
      }
      apr {
        total
        items {
          title
          apr
        }
      }
    }
  }
`;

export interface BeetsPoolData {
  id: string;
  name: string;
  type: string;
  tvl: string;
  volume24h: string;
  apr: string;
  swapFee: string;
  tokens: Array<{
    address: string;
    symbol: string;
    balance: string;
    weight: string;
  }>;
}

export const useBeetsPool = () => {
  const [data, setData] = useState<BeetsPoolData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!POOL_ID || POOL_ID === '0x0000000000000000000000000000000000000000000000000000000000000000') {
      setData(null);
      setError('No pool ID set');
      return;
    }
    setLoading(true);
    setError(null);
    fetch(SUBGRAPH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: POOL_QUERY,
        variables: { poolId: POOL_ID.toLowerCase() },
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.errors) {
          setError(result.errors[0].message);
          setData(null);
        } else if (result.data && result.data.pool) {
          const pool = result.data.pool;
          setData({
            id: pool.id,
            name: pool.name,
            type: pool.type,
            tvl: pool.dynamicData.totalLiquidity,
            volume24h: pool.dynamicData.swapVolume24h,
            apr: pool.apr?.total || pool.dynamicData.apr || '0',
            swapFee: pool.dynamicData.swapFee,
            tokens: pool.tokens.map((t: any) => ({
              address: t.address,
              symbol: t.symbol,
              balance: t.balance,
              weight: t.weight,
            })),
          });
        } else {
          setError('Pool not found');
          setData(null);
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch pool data');
        setData(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}; 