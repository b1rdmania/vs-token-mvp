import { useState, useEffect, useRef } from 'react';

const SUBGRAPH_URL = 'https://backend-v3.beets-ftm-node.com/';

// Update this with your actual pool ID
const POOL_ID: string = '0x8C1121B2BFD23ef4e152097C07764D6ad50477B4';

// Log environment info on module load
console.log('🌍 Environment Info:', {
  userAgent: navigator.userAgent,
  location: window.location.href,
  isDev: import.meta.env.DEV,
  mode: import.meta.env.MODE,
  baseUrl: import.meta.env.BASE_URL,
  envVars: import.meta.env
});

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
    console.log('🚀 useBeetsPool useEffect triggered', { 
      enabled, 
      POOL_ID,
      timestamp: new Date().toISOString(),
      SUBGRAPH_URL 
    });
    
    if (!enabled) {
      console.log('❌ Hook disabled, returning early');
      return;
    }
    
    if (!POOL_ID || POOL_ID === '0x0000000000000000000000000000000000000000000000000000000000000000') {
      console.log('❌ No pool ID set');
      setData(null);
      setError('No pool ID set');
      return;
    }
    
    console.log('🔄 Starting GraphQL request to:', SUBGRAPH_URL);
    console.log('🌐 Network connectivity check...');
    
    // Check if we can reach the internet at all
    if (!navigator.onLine) {
      console.error('❌ Browser reports offline status');
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
    
    console.log('📤 Request details:', {
      url: SUBGRAPH_URL,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: requestBody,
      bodySize: JSON.stringify(requestBody).length
    });
    
    const startTime = performance.now();
    
    fetch(SUBGRAPH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })
      .then((res) => {
        const endTime = performance.now();
        const requestDuration = endTime - startTime;
        
        console.log('📥 Response received:', {
          status: res.status,
          statusText: res.statusText,
          duration: `${requestDuration.toFixed(2)}ms`,
          url: res.url,
          redirected: res.redirected,
          type: res.type
        });
        
        console.log('📥 Response headers:', Object.fromEntries(res.headers.entries()));
        
        // Check if response is empty or not JSON
        const contentType = res.headers.get('content-type');
        const contentLength = res.headers.get('content-length');
        
        console.log('📋 Content info:', {
          contentType,
          contentLength,
          ok: res.ok,
          bodyUsed: res.bodyUsed
        });
        
        if (!res.ok) {
          console.error('❌ HTTP Error:', {
            status: res.status,
            statusText: res.statusText,
            headers: Object.fromEntries(res.headers.entries())
          });
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        if (!contentType || !contentType.includes('application/json')) {
          console.error('❌ Wrong content type:', contentType);
          throw new Error(`Expected JSON response, got ${contentType}`);
        }
        
        console.log('✅ Response validation passed, parsing JSON...');
        return res.json();
      })
      .then((result) => {
        console.log('📊 GraphQL result received:', {
          hasData: !!result.data,
          hasErrors: !!result.errors,
          keys: Object.keys(result),
          result: result
        });
        
        if (result.errors) {
          console.error('❌ GraphQL errors:', result.errors);
          console.error('❌ First error details:', {
            message: result.errors[0]?.message,
            extensions: result.errors[0]?.extensions,
            locations: result.errors[0]?.locations,
            path: result.errors[0]?.path
          });
          setError(result.errors[0].message);
          setData(null);
        } else if (result.data && result.data.poolGetPool) {
          const pool = result.data.poolGetPool;
          console.log('✅ Pool data found:', {
            id: pool.id,
            name: pool.name,
            type: pool.type,
            hasDynamicData: !!pool.dynamicData,
            dynamicData: pool.dynamicData,
            tokenCount: pool.allTokens?.length || 0
          });
          
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
          console.warn('⚠️ Pool not found in response');
          console.warn('⚠️ Response structure:', {
            hasData: !!result.data,
            dataKeys: result.data ? Object.keys(result.data) : null,
            poolGetPool: result.data?.poolGetPool
          });
          setError('Pool not found');
          setData(null);
        }
      })
      .catch((err) => {
        const endTime = performance.now();
        const requestDuration = endTime - startTime;
        
        console.error('💥 Fetch error after', `${requestDuration.toFixed(2)}ms`);
        console.error('💥 Error type:', err.constructor.name);
        console.error('💥 Error details:', {
          name: err.name,
          message: err.message,
          cause: err.cause,
          stack: err.stack
        });
        
        // Additional error context
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
          console.error('🔍 Network error - possible causes:');
          console.error('   - CORS policy blocking request');
          console.error('   - DNS resolution failure');
          console.error('   - Server unreachable');
          console.error('   - SSL/TLS certificate issues');
        }
        
        if (err.name === 'SyntaxError' && err.message.includes('JSON')) {
          console.error('🔍 JSON parsing error - server returned non-JSON response');
        }
        
        console.error('🔍 Browser/Environment info:', {
          userAgent: navigator.userAgent,
          cookieEnabled: navigator.cookieEnabled,
          language: navigator.language,
          platform: navigator.platform,
          onLine: navigator.onLine
        });
        
        setError(err.message || 'Failed to fetch pool data');
        setData(null);
      })
      .finally(() => {
        const endTime = performance.now();
        const totalDuration = endTime - startTime;
        console.log('🏁 Request completed:', {
          duration: `${totalDuration.toFixed(2)}ms`,
          timestamp: new Date().toISOString()
        });
        setLoading(false);
      });
  }, [enabled]);

  console.log('🔍 Current hook state:', { 
    hasData: !!data, 
    loading, 
    error,
    dataPreview: data ? {
      tvl: data.tvl,
      volume24h: data.volume24h,
      swapFee: data.swapFee
    } : null
  });
  
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