import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/db";
import { authOptions } from "@/lib/auth";

const ERROR_CAUSE = "WRONG_INPUTS";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  try {
    if (!session?.user) {
      console.error("No session found", session);
      throw new Error("Please login to create a meeting", {
        cause: ERROR_CAUSE,
      });
    }

    const hostId = (
      await prisma.user.findUnique({
        where: {
          email: session.user.email!,
        },
        select: {
          id: true,
        },
      })
    )?.id;

    if (!hostId) {
      throw new Error("Invalid user ID provided", { cause: ERROR_CAUSE });
    }

    const meeting = await prisma.meetings.create({
      data: {
        hostId,
      },
      select: {
        id: true,
      },
    });

    const baseUrl = req.nextUrl.origin;
    return Response.json(
      { link: `${baseUrl}/meeting/${meeting.id}` },
      { status: 200 },
    );
  } catch (err) {
    return Response.json(
      {
        error:
          err instanceof Error
            ? err.cause === ERROR_CAUSE && err.message
            : "Failed to create meeting",
      },
      {
        status: 500,
      },
    );
  }
}
