import { NextResponse } from "next/server";
import { SITE_NAME } from "@/lib/config";

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0 || parts.length > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: SITE_NAME,
    timestamp: new Date().toISOString(),
    uptime: formatUptime(process.uptime()),
    version: process.env.npm_package_version || "0.1.0",
    node: process.version,
  });
}
