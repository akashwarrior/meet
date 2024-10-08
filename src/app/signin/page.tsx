import Signin from "../components/SignIn";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

export default async function signIn () {
    const session = await getServerSession();
    if (session?.user) {
        redirect('/');
    }

    return <Signin />
}