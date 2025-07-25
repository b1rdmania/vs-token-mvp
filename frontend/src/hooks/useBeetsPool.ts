import { useState, useEffect, useRef } from 'react';

const SUBGRAPH_URL = 'https://backend-v3.beets-ftm-node.com/';

// Update this with your actual pool ID
const POOL_ID: string = '0x8C1121B2BFD23ef4e152097C07764D6ad50477B4';

const POOL_QUERY = `
  query GetPool($poolId: String!, $chain: GqlChain!) {
    poolGetPool(id: $poolId, chain: $chain) {
      id
      name
      type
      dynamicData {
        totalLiquidity
        volume24h
        swapFee
      }
      allTokens {
        address
        symbol
        weight
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
  swapFee: string;
  tokens: Array<{
    address: string;
    symbol: string;
    weight: string;
  }>;
}

export const useBeetsPool = (enabled: boolean = true) => {
  const [data, setData] = useState<BeetsPoolData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    
    if (!POOL_ID || POOL_ID === '0x0000000000000000000000000000000000000000000000000000000000000000') {
      setData(null);
      setError('No pool ID set');
      return;
    }
    
    if (!navigator.onLine) {
      setError('Browser is offline');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const requestBody = {
      query: POOL_QUERY,
      variables: { 
        poolId: POOL_ID.toLowerCase(),
        chain: 'SONIC'
      },
    };
    
    fetch(SUBGRAPH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error(`Expected JSON response, got ${contentType}`);
        }
        
        return res.json();
      })
      .then((result) => {
        if (result.errors) {
          setError(result.errors[0].message);
          setData(null);
        } else if (result.data && result.data.poolGetPool) {
          const pool = result.data.poolGetPool;
          setData({
            id: pool.id,
            name: pool.name,
            type: pool.type,
            tvl: pool.dynamicData.totalLiquidity,
            volume24h: pool.dynamicData.volume24h,
            swapFee: pool.dynamicData.swapFee,
            tokens: pool.allTokens.map((t: any) => ({
              address: t.address,
              symbol: t.symbol,
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
      .finally(() => {
        setLoading(false);
      });
  }, [enabled]);

  return { data, loading, error };
};

// Intersection Observer hook for lazy loading
const useIntersectionObserver = (options: IntersectionObserverInit = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      { threshold: 0.1, ...options }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [hasIntersected]);

  return { elementRef, isIntersecting, hasIntersected };
};

// Lazy loading version that only loads when visible
export const useBeetsPoolLazy = () => {
  const { elementRef, hasIntersected } = useIntersectionObserver();
  const { data, loading, error } = useBeetsPool(hasIntersected);

  return { elementRef, data, loading, error, hasIntersected };
}; 