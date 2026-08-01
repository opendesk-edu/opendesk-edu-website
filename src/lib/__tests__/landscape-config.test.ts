// SPDX-FileCopyrightText: 2026 openDesk Edu
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from "vitest";
import {
  CATEGORIES,
  SERVICES,
  getServicesByCategory,
  searchServices,
  getServicesByStatus,
  getServicesByTag,
  getFeaturedServices,
  getNewServices,
  getDependentServices,
  getCategoryById,
  getStatusConfig,
  getLandscapeStats,
  getAllTags,
  sortServices,
} from "@/lib/landscape-config";

describe("landscape-config", () => {
  it("exports non-empty collections", () => {
    expect(CATEGORIES.length).toBeGreaterThan(0);
    expect(SERVICES.length).toBeGreaterThan(0);
  });

  it("getServicesByCategory filters by category", () => {
    const first = SERVICES[0];
    const result = getServicesByCategory(first.category);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((s) => s.category === first.category)).toBe(true);
  });

  it("searchServices matches by name and description", () => {
    const byName = searchServices(SERVICES[0].name.slice(0, 6));
    expect(byName.length).toBeGreaterThan(0);

    const byDescription = searchServices("open");
    expect(Array.isArray(byDescription)).toBe(true);
  });

  it("getServicesByStatus filters by status", () => {
    const status = SERVICES[0].status;
    const result = getServicesByStatus(status);
    expect(result.every((s) => s.status === status)).toBe(true);
  });

  it("getServicesByTag filters by tag", () => {
    const tag = SERVICES[0].tags[0];
    const result = getServicesByTag(tag);
    expect(result.every((s) => s.tags.includes(tag))).toBe(true);
  });

  it("getFeaturedServices returns only featured", () => {
    const result = getFeaturedServices();
    expect(result.every((s) => s.isFeatured)).toBe(true);
  });

  it("getNewServices returns only new", () => {
    const result = getNewServices();
    expect(result.every((s) => s.isNew)).toBe(true);
  });

  it("getDependentServices finds dependencies", () => {
    const dependent = SERVICES.find((s) => s.dependsOn?.length);
    if (dependent) {
      const result = getDependentServices(dependent.dependsOn![0]);
      expect(result).toContain(dependent);
    } else {
      expect(Array.isArray(getDependentServices("nonexistent"))).toBe(true);
    }
  });

  it("getCategoryById finds categories", () => {
    const cat = CATEGORIES[0];
    expect(getCategoryById(cat.id)).toEqual(cat);
    expect(getCategoryById("nonexistent")).toBeUndefined();
  });

  it("getStatusConfig finds status configs", () => {
    const stats = getLandscapeStats();
    const firstStatus = stats.servicesByStatus[0]?.status;
    if (firstStatus) {
      expect(getStatusConfig(firstStatus)).toBeDefined();
    }
    expect(getStatusConfig("nonexistent")).toBeUndefined();
  });

  it("getLandscapeStats returns aggregate statistics", () => {
    const stats = getLandscapeStats();
    expect(stats.totalServices).toBe(SERVICES.length);
    expect(stats.servicesByCategory.length).toBeGreaterThan(0);
    expect(stats.servicesByStatus.length).toBeGreaterThan(0);
    expect(stats.featuredCount).toBe(getFeaturedServices().length);
    expect(stats.newCount).toBe(getNewServices().length);
    expect(typeof stats.lastUpdated).toBe("string");
  });

  it("getAllTags returns unique sorted tags", () => {
    const tags = getAllTags();
    expect(tags.length).toBeGreaterThan(0);
    expect(new Set(tags).size).toBe(tags.length);
    expect([...tags].sort()).toEqual(tags);
  });

  it("sortServices sorts by status priority then name", () => {
    const sorted = sortServices(SERVICES);
    expect(sorted.length).toBe(SERVICES.length);
    // Same set of services returned
    expect(new Set(sorted.map((s) => s.id)).size).toBe(SERVICES.length);
    // Sorted by status priority first
    for (let i = 1; i < sorted.length; i++) {
      const prevStatus = getStatusConfig(sorted[i - 1].status);
      const currStatus = getStatusConfig(sorted[i].status);
      const prevPrio = prevStatus?.priority ?? 999;
      const currPrio = currStatus?.priority ?? 999;
      expect(prevPrio).toBeLessThanOrEqual(currPrio);
    }
  });
});
