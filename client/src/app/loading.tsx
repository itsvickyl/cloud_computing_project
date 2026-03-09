import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Spinner size="xl" className="mx-auto" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
