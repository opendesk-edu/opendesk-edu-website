import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes("@") || email.length > 254) {
      return NextResponse.json(
        { error: "Valid email address is required." },
        { status: 400 }
      );
    }

    const listmonkUrl = process.env.LISTMONK_URL;
    const listmonkApiKey = process.env.LISTMONK_API_KEY;

    if (!listmonkUrl || !listmonkApiKey) {
      // Listmonk not configured — log and return 501
      console.log(
        `[subscribe] Listmonk not configured. Would subscribe: ${email}`
      );
      return NextResponse.json(
        {
          error:
            "Newsletter subscription is not yet configured. Follow our RSS feed for updates.",
        },
        { status: 501 }
      );
    }

    const listId = process.env.LISTMONK_LIST_ID
      ? parseInt(process.env.LISTMONK_LIST_ID, 10)
      : 1;

    const response = await fetch(`${listmonkUrl}/api/subscribers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`:${listmonkApiKey}`).toString("base64")}`,
      },
      body: JSON.stringify({
        email,
        lists: [listId],
        preconfirm_subscriptions: true,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      // 409 = already subscribed — that's fine
      if (response.status === 409) {
        return NextResponse.json({ success: true, alreadySubscribed: true });
      }
      console.error(
        `[subscribe] Listmonk error (${response.status}): ${text}`
      );
      return NextResponse.json(
        { error: "Failed to subscribe. Please try again later." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[subscribe] Failed:", error);
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again later." },
      { status: 500 }
    );
  }
}
