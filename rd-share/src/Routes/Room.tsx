import { useEffect, useRef } from "react";
import '../styles/Room.css';

export const Room = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const roomId = window.location.search.split("=").pop();

    useEffect(() => {
        if (!roomId) return;
        const worker = new Worker(new URL('../app/peerReceiverWorker.ts', import.meta.url), { type: "module" });

        worker.postMessage({ type: 0, data: null, roomId });
        const peerConnection = new RTCPeerConnection();

        worker.onmessage = ({ data }) => {
            peerConnection.setRemoteDescription(new RTCSessionDescription(data));
            peerConnection.createAnswer().then(answer => {
                peerConnection.setLocalDescription(answer);
                worker.postMessage({ type: 1, data: answer, roomId });
            })
        }

        peerConnection.ontrack = ({ streams }) => {
            if (videoRef.current) {
                videoRef.current.srcObject = streams[0];
            }
        };

        peerConnection.onicecandidate = async ({ candidate }) => {
            if (candidate) {
                worker.postMessage({ type: 2, data: candidate.toJSON(), roomId });
            }
        }

        return () => {
            peerConnection.close();
            worker.terminate();
        };
    }, []);


    return (
        <section className="screenAccessSection">
            <video id="vdieo" playsInline autoPlay ref={videoRef} />
        </section>
    );
};