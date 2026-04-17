"use client";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Section header skeleton */}
      <div className="bg-gradient-to-br from-accent/10 to-accent/5 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-foreground/10 rounded w-48 mb-4"></div>
            <div className="h-6 bg-foreground/10 rounded w-96"></div>
          </div>
        </div>
      </div>

      {/* Section content skeleton */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-8">
          {/* Card grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-background border border-border rounded-lg p-6">
                <div className="h-6 bg-foreground/10 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-foreground/10 rounded w-full mb-2"></div>
                <div className="h-4 bg-foreground/10 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}