import Meeting from "@/components/meeting/meeting";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";

export default async function MeetingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const {id} = await params;

  if (id?.trim().length !== 25) {
    notFound();
  }

  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!meeting) {
      notFound();
    }

    return <Meeting meetingId={meeting.id} />;
  } catch (error) {
    notFound();
  }
}
