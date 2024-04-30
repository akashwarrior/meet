import { useEffect, useRef } from "react";

export const Room = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const roomId = window.location.search.split("=").pop();

    useEffect(() => {
        if (!roomId) return;
        const worker = new Worker(new URL('../app/roomWorker.ts', import.meta.url), { type: "module" });

        worker.postMessage({ type: 0, data: null, roomId });
        const peerConnection = new RTCPeerConnection();

        worker.onmessage = async ({ data }) => {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data));
            const answer = await peerConnection.createAnswer();
            worker.postMessage({ type: 1, data: answer, roomId });
            await peerConnection.setLocalDescription(answer);
        }

        peerConnection.ontrack = ({ streams }) => {
            if (videoRef.current) {
                const [remoteStream] = streams;
                videoRef.current.srcObject = remoteStream;
            }
        };

        peerConnection.onicecandidate = async ({ candidate }) => {
            if (candidate) {
                worker.postMessage({ type: 2, data: candidate.toJSON(), roomId });
            }
        }

        peerConnection.onconnectionstatechange = () => {
            const { connectionState } = peerConnection || {};
            if (connectionState === "disconnected" || connectionState === "failed" || connectionState === "closed" || connectionState === "connected") {
                worker.terminate();
            }
        };

        return () => {
            peerConnection.close();
            worker.terminate();
        };
    }, []);


    return (
        <div>
            <video id="vdieo" playsInline autoPlay ref={videoRef} />
        </div>
    );
};