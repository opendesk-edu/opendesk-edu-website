import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!email || !message) {
      return NextResponse.json(
        { error: "Email and message are required." },
        { status: 400 }
      );
    }

    if (!email.includes("@") || email.length > 254) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    if (message.length < 10 || message.length > 10000) {
      return NextResponse.json(
        { error: "Message must be between 10 and 10,000 characters." },
        { status: 400 }
      );
    }

    const transporter = getTransporter();

    if (!transporter) {
      // SMTP not configured — log the attempt and return 501
      console.log(
        `[contact] SMTP not configured. Would send: from=${email}, name=${name || "—"}, subject=${subject || "(no subject)"}, message length=${message.length}`
      );
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
