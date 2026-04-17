import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ServiceIcon, EduServicesIconSet, BigBlueButtonIcon, MoodleIcon } from "@/components/Icons";

// Mock next/image
vi.mock("next/image", () => ({
  default: function MockImage({ src, alt, width, height, className }: { src: string; alt: string; width: number; height: number; className?: string }) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} width={width} height={height} className={className} data-testid="service-icon" />
    );
  },
}));

describe("Icons", () => {
  describe("ServiceIcon", () => {
    it("renders an image with correct src and alt", () => {
      render(<ServiceIcon service="moodle" />);
      const img = screen.getByTestId("service-icon");
      expect(img).toBeInTheDocument();
      expect(img.getAttribute("src")).toBe("/static/icons/moodle-icon.svg");
      expect(img.getAttribute("alt")).toBe("moodle icon");
    });

    it("uses default size of 48", () => {
      render(<ServiceIcon service="moodle" />);
      const img = screen.getByTestId("service-icon");
      expect(img.getAttribute("width")).toBe("48");
      expect(img.getAttribute("height")).toBe("48");
    });

    it("applies custom size", () => {
      render(<ServiceIcon service="moodle" size={96} />);
      const img = screen.getByTestId("service-icon");
      expect(img.getAttribute("width")).toBe("96");
      expect(img.getAttribute("height")).toBe("96");
    });

    it("applies custom className", () => {
      render(<ServiceIcon service="moodle" className="custom-class" />);
      const img = screen.getByTestId("service-icon");
      expect(img.getAttribute("class")).toContain("custom-class");
    });
  });

  describe("EduServicesIconSet", () => {
    it("renders 25 service icons", () => {
      render(<EduServicesIconSet />);
      const icons = screen.getAllByTestId("service-icon");
      expect(icons).toHaveLength(25);
    });

    it("applies custom className to container", () => {
      const { container } = render(<EduServicesIconSet className="my-grid" />);
      const grid = container.firstChild as HTMLElement;
      expect(grid.className).toContain("my-grid");
    });
  });

  describe("Named icon exports", () => {
    it("BigBlueButtonIcon renders correct service", () => {
      render(<BigBlueButtonIcon />);
      const img = screen.getByTestId("service-icon");
      expect(img.getAttribute("src")).toBe("/static/icons/bigbluebutton-icon.svg");
    });

    it("MoodleIcon renders correct service", () => {
      render(<MoodleIcon />);
      const img = screen.getByTestId("service-icon");
      expect(img.getAttribute("src")).toBe("/static/icons/moodle-icon.svg");
    });

    it("named exports accept size prop", () => {
      render(<MoodleIcon size={64} />);
      const img = screen.getByTestId("service-icon");
      expect(img.getAttribute("width")).toBe("64");
    });

    it("named exports accept className prop", () => {
      render(<BigBlueButtonIcon className="icon-cls" />);
      const img = screen.getByTestId("service-icon");
      expect(img.getAttribute("class")).toContain("icon-cls");
    });
  });
});
