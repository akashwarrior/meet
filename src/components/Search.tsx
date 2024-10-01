import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { userAtom } from "../store/atoms";
import { DocumentData, deleteDoc, doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import '../styles/Search.css';

export const Search = ({ onHide }: { onHide: () => void }) => {
    const navigation = useNavigate();
    const user = useRecoilValue<{
        displayName: string,
        uid: string
    } | null>(userAtom);
    const searchInpt = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const handleKeyPress = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            onHide();
        } else if (event.key === 'Enter') {
            event.preventDefault();
            handleSearch();
        }
    }, []);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyPress);
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        }
    }, []);

    const handleSearch = () => {
        if (!user) return;
        const value = searchInpt.current?.value;
        if (!value || value.length < 6) {
            alert("ID is not valid");
            return;
        }

        setLoading(true);
        let res = '';
        for (let i = 0; i < value.length; i++) {
            if (value[i] === '-' || value[i] === '+') {
                continue;
            }
            res += value[i];
        }
        if (res === user.uid) {
            setLoading(false);
            alert("You can't connect with yourself.");
            return;
        }
        sendRequest(res);
    };


    const sendRequest = async (res: string) => {
        if (!user) return;
        const docRef = doc(db, res, "details");
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
            const docs = doc(db, res, "request");
            await setDoc(docs, { displayName: user.displayName, uid: user.uid, status: null, waiting: false });
            const timeout = setTimeout(async () => {
                unsubscribe();
                await deleteDoc(docs);
                setLoading(false);
                alert("User is offline.");
            }, 3000);
            const unsubscribe = onSnapshot(docs, (snapshot: DocumentData) => {
                const { status, waiting } = snapshot.data();
                if (waiting) {
                    clearTimeout(timeout);
                }
                if (status == null) return;
                unsubscribe();
                if (status) {
                    navigation('/room?id=' + res);
                } else {
                    setLoading(false);
                    alert("User declined your request.");
                }
            });
        } else {
            setLoading(false);
            alert("User not found.");
        }
    }

    return (
        <section className="searchSec">
            <span className="searchSec_bg"></span>
            <div>
                <input
                    type="number"
                    ref={searchInpt}
                    placeholder="Enter User ID..."
                    autoFocus
                    {...loading && { disabled: true }}
                />
                <button onClick={onHide}>Esc</button>
            </div>
            {loading && <span className="loading" >Loading...</span>}
        </section >
    );
};