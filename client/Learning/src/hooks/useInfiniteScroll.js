import { useEffect, useRef, useCallback } from 'react';

export function useInfiniteScroll({ hasNextPage, isFetchingNextPage, fetchNextPage, rootMargin = '400px' }) {
  const observerRef = useRef(null);
  
  const sentinelRef = useCallback(
    (node) => {
      // Disconnect previous observer if exists
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      // If no node, or if currently fetching, or if no more pages, do nothing
      if (!node) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        },
        {
          rootMargin,
          threshold: 0,
        }
      );

      observerRef.current.observe(node);
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage, rootMargin]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return sentinelRef;
}
