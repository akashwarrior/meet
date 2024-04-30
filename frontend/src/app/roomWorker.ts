import { deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase";

self.onmessage = ({ data }) => {
    const { type, roomId } = data;
    switch (type) {
        case 0:
            const docOfferRef = doc(db, roomId, "offer");
            const unsubscribe = onSnapshot(docOfferRef, snapshot => {
                const { offer } = snapshot.data() || {};
                if (offer) {
                    self.postMessage(offer);
                    unsubscribe();
                    deleteDoc(docOfferRef);
                }
            });
            break;
        case 1:
            const answer = data.data;
            setDoc(doc(db, roomId, "answer"), { answer: { type: answer.type, sdp: answer.sdp } });
            break;
        case 2:
            const candidate = data.data;
            setDoc(doc(db, roomId, "candidate"), { candidate }).then(() => {
                self.close();
            })
            break;
        default:
            break;
    }
};