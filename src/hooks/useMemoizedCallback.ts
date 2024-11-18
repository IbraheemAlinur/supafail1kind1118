import { useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook that returns a memoized version of the callback that only changes if one of the dependencies has changed.
 * This is useful when passing callbacks to optimized child components that rely on reference equality to prevent unnecessary renders.
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: any[]
): T {
  // Keep a reference to the latest callback
  const callbackRef = useRef(callback);

  // Update the ref whenever the callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...dependencies]);

  // Return a memoized version of the callback that uses the ref
  return useCallback((...args: Parameters<T>) => {
    return callbackRef.current(...args);
  }, []) as T;
}