# Meet – Real-time Video Meeting App

Meet is a high-performance real-time video meeting app built with Next.js and Node.js using WebRTC.  
It delivers minimal-latency video calls with adaptive streaming and efficient peer-to-peer communication.

---

## 🚀 Features

- Real-time video and audio communication
- Adaptive streaming (resolution, framerate, bitrate)
- Authentication with NextAuth
- Scalable P2P architecture
- Optimized for desktop and mobile
- Built-in WebSocket signaling server
- Prisma + PostgreSQL backend

---

## 🛠️ Local Development Setup

Follow the steps below to run Meet locally:

### 1. Clone the repository

```bash
git clone https://github.com/akashwarrior/meet.git
cd meet
```
### 2. Install dependencies
```bash
npm install
```
### 3. Create environment variables
```bash
cp .env.example .env
```
### 4. Generate Prisma client
```bash
npm run generate
```
### 5. Start the app locally
```bash
npm run dev
```
Your app will be running at: http://localhost:3000

---

## 🧠 Tech Stack
##### - Frontend: Next.js, React, Tailwind CSS

##### - Backend: Node.js, WebSocket (WS), Prisma, PostgreSQL

##### - Auth: NextAuth.js

##### - RTC: WebRTC API with custom signaling

##### - ORM: Prisma


---


## 📁 Project Structure

    /src/app                   →   Next.js frontend
    /src/store                 →   Zustand store
    /src/lib/webrtc-service    →   WebRTC and signaling logic
    /prisma                    →   Prisma schema and migrations