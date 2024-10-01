import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import '../styles/Room.css';

export default function Room() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const roomId = useSearchParams()[0].get("id");
    const codecPreferences = useRef<HTMLSelectElement>(null);
    const [toggleSidebar, setToggleSidebar] = useState(true);

    useEffect(() => {
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

        const unsubscribeCandidate = onSnapshot(doc(db, roomId, "candidate"), async snapshot => {
            const data = snapshot.data();
            if (data) {
                console.log("received candidate");
                await peerConnection.addIceCandidate(data.candidate);
            }
        });

        const unsubscribeAnswere = onSnapshot(doc(db, roomId, "answer"), async snapshot => {
            const data = snapshot.data();
            if (data) {
                console.log("received answer");
                await peerConnection.setRemoteDescription(data.answer);
            }
        });

        const peerConnection = new RTCPeerConnection();

        peerConnection.ontrack = async (e) => {
            if (videoRef.current) {
                const videoTrack = e.track;
                videoTrack.applyConstraints({ frameRate: { min: 60, max: 60 } });
                videoRef.current.srcObject = new MediaStream([videoTrack]);
            }
        };

        peerConnection.onicecandidate = async ({ candidate }) => {
            if (candidate) {
                console.log("sending candidate");
                await setDoc(doc(db, roomId, "candidate1"), { candidate: candidate.toJSON() });
            }
        };

        const createOffer = async () => {
            const offer = await peerConnection.createOffer({ offerToReceiveVideo: true })
            await peerConnection.setLocalDescription(offer);
            console.log("sending offer");
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
                createOffer();
            }
        }

        return () => {
            peerConnection.close();
            unsubscribeAnswere();
            unsubscribeCandidate();
        };
    }, []);


    return (
        <section className="screenAccessSection">
            <video id="video" playsInline autoPlay ref={videoRef} />
            <div className={`sidebarContainer ${toggleSidebar && "hide"}`}>
                <div className="sidebarToggle" onClick={() => setToggleSidebar(prev => !prev)}></div>
                <div className="sidebar">
                    <select ref={codecPreferences}>
                        <option>Choose Codec</option>
                    </select>
                </div>
            </div>
        </section>
    );
};