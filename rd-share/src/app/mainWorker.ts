import { auth, db } from "../firebase";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";

self.onmessage = ({ data }) => {
    const { type } = data;
    switch (type) {
        case 0:
            auth.onAuthStateChanged((authUser) => {
                if (authUser) {
                    self.postMessage({
                        type: 11, data: {
                            displayName: authUser.displayName,
                            email: authUser.email,
                            uid: authUser.photoURL
                        }
                    });
                    subscribe(authUser.photoURL || "");
                    getDoc(doc(db, authUser.photoURL || "", "users")).then((doc) => {
                        if (doc.exists()) {
                            const data = doc.data();
                            self.postMessage({ type: 13, data: data });
                        }
                    });
                } else {
                    self.postMessage({ type: 10 });
                }
            });
            break;
        case 1:
            auth.signOut().then(() => {
                self.postMessage({ type: 10 });
            });
            break;
        case 2:
            const { uid } = data;
            updateDoc(doc(db, uid, "request"), { status: false });
            subscribe(uid);
            break;
        default:
            break;
    }


}

const subscribe = (uid: string) => {
    const docRef = doc(db, uid, "request");
    const unsubscribe = onSnapshot(docRef, snapshot => {
        const data = snapshot.data();
        if (data && !data.waiting) {
            unsubscribe();
            updateDoc(docRef, { waiting: true });
            self.postMessage({ type: 12, data: data });
        }
    });
}