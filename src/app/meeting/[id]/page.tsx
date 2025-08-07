import Meeting from "@/components/page/Meeting"
import prisma from "@/lib/db"
import { redirect } from "next/navigation"

export default async function MeetingPage({ params }: { params: Promise<{ id: string }> }) {
  const meetingId = (await params).id

  if (!meetingId || meetingId.length !== 25) {
    redirect("/");
  }

  let meeting: { id: string } | null = null

  try {
    meeting = await prisma.meetings.findUnique({
      where: {
        id: meetingId
      },
      select: {
        id: true,
      }
    })
  } catch (error) {
    console.error("Error fetching meeting:", error)
    redirect("/");
  }

  if (!meeting?.id) {
    redirect("/")
  }

  return (
    <Meeting meetingId={meeting.id} />
  )
}