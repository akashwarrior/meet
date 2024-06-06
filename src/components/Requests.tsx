import { useEffect, useRef, useState } from "react";
import { doc, getDoc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import '../styles/Requests.css';

export const Request = ({ name, reqUID, rejectReq, ownUID }: { name: string, reqUID: string, rejectReq: () => void, ownUID: string }) => {
    const timeRef = useRef<NodeJS.Timeout>();
    const stream = useRef<MediaStream | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const [timer, setTimer] = useState<number | null>(30);

    useEffect(() => {
        if (timer === null) return;
        const timeInterval = setTimeout(() => {
            if (timer > 0) {
                setTimer(timer - 1);
            } else {
                rejectReq();
            }
        }, 1000);
        timeRef.current = timeInterval;
        return () => {
            clearTimeout(timeRef.current);
            timeRef.current = undefined;
        }
    }, [timer]);

    useEffect(() => {
        if (timer != null || !stream.current) return;

        peerConnectionRef.current = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        peerConnectionRef.current.addTrack(stream.current.getVideoTracks()[0]);

        const unsubscribeAnswere = onSnapshot(doc(db, ownUID, "answer"), snapshot => {
            const data = snapshot.data();
            if (data) {
                peerConnectionRef.current?.setRemoteDescription(data.answer);
            }
        });

        const docCandidateRef = doc(db, ownUID, "candidate");

        const unsubscribeCandidate = onSnapshot(docCandidateRef, async snapshot => {
            const data = snapshot.data();
            if (data?.sender === false) {
                await peerConnectionRef.current?.addIceCandidate(data.candidate);
            }
        });

        peerConnectionRef.current.onnegotiationneeded = async () => {
            const offer = await peerConnectionRef.current?.createOffer()
            await peerConnectionRef.current?.setLocalDescription(offer);
            if (offer) {
                setDoc(doc(db, ownUID, "offer"), { offer });
            }
        }

        peerConnectionRef.current.onicecandidate = ({ candidate }) => {
            if (candidate) {
                setDoc(docCandidateRef, {
                    sender: true,
                    candidate: candidate.toJSON()
                });
            }
        };

        peerConnectionRef.current.onconnectionstatechange = () => {
            const { connectionState } = peerConnectionRef.current || {};
            if (connectionState === "connected") {
                const docRef = doc(db, ownUID, "users");
                getDoc(docRef).then(snapshot => {
                    if (snapshot.exists()) {
                        updateDoc(docRef, { [reqUID]: [name] });
                    } else {
                        setDoc(docRef, { [reqUID]: [name] });
                    }
                });
            }
        }

        return () => {
            peerConnectionRef.current?.close();
            peerConnectionRef.current = null;
            stream.current?.getTracks().forEach(track => track.stop());
            stream.current = null;
            unsubscribeAnswere();
            unsubscribeCandidate();
        };
    }, [timer])

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
            await updateDoc(doc(db, ownUID, "request"), { status: true });
            clearInterval(timeRef.current);
            timeRef.current = undefined;
            stream.current = localStream;
            setTimer(null);
        } catch (error) {
            rejectReq();
            alert("Error accessing screen: " + error);
        }
    }

    return (
        <section className="req_sec">
            <div className="transparent_bg"></div>
            {timer !== null ?
                <div className="request_card">
                    <div className="mainAnimatedDiv">
                        <div className="animated_child_1"></div>
                        <div className="animated_child_2"></div>
                    </div>
                    <div className="profile">
                        <img src={`https://ui-avatars.com/api/?name=${name}&background=random`} alt={name} />
                    </div>
                    <h1>{name}</h1>
                    <span>{reqUID.slice(0, 3) + "-" + reqUID.slice(3)}</span>
                    <div className="req_btnContainer">
                        <button onClick={rejectReq} className="rejectReq">Reject {timer}</button>
                        <button onClick={acceptReq} className="acceptReq">Share</button>
                    </div>
                </div>
                :
                <h1 className="sharing_title">Sharing Screen with {name}</h1>
            }
        </section>
    );
}