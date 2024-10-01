import { useEffect, useRef, useState } from "react";
import { deleteDoc, doc, getDoc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import '../styles/Requests.css';

export const Request = ({ uid }: { uid: string }) => {
    const stream = useRef<MediaStream | null>(null);
    const [req, setReq] = useState<{
        displayName: string,
        uid: string,
        status: boolean,
    } | null>(null);

    const rejectReq = async () => {
        setReq(null);
        await updateDoc(doc(db, uid, "request"), { status: false });
    }

    useEffect(() => {
        const docRef = doc(db, uid, "request");
        const unsubscribe = onSnapshot(docRef, async snapshot => {
            const data = snapshot.data();
            if (data?.waiting === false) {
                if (req) {
                    rejectReq();
                    return;
                }
                await updateDoc(docRef, { waiting: true });
                await deleteDoc(doc(db, uid, "offer"));
                await deleteDoc(doc(db, uid, "answer"));
                await deleteDoc(doc(db, uid, "candidate"));
                await deleteDoc(doc(db, uid, "candidate1"));
                setReq({
                    displayName: data.displayName,
                    uid: data.uid,
                    status: data.status
                });
            }
        });

        return () => {
            unsubscribe();
        }
    }, [req])

    useEffect(() => {
        if (req?.status !== true || !stream.current) return;
        const peerConnection = new RTCPeerConnection();

        const sender = peerConnection.addTrack(stream.current.getVideoTracks()[0], stream.current);

        // get the current parameters first
        const params = sender.getParameters();

        if (!params.encodings) params.encodings = [{}]; // Firefox workaround!
        params.encodings[0].maxBitrate = 100000000; // 1 Mbps
        sender.setParameters(params);

        const unsubscribeCandidate = onSnapshot(doc(db, uid, "candidate1"), async snapshot => {
            const data = snapshot.data();
            if (data) {
                await peerConnection.addIceCandidate(data.candidate);
            }
        });

        const unsubscribeOffer = onSnapshot(doc(db, uid, "offer"), async snapshot => {
            const data = snapshot.data();
            if (data) {
                await peerConnection.setRemoteDescription(data.offer);
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);
                await setDoc(doc(db, uid, "answer"), { answer });
            }
        });

        peerConnection.onicecandidate = async ({ candidate }) => {
            if (candidate) {
                await setDoc(doc(db, uid, "candidate"), { candidate: candidate.toJSON() });
            }
        };
        peerConnection.onconnectionstatechange = () => {
            const { connectionState } = peerConnection || {};
            if (connectionState === "connected") {
                const docRef = doc(db, uid, "users");
                getDoc(docRef).then(snapshot => {
                    if (snapshot.exists()) {
                        updateDoc(docRef, { [req.uid]: [req.displayName] });
                    } else {
                        setDoc(docRef, { [req.uid]: [req.displayName] });
                    }
                });
            }
        }

        return () => {
            peerConnection.close();
            stream.current?.getTracks().forEach(track => track.stop());
            stream.current = null;
            unsubscribeCandidate();
            unsubscribeOffer();
        };
    }, [req])

    const acceptReq = async () => {
        try {
            const localStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    width: 1280,
                    height: 720,
                    frameRate: 60,
                    displaySurface: "monitor",
                },
                audio: false,
            })
            stream.current = localStream;
            await updateDoc(doc(db, uid, "request"), { status: true });
            setReq(req => req ? { ...req, status: true } : null);
        } catch (error) {
            rejectReq();
            alert("Error accessing screen: " + error);
        }
    }

    if (!req) return null;

    return (
        <section className="req_sec">
            <div className="transparent_bg"></div>
            {!req.status ?
                <div className="request_card">
                    <div className="mainAnimatedDiv">
                        <div className="animated_child_1"></div>
                        <div className="animated_child_2"></div>
                    </div>
                    <div className="profile">
                        <img src={`https://ui-avatars.com/api/?name=${req.displayName}&background=random`} alt={req.displayName} />
                    </div>
                    <h1>{req.displayName}</h1>
                    <span>{req.uid.slice(0, 3) + "-" + req.uid.slice(3)}</span>
                    <div className="req_btnContainer">
                        <button onClick={rejectReq} className="rejectReq">Reject <Timer rejectReq={rejectReq} /></button>
                        <button onClick={acceptReq} className="acceptReq">Share</button>
                    </div>
                </div>
                :
                <h1 className="sharing_title">Sharing Screen with {req.displayName}</h1>
            }
        </section>
    );
}


export const Timer = ({ rejectReq }: { rejectReq: () => void }) => {
    const timeRef = useRef<NodeJS.Timeout>();
    const [timer, setTimer] = useState<number>(30);

    useEffect(() => {
        if (timer === null) return;
        const timeInterval = setTimeout(() => timer > 0 ? setTimer(timer - 1) : rejectReq(), 1000);
        timeRef.current = timeInterval;
        return () => {
            clearTimeout(timeRef.current);
            timeRef.current = undefined;
        }
    }, [timer]);

    return <span>
        {timer}
    </span>
}