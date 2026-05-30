export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs px-2 py-1 rounded-full bg-background border border-border text-foreground-secondary">
      {children}
    </span>
  );
}

export function CategoryBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-foreground border border-accent/20">
      {children}
    </span>
  );
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const colors: Record<string, string> = {
    stable: "bg-emerald-500/10 text-emerald-600 border-emerald-500/25",
    beta: "bg-amber-500/10 text-amber-600 border-amber-500/25",
    planned: "bg-blue-500/10 text-blue-600 border-blue-500/25",
  };
  const colorClass = colors[status.toLowerCase()] ?? colors.stable;
  return (
    <span className={`text-xs px-2 py-1 rounded-full border ${colorClass} ${className ?? ""}`}>
      {status}
    </span>
  );
}
