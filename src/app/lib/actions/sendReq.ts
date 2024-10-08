'use server'

import { db } from "@/app/lib/firebase";
import { deleteDoc, doc, DocumentData, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { getServerSession } from "next-auth";

export async function sendRequest(res: string): Promise<{
    status: boolean;
    message: string;
}> {
    const session = await getServerSession();
    if (!session) return {
        status: false,
        message: "Not authenticated."
    };

    const docRef = doc(db, res, "details");
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
        const docs = doc(db, res, "request");
        await setDoc(docs, { displayName: session.user?.name, uid: session.user?.image, status: null, waiting: false });
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                unsubscribe();
                deleteDoc(docs);
                resolve({
                    status: false,
                    message: "User is offline."
                });
            }, 3000);

            const unsubscribe = onSnapshot(docs, (snapshot: DocumentData) => {
                const { status, waiting } = snapshot.data();
                if (waiting) {
                    clearTimeout(timeout);
                }
                if (status == null) return;
                unsubscribe();
                if (status) {
                    resolve({
                        status: true,
                        message: "User accepted your request."
                    });
                } else {
                    resolve({
                        status: false,
                        message: "User rejected your request."
                    });
                }
            });
        });
    } else {
        return new Promise((resolve) => {
            resolve({
                status: false,
                message: "User not found."
            });
        });
    }
}