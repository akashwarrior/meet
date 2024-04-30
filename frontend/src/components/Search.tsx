import { useEffect, useRef } from "react";
import { db } from "../firebase";
import { DocumentData, deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export const Search = ({ onHide, displayName, uid }: { onHide: any, displayName: string, uid: string }) => {
    const navigation = useNavigate();
    const searchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, []);

    const handleKeyPress = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            onHide();
        } else if (event.key === 'Enter') {
            event.preventDefault();
            handleSearch();
        }
    };

    const handleSearch = async () => {
        if (!searchRef.current) return;
        const result = searchRef.current.value;
        const docRef = doc(db, result, "details");
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
            const docs = doc(db, result, "request");
            await setDoc(docs, { displayName: displayName, uid: uid, status: null, waiting: false });
            const timeout = setTimeout(() => {
                alert("User is offline.");
                unsubscribe();
                deleteDoc(docs);
            }, 2000);
            const unsubscribe = onSnapshot(docs, (snapshot: DocumentData) => {
                const { status, waiting } = snapshot.data();
                timeout;
                if (waiting == true) {
                    clearTimeout(timeout);
                }
                if (status == null) return;
                unsubscribe();
                if (status == true) {
                    onHide();
                    navigation(`/room?id=${result}`);
                } else {
                    alert("User declined your request.");
                }
            });
        } else {
            alert("User not found.");
        }
    };


    return (
        <section className="searchSec">
            <span className="searchSec_bg"></span>
            <div>
                <input type="search" ref={searchRef} placeholder="Enter User ID..." autoFocus />
                <button onClick={onHide}>Esc</button>
            </div>
        </section >
    );
};