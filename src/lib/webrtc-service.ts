enum WebRTCEvents {
    "OFFER",
    "ANSWER",
    "ICE_CANDIDATE",
    "USER_JOINED",
    "USER_LEFT",
    "DATA_MESSAGE",
    "ERROR",
}

interface Message {
    type: WebRTCEvents;
    from: number;
    name?: string;
    to: number;
    data: any;
}

export interface Participant {
    id: number,
    name?: string,
    audio: MediaStreamTrack | null,
    video: MediaStreamTrack | null,
    screen: MediaStreamTrack | null,
}

export class WebRTCService {
    // Initialize with default STUN servers
    private readonly configuration = {
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" }
        ],
    };
    private peerConnection: Map<number, RTCPeerConnection>;
    private socket: WebSocket | null = null
    private stream: MediaStream | null = null;


    // Callbacks
    private onParticipantLeaveCallback: ((id: number) => void) | null = null
    private getMediaStreamCallback: ((id: number, stream: MediaStreamTrack | null) => void) | null = null
    private getParticipantsCallback: ((participants: Participant) => void) | null = null

    // Singleton instance
    private static instance: WebRTCService | null = null
    public static getInstance(): WebRTCService {
        if (!WebRTCService.instance) {
            WebRTCService.instance = new WebRTCService();
        }
        return WebRTCService.instance
    }


    // Private constructor to prevent instantiation
    private constructor() {
        this.peerConnection = new Map<number, RTCPeerConnection>();
    }

    // Connect to signaling server
    public async connect(roomId: string): Promise<void> {
        const serverUrl = process.env.NEXT_PUBLIC_SIGNALING_SERVER_URL || "ws://localhost:8080"

        return new Promise((resolve, reject) => {
            try {
                this.socket = new WebSocket(`${serverUrl}?roomId=${roomId}`)

                this.socket.onopen = () => {
                    console.log("Connected to signaling server")
                    this.getParticipants
                    resolve()
                }

                this.socket.onmessage = this.handleSignalingMessage.bind(this)

                this.socket.onerror = (error) => {
                    console.error("WebSocket error:", error);
                    reject(error)
                }

                this.socket.onclose = () => {
                    console.log("WebSocket connection closed")
                }
            } catch (error) {
                console.error("Error connecting to signaling server:", error)
                reject(error)
            }
        })
    }

    public getMediaStreams(callback: (id: number, stream: MediaStreamTrack | null) => void): void {
        this.getMediaStreamCallback = callback;
    }

    public async sendMediaStream(): Promise<MediaStream | null> {
        this.stopMediaStream();
        console.log("Sending stream...")

        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "user",
                width: { ideal: 1280, max: 1920 },
                height: { ideal: 720, max: 1080 },
                frameRate: { ideal: 30, max: 60 },
            },
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: false,
            }
        });

        const videoTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];

        for (const [, pc] of this.peerConnection) {
            let videoTransceiver = pc.getTransceivers().find(t => t.sender.track?.kind === 'video');
            if (!videoTransceiver) {
                videoTransceiver = pc.addTransceiver('video', { direction: 'sendrecv' });
            }
            let audioTransceiver = pc.getTransceivers().find(t => t.sender.track?.kind === 'audio');
            if (!audioTransceiver) {
                audioTransceiver = pc.addTransceiver('audio', { direction: 'sendrecv' });
            }
            await videoTransceiver.sender.replaceTrack(videoTrack);
            await audioTransceiver.sender.replaceTrack(audioTrack);
        }

        this.stream = stream;
        this.getMediaStreamCallback?.(-1, videoTrack);
        this.getMediaStreamCallback?.(-1, audioTrack);
        return stream;
    }

    public stopMediaStream(): void {
        if (!this.stream) return;
        this.stream.getTracks().forEach(track => track.stop());
        for (const [, pc] of this.peerConnection) {
            const transceivers = pc.getTransceivers();
            transceivers.forEach(transceiver => {
                transceiver.direction = 'recvonly';
                transceiver.sender.replaceTrack(null);
            });
        }
        this.stream = null;
        this.getMediaStreamCallback?.(-1, null);
        console.log("Stopped stream")
    }

    public getParticipants(callback: (participant: Participant) => void): void {
        this.getParticipantsCallback = callback;
        callback({
            id: -1,
            name: "Hulk",
            audio: null,
            video: null,
            screen: null,
        })
    }

    public onParticipantLeave(callback: (id: number) => void): void {
        this.onParticipantLeaveCallback = callback
    }

    // Start local media
    // public async startLocalMedia(videoEnabled = true, audioEnabled = true): Promise<MediaStream> {
    //     try {
    //         const constraints = {
    //             video: videoEnabled,
    //             audio: audioEnabled,
    //         }

    //         this.localStream = await navigator.mediaDevices.getUserMedia(constraints)

    //         // Add tracks to peer connection
    //         if (this.peerConnection) {
    //             this.localStream.getTracks().forEach((track) => {
    //                 if (this.peerConnection && this.localStream) {
    //                     this.peerConnection.addTrack(track, this.localStream)
    //                 }
    //             })
    //         }

    //         return this.localStream
    //     } catch (error) {
    //         console.error("Error starting local media:", error)
    //         throw error
    //     }
    // }

    // Toggle video
    // public toggleVideo(enabled: boolean): void {
    //     if (this.localStream) {
    //         const videoTracks = this.localStream.getVideoTracks()
    //         videoTracks.forEach((track) => {
    //             track.enabled = enabled
    //         })

    //         // Notify other participants about the change
    //         this.sendDataMessage({
    //             type: "media-state-change",
    //             videoEnabled: enabled,
    //         })
    //     }
    // }

    // // Toggle audio
    // public toggleAudio(enabled: boolean): void {
    //     if (this.localStream) {
    //         const audioTracks = this.localStream.getAudioTracks()
    //         audioTracks.forEach((track) => {
    //             track.enabled = enabled
    //         })

    //         // Notify other participants about the change
    //         this.sendDataMessage({
    //             type: "media-state-change",
    //             audioEnabled: enabled,
    //         })
    //     }
    // }

    // // Start screen sharing
    // public async startScreenSharing(): Promise<MediaStream> {
    //     try {
    //         const screenStream = await navigator.mediaDevices.getDisplayMedia({
    //             video: true,
    //             audio: true,
    //         })

    //         // Replace video track with screen sharing track
    //         if (this.peerConnection && this.localStream) {
    //             const videoTrack = screenStream.getVideoTracks()[0]

    //             const senders = this.peerConnection.getSenders()
    //             const videoSender = senders.find((sender) => sender.track?.kind === "video")

    //             if (videoSender) {
    //                 videoSender.replaceTrack(videoTrack)
    //             }

    //             // Notify other participants about screen sharing
    //             this.sendDataMessage({
    //                 type: "screen-sharing",
    //                 isSharing: true,
    //             })
    //         }

    //         return screenStream
    //     } catch (error) {
    //         console.error("Error starting screen sharing:", error)
    //         throw error
    //     }
    // }

    // // Stop screen sharing
    // public async stopScreenSharing(): Promise<void> {
    //     try {
    //         if (this.peerConnection && this.localStream) {
    //             // Get original video track from local stream
    //             const videoTrack = this.localStream.getVideoTracks()[0]

    //             const senders = this.peerConnection.getSenders()
    //             const videoSender = senders.find((sender) => sender.track?.kind === "video")

    //             if (videoSender && videoTrack) {
    //                 videoSender.replaceTrack(videoTrack)
    //             }

    //             // Notify other participants about stopping screen sharing
    //             this.sendDataMessage({
    //                 type: "screen-sharing",
    //                 isSharing: false,
    //             })
    //         }
    //     } catch (error) {
    //         console.error("Error stopping screen sharing:", error)
    //         throw error
    //     }
    // }

    // Send a message through the data channel
    // public sendDataMessage(message: Message): void {
    //     if (this.dataChannel && this.dataChannel.readyState === "open") {
    //         this.dataChannel.send(JSON.stringify(message))
    //     } else {
    //         console.error("No open data channel or WebSocket connection")
    //     }
    // }

    // Leave the meeting
    public leave(): void {
        // Close peer connection
        this.peerConnection.forEach((pc) => {
            pc.getTransceivers().forEach(transceiver => transceiver.stop());
            pc.close()
        })
        this.peerConnection.clear();

        // Stop local media stream
        this.stream?.getTracks().forEach((track) => track.stop());

        // Close WebSocket
        if (this.socket) {
            this.socket.close()
        }

        // Clear state
        // this.dataChannel = null
        this.stream = null
        this.socket = null
    }

    // Private methods
    private async setupPeerConnectionListeners(data: Message): Promise<RTCPeerConnection> {
        if (this.peerConnection.has(data.from)) {
            return this.peerConnection.get(data.from)!;
        }
        const pc = new RTCPeerConnection(this.configuration);
        this.peerConnection.set(data.from as number, pc);
        this.getParticipantsCallback?.({
            id: data.from,
            name: data.name,
            audio: null,
            video: null,
            screen: null,
        });

        const audioTransceiver = pc.addTransceiver('audio', { direction: this.stream ? 'sendrecv' : 'recvonly' });
        const videoTransceiver = pc.addTransceiver('video', { direction: this.stream ? 'sendrecv' : 'recvonly' });

        const params = videoTransceiver.sender.getParameters();
        params.encodings = [{
            maxBitrate: 100000,
            maxFramerate: 60,
            networkPriority: 'high',
            priority: 'high',
        }];

        videoTransceiver.setCodecPreferences([
            { mimeType: 'video/VP9', clockRate: 90000 },
            { mimeType: 'video/VP8', clockRate: 90000 },
        ]);

        await videoTransceiver.sender.setParameters(params);
        videoTransceiver.sender.replaceTrack(this.stream?.getVideoTracks()[0] || null);
        audioTransceiver.sender.replaceTrack(this.stream?.getAudioTracks()[0] || null);

        // Stats
        this.getStats(pc).catch((error) => {
            console.error("Error getting stats:", error)
        });

        pc.onnegotiationneeded = () => {
            console.log("Negotiation needed")
            this.createOffer(pc, ({
                type: WebRTCEvents.OFFER,
                from: data.from,
                to: data.from,
                data: null,
            }))
        }

        pc.ontrack = async ({ track }) => {
            track.onended = () => {
                console.log("Track ended")
                this.getMediaStreamCallback?.(data.from, null);
            }
            track.onmute = () => {
                console.log("Track muted")
                this.getMediaStreamCallback?.(data.from, null);
            }
            console.log("Received track")
            this.getMediaStreamCallback?.(data.from, track);
        };

        pc.onicecandidate = ({ candidate }) => {
            if (candidate) {
                console.log("Sending ICE candidate")
                this.sendMessage({
                    type: WebRTCEvents.ICE_CANDIDATE,
                    from: data.to,
                    to: data.from,
                    data: candidate,
                })
            }
        }
        // Handle disconnection
        pc.onconnectionstatechange = () => {
            if (
                pc.connectionState === "disconnected" ||
                pc.connectionState === "failed" ||
                pc.connectionState === "closed"
            ) {
                console.log("Peer connection disconnected or failed");
                pc?.getTransceivers().forEach(transceiver => transceiver.stop());
                pc?.close()
                this.peerConnection.delete(data.from);
            }

            if (pc.connectionState === "connected") {
                console.log("Peer connection established")
            }
        }

        return pc;
    }

    private async getStats(pc: RTCPeerConnection): Promise<void> {
        const outbTraces = new Map<string, { qualityLimitationReason: string }>();
        const remoteInbTraces = new Map<string, { totalRoundTripTime: number, roundTripTimeMeasurements: number }>();
        let ewmaRttInMs: number | undefined;
        let congested = false;

        setInterval(async () => {
            const roundTripTimeMeasurements: number[] = [];
            (await (pc.getStats())).forEach((report: any) => {
                if (report.type === 'outbound-rtp') {
                    const newTrace = {
                        qualityLimitationReason: report.qualityLimitationReason,
                    };

                    outbTraces.set(report.id, newTrace);
                }

                if (report.type === 'remote-inbound-rtp' && report.totalRoundTripTime && report.roundTripTimeMeasurements) {
                    let trace = remoteInbTraces.get(report.id);

                    if (!trace) {
                        trace = {
                            totalRoundTripTime: 0,
                            roundTripTimeMeasurements: 0,
                        };

                        remoteInbTraces.set(report.id, trace);
                    }

                    const diffMeasurements = report.roundTripTimeMeasurements - trace.roundTripTimeMeasurements;
                    const diffTotalRoundTripTime = report.totalRoundTripTime - trace.totalRoundTripTime;

                    if (diffMeasurements > 0 && diffTotalRoundTripTime > 0) {
                        const avgRttInInterval = diffTotalRoundTripTime / diffMeasurements;

                        trace.totalRoundTripTime = report.totalRoundTripTime;
                        trace.roundTripTimeMeasurements = report.roundTripTimeMeasurements;

                        roundTripTimeMeasurements.push(avgRttInInterval * 1000);
                    }
                }
            });

            const avgRoundTripTimeInMs = roundTripTimeMeasurements.reduce((a, b) => a + b, 0) / roundTripTimeMeasurements.length;
            if (!Number.isNaN(avgRoundTripTimeInMs)) {
                if (!ewmaRttInMs) {
                    ewmaRttInMs = avgRoundTripTimeInMs;
                }

                const isBandwidthLimited = [...outbTraces.values()].some((trace) => trace.qualityLimitationReason === 'bandwidth');

                if (!congested && isBandwidthLimited && (avgRoundTripTimeInMs - ewmaRttInMs) > 50) {

                    console.warn('Congestion detected, the network is bandwidth limited and the round trip time is increasing (ewmaRtt: %d, avgRoundTripTime: %d)', ewmaRttInMs, avgRoundTripTimeInMs);
                    congested = true;
                } else if (congested && (avgRoundTripTimeInMs - ewmaRttInMs) < 30) {

                    console.info('Congestion resolved, the round trip time is back to normal (ewmaRtt: %d, avgRoundTripTime: %d)', ewmaRttInMs, avgRoundTripTimeInMs);
                    congested = false;
                }

                ewmaRttInMs = (0.9 * ewmaRttInMs) + (0.1 * avgRoundTripTimeInMs);

                // eslint-disable-next-line no-console
                console.info(`avgRoundTripTime: ${avgRoundTripTimeInMs.toFixed(2)}, ewmaRttInMs: ${ewmaRttInMs.toFixed(2)}, bandwidthLimited: ${isBandwidthLimited}`);
            }
        }, 1000);
    }

    // private setupDataChannel(): void {
    //     if (!this.dataChannel) return

    //     this.dataChannel.onopen = () => {
    //         console.log("Data channel opened")
    //     }

    //     this.dataChannel.onclose = () => {
    //         console.log("Data channel closed")
    //     }

    //     this.dataChannel.onmessage = (event) => {
    //         try {
    //             const message = JSON.parse(event.data)
    //         } catch (error) {
    //             console.error("Error parsing data channel message:", error)
    //         }
    //     }
    // }

    private async handleSignalingMessage(event: MessageEvent): Promise<void> {
        try {
            const data = JSON.parse(event.data);
            switch (data.type) {
                case WebRTCEvents.OFFER:
                    await this.handleOffer(data)
                    break
                case WebRTCEvents.ANSWER:
                    await this.handleAnswer(data)
                    break
                case WebRTCEvents.ICE_CANDIDATE:
                    await this.handleICECandidate(data)
                    break
                case WebRTCEvents.USER_JOINED:
                    this.handleUserJoined(data);
                    break
                case WebRTCEvents.USER_LEFT:
                    this.peerConnection.get(data.from)?.getTransceivers().forEach(transceiver => transceiver.stop());
                    this.peerConnection.get(data.from)?.close()
                    this.peerConnection.delete(data.from)
                    this.onParticipantLeaveCallback?.(data.from)
                    break;
                case WebRTCEvents.DATA_MESSAGE:
                    this.handleDataMessage(data)
                    break
                default:
                    console.log("Unknown message type:", data.type)
            }
        } catch (error) {
            console.error("Error handling signaling message:", error)
        }
    }

    private async handleOffer(data: Message): Promise<void> {
        try {
            const pc = await this.setupPeerConnectionListeners(data);
            await pc.setRemoteDescription(data.data)

            const answer = await pc.createAnswer()
            await pc.setLocalDescription(answer)

            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                console.log("Sending answer")
                this.socket.send(
                    JSON.stringify({
                        type: WebRTCEvents.ANSWER,
                        to: data.from,
                        data: answer,
                    }),
                )
            }
        } catch (error) {
            console.error("Error handling offer", error)
        }
    }

    private async handleAnswer(data: Message): Promise<void> {
        try {
            console.log("Received answer")
            await this.peerConnection.get(data.from)?.setRemoteDescription(new RTCSessionDescription(data.data))
        } catch (error) {
            console.error("Error handling answer:", error)
        }
    }

    private async handleICECandidate(data: Message): Promise<void> {
        if (!this.peerConnection.get(data.from)?.remoteDescription) return;
        try {
            await this.peerConnection.get(data.from)?.addIceCandidate(new RTCIceCandidate(data.data))
        } catch (error) {
            console.error("Error handling ICE candidate:", error);
        }
    }

    private async handleUserJoined(data: Message): Promise<void> {
        const pc = await this.setupPeerConnectionListeners(data);
        this.createOffer(pc, data)
    }

    private handleDataMessage(data: any): void {
    }

    // private createDataChannel(): void {

    //     try {
    //         this.dataChannel = this.peerConnection.createDataChannel("data")
    //         this.setupDataChannel()
    //     } catch (error) {
    //         console.error("Error creating data channel:", error)
    //     }
    // }

    private async createOffer(pc: RTCPeerConnection, data: Message): Promise<void> {
        try {
            const offer = await pc.createOffer()
            await pc.setLocalDescription(offer)

            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                console.log("Sending offer")
                this.sendMessage({
                    type: WebRTCEvents.OFFER,
                    from: -1,
                    to: data.from,
                    data: offer,
                })
            }
        } catch (error) {
            console.error("Error creating offer:", error)
        }
    }

    private sendMessage(message: Message): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message))
        } else {
            console.error("WebSocket is not open")
        }
    }
}