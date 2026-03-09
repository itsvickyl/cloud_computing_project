"use client";

import { ReactNode } from "react";
import { Skeleton } from "./skeleton";

interface LoadingWrapperProps {
  isLoading: boolean;
  children: ReactNode;
  skeleton?: ReactNode;
  className?: string;
}

const LoadingWrapper = ({ 
  isLoading, 
  children, 
  skeleton, 
  className 
}: LoadingWrapperProps) => {
  if (isLoading) {
    return (
      <div className={className}>
        {skeleton || <Skeleton className="h-20 w-full" />}
      </div>
    );
  }

  return <>{children}</>;
};

export default LoadingWrapper;