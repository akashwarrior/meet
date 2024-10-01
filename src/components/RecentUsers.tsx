import { DocumentData, deleteDoc, doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import '../styles/RecentUsers.css';

export const useRecentUsers = (uid: string) => {
    const [users, setUsers] = useState<DocumentData[]>([]);

    useEffect(() => {
        getDoc(doc(db, uid, "users")).then((doc) => {
            if (doc.exists()) {
                const map = doc.data();
                for (const key in map) {
                    setUsers((prev) => [...prev, { uid: key, displayName: map[key] }]);
                }
            }
        });
    }, []);

    return users;
}

export const RecentUsers = ({ uid, name }: { uid: string, name: string }) => {
    const navigation = useNavigate();
    const users = useRecentUsers(uid);
    const [connecting, setConnecting] = useState<boolean>(false);

    const handleClick = async (roomId: string) => {
        if (connecting) return;

        setConnecting(true);
        const docs = doc(db, roomId, "request");
        await setDoc(docs, { displayName: name, uid, status: null, waiting: false });
        const timeout = setTimeout(() => {
            setConnecting(false);
            alert("User is offline.");
            unsubscribe();
            deleteDoc(docs);
        }, 3000);
        const unsubscribe = onSnapshot(docs, (snapshot: DocumentData) => {
            const { status, waiting } = snapshot.data();
            timeout;
            if (waiting) {
                clearTimeout(timeout);
            }
            if (status == null) return;
            unsubscribe();

            if (status) {
                deleteDoc(docs);
                navigation('/room?id=' + roomId);
            } else {
                setConnecting(false);
                alert("User declined your request.");
            }
        });
    }

    return (
        <section className="recent_section">
            {users.map((user: DocumentData) => (
                <RecentUsersSkeleton
                    key={user.uid}
                    displayName={user.displayName}
                    handleClick={() => handleClick(user.uid)}
                    isConnecting={connecting}
                />
            ))}
        </section>
    );
};

const RecentUsersSkeleton = ({ displayName, handleClick, isConnecting }
    : { displayName: string, handleClick: () => void, isConnecting: boolean }) => {

    const [connecting, setConnecting] = useState<boolean>(false);

    const handleConnect = () => {
        if (isConnecting || connecting) {
            alert("Connecting...");
            return;
        }
        setConnecting(true);
        handleClick();
    }

    useEffect(() => {
        if (!isConnecting) setConnecting(false);
    }, [isConnecting]);

    return (
        <div className="avatar_container">
            <div className="recent_mainAnimatedDiv">
                <div className="recent_div1"></div>
                <div className="recent_div2"></div>
            </div>
            <img className="avatar" src={`https://ui-avatars.com/api/?name=${displayName}&background=random`} alt={displayName} />
            <p className="text-sm font-semibold">{displayName}</p>
            <button onClick={handleConnect} className="avatarBtn">{connecting && isConnecting ? <span className="loader"></span> : "Connect"}</button>
        </div>
    );
}