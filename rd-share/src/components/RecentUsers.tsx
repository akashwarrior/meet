import { DocumentData } from "firebase/firestore";
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";

export const RecentUsers = ({ users, uid, name }: { users: DocumentData[], uid: string, name: string }) => {
    const navigation = useNavigate();
    const [worker, setWorker] = useState<Worker | null>(null);

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
                    alert("User is offline.");
                    break;
                case 5:
                    alert("User declined your request.");
                    break;

            }
        };
        return () => {
            webWoker.terminate();
            worker?.terminate();
        }
    }, []);

    const handleClick = ({ roomID }: { roomID: string }) => {
        worker?.postMessage({ type: 1, roomID, displayName: name, uid });
    }

    return (
        <section className="recent_section">
            {users.map((user: DocumentData) => (
                <RecentUsersSkeleton key={user.uid} displayName={user.displayName} handleClick={() => { handleClick({ roomID: user.uid }) }} />
            ))}
        </section>
    );
};

export const RecentUsersSkeleton = ({ displayName, handleClick }: { displayName: string, handleClick: any }) => {
    return (
        <div className="avatar_container">
            <div className="recent_mainAnimatedDiv">
                <div className="recent_div1"></div>
                <div className="recent_div2"></div>
            </div>
            <img src={`https://ui-avatars.com/api/?name=${displayName}&background=random`} alt={displayName} className="avatar" />
            <p className="text-sm font-semibold">{displayName}</p>
            <button onClick={handleClick} className="avatarBtn">Connect</button>
        </div>
    );
}