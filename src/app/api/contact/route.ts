import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { isRateLimited } from "@/lib/rateLimit";

function getClientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  return "unknown";
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

// CRLF / control characters must never reach mail header fields (header
// injection). Nodemailer encodes most fields, but defence-in-depth is cheap.
function hasControlCharacters(value: unknown): boolean {
  return typeof value === "string" && /[\r\n\u0000-\u001f]/.test(value);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!email || !message) {
      return NextResponse.json({ error: "Email and message are required." }, { status: 400 });
    }

    if (
      typeof email !== "string" ||
      email.length > 254 ||
      !EMAIL_RE.test(email) ||
      hasControlCharacters(email)
    ) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    if (typeof message !== "string" || message.length < 10 || message.length > 10000) {
      return NextResponse.json(
        { error: "Message must be between 10 and 10,000 characters." },
        { status: 400 }
      );
    }

    // Reject header injection in any user-controlled mail header field.
    if (hasControlCharacters(name) || hasControlCharacters(subject)) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    // Throttle only submissions that pass validation (i.e. would send mail).
    if (isRateLimited(getClientIp(request))) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const transporter = getTransporter();

    if (!transporter) {
      return NextResponse.json(
        {
          error:
            "Contact form is not yet configured. Please send an email directly to info@opendesk-edu.org.",
        },
        { status: 501 }
      );
    }

    const mailOptions = {
      from: `"${name || "Website Contact"}" <${email}>`,
      to: process.env.CONTACT_RECIPIENT || "info@opendesk-edu.org",
      replyTo: email,
      subject: `[openDesk Edu] ${subject || "Contact Form Message"}`,
      text: `Name: ${name || "Not provided"}
Email: ${email}
Subject: ${subject || "Not provided"}

Message:
${message}`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[contact] Failed to send email:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}
