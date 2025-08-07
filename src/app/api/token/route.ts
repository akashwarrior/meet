import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

// Do not cache endpoint result
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const meetingId = req.nextUrl.searchParams.get("meetingId");
  const username = req.nextUrl.searchParams.get("username");
  if (!meetingId || !username) {
    return NextResponse.json(
      { error: "Missing query parameter" },
      { status: 400 },
    );
  }

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
    identity: username,
    name: username,
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
