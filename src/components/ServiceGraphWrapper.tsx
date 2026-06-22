"use client";

import dynamic from "next/dynamic";
import type { Post } from "@/lib/content";

const ServiceGraph = dynamic(() => import("@/components/ServiceGraph"), {
  ssr: false,
});

export default function ServiceGraphWrapper({
  posts,
  section,
  locale,
}: {
  posts: Post[];
  section: string;
  locale: string;
}) {
  return <ServiceGraph posts={posts} section={section} locale={locale} />;
}
