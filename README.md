## Mini Team Chat Application (Slack-Like)

---

## 📌 Project Overview

The **Mini Team Chat Application** is a full-stack, real-time communication platform inspired by Slack.
It allows multiple users to communicate instantly inside channels with authentication, online presence, and message history.

This project demonstrates practical skills in **full-stack development**, **real-time systems**, and **REST API design**, making it suitable for **internship and entry-level software roles**.

---

## ✨ Key Features

* 🔐 **JWT-based User Authentication**

  * User registration and login
  * Secure password hashing
  * Persistent login on page refresh

* 📢 **Channel System**

  * Create and view channels
  * Join channels
  * Channel-based communication

* 💬 **Real-Time Messaging**

  * Instant message delivery using Socket.IO
  * Messages broadcast only to users in the same channel
  * Messages stored in database

* 🟢 **Online / Offline Presence**

  * Displays currently online users
  * Updates in real time when users connect or disconnect

* 📜 **Message History with Pagination**

  * Loads recent messages when entering a channel
  * Older messages fetched in batches (pagination)
  * Optimized for performance

---

## 🛠️ Tech Stack

### Frontend

* React (Vite)
* JavaScript
* Axios
* Socket.IO Client
* Tailwind CSS

### Backend

* Node.js
* Express.js
* MongoDB + Mongoose
* JWT (JSON Web Token)
* Socket.IO

### Database

* MongoDB (Local / MongoDB Atlas)

---

## 🗂️ Project Structure

### Backend

```
backend/
 ├── server.js
 ├── config/
 │    └── db.js
 ├── models/
 │    ├── User.js
 │    ├── Channel.js
 │    ├── Message.js
 │    └── Member.js
 ├── routes/
 │    ├── auth.js
 │    ├── channel.js
 │    └── message.js
 └── sockets/
      └── chat.js
```

### Frontend

```
frontend/
 ├── pages/
 │    ├── Login.jsx
 │    ├── Register.jsx
 │    └── ChatPage.jsx
 ├── components/
 │    ├── ChannelList.jsx
 │    ├── ChatWindow.jsx
 │    ├── MessageInput.jsx
 │    └── OnlineUsers.jsx
 ├── context/
 │    ├── AuthContext.jsx
 │    └── SocketContext.jsx
 └── main.jsx
```

---

## 🔐 Authentication Flow (JWT)

1. User logs in or registers
2. Backend generates a JWT token
3. Token is stored on the frontend
4. Token is sent with every API request
5. Backend verifies token before allowing access

This ensures **secure access** to channels and messages.

---

## ⚡ Real-Time Communication (Socket.IO)

* Socket.IO maintains a persistent connection between client and server
* Users join **channel-specific rooms**
* Messages are broadcast instantly to all users in the same channel
* Online users are tracked using active socket connections

---

## 🧠 Database Design

### User

* name
* email
* passwordHash

### Channel

* name
* createdBy

### Member

* userId
* channelId

### Message

* senderId
* channelId
* text
* createdAt

---

## 🚀 How to Run Locally

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/mini-team-chat.git
cd mini-team-chat
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
MONGO_URI=mongodb://localhost:27017/mini_chat
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173
```

Run backend:

```bash
npm run dev
```

---

### 3️⃣ Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

## 🌍 Deployment

* **Backend:** Render / Railway
* **Frontend:** Vercel / Netlify
* **Database:** MongoDB Atlas

> Deployed links will be added here after deployment.

---

## ⚠️ Assumptions & Limitations

* No private channels (all channels are public)
* No file or image sharing
* No message editing or deletion
* Focused on core real-time chat functionality

---

## 📽️ Demo & Code Walkthrough

A screen recording demonstrates:

* User signup and login
* Channel creation and joining
* Real-time messaging between users
* Online/offline presence
* Message pagination
* Code structure and design decisions

📌 **Video Link:** *(Add Loom / YouTube / Drive link here)*

---

## 🎯 Learning Outcomes

* Built real-time applications using Socket.IO
* Implemented JWT authentication securely
* Designed REST APIs and database schemas
* Managed frontend and backend integration
* Gained experience deploying full-stack applications

---

## 👤 Author

**Aniket Mali**
MCA Student | Full-Stack Developer
📧 Email: [aniketmali0912@gmail.com](mailto:aniketmali0912@gmail.com)
🔗 GitHub: [https://github.com/Aniketm09](https://github.com/Aniketm09)
🔗 LinkedIn: [https://www.linkedin.com/in/aniket-mali09/](https://www.linkedin.com/in/aniket-mali09/)

---

