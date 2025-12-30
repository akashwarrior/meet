import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { getLiveKitEnv } from "@/lib/env.server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import prisma from "@/lib/db";

export async function GET({ nextUrl: { searchParams } }: NextRequest) {
  const meetingId = searchParams.get("meetingId");
  const name = searchParams.get("name");

  if (meetingId?.length !== 25 || !name?.trim()) {
    return NextResponse.json(
      { error: "A valid meeting ID and participant name are required" },
      { status: 400 },
    );
  }

  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    select: { allowGuestJoin: true },
  });

  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  let hasSession = false;

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    hasSession = Boolean(session?.user);

    if (!session?.user && !meeting.allowGuestJoin) {
      return NextResponse.json(
        {
          error:
            "Guest access is disabled for this meeting. Sign in to continue.",
        },
        { status: 401 },
      );
    }

    const liveKitEnv = getLiveKitEnv();

    const token = new AccessToken(
      liveKitEnv.liveKitApiKey,
      liveKitEnv.liveKitApiSecret,
      {
        identity: session?.user.email ?? `guest-${crypto.randomUUID()}`,
        name,
        ttl: "15m",
      },
    );

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
  } catch (error) {
    console.error("Failed to create LiveKit token", {
      meetingId,
      hasSession,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Failed to create meeting token" },
      { status: 500 },
    );
  }
}
