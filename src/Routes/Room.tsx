import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import '../styles/Room.css';

export default function Room() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const roomId = useSearchParams()[0].get("id");
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

    useEffect(() => {
        if (!roomId) return;

        peerConnectionRef.current = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        peerConnectionRef.current.ontrack = ({ track }) => {
            if (videoRef.current) {
                videoRef.current.srcObject = new MediaStream([track]);
            }
        };

        const unsubscribeOffer = onSnapshot(doc(db, roomId, "offer"), async snapshot => {
            const data = snapshot.data();
            if (data) {
                await peerConnectionRef.current?.setRemoteDescription(data.offer);
                const answer = await peerConnectionRef.current?.createAnswer()
                await peerConnectionRef.current?.setLocalDescription(answer);
                setDoc(doc(db, roomId, "answer"), { answer });
            }
        });

        const docCandidateRef = doc(db, roomId, "candidate");

        const unsubscribeCandidate = onSnapshot(docCandidateRef, async snapshot => {
            const data = snapshot.data();
            if (data?.sender === true) {
                await peerConnectionRef.current?.addIceCandidate(data.candidate);
            }
        });

        peerConnectionRef.current.onicecandidate = ({ candidate }) => {
            if (candidate) {
                setDoc(docCandidateRef, {
                    sender: false,
                    candidate: candidate.toJSON()
                });
            }
        };

        return () => {
            peerConnectionRef.current?.close();
            peerConnectionRef.current = null;
            unsubscribeOffer();
            unsubscribeCandidate();
        };
    }, []);


    return (
        <section className="screenAccessSection">
            <video id="video" playsInline autoPlay ref={videoRef} />
        </section>
    );
};