# 🖥️ RD Share

**RD Share** is a real-time screen sharing web application built for seamless, peer-to-peer collaboration. It uses WebRTC for fast media streaming and Firebase for secure signaling and authentication—no plugins or extensions required.

---

## 🚀 Features

- 📺 Real-time screen sharing between peers
- 🔐 Secure authentication with Firebase Auth
- ⚡ Peer connection handling via Firestore as a signaling channel
- 🎥 Optimized WebRTC implementation for high video clarity and low latency

---

## 🛠️ Tech Stack

- **Frontend:** Next.js, TypeScript, Tailwind CSS
- **Backend/Infra:** Firebase (Firestore, Auth), WebRTC (getUserMedia, RTCPeerConnection)

---

##  Demo Video

👉 [Watch Demo Video of RD Share](https://drive.google.com/file/d/1MGmWHGEic1e1yxNaCbwzqNdTHixpq634/view)  

---

## 📺 Live Demo

👉 [Try RD Share](https://rd-share.vercel.app/)  

---

## 📦 Setup Instructions

 Clone the repository  
 ```bash
 git clone https://github.com/akashwarrior/rd-share.git
 cd rd-share
 ```
Install dependencies

```bash
npm install
```
Add your Firebase config to .env.local

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
```
Start the development server

```bash
npm run dev
```

	💡 How It Works
When a user starts a session, their screen stream is captured using getDisplayMedia.

Connection details are exchanged via Firebase Firestore for signaling.

WebRTC establishes a peer-to-peer connection between participants, enabling direct screen sharing with low latency.

	📈 Optimizations

Replaced WebSocket with Firestore to simplify peer signaling.

Reduced handshake time and enhanced stream reliability.

Designed with focus on smooth UX and real-time feedback.

	🧠 Future Enhancements

Add voice communication

Support for multi-user sharing

Add session history & auto-expiration for links

🤝 Contributing
Contributions and suggestions are welcome! Feel free to open issues or pull requests.

Let me know if you'd like to add diagrams, environment setup screenshots, or detailed signaling flow!
