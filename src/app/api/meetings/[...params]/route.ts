import prisma from "@/lib/prisma"
import { NextRequest } from "next/server"

// validating the meeting ID
export async function GET(req: NextRequest) {
    const id = req.nextUrl.pathname.split("/")?.pop();
    if (!id) {
        return Response.json({ error: "Meeting ID is required" }, { status: 400 })
    }
    let res = null
    try {
        res = await prisma.meeting.findUnique({
            where: {
                id,
            }
        })
    } catch (error) {
        console.error("Error fetching meeting:", error);
    }

    if (!res) {
        return Response.json({ error: "Meeting not found" }, { status: 404 })
    }
    return Response.json({ message: "Joining meeting..." }, { status: 200 })
}