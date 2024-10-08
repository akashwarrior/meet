import { redirect } from "next/navigation";
import SignUp from "../components/SignUp";
import { getServerSession } from "next-auth";

export default async function signup () {
    const session = await getServerSession();
    if (session?.user) {
        redirect('/');
    }

    return <SignUp />
}