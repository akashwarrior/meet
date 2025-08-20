import Meeting from "@/components/meeting/meeting";
import prisma from "@/lib/db";
import { redirect, notFound } from "next/navigation";

export default async function MeetingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const meetingId = (await params).id;

  if (!meetingId || meetingId.length !== 25) {
    notFound();
  }

  let meeting: { id: string } | null = null;

  try {
    meeting = await prisma.meetings.findUnique({
      where: {
        id: meetingId,
      },
      select: {
        id: true,
      },
    });
  } catch (error) {
    console.error("Error fetching meeting:", error);
    redirect("/");
  }

  if (!meeting?.id) {
    console.log("missing id ", meeting);
    notFound();
  }

  return <Meeting meetingId={meeting.id} />;
}
