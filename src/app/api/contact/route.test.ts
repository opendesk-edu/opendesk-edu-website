import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "./route";

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn().mockResolvedValue({ messageId: "test" }),
    })),
  },
}));

describe("Contact API", () => {
  const validBody = {
    name: "Test User",
    email: "test@example.com",
    subject: "Test Subject",
    message: "This is a test message that is long enough",
  };

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 400 when email is missing", async () => {
    const request = new Request("http://localhost/api/contact", {
      method: "POST",
      body: JSON.stringify({ message: "Hello" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("Email");
  });

  it("returns 400 when message is missing", async () => {
    const request = new Request("http://localhost/api/contact", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("Email");
  });

  it("returns 400 for invalid email", async () => {
    const request = new Request("http://localhost/api/contact", {
      method: "POST",
      body: JSON.stringify({ email: "invalid", message: "Valid message text here" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("Invalid email");
  });

  it("returns 400 for too-short message", async () => {
    const request = new Request("http://localhost/api/contact", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com", message: "short" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("Message");
  });

  it("returns 501 when SMTP not configured", async () => {
    vi.stubEnv("SMTP_HOST", "");
    vi.stubEnv("SMTP_USER", "");
    vi.stubEnv("SMTP_PASS", "");
    const request = new Request("http://localhost/api/contact", {
      method: "POST",
      body: JSON.stringify(validBody),
    });
    const response = await POST(request);
    expect(response.status).toBe(501);
    const body = await response.json();
    expect(body.error).toContain("not yet configured");
  });

  it("returns 200 when SMTP is configured", async () => {
    vi.stubEnv("SMTP_HOST", "smtp.example.com");
    vi.stubEnv("SMTP_PORT", "587");
    vi.stubEnv("SMTP_USER", "user");
    vi.stubEnv("SMTP_PASS", "pass");
    const request = new Request("http://localhost/api/contact", {
      method: "POST",
      body: JSON.stringify(validBody),
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  it("returns 500 on send failure", async () => {
    vi.stubEnv("SMTP_HOST", "smtp.example.com");
    vi.stubEnv("SMTP_PORT", "587");
    vi.stubEnv("SMTP_USER", "user");
    vi.stubEnv("SMTP_PASS", "pass");
    const nodemailer = await import("nodemailer");
    const mockTransport = nodemailer.default.createTransport as ReturnType<typeof vi.fn>;
    mockTransport.mockReturnValueOnce({
      sendMail: vi.fn().mockRejectedValue(new Error("SMTP error")),
    });
    const request = new Request("http://localhost/api/contact", {
      method: "POST",
      body: JSON.stringify(validBody),
    });
    const response = await POST(request);
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toContain("Failed to send");
  });
});
