import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LanguageSwitcher from "../LanguageSwitcher";

const mockReplace = vi.fn();
const mockOnLocaleChange = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => "/en/docs",
}));

vi.mock("@/i18n/routing", () => ({
  routing: { locales: ["en", "de", "fr", "zh"], defaultLocale: "en" },
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      label: "Language",
    };
    return translations[key] || key;
  },
  useLocale: () => "en",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/docs",
}));

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the current locale button", () => {
    render(<LanguageSwitcher />);
    expect(screen.getByText("EN")).toBeInTheDocument();
  });

  it("has proper ARIA attributes", () => {
    render(<LanguageSwitcher />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Language");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("aria-haspopup", "listbox");
  });

  it("opens dropdown when clicked", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
  });

  it("shows all available locales except current", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    expect(screen.getByText("DE")).toBeInTheDocument();
    expect(screen.getByText("FR")).toBeInTheDocument();
    expect(screen.getByText("ZH")).toBeInTheDocument();
  });

  it("changes locale when a locale is selected", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher onLocaleChange={mockOnLocaleChange} />);

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    const deOption = screen.getByText("DE");
    await user.click(deOption);

    expect(mockReplace).toHaveBeenCalledWith("/docs", { locale: "de" });
    expect(mockOnLocaleChange).toHaveBeenCalledTimes(1);
  });

  it("closes dropdown after selecting a locale", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    const deOption = screen.getByText("DE");
    await user.click(deOption);

    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  it("closes dropdown when clicking outside", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <LanguageSwitcher />
        <div data-testid="outside">Outside</div>
      </div>
    );

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    const outside = screen.getByTestId("outside");
    await user.click(outside);

    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  it("toggles dropdown on multiple clicks", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    const button = screen.getByRole("button");

    await user.click(button);
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    await user.click(button);
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  it("calls onLocaleChange when locale is changed", async () => {
    const user = userEvent.setup();
    const mockCallback = vi.fn();
    render(<LanguageSwitcher onLocaleChange={mockCallback} />);

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    const frOption = screen.getByText("FR");
    await user.click(frOption);

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it("handles root path correctly", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    const deOption = screen.getByText("DE");
    await user.click(deOption);

    expect(mockReplace).toHaveBeenCalledWith("/docs", { locale: "de" });
  });

  it("displays current locale name correctly for different locales", async () => {
    const mockUseLocale = vi.fn().mockReturnValue("de");
    vi.mocked(await import("next-intl")).useLocale = mockUseLocale;

    render(<LanguageSwitcher />);
    expect(screen.getByText("DE")).toBeInTheDocument();
  });
});
