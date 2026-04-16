export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs px-2 py-1 rounded-full bg-background border border-border text-foreground-secondary">
      {children}
    </span>
  );
}

export function CategoryBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-foreground-secondary border border-accent/20">
      {children}
    </span>
  );
}
