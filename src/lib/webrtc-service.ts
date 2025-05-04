enum WebRTCEvents {
    OFFER = "OFFER",
    ANSWER = "ANSWER",
    ICE_CANDIDATE = "ICE_CANDIDATE",
    USER_JOINED = "USER_JOINED",
    USER_LEFT = "USER_LEFT",
    USER_REQUEST = "USER_REQUEST",
    USER_REQUEST_ACCEPTED = "USER_REQUEST_ACCEPTED",
    USER_REQUEST_REJECTED = "USER_REQUEST_REJECTED",
}

interface Message {
    type: WebRTCEvents;
    sender?: string;
    receiver: string;
    name?: string;
    data: RTCSessionDescriptionInit | RTCIceCandidateInit;
}

export interface DataChannelMessage {
    senderId: string,
    sender: string,
    content: string,
    timestamp: number,
}

declare global {
    interface RTCPeerConnection {
        id: string;
    }
    interface RTCDataChannel {
        sender: string;
    }
}

export class WebRTCService {
    private readonly configuration: RTCConfiguration = {
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" }
        ],
        iceTransportPolicy: 'all',
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
        iceCandidatePoolSize: 0,
    };

    // Network options
    private NETWORK_PRIORITY: RTCPriorityType;
    private MEDIA_TRACK_PRIORITY: RTCPriorityType;

    // Video options
    private readonly MAX_VIDEO_BITRATE: number = 1_000_000;  // 1 Mbps
    private DEFAULT_VIDEO_CODEC: string;
    private VIDEO_RESOLUTION: {
        width: { ideal: number, max: number },
        height: { ideal: number, max: number }
    };;
    private VIDEO_FRAMES: { exact: number, max: number };

    // Audio options
    private readonly DEFAULT_AUDIO_CODEC: string = "audio/opus"
    private readonly MAX_AUDIO_BITRATE: number = 1_28_000; // 128 kbps
    private readonly COMPRESSION_CONFIG = {
        threshold: 0,
        knee: 40,
        ratio: 4,
        attack: 0.3,
        release: 0.25,
    }

    // 
    private peerConnection: RTCPeerConnection[];
    private socket: WebSocket | null;
    private stream: MediaStream | null;
    private dataChannel: RTCDataChannel[];
    public userId: string | null = null
    public userName: string | null = null

    // Callbacks
    private onMediaTrackCallback: ((track: { id: string, track: MediaStreamTrack | null }, kind: string) => void) | null = null
    private onParticipantJoinCallback: (({ id, name }: { id: string, name: string }) => void) | null = null
    private onParticipantLeaveCallback: (((id: string) => void) | null)[] = []
    private onDataChannelMessageCallback: ((message: DataChannelMessage) => void) | null = null
    private onSucessCallback: (() => void) | null = null
    private onUserRequestCallback: ((message: { name: string, sender: string }) => void) | null = null

    // Private constructor to prevent instantiation
    private constructor({
        networkPriority,
        mediaTrackPriority,
        videoCodec,
        videoResolution,
        videoFrames,
    }: {
        networkPriority: RTCPriorityType,
        mediaTrackPriority: RTCPriorityType,
        videoCodec: string,
        videoResolution: { width: { ideal: number, max: number }, height: { ideal: number, max: number } },
        videoFrames: { exact: number, max: number },
    }) {

        this.peerConnection = []
        this.socket = null
        this.stream = null
        this.dataChannel = [];
        this.NETWORK_PRIORITY = networkPriority
        this.MEDIA_TRACK_PRIORITY = mediaTrackPriority
        this.DEFAULT_VIDEO_CODEC = videoCodec
        this.VIDEO_RESOLUTION = videoResolution
        this.VIDEO_FRAMES = videoFrames
    }


    // Singleton instance
    private static instance: WebRTCService | null = null
    public static async getInstance({
        meetingId,
        name,
        isVideoEnabled,
        isAudioEnabled,
        videoDeviceId,
        audioDeviceId,
        networkPriority = "high",
        mediaTrackPriority = "high",
        videoCodec,
        videoResolution,
        videoFrames,
    }: {
        meetingId: string,
        name: string | null,
        isVideoEnabled: boolean,
        isAudioEnabled: boolean,
        videoDeviceId?: string,
        audioDeviceId?: string,
        networkPriority?: RTCPriorityType,
        mediaTrackPriority?: RTCPriorityType,
        videoCodec: string,
        videoResolution: { width: number, height: number },
        videoFrames: number,
    }): Promise<WebRTCService> {

        if (!this.instance) {
            this.instance = new WebRTCService({
                networkPriority,
                mediaTrackPriority,
                videoCodec,
                videoResolution: { width: { ideal: videoResolution.width, max: 1920 }, height: { ideal: videoResolution.height, max: 1080 } },
                videoFrames: { exact: videoFrames, max: 60 },
            });
        }
        try {
            const serverUrl = process.env.NEXT_PUBLIC_SIGNALING_SERVER_URL || "ws://localhost:8080"
            this.instance.socket = new WebSocket(`${serverUrl}?meetingId=${meetingId}&name=${name}`)
            await this.instance.connect();
            this.instance.stream = new MediaStream();
            if (isVideoEnabled) {
                this.instance.sendVideoStream({ deviceId: videoDeviceId })
            }
            if (isAudioEnabled) {
                this.instance.sendAudioStream({ deviceId: audioDeviceId })
            }
        } catch (error) {
            console.log("Error connecting to signaling server:", error)
            this.instance?.close();
            this.instance = null
            throw new Error("Failed to connect to server")
        }
        return this.instance;
    }


    // WebSocket ---
    private connect(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.socket) {
                reject(new Error("WebSocket is not initialized"))
                return
            }
            this.socket.onopen = () => {
                resolve("Connected to signaling server")
            }

            this.socket.onmessage = this.handleSignalingMessage.bind(this)

            this.socket.onerror = (error) => {
                reject(error)
            }

            this.socket.onclose = (error) => {
                reject(error)
            }
        })
    }

    private sendMessage(message: Message): void {
        if (!this.socket) {
            console.error("WebSocket is not initialized")
            return
        }
        this.socket.send(JSON.stringify(message))
    }


    // Media streams ---
    public async sendVideoStream({ deviceId }: { deviceId?: string }): Promise<void> {
        try {
            await this.stopVideoStream();
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "user",
                    width: this.VIDEO_RESOLUTION.width,
                    height: this.VIDEO_RESOLUTION.height,
                    frameRate: this.VIDEO_FRAMES,
                    deviceId: deviceId ? { exact: deviceId } : undefined,
                    aspectRatio: this.VIDEO_RESOLUTION.width.ideal / this.VIDEO_RESOLUTION.height.ideal,
                },
                audio: false,
            });

            const videoTrack = stream.getVideoTracks()[0];
            this.stream?.addTrack(videoTrack);
            this.onMediaTrackCallback?.({ id: this.userId!, track: videoTrack }, "video");

            for (const pc of this.peerConnection) {
                const transceiver = pc.getTransceivers()[1];
                await transceiver.sender.replaceTrack(videoTrack);
                transceiver.direction = 'sendrecv';
            }
        } catch (error) {
            console.error("Error sending video stream:", error)
            this.onMediaTrackCallback?.({ id: this.userId!, track: null }, "video")
        }

    }

    public async sendAudioStream({ deviceId }: { deviceId?: string }): Promise<void> {
        this.stopAudioStream();
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: false,
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: false,
                    deviceId: deviceId ? { exact: deviceId } : undefined,
                },
            });

            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(stream);

            const gainNode = audioContext.createGain();
            gainNode.gain.value = 1.5;

            const highPassFilter = audioContext.createBiquadFilter();
            highPassFilter.type = "highpass";
            highPassFilter.frequency.value = 100;

            const lowPassFilter = audioContext.createBiquadFilter();
            lowPassFilter.type = "lowpass";
            lowPassFilter.frequency.value = 11000;

            const compressor = audioContext.createDynamicsCompressor();
            compressor.threshold.setValueAtTime(this.COMPRESSION_CONFIG.threshold, audioContext.currentTime);
            compressor.knee.setValueAtTime(this.COMPRESSION_CONFIG.knee, audioContext.currentTime);
            compressor.ratio.setValueAtTime(this.COMPRESSION_CONFIG.ratio, audioContext.currentTime);
            compressor.attack.setValueAtTime(this.COMPRESSION_CONFIG.attack, audioContext.currentTime);
            compressor.release.setValueAtTime(this.COMPRESSION_CONFIG.release, audioContext.currentTime);

            source
                .connect(highPassFilter)
                .connect(lowPassFilter)
                .connect(compressor)
                .connect(gainNode)

            const destination = audioContext.createMediaStreamDestination();
            gainNode.connect(destination);


            const processedStream = destination.stream;
            const audioTrack = processedStream.getAudioTracks()[0];

            for (const pc of this.peerConnection) {
                const transceiver = pc.getTransceivers()[0];
                await transceiver.sender.replaceTrack(audioTrack);
                transceiver.direction = 'sendrecv';
            }

            this.stream?.addTrack(audioTrack);
            this.onMediaTrackCallback?.({ id: this.userId!, track: audioTrack }, "audio");
        } catch (error) {
            console.error("Error sending audio stream:", error)
            this.onMediaTrackCallback?.({ id: this.userId!, track: null }, "audio")
        }
    }

    public async stopVideoStream(): Promise<void> {
        const videoTrack = this.stream?.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.stop();
            this.stream?.removeTrack(videoTrack);
            for (const pc of this.peerConnection) {
                const transceiver = pc.getTransceivers()[1];
                await transceiver.sender.replaceTrack(null);
                transceiver.direction = 'recvonly';
            }
            this.onMediaTrackCallback?.({ id: this.userId!, track: null }, "video");
        }
    }

    public async stopAudioStream(): Promise<void> {
        const audioTrack = this.stream?.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.stop();
            this.stream?.removeTrack(audioTrack);
            for (const pc of this.peerConnection) {
                const transceiver = pc.getTransceivers()[0];
                await transceiver.sender.replaceTrack(null);
                transceiver.direction = 'recvonly';
            }
            this.onMediaTrackCallback?.({ id: this.userId!, track: null }, "audio");
        }
    }


    private setupPeerConnectionListeners({ sender, name }: { sender: string, name: string }): RTCPeerConnection {
        const existingPC = this.peerConnection.find(pc => pc.id === sender);
        if (existingPC) {
            return existingPC;
        }

        const pc = new RTCPeerConnection(this.configuration);
        pc.id = sender;
        this.peerConnection.push(pc);
        this.onParticipantJoinCallback?.({ id: sender, name });

        pc.ondatachannel = ({ channel }) => {
            this.setupDataChannel(channel)
            this.dataChannel.push(channel)
        }

        pc.ontrack = ({ track }) => {
            track.onended = () => {
                this.onMediaTrackCallback?.({ id: sender, track: null }, track.kind);
            }
            track.onmute = () => {
                this.onMediaTrackCallback?.({ id: sender, track: null }, track.kind);
            }
            track.onunmute = () => {
                this.onMediaTrackCallback?.({ id: sender, track }, track.kind);
            }
            this.onMediaTrackCallback?.({ id: sender, track }, track.kind);
        };

        pc.onnegotiationneeded = () => {
            if (pc.iceGatheringState !== "complete") return
            this.createOffer(pc, sender);
        }

        pc.onicecandidate = ({ candidate }) => {
            if (candidate) {
                this.sendMessage({
                    type: WebRTCEvents.ICE_CANDIDATE,
                    receiver: sender,
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
                this.connectionCleanup(pc);
            }

            if (pc.connectionState === "connected") {
                if (this.stream) {
                    if (pc.getTransceivers()[1].currentDirection !== 'sendrecv' && this.stream.getVideoTracks().length > 0) {
                        this.sendVideoStream({})
                    }
                    if (pc.getTransceivers()[0].currentDirection !== 'sendrecv' && this.stream.getAudioTracks().length > 0) {
                        this.sendAudioStream({})
                    }
                }
            }
        }
        return pc;
    }

    private handleSignalingMessage(event: MessageEvent): void {
        const { type, sender, data, name } = JSON.parse(event.data) as Message;
        switch (type) {
            case WebRTCEvents.USER_JOINED:
                const pc = this.setupPeerConnectionListeners({ sender: sender!, name: name! })
                this.createOffer(pc, sender!);
                break

            case WebRTCEvents.OFFER:
                this.handleOffer({ sender, data, name });
                break

            case WebRTCEvents.ANSWER:
                this.handleAnswer({ sender, data });
                break

            case WebRTCEvents.ICE_CANDIDATE:
                this.handleICECandidate({ sender, data });
                break

            case WebRTCEvents.USER_LEFT:
                const pcToRemove = this.peerConnection.find(pc => pc.id === sender);
                this.connectionCleanup(pcToRemove!);
                break;
            case WebRTCEvents.USER_REQUEST:
                this.onUserRequestCallback?.({ name: name!, sender: sender! })
                break
            case WebRTCEvents.USER_REQUEST_ACCEPTED:
                this.userId = sender!
                this.userName = name!
                this.onSucessCallback?.()
                this.onParticipantJoinCallback?.({ id: sender!, name: name! })
                break;
            default:
                console.log("Unknown message type:", type)
        }
    }


    // Peer connection setup
    private async createOffer(pc: RTCPeerConnection, sender: string): Promise<void> {
        try {
            await this.setupTransceiver(pc)
            const offer = await pc.createOffer()
            await pc.setLocalDescription(offer)

            this.sendMessage({
                type: WebRTCEvents.OFFER,
                receiver: sender!,
                data: offer,
            })
        } catch (error) {
            console.error("Error creating offer:", error)
        }
    }

    private async handleOffer({ sender, data, name }: Partial<Message>): Promise<void> {
        try {
            const pc = this.setupPeerConnectionListeners({ sender: sender!, name: name! })
            await pc.setRemoteDescription(data as RTCSessionDescriptionInit)
            const answer = await pc.createAnswer()
            await pc.setLocalDescription(answer)

            this.sendMessage({
                type: WebRTCEvents.ANSWER,
                receiver: sender!,
                data: answer,
            })
        } catch (error) {
            console.error("Error handling offer", error)
        }
    }

    private async handleAnswer({ sender, data }: Partial<Message>): Promise<void> {
        try {
            const pc = this.peerConnection.find(pc => pc.id === sender);
            if (!pc) {
                console.log("Peer connection not found")
                return
            }
            await pc.setRemoteDescription(new RTCSessionDescription(data as RTCSessionDescriptionInit))
        } catch (error) {
            console.error("Error handling answer:", error)
        }
    }

    private async handleICECandidate({ data, sender }: Partial<Message>): Promise<void> {
        try {
            const pc = this.peerConnection.find(pc => pc.id === sender);
            if (!pc) {
                console.log("Peer connection not found")
                return
            }
            await pc.addIceCandidate(new RTCIceCandidate(data as RTCIceCandidateInit))
        } catch (error) {
            console.error("Error handling ICE candidate:", error);
        }
    }

    public acceptRequest(receiver: string): void {
        const message: Message = {
            type: WebRTCEvents.USER_REQUEST_ACCEPTED,
            sender: this.userId!,
            receiver,
            data: {},
        }
        this.sendMessage(message)
    }

    public rejectRequest(sender: string): void {
        const message: Message = {
            type: WebRTCEvents.USER_REQUEST_REJECTED,
            sender: this.userId!,
            receiver: sender,
            data: {},
        }
        this.sendMessage(message)
    }


    // Data channel
    private createDataChannel(pc: RTCPeerConnection): void {
        try {
            const dataChannel = pc.createDataChannel("data")
            this.setupDataChannel(dataChannel)
            this.dataChannel.push(dataChannel)
        } catch (error) {
            console.error("Error creating data channel:", error)
        }
    }

    public sendDataMessage(message: DataChannelMessage): void {
        this.dataChannel.forEach((channel) => {
            channel.send(JSON.stringify(message))
        });
    }

    private setupDataChannel(channel: RTCDataChannel): void {
        channel.onmessage = ({ data }: MessageEvent) => {
            try {
                const message: DataChannelMessage = JSON.parse(data)
                this.onDataChannelMessageCallback?.(message)
            } catch (error) {
                console.error("Error parsing data channel message:", error)
            }
        }
    }

    // Listeners
    public onConnectionSuccess(callback: () => void): void {
        this.onSucessCallback = callback
    }

    public onUserRequest(callback: (message: { name: string, sender: string }) => void): void {
        this.onUserRequestCallback = callback
    }

    public onParticipantJoined(callback: ({ id, name }: { id: string, name: string }) => void): void {
        this.onParticipantJoinCallback = callback;
    }

    public onParticipantLeave(callback: (id: string) => void): void {
        this.onParticipantLeaveCallback.push(callback)
    }

    public onMediaTrack(callback: (track: { id: string, track: MediaStreamTrack | null }, kind: string) => void): void {
        this.onMediaTrackCallback = callback;
    }

    public onDataChannelMessage(callback: (message: DataChannelMessage) => void): void {
        this.onDataChannelMessageCallback = callback
    }

    private async setupTransceiver(pc: RTCPeerConnection): Promise<void> {
        if (pc.getTransceivers().length == 2) return;
        this.createDataChannel(pc)
        const isAudioEnabled = this.stream!.getAudioTracks().length > 0;
        const isVideoEnabled = this.stream!.getVideoTracks().length > 0;

        const audioTransceiver = pc.addTransceiver('audio', {
            direction: isAudioEnabled ? 'sendrecv' : 'recvonly'
        });

        const videoTransceiver = pc.addTransceiver('video', {
            direction: isVideoEnabled ? 'sendrecv' : 'recvonly',
        });

        const videoParams = videoTransceiver.sender.getParameters();
        videoParams.encodings = [{
            maxBitrate: this.MAX_VIDEO_BITRATE,
            maxFramerate: this.VIDEO_FRAMES.max,
            networkPriority: this.NETWORK_PRIORITY,
            priority: this.MEDIA_TRACK_PRIORITY,
        }];

        const audioParams = audioTransceiver.sender.getParameters();
        audioParams.encodings = [{
            maxBitrate: this.MAX_AUDIO_BITRATE,
            networkPriority: this.NETWORK_PRIORITY,
            priority: this.MEDIA_TRACK_PRIORITY,
        }];

        const audioCapabilities = RTCRtpSender.getCapabilities('audio');
        const audioCodec = audioCapabilities?.codecs.find(codec => codec.mimeType === this.DEFAULT_AUDIO_CODEC)
            || audioCapabilities?.codecs[0];

        const videoCapabilities = RTCRtpSender.getCapabilities('video');
        const videoCodec = videoCapabilities?.codecs.find(codec => codec.mimeType === this.DEFAULT_VIDEO_CODEC)
            || videoCapabilities?.codecs.find(codec => codec.mimeType === 'video/VP8')
            || videoCapabilities?.codecs.find(codec => codec.mimeType === 'video/H264')
            || videoCapabilities?.codecs[0];

        if (audioCodec) {
            audioTransceiver.setCodecPreferences([audioCodec]);
        }
        if (isAudioEnabled) {
            await audioTransceiver.sender.replaceTrack(this.stream!.getAudioTracks()[0]);
            await audioTransceiver.sender.setParameters(audioParams);
        }

        if (videoCodec) {
            console.log("Video codec:", videoCodec)
            videoTransceiver.setCodecPreferences([videoCodec]);
        }
        if (isVideoEnabled) {
            await videoTransceiver.sender.replaceTrack(this.stream!.getVideoTracks()[0]);
            await videoTransceiver.sender.setParameters(videoParams);
        }
    }

    // Clean up functions
    private connectionCleanup(pc: RTCPeerConnection): void {
        pc?.getTransceivers().forEach(transceiver => {
            transceiver.sender?.track?.stop();
            transceiver.receiver?.track?.stop();
            transceiver.stop();
        });
        pc?.close();
        this.onParticipantLeaveCallback.forEach(callback => callback?.(pc?.id));
        this.dataChannel = this.dataChannel.filter(channel => channel.sender !== pc?.id);
        this.peerConnection = this.peerConnection.filter(p => p.id !== pc?.id);
    }

    public close(): void {
        this.peerConnection.forEach((pc) => {
            this.connectionCleanup(pc);
            pc.onicecandidate = null
            pc.ontrack = null
            pc.onnegotiationneeded = null
            pc.onconnectionstatechange = null
            pc.ondatachannel = null
        })
        this.peerConnection = [];

        this.stream?.getTracks().forEach((track) => {
            track.stop();
            this.stream?.removeTrack(track);
        });
        this.stream = null

        if (this.socket) {
            this.socket.onopen = null
            this.socket.onmessage = null
            this.socket.onclose = null
            this.socket.onerror = null
        }
        this.socket?.close()
        this.socket = null

        this.dataChannel?.forEach((channel) => {
            channel.close()
            channel.onopen = null
            channel.onmessage = null
            channel.onclose = null
            channel.onerror = null
        })
        this.dataChannel = []

        this.onMediaTrackCallback = null
        this.onParticipantJoinCallback = null
        this.onParticipantLeaveCallback = []
        this.onDataChannelMessageCallback = null
        this.onSucessCallback = null
        this.onUserRequestCallback = null
        this.userId = null
        this.userName = null
        WebRTCService.instance = null;
    }
}