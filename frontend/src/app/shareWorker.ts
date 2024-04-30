import { deleteDoc, doc, getDoc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

self.onmessage = ({ data }) => {
    const { type } = data;
    const { uid = null } = data;
    switch (type) {
        case 0:
            updateDoc(doc(db, uid, "request"), { status: true });
            handleSnapshots(uid);
            break;
        case 1:
            const { offer } = data;
            const docOfferRef = doc(db, uid, "offer");
            setDoc(docOfferRef, {
                offer: { type: offer.type, sdp: offer.sdp }
            });
            break;
        case 2:
            const { ID, name } = data;
            const docRef = doc(db, uid, "users");
            getDoc(docRef).then(snapshot => {
                if (snapshot.exists()) {
                    updateDoc(docRef, { [ID]: [name] });
                } else {
                    setDoc(docRef, { [ID]: [name] });
                }
            });
            break;
        case 3:
            deleteDoc(doc(db, uid, "request"));
            break;
        default:
            break;
    }
}

const handleSnapshots = (uid: string) => {
    const docAnswerRef = doc(db, uid, "answer");
    const docCandidateRef = doc(db, uid, "candidate");

    const unsubscribeAnswere = onSnapshot(docAnswerRef, snapshot => {
        const data = snapshot.data();
        if (!data) return;
        self.postMessage({ type: 10, answer: data.answer });
        unsubscribeAnswere();
        deleteDoc(docAnswerRef);
    });

    const unsubscribeIceCandidate = onSnapshot(docCandidateRef, snapshot => {
        const data = snapshot.data();
        if (!data) return;
        self.postMessage({ type: 11, candidate: data.candidate });
        unsubscribeIceCandidate();
        deleteDoc(docCandidateRef);
    });

}