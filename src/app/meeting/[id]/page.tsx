import Meeting from "@/components/page/Meeting"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function MeetingPage({ params }: { params: Promise<{ id: string }> }) {
  const meetingId = (await params).id

  if (!meetingId || meetingId.length !== 25) {
    redirect("/");
  }

  const meeting = await prisma.meeting.findUnique({
    where: {
      id: meetingId
    },
    select: {
      id: true,
    }
  })

  if (!meeting?.id) {
    redirect("/")
  }

  return (
    <Meeting meetingId={meeting.id} />
  )
}