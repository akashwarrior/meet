import { DocumentData, deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import '../styles/RecentUsers.css';

export const RecentUsers = ({ users, uid, name }: { users: DocumentData[], uid: string, name: string }) => {
    const navigation = useNavigate();
    const [connecting, setConnecting] = useState<boolean>(false);

    const handleClick = async (roomId: string) => {
        if (connecting) return;

        setConnecting(true);
        const docs = doc(db, roomId, "request");
        await setDoc(docs, { displayName: name, uid: uid, status: null, waiting: false });
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

export const RecentUsersSkeleton = ({ displayName, handleClick, isConnecting }
    : { displayName: string, handleClick: any, isConnecting: boolean }) => {
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