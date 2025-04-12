'use client'

import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { db } from "../lib/firebase";
import { usePathname } from "next/navigation";

export function Room() {
    const pathName = usePathname();
    const videoRef = useRef<HTMLVideoElement>(null);
    const codecPreferences = useRef<HTMLSelectElement>(null);
    const [toggleSidebar, setToggleSidebar] = useState<boolean>(true);

    useEffect(() => {
        const roomId = pathName.split('/').pop() ?? null;
        if (!roomId) return;

        const codecs = RTCRtpSender.getCapabilities('video')?.codecs ?? [];
        codecs.forEach(codec => {
            if (['video/red', 'video/ulpfec', 'video/rtx'].includes(codec.mimeType)) {
                return;
            }
            const option = document.createElement('option');
            option.value = (codec.mimeType + ' ' + (codec.sdpFmtpLine || '')).trim();
            option.innerText = option.value;
            codecPreferences.current?.appendChild(option);
        });

        const unsubscribeCandidate = onSnapshot(doc(db, roomId, "sendersCandidate"), async snapshot => {
            const data = snapshot.data();
            if (data) {
                await peerConnection.addIceCandidate(data.candidate);
            }
        });

        const unsubscribeAnswere = onSnapshot(doc(db, roomId, "answer"), async snapshot => {
            const data = snapshot.data();
            if (data) {
                await peerConnection.setRemoteDescription(data.answer);
            }
        });

        const peerConnection = new RTCPeerConnection();

        peerConnection.ontrack = async (e) => {
            if (videoRef.current) {
                const videoTrack = e.track;
                videoRef.current.srcObject = new MediaStream([videoTrack]);
            }
        };

        peerConnection.onicecandidate = async ({ candidate }) => {
            if (candidate) {
                await setDoc(doc(db, roomId, "candidate"), { candidate: candidate.toJSON() });
            }
        };

        const createOffer = async () => {
            const offer = await peerConnection.createOffer({ offerToReceiveVideo: true })
            await peerConnection.setLocalDescription(offer);
            await setDoc(doc(db, roomId, "offer"), { offer });
        };

        createOffer();

        if (!codecPreferences.current) return;
        codecPreferences.current.onchange = async () => {
            if (!codecPreferences.current) return;
            const preferredCodec = codecPreferences.current.options[codecPreferences.current.selectedIndex];
            if (preferredCodec.value !== '') {
                const [mimeType, sdpFmtpLine] = preferredCodec.value.split(' ');
                const selectedCodecIndex = codecs.findIndex(c => c.mimeType === mimeType && c.sdpFmtpLine === sdpFmtpLine);
                const selectedCodec = codecs[selectedCodecIndex];
                codecs.splice(selectedCodecIndex, 1);
                codecs.unshift(selectedCodec);

                peerConnection.getTransceivers().forEach(transceiver => {
                    transceiver.setCodecPreferences(codecs);
                });
                await createOffer();
            }
        }

        return () => {
            peerConnection.close();
            unsubscribeAnswere();
            unsubscribeCandidate();
        };
    }, [pathName]);


    return (
        <section className="bg-black w-screen h-screen flex items-center justify-center">

            <video className="top-0 left-0 w-full h-full m-auto" playsInline autoPlay ref={videoRef} />

            <div className={`absolute w-fit pl-7 h-full flex items-center justify-center top-0 transition-[right] duration-[0.25s] ${toggleSidebar ? "right-[-320px]" : "right-0"}`}>
                <div
                    className="absolute left-0 w-12 h-12 rounded-full cursor-pointer z-10 bg-[#1a1a1aae] after:content-['\2039'] after:text-4xl after:absolute after:top-[40%] after:left-[35%] hover:text-white hover:bg-[#1a1a1a] after:translate-x-[-50%] after:translate-y-[-50%] "
                    onClick={() => setToggleSidebar(prev => !prev)}>
                </div>

                <div className="w-80 h-full bg-[#1a1a1a] flex flex-col items-center p-5 pt-12 z-10">
                    <select className="w-full p-2.5 bg-[#1a1a1a] text-white border border-white rounded-sm cursor-pointer" ref={codecPreferences}>
                        <option className="bg-[#1a1a1a] text-white" >Choose Codec</option>
                    </select>
                </div>
            </div>

        </section>
    )
}