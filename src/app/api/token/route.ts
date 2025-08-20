import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
  const meetingId = req.nextUrl.searchParams.get("meetingId");
  const name = req.nextUrl.searchParams.get("name");

  if (!meetingId || !name) {
    return NextResponse.json({ error: "Invalid Inputs" }, { status: 400 });
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 },
    );
  }

  const token = new AccessToken(apiKey, apiSecret, {
    identity: session?.user.email || "unknown-" + new Date().getTime(),
    name: name,
    ttl: 1 * 60 * 60, // 1 hours
  });

  token.addGrant({
    room: meetingId,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });

  return NextResponse.json(
    { token: await token.toJwt() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
