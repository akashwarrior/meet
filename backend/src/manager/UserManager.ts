import { Socket } from "socket.io";

export class UserManager {
    private senders: Socket[];
    private receivers: Socket[];

    constructor() {
        this.senders = [];
        this.receivers = [];
    }

    addSender(socket: Socket) {
        this.senders.push(socket);
        if (this.receivers.length) {
            this.clearQueue();
        }
    }

    addReceiver(socket: Socket) {
        this.receivers.push(socket);
        if (this.senders.length) {
            this.clearQueue();
        }
    }

    removeUser(socketId: string) {
        this.senders = this.senders.filter(x => x.id !== socketId);
        this.receivers = this.receivers.filter(x => x.id !== socketId);
    }

    clearQueue() {
        const sender = this.senders[0];
        const receiver = this.receivers[0];

        sender.emit('send-offer');
        console.log('sender creating offer');

        sender.on("offer", ({ sdp }: { sdp: string }) => {
            receiver.emit("offer", { sdp });
            console.log('sender sent offer to reciver');
        });

        receiver.on("answer", ({ sdp }: { sdp: string }) => {
            sender.emit("answer", { sdp });
            console.log("reciever answered on offer");
        });

        receiver.on("add-ice-candidate", async (candidate) => {
            sender.emit("add-ice-candidate", candidate);
            console.log("on ice candidate");
            this.removeUser(sender.id);
            this.removeUser(receiver.id);
        });
    }
}