import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface LoadingSkeletonProps {
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 6,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, index) => (
        <Card
          key={index}
          className="h-full bg-card shadow-card border-0 overflow-hidden"
        >
          {/* Image Skeleton */}
          <div className="h-48 bg-muted animate-pulse" />

          {/* Content Skeleton */}
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Title Skeleton */}
              <div className="space-y-2">
                <div className="bg-muted h-4 rounded w-3/4 animate-pulse" />
                <div className="bg-muted h-4 rounded w-1/2 animate-pulse" />
              </div>

              {/* Description Skeleton */}
              <div className="space-y-2">
                <div className="bg-muted h-3 rounded w-full animate-pulse" />
                <div className="bg-muted h-3 rounded w-2/3 animate-pulse" />
              </div>

              {/* Location and Date Skeleton */}
              <div className="space-y-2">
                <div className="bg-muted h-3 rounded w-1/2 animate-pulse" />
                <div className="bg-muted h-3 rounded w-1/3 animate-pulse" />
              </div>

              {/* Category Badge Skeleton */}
              <div className="bg-muted h-6 rounded w-20 animate-pulse" />
            </div>
          </CardContent>

          {/* Footer Skeleton */}
          <CardFooter className="p-4 pt-0">
            <div className="bg-muted h-10 rounded w-full animate-pulse" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
