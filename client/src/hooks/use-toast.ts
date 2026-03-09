import { useCallback } from "react";

interface ToastProps {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const toast = useCallback(({ title, description }: ToastProps) => {
    console.log(`[Toast] ${title}${description ? `: ${description}` : ""}`);
  }, []);

  return { toast };
}
