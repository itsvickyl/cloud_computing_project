"use client";

import { useLoading } from "../providers/loading-provider";
import { Spinner } from "./loading-components";

export const GlobalLoadingOverlay = () => {
  const { globalLoading, loadingMessage } = useLoading();

  if (!globalLoading) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card border rounded-lg p-6 shadow-lg flex items-center gap-3">
        <Spinner size="md" />
        <span className="text-sm font-medium">{loadingMessage}</span>
      </div>
    </div>
  );
};