# 💬 ChitChat - Real-Time Messaging & WebRTC Video/Voice Calling App

[![Live Demo](https://img.shields.io/badge/Live_Demo-ChitChat_on_Render-6366f1?style=for-the-badge&logo=render&logoColor=white)](https://chat-app-1-oryb.onrender.com)
[![GitHub License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js_24-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io)
[![WebRTC](https://img.shields.io/badge/WebRTC-Audio_%26_Video-FF4438?style=for-the-badge&logo=webrtc&logoColor=white)](https://webrtc.org)

**ChitChat** is a full-stack, production-grade real-time chat and calling web application built with the MERN stack (MongoDB, Express, React, Node.js), Socket.IO, and WebRTC. It supports instant one-on-one messaging, file/image attachments, live typing indicators, online status tracking, and crystal-clear peer-to-peer audio and video calling across desktop and mobile devices.

---

## 🌐 Live Application

> **🔗 Live Demo:** **[https://chat-app-1-oryb.onrender.com](https://chat-app-1-oryb.onrender.com)**  
> *(Test demo accounts are pre-configured or you can register your own account instantly)*

---

## ✨ Features

### 💬 Real-Time Messaging
- **Instant Messaging**: Real-time bi-directional messaging powered by Socket.IO.
- **Media & File Attachments**: Share images (Cloudinary integration) and documents (`.pdf`, `.docx`, `.txt`, `.zip`) securely.
- **Live Typing Indicators**: Real-time feedback when a conversation partner is typing.
- **Online Presence & Status**: Live tracking of online/offline contacts with real-time indicators.
- **Audible Alerts**: Custom sound effects for incoming and outgoing messages.

### 📞 WebRTC Audio & Video Calling
- **One-on-One HD Video Calls**: High-definition video with adaptive picture-in-picture local preview.
- **Crystal-Clear Voice Calls**: Dedicated audio streaming with hardware echo cancellation and noise suppression.
- **Cross-Platform Compatibility**: STUN relay integration and candidate buffering for smooth connections between mobile phones (iOS/Android) and laptops/desktops.
- **In-Call Controls**: Instant microphone mute/unmute and camera toggling.
- **Call History & Logs**: Log record tracking for completed, missed, and rejected calls.

### 🔒 Security & Authentication
- **Secure Authentication**: JWT stored in `httpOnly`, `sameSite: strict`, and `secure` cookies.
- **Password Protection**: Passwords hashed with `bcryptjs` (salt rounds: 10).
- **Forgot & Reset Password**: Time-bound cryptographic reset tokens delivered via automated SMTP emails.
- **Robust Security Headers**: Express security headers (`nosniff`, `SAMEORIGIN`, `strict-origin-when-cross-origin`, `trust proxy`).
- **Input Sanitization & Rate Limiting**: Protection against brute-force attacks and NoSQL injection.

### 🎨 Modern UI & Theming
- **32 Curated Themes**: Powered by DaisyUI and Tailwind CSS (Dark, Light, Synthwave, Cyberpunk, Forest, and more).
- **Mobile-First Responsive Design**: Optimized layout for smartphones, tablets, and wide desktop screens.
- **Fluid Micro-Animations**: Smooth transitions powered by Framer Motion and Lucide icons.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, DaisyUI, Zustand, Framer Motion, Lucide Icons, Axios |
| **Backend** | Node.js (v24), Express 5, Socket.IO, Mongoose, JSON Web Tokens (JWT), BcryptJS |
| **Real-Time & Media** | WebRTC (RTCPeerConnection, STUN), Socket.IO signaling, Cloudinary API |
| **Database** | MongoDB Atlas (Cloud Database) with embedded resilient local fallback engine |
| **Deployment** | Render (Web Service), GitHub Actions CI/CD |

---

## 📁 Project Structure

```text
CHAT-APP/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Route controllers (auth, message, call)
│   │   ├── middleware/     # Auth & validation middleware
│   │   ├── models/         # Mongoose schemas (User, Message, Call)
│   │   ├── routes/         # Express API route definitions
│   │   ├── lib/            # Utilities (db, socket, email, cloudinary)
│   │   └── index.js        # Server entry point & static file serving
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/     # UI components (ChatContainer, CallModal, Navbar, etc.)
│   │   ├── pages/          # App pages (Home, Login, SignUp, Profile, Settings)
│   │   ├── store/          # Zustand global stores (useAuthStore, useChatStore, useCallStore)
│   │   ├── lib/            # Axios instance, sound effects, utils
│   │   └── App.jsx         # App router & socket initialization
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── package.json            # Root orchestrator for build & start scripts
├── render.yaml             # Render infrastructure as code
└── README.md
```

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/) (bundled with Node.js)
- A [MongoDB Atlas](https://www.mongodb.com/atlas) connection string (or use the built-in embedded DB engine)
- A free [Cloudinary](https://cloudinary.com/) account for image uploads

### 1. Clone the Repository
```bash
git clone https://github.com/abdulyahiya/Chat-App.git
cd Chat-App
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend/` directory:
```bash
cp backend/.env.example backend/.env
```
Fill in your keys:
```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=no-reply@chitchat.com

CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Install Dependencies
```bash
# Install root, backend, and frontend dependencies
npm run build
```

### 4. Run Development Servers
In two separate terminals:

```bash
# Terminal 1: Start Backend (Port 5001)
cd backend
npm run dev

# Terminal 2: Start Frontend (Port 5173)
cd frontend
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## ☁️ Deployment (Render)

This project is configured for automated Continuous Deployment via **Render**.

1. Connect your repository (`abdulyahiya/Chat-App`) to Render as a **Web Service**.
2. Set configuration:
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`
3. Add Environment Variables (`MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_*`, `SMTP_*`, `CLIENT_URL`).
4. Every push to `main` will automatically trigger a clean build and deploy!

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Made with ❤️ by [Abdul Yahiya](https://github.com/abdulyahiya)
