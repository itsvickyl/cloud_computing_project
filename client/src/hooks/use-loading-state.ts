"use client";

import { useState, useEffect } from "react";

interface UseLoadingStateOptions {
  delay?: number;
  timeout?: number;
}

export const useLoadingState = (
  isLoading: boolean, 
  options: UseLoadingStateOptions = {}
) => {
  const { delay = 200, timeout = 30000 } = options;
  const [showLoading, setShowLoading] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    let delayTimer: NodeJS.Timeout;
    let timeoutTimer: NodeJS.Timeout;

    if (isLoading) {
      delayTimer = setTimeout(() => {
        setShowLoading(true);
      }, delay);

      // Set timeout for loading state
      timeoutTimer = setTimeout(() => {
        setHasTimedOut(true);
      }, timeout);
    } else {
      setShowLoading(false);
      setHasTimedOut(false);
    }

    return () => {
      clearTimeout(delayTimer);
      clearTimeout(timeoutTimer);
    };
  }, [isLoading, delay, timeout]);

  return {
    showLoading: isLoading && showLoading,
    hasTimedOut: isLoading && hasTimedOut,
  };
};