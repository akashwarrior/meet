import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ meetingId: string }> },
) {
  const {meetingId} = await params;

  if (meetingId.length !== 25) {
    return NextResponse.json(
      { error: "A valid meeting ID is required" },
      { status: 400 },
    );
  }

  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      select: { id: true },
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        id: meeting.id,
        message: "Meeting is ready",
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
