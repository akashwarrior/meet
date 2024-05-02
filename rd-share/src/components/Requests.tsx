import { useEffect, useRef, useState } from "react";
import '../styles/Requests.css';

export const Request = ({ name, reqUID, rejectReq, ownUID }: { name: string, reqUID: string, rejectReq: any, ownUID: string }) => {
    const timeRef = useRef<NodeJS.Timeout>();
    const [timer, setTimer] = useState<string | null>('30');
    const [worker, setWorker] = useState<Worker | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        clearTimer();
        const webWorker = new Worker(new URL('../app/peerSenderWorker.ts', import.meta.url), { type: "module" });
        setWorker(webWorker);
        clearTimer();
        return () => {
            clearInterval(timeRef.current);
            timeRef.current = undefined;
            webWorker.terminate();
            worker?.terminate();
        }
    }, []);

    useEffect(() => {
        if (timer || !worker || !stream) return;
        const peerConnection = new RTCPeerConnection();
        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

        peerConnection.createOffer()
            .then(offer => {
                peerConnection.setLocalDescription(offer);
                worker.postMessage({ type: 1, uid: ownUID, offer });
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
                worker?.postMessage({ type: 2, ID: reqUID, name, uid: ownUID });
            } else if (connectionState === "disconnected" || connectionState === "failed") {
                worker?.postMessage({ type: 3, uid: ownUID });
            }
        }

        return () => {
            peerConnection.close();
            worker.terminate();
        };
    }, [timer])

    const acceptReq = () => {
        worker?.postMessage({ type: 0, uid: ownUID });
        navigator.mediaDevices.getDisplayMedia({
            video: {
                width: 1280,
                height: 720,
                frameRate: 60,
                displaySurface: 'monitor',
            },
            audio: false,
        }).then(localStream => {
            clearInterval(timeRef.current);
            timeRef.current = undefined;
            setStream(localStream)
            setTimer(null);
        }).catch(error => {
            rejectReq();
            alert("Error accessing screen: " + error);
        });
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
        <section className="req_sec">
            <div className="transparent_bg"></div>
            {timer ?
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
                <h1 className="sharing">Sharing Screen with {name}</h1>
            }
        </section>
    );
}