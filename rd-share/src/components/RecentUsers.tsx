import { DocumentData } from "firebase/firestore";
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import '../styles/RecentUsers.css';

export const RecentUsers = ({ users, uid, name }: { users: DocumentData[], uid: string, name: string }) => {
    const navigation = useNavigate();
    const [worker, setWorker] = useState<Worker | null>(null);
    const [connecting, setConnecting] = useState<boolean>(false);

    useEffect(() => {
        const webWoker = new Worker(new URL('../app/peerRequestingWoker.ts', import.meta.url), { type: 'module' });
        setWorker(webWoker);
        webWoker.onmessage = ({ data }) => {
            const { type } = data;
            switch (type) {
                case 3:
                    const { roomId } = data;
                    navigation('/room?id=' + roomId);
                    break;
                case 4:
                    setConnecting(false);
                    alert("User is offline.");
                    break;
                case 5:
                    setConnecting(false);
                    alert("User declined your request.");
                    break;
                default:
                    break;
            }
        };
        return () => {
            webWoker.terminate();
            worker?.terminate();
        }
    }, []);

    const handleClick = ({ roomID }: { roomID: string }) => {
        if (connecting) return;
        setConnecting(true);
        worker?.postMessage({ type: 1, roomID, displayName: name, uid });
    }

    return (
        <section className="recent_section">
            {users.map((user: DocumentData) => (
                <RecentUsersSkeleton
                    key={user.uid}
                    displayName={user.displayName}
                    handleClick={() => handleClick({ roomID: user.uid })}
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