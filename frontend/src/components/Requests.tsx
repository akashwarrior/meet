import { useEffect, useRef, useState } from "react";

export const Request = ({ name, ID, rejectReq, uid }: { name: string, ID: string, rejectReq: any, uid: string }) => {
    const timeRef = useRef<NodeJS.Timeout>();
    const streamRef = useRef<MediaStream>(new MediaStream());
    const [timer, setTimer] = useState<string | null>('30');
    const [worker, setWorker] = useState<Worker | null>(null);

    useEffect(() => {
        clearTimer();
        const webWorker = new Worker(new URL('../app/shareWorker.ts', import.meta.url), { type: "module" });
        setWorker(webWorker);
        clearTimer();
        return () => {
            clearInterval(timeRef.current);
            timeRef.current = undefined;
            webWorker.terminate();
        }
    }, [])

    useEffect(() => {
        if (timer || !worker) return;
        const peerConnection = new RTCPeerConnection();
        streamRef.current.getTracks().forEach(track => peerConnection.addTrack(track, streamRef.current));

        peerConnection.createOffer()
            .then(async offer => {
                worker.postMessage({ type: 1, uid, offer });
                peerConnection.setLocalDescription(offer);
            });

        worker.onmessage = ({ data }) => {
            const { type } = data;
            switch (type) {
                case 10:
                    const { answer } = data;
                    peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
                    break;
                case 11:
                    const { candidate } = data;
                    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                    break;
            }
        }

        peerConnection.onconnectionstatechange = () => {
            const { connectionState } = peerConnection || {};
            if (connectionState === "connected") {
                worker?.postMessage({ type: 2, ID, name, uid });
            } else if (connectionState === "disconnected" || connectionState === "failed") {
                worker?.postMessage({ type: 3, uid });
            }
        }

        return () => {
            peerConnection.close();
            streamRef.current.getTracks().forEach(track => track.stop());
            worker.terminate();
        };
    }, [timer])

    const acceptReq = async () => {
        worker?.postMessage({ type: 0, uid });
        navigator.mediaDevices.getDisplayMedia({
            video: {
                width: 1280,
                height: 720,
                frameRate: 60,
                displaySurface: 'monitor',
                autoGainControl: true,
            },
            audio: false,
        }).then(stream => {
            streamRef.current = stream
            clearInterval(timeRef.current);
            timeRef.current = undefined;
            setTimer(null);
        }).catch(error => alert("Error accessing screen: " + error));
    }

    const clearTimer = () => {
        clearInterval(timeRef.current);
        const date = getDeadTime();
        const timeInterval = setInterval(() => startTimer(date), 1000);
        timeRef.current = timeInterval;
    };


    const startTimer = (date: string) => {
        const total = Date.parse(date.toString()) - Date.parse(new Date().toString());
        const seconds = Math.floor((total / 1000) % 60);
        if (seconds >= 0) {
            setTimer(seconds.toString())
        } else {
            clearInterval(timeRef.current);
            timeRef.current = undefined;
            rejectReq();
        }
    };

    const getDeadTime = () => {
        let deadTime = new Date();
        deadTime.setSeconds(deadTime.getSeconds() + 30);
        return deadTime.toString();
    };

    return (
        timer ?
            <section className="req_sec">
                <div className="transparent"></div>
                <div className="request_card">
                    <div className="mainAnimatedDiv">
                        <div className="div1"></div>
                        <div className="div2"></div>
                    </div>
                    <div className="profile">
                        <div className="upper"></div>
                        <div className="lower"></div>
                    </div>
                    <h1>{name}</h1>
                    <span>{ID}</span>
                    <div className="req_btnContainer">
                        <button onClick={rejectReq} className="rejectReq">Reject {timer}</button>
                        <button onClick={acceptReq} className="acceptReq">Share</button>
                    </div>
                </div>
            </section>
            :
            <h1>Sharing Screen with {name}</h1>
    );
}