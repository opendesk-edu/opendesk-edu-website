// SPDX-FileCopyrightText: 2026 openDesk Edu
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LandscapeVisualization from "@/components/Landscape/LandscapeVisualization";

describe("LandscapeVisualization", () => {
  it("renders search input", () => {
    render(<LandscapeVisualization />);
    expect(
      screen.getByPlaceholderText(/search services/i)
    ).toBeInTheDocument();
  });

  it("renders quick stats", () => {
    render(<LandscapeVisualization />);
    expect(screen.getByText(/production ready/i)).toBeInTheDocument();
    expect(screen.getByText(/beta services/i)).toBeInTheDocument();
    expect(screen.getByText(/categories/i)).toBeInTheDocument();
  });
});
