import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Button } from "./ui/Button";

export async function RecentUsers({ uid }: { uid: string }) {
    const users: { uid: string, displayName: string }[] = [];

    await getDoc(doc(db, uid, "users"))
        .then((doc) => {
            if (doc.exists()) {
                const map = doc.data();
                for (const key in map) {
                    users.push({ uid: key, displayName: map[key] });
                }
            }
        });

    return (
        <section className="flex items-center justify-center m-auto mt-[5%] flex-wrap h-fit pb-7 gap-8">
            {users.map((user) => (
                <div
                    key={user.uid}
                    className="relative w-fit px-16 py-12 bg-black rounded-xl flex items-center justify-center flex-col flex-wrap select-none drop-shadow-sm shadow-[0_0_0_1px_hsla(0,0%,100%/14%),0_1px_1px_rgba(0,0,0/2%),0_8px_16px_-4px_rgba(0,0,0/4%),0_24px_32px_-8px_rgba(0,0,0/6%)]"
                >
                    <div className="opacity-80 absolute w-full h-full overflow-visible top-0 left-0 z-10 animate-spin-slow blur-[100px]">
                        <div className="absolute top-[40%] left-0 bg-[#3291ff] h-24 w-24 rounded-full"></div>
                        <div className="absolute top-0 right-0 bg-[#79ffe1] h-24 w-24 rounded-full"></div>
                    </div>
                    <img className="w-28 h-28 rounded-full mb-3" src={`https://ui-avatars.com/api/?name=${user.displayName}&background=random`} alt={user.displayName} />
                    <p className="text-base font-semibold text-white">{user.displayName}</p>
                    <Button
                        className={"bg-[#0070f3] text-white border-none w-full rounded-md h-10 cursor-pointer font-semibold z-30 outline-none mt-5 flex items-center justify-center transition-all duration-200 hover:bg-[#0077ffb1] active:bg-[#4d4dff]"}
                        data={{ uid: user.uid }}
                    >
                        Connect
                    </Button>
                </div>
            ))}
        </section>
    );
}