import { Room } from "@/app/components/Room";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function room() {
    const session = await getServerSession();

    if (!session) {
        redirect('/signin');
    }

    return <Room />
}