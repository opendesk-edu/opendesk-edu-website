import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { NextIntlClientProvider } from "next-intl";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Component that throws on render
function ThrowingComponent(): React.ReactElement {
  throw new Error("Test error");
}

// Component that never throws
function GoodComponent(): React.ReactElement {
  return <div>Good content</div>;
}

const messages = {
  errorBoundary: {
    title: "Something went wrong",
    message: "We encountered an unexpected error. Please try again.",
    tryAgain: "Try again",
  },
};

function renderWithProvider(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
}

describe("ErrorBoundary", () => {
  // Suppress console.error from componentDidCatch
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });

  it("renders children when no error", () => {
    renderWithProvider(
      <ErrorBoundary>
        <GoodComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText("Good content")).toBeInTheDocument();
  });

  it("renders fallback UI when child throws", () => {
    renderWithProvider(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Try again")).toBeInTheDocument();
  });

  it("renders custom fallback when provided", () => {
    renderWithProvider(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText("Custom fallback")).toBeInTheDocument();
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });

  it("calls console.error in componentDidCatch", () => {
    renderWithProvider(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(console.error).toHaveBeenCalled();
  });

  it("resets error state when Try again is clicked", () => {
    let shouldThrow = true;

    function ConditionalThrower(): React.ReactElement {
      if (shouldThrow) throw new Error("Conditional error");
      return <div>Recovered</div>;
    }

    renderWithProvider(
      <ErrorBoundary>
        <ConditionalThrower />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    // Stop throwing and click reset
    shouldThrow = false;
    fireEvent.click(screen.getByText("Try again"));
    expect(screen.getByText("Recovered")).toBeInTheDocument();
  });
});
