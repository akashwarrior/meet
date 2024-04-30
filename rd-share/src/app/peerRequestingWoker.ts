import { DocumentData, deleteDoc, doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase";

self.onmessage = ({ data }) => {
    const { type, roomID, uid, displayName } = data;
    switch (type) {
        case 0:
            const docRef = doc(db, roomID, "details");
            getDoc(docRef).then((snapshot) => {
                if (snapshot.exists()) {
                    sendRequest({ roomID, displayName, uid });
                } else {
                    self.postMessage({ type: 2 });
                }
            });
            break;
        case 1:
            sendRequest({ roomID, displayName, uid });
            break;
        default:
            break;
    }
};

const sendRequest = async ({ roomID, displayName, uid }: { roomID: string, displayName: string, uid: string }) => {
    const docs = doc(db, roomID, "request");
    await setDoc(docs, { displayName: displayName, uid: uid, status: null, waiting: false });
    const timeout = setTimeout(() => {
        self.postMessage({ type: 4 });
        unsubscribe();
        deleteDoc(docs);
    }, 2000);
    const unsubscribe = onSnapshot(docs, (snapshot: DocumentData) => {
        const { status, waiting } = snapshot.data();
        timeout;
        if (waiting) {
            clearTimeout(timeout);
        }
        if (status == null) return;
        unsubscribe();
        if (status) {
            self.postMessage({ type: 3, roomId: roomID });
        } else {
            self.postMessage({ type: 5 });
        }
    });
}