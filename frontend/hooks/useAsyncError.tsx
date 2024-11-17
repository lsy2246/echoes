// File path: hooks/useAsyncError.tsx
import { useState, useCallback } from 'react';

export function useAsyncError() {
  const [, setError] = useState();
  
  return useCallback(
    (e: Error) => {
      setError(() => {
        throw e;
      });
    },
    [setError],
  );
}