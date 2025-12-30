import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth/auth";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session?.user) {
    return NextResponse.json(
      { error: "Sign in to create a meeting" },
      { status: 401 },
    );
  }

  const body = (await req.json()) as { allowGuestJoin?: boolean };

  try {
    const meeting = await prisma.meeting.create({
      data: {
        hostId: session.user.id,
        allowGuestJoin: body?.allowGuestJoin ?? false,
      },
      select: {
        id: true,
        allowGuestJoin: true,
      },
    });

    return NextResponse.json(
      {
        id: meeting.id,
        link: new URL(`/meeting/${meeting.id}`, req.nextUrl.origin).toString(),
        allowGuestJoin: meeting.allowGuestJoin,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Failed to create meeting", {
      userEmail: session.user.email,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Failed to create meeting" },
      { status: 500 },
    );
  }
}
