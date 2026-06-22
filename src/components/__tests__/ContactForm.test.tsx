import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContactForm from "../ContactForm";

const mockT = vi.fn((key: string) => {
  const translations: Record<string, string> = {
    contactTitle: "Contact Us",
    contactName: "Name",
    contactNamePlaceholder: "Your name",
    contactEmail: "Email",
    contactEmailPlaceholder: "your@email.com",
    contactSubject: "Subject",
    contactSubjectPlaceholder: "What is this about?",
    contactMessage: "Message",
    contactMessagePlaceholder: "Your message...",
    contactSend: "Send",
    contactSending: "Sending...",
    contactCancel: "Cancel",
    contactError: "An error occurred",
    contactSuccess: "Message sent successfully!",
    contactClose: "Close",
    contactNotice: "We'll respond within 2 business days",
  };
  return translations[key] || key;
});

const mockOnClose = vi.fn();

describe("ContactForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the contact form with all fields", () => {
    render(<ContactForm onClose={mockOnClose} t={mockT} />);

    expect(screen.getByText("Contact Us")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Subject")).toBeInTheDocument();
    expect(screen.getByLabelText("Message")).toBeInTheDocument();
    expect(screen.getByText("Send")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("calls onClose when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(<ContactForm onClose={mockOnClose} t={mockT} />);

    const cancelButton = screen.getByText("Cancel");
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when close button (X) is clicked", async () => {
    const user = userEvent.setup();
    render(<ContactForm onClose={mockOnClose} t={mockT} />);

    const closeButton = screen.getByLabelText("Close");
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("allows typing in all form fields", async () => {
    const user = userEvent.setup();
    render(<ContactForm onClose={mockOnClose} t={mockT} />);

    await user.type(screen.getByLabelText("Name"), "John Doe");
    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.type(screen.getByLabelText("Subject"), "Test Subject");
    await user.type(screen.getByLabelText("Message"), "This is a test message");

    expect(screen.getByLabelText("Name")).toHaveValue("John Doe");
    expect(screen.getByLabelText("Email")).toHaveValue("john@example.com");
    expect(screen.getByLabelText("Subject")).toHaveValue("Test Subject");
    expect(screen.getByLabelText("Message")).toHaveValue("This is a test message");
  });

  it("submits the form successfully and shows success message", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(<ContactForm onClose={mockOnClose} t={mockT} />);

    await user.type(screen.getByLabelText("Name"), "John Doe");
    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.type(screen.getByLabelText("Subject"), "Test Subject");
    await user.type(screen.getByLabelText("Message"), "This is a test message");

    const sendButton = screen.getByText("Send");
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText("Message sent successfully!")).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/contact",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "John Doe",
          email: "john@example.com",
          subject: "Test Subject",
          message: "This is a test message",
        }),
      })
    );
  });

  it("shows error message when submission fails", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Server error" }),
    });

    render(<ContactForm onClose={mockOnClose} t={mockT} />);

    await user.type(screen.getByLabelText("Name"), "John Doe");
    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.type(screen.getByLabelText("Subject"), "Test Subject");
    await user.type(screen.getByLabelText("Message"), "This is a test message");

    const sendButton = screen.getByText("Send");
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText("Server error")).toBeInTheDocument();
    });
  });

  it("disables submit button while submitting", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100);
        })
    );

    render(<ContactForm onClose={mockOnClose} t={mockT} />);

    await user.type(screen.getByLabelText("Name"), "John Doe");
    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.type(screen.getByLabelText("Subject"), "Test Subject");
    await user.type(screen.getByLabelText("Message"), "This is a test message");

    const sendButton = screen.getByText("Send");
    await user.click(sendButton);

    const sendingText = screen.getAllByText("Sending...");
    expect(sendingText.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("button", { name: /Sending/i })).toBeDisabled();
  });

  it("prevents multiple submissions while already submitting", async () => {
    const user = userEvent.setup();
    const fetchCalls = 0;
    global.fetch = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 200);
        })
    );

    render(<ContactForm onClose={mockOnClose} t={mockT} />);

    await user.type(screen.getByLabelText("Name"), "John Doe");
    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.type(screen.getByLabelText("Subject"), "Test Subject");
    await user.type(screen.getByLabelText("Message"), "This is a test message");

    const sendButton = screen.getByText("Send");
    await user.click(sendButton);
    await user.click(sendButton);
    await user.click(sendButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  it("trims whitespace from form fields before submission", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(<ContactForm onClose={mockOnClose} t={mockT} />);

    await user.type(screen.getByLabelText("Name"), "  John Doe  ");
    await user.type(screen.getByLabelText("Email"), "  john@example.com  ");
    await user.type(screen.getByLabelText("Subject"), "  Test  ");
    await user.type(screen.getByLabelText("Message"), "  Message  ");

    const sendButton = screen.getByText("Send");
    await user.click(sendButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/contact",
        expect.objectContaining({
          body: JSON.stringify({
            name: "John Doe",
            email: "john@example.com",
            subject: "Test",
            message: "Message",
          }),
        })
      );
    });
  });

  it("closes the form after successful submission", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(<ContactForm onClose={mockOnClose} t={mockT} />);

    await user.type(screen.getByLabelText("Name"), "John Doe");
    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.type(screen.getByLabelText("Subject"), "Test Subject");
    await user.type(screen.getByLabelText("Message"), "This is a test message");

    const sendButton = screen.getByText("Send");
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText("Message sent successfully!")).toBeInTheDocument();
    });

    const closeButton = screen.getByText("Close");
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("shows error message when submission fails with empty error response", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    render(<ContactForm onClose={mockOnClose} t={mockT} />);

    await user.type(screen.getByLabelText("Name"), "John Doe");
    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.type(screen.getByLabelText("Subject"), "Test Subject");
    await user.type(screen.getByLabelText("Message"), "This is a test message");

    const sendButton = screen.getByText("Send");
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText("Unknown error")).toBeInTheDocument();
    });
  });

  it("enforces required field validation for email", async () => {
    const user = userEvent.setup();
    render(<ContactForm onClose={mockOnClose} t={mockT} />);

    const emailField = screen.getByLabelText("Email");
    await user.type(emailField, "test");

    expect(emailField).toHaveAttribute("type", "email");
    expect(emailField).toHaveAttribute("required");
  });

  it("enforces minimum message length of 10 characters", async () => {
    const user = userEvent.setup();
    render(<ContactForm onClose={mockOnClose} t={mockT} />);

    const messageField = screen.getByLabelText("Message");
    expect(messageField).toHaveAttribute("minLength", "10");
  });

  it("enforces maximum field lengths", async () => {
    const user = userEvent.setup();
    render(<ContactForm onClose={mockOnClose} t={mockT} />);

    expect(screen.getByLabelText("Name")).toHaveAttribute("maxLength", "200");
    expect(screen.getByLabelText("Email")).toHaveAttribute("maxLength", "254");
    expect(screen.getByLabelText("Subject")).toHaveAttribute("maxLength", "200");
    expect(screen.getByLabelText("Message")).toHaveAttribute("maxLength", "10000");
  });
});
