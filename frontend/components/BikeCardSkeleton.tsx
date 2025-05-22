import React from "react";
import { Skeleton } from "./ui/skeleton";

export default function BikeCardSkeleton() {
  return (
    <div className="p-1 border rounded-lg">
      <Skeleton className="h-[180px] w-full border-b object-cover" />
      <div className="flex items-center justify-between gap-2 py-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="py-1">
        <Skeleton className="h-4 w-44" />
      </div>
      <div className="py-1">
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}
