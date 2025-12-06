import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ChannelListPage from "./pages/ChannelListPage";
import ChatPage from "./pages/ChatPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { io } from "socket.io-client";

// Global socket instance (created once)
export const socket = io("http://localhost:5000");

export default function App() {

  // IDENTIFY USER GLOBALLY
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      socket.emit("identify", user.id);
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/channels"
          element={
            <ProtectedRoute>
              <ChannelListPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat/:channelId"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
