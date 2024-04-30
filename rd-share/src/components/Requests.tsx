import { useEffect, useRef, useState } from "react";

export const Request = ({ name, reqUID, rejectReq, ownUID }: { name: string, reqUID: string, rejectReq: any, ownUID: string }) => {
    const timeRef = useRef<NodeJS.Timeout>();
    const peerConnectionref = useRef<RTCPeerConnection>(new RTCPeerConnection());
    const [timer, setTimer] = useState<string | null>('30');
    const [worker, setWorker] = useState<Worker | null>(null);

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
    }, [])

    useEffect(() => {
        if (timer || !worker) return;

        peerConnectionref.current.createOffer()
            .then(offer => {
                peerConnectionref.current.setLocalDescription(offer);
                worker.postMessage({ type: 1, uid: ownUID, offer });
            });

        worker.onmessage = ({ data }) => {
            const { type } = data;
            switch (type) {
                case 10:
                    const { answer } = data;
                    peerConnectionref.current.setRemoteDescription(new RTCSessionDescription(answer));
                    break;
                case 11:
                    const { candidate } = data;
                    peerConnectionref.current.addIceCandidate(new RTCIceCandidate(candidate));
                    break;
            }
        }

        peerConnectionref.current.onconnectionstatechange = () => {
            const { connectionState } = peerConnectionref.current || {};
            if (connectionState === "connected") {
                worker?.postMessage({ type: 2, ID: reqUID, name, uid: ownUID });
            } else if (connectionState === "disconnected" || connectionState === "failed") {
                worker?.postMessage({ type: 3, uid: ownUID });
            }
        }

        return () => {
            peerConnectionref.current.close();
            worker.terminate();
        };
    }, [timer])

    const acceptReq = async () => {
        worker?.postMessage({ type: 0, uid: ownUID });
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
            clearInterval(timeRef.current);
            timeRef.current = undefined;
            stream.getTracks().forEach(track => peerConnectionref.current.addTrack(track, stream));
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
                        <img src={`https://ui-avatars.com/api/?name=${name}&background=random`} alt={name} className="avatar" />
                    </div>
                    <h1>{name}</h1>
                    <span>{reqUID}</span>
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