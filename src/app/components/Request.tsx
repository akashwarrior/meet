'use client'

import { deleteDoc, doc, getDoc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";
import { db } from "../lib/firebase";
import { Timer } from "./Timer";

export function Request({ uid }: { uid: string }) {
    const stream = useRef<MediaStream | null>(null);
    const [req, setReq] = useState<{
        displayName: string,
        uid: string,
        status: boolean,
    } | null>(null);

    const rejectReq = useCallback(async () => {
        setReq(null);
        await updateDoc(doc(db, uid, "request"), { status: false });
    }, [uid]);

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
                await deleteDoc(doc(db, uid, "sendersCandidate"));
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
    }, [req, uid, rejectReq])

    useEffect(() => {
        if (req?.status !== true || !stream.current) return;
        const peerConnection = new RTCPeerConnection();

        stream.current.getTracks().forEach(track => peerConnection.addTrack(track, stream.current as MediaStream));

        const unsubscribeCandidate = onSnapshot(doc(db, uid, "candidate"), async snapshot => {
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
                await setDoc(doc(db, uid, "sendersCandidate"), { candidate: candidate.toJSON() });
            }
        };

        peerConnection.onconnectionstatechange = () => {
            const { connectionState } = peerConnection || {};
            if (connectionState === "connected") {
                const docRef = doc(db, uid, "users");
                getDoc(docRef).then(snapshot => {
                    if (snapshot.exists()) {
                        updateDoc(docRef, { [req.uid]: req.displayName });
                    } else {
                        setDoc(docRef, { [req.uid]: req.displayName });
                    }
                });
            } else if (connectionState === 'disconnected') {
                rejectReq();
            } else if (connectionState === "closed") {
                stream.current?.getTracks().forEach(track => track.stop());
                stream.current = null;
                setReq(null);
            }
        }

        return () => {
            peerConnection.close();
            stream.current?.getTracks().forEach(track => track.stop());
            stream.current = null;
            unsubscribeCandidate();
            unsubscribeOffer();
        };
    }, [req, uid, rejectReq]);

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
        <section className="absolute w-full flex items-center justify-center h-screen bg-transparent z-50 overflow-hidden">
            <div className="absolute w-full h-full z-10 bg-[#0a0a0a] opacity-80"></div>
            {!req.status ?
                <div className="z-20 relative w-96 h-fit flex flex-col items-center py-10 bg-black rounded-xl drop-shadow-xs" key={req.uid}>
                    <div className="opacity-80 absolute w-full h-full overflow-visible top-0 left-0 z-10 animate-spin-slow">
                        <div className="absolute top-[40%] left-0 bg-[#3291ff] h-72 w-72 rounded-full blur-[300px]"></div>
                        <div className="absolute top-0 right-0 bg-[#79ffe1] h-72 w-72 rounded-full blur-[300px]"></div>
                    </div>
                    <div className="flex items-center justify-center w-36 h-36 mb-6">
                        <img
                            className="w-full h-full rounded-full"
                            src={`https://ui-avatars.com/api/?name=${req.displayName}&background=random`}
                            alt={req.displayName}
                        />
                    </div>
                    <h1>{req.displayName}</h1>
                    <span>{req.uid.slice(0, 3) + "-" + req.uid.slice(3)}</span>
                    <div className="flex w-4/5 justify-around items-center flex-1 mt-10">
                        <button
                            onClick={rejectReq}
                            className="bg-[#dd3d3d] text-white border-none w-[45%] py-2.5 px-5 rounded-md mr-2.5 h-10 cursor-pointer font-semibold z-50 hover:bg-[#ff4d4d] active:bg-[#c0392b]"
                        >
                            Reject {' '}
                            <Timer rejectReq={rejectReq} time={30} />
                        </button>
                        <button
                            onClick={acceptReq}
                            className="bg-[#36bd36] text-white border-none w-[45%] py-2.5 px-5 rounded-md mr-2.5 h-10 cursor-pointer font-semibold z-50 hover:bg-[#2ecc71] active:bg-[#27ae60]"
                        >
                            Share
                        </button>
                    </div>
                </div>
                :
                <h1 className="text-xl font-semibold m-auto z-30">Sharing Screen with {req.displayName}</h1>
            }
        </section>
    )
}