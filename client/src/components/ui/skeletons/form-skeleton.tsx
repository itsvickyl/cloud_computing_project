import { Card, CardContent, CardHeader } from "../card";
import { Skeleton } from "../skeleton";

export function FormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-md mt-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Form fields */}
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}

        {/* Submit button */}
        <Skeleton className="h-10 w-32 mt-6" />
      </CardContent>
    </Card>
  );
}
