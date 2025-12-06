import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosClient";
import { socket } from "../App"; // global socket

const PAGE_SIZE = 20;

export default function ChatPage() {
  const { channelId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const [typingUser, setTypingUser] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const bottomRef = useRef();
  const user = JSON.parse(localStorage.getItem("user"));

  // Identify user for online presence
  useEffect(() => {
    if (user) {
      socket.emit("identify", user.id);
    }
  }, [user]);

  // Listen for online users
  useEffect(() => {
    const handleOnline = (list) => setOnlineUsers(list);
    socket.on("online-users", handleOnline);
    return () => socket.off("online-users", handleOnline);
  }, []);

  // Join channel + listen for new messages
  useEffect(() => {
    socket.emit("join-channel", channelId);

    const handleNewMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("new-message", handleNewMessage);

    return () => socket.off("new-message", handleNewMessage);
  }, [channelId]);

  // Typing listeners
  useEffect(() => {
    socket.on("typing", (name) => setTypingUser(name));
    socket.on("stop-typing", () => setTypingUser(null));

    return () => {
      socket.off("typing");
      socket.off("stop-typing");
    };
  }, []);

  // ------------------------------
  // Pagination message loader
  // ------------------------------
  const loadMessages = useCallback(
    async (pageToLoad = 1, append = false) => {
      try {
        const res = await api.get(`/messages/${channelId}`, {
          params: { page: pageToLoad, limit: PAGE_SIZE },
        });

        const fetched = res.data.messages || [];

        if (append) {
          setMessages((prev) => [...fetched, ...prev]);
        } else {
          setMessages(fetched);
        }

        setHasMore(res.data.hasMore);
        setPage(pageToLoad);
      } catch (err) {
        console.log("Error loading messages", err);
      }
    },
    [channelId] // required dependency
  );

  // Initial load
  useEffect(() => {
    loadMessages(1, false);
  }, [loadMessages]);

  // Load older messages
  const loadOlder = async () => {
    if (!hasMore || loadingOlder) return;
    setLoadingOlder(true);
    await loadMessages(page + 1, true);
    setLoadingOlder(false);
  };

  // Auto scroll unless loading older
  useEffect(() => {
    if (!loadingOlder) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loadingOlder]);

  // ------------------------------
  // Typing event
  // ------------------------------
  let typingTimeout;
  const handleTyping = () => {
    socket.emit("typing", { channelId, name: user.name });

    if (typingTimeout) clearTimeout(typingTimeout);

    typingTimeout = setTimeout(() => {
      socket.emit("stop-typing", { channelId, name: user.name });
    }, 1200);
  };

  // ------------------------------
  // Send Message
  // ------------------------------
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const res = await api.post(`/messages/${channelId}`, { text });

    socket.emit("send-message", {
      channelId,
      message: res.data,
    });

    setText("");
    socket.emit("stop-typing", { channelId, name: user.name });
  };

  // ------------------------------
  // Edit Message
  // ------------------------------
  const startEditing = (msg) => {
    setEditingId(msg._id);
    setEditText(msg.text);
  };

  const saveEdit = async () => {
    const res = await api.put(`/messages/${editingId}`, { text: editText });

    setMessages((prev) =>
      prev.map((m) => (m._id === editingId ? res.data : m))
    );

    setEditingId(null);
    setEditText("");
  };

  // ------------------------------
  // Delete Message
  // ------------------------------
  const deleteMsg = async (id) => {
    await api.delete(`/messages/${id}`);
    setMessages((prev) => prev.filter((m) => m._id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">

      {/* HEADER */}
      <div className="bg-white shadow p-4 flex justify-between items-center border-b">
        <div>
          <h2 className="text-xl font-bold">Chat Room</h2>
          <p className="text-xs text-gray-500 mt-1">
            Channel ID: {channelId}
          </p>
        </div>

        <div className="text-gray-700 text-sm flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-green-500"></span>
          Online: {onlineUsers.length}
        </div>

        <button
          onClick={() => navigate("/channels")}
          className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
        >
          ← Back
        </button>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">

        {hasMore && (
          <div className="flex justify-center mb-2">
            <button
              onClick={loadOlder}
              disabled={loadingOlder}
              className="text-sm px-4 py-2 border rounded-full bg-white hover:bg-gray-100"
            >
              {loadingOlder ? "Loading..." : "Load older messages"}
            </button>
          </div>
        )}

        {/* TYPING INDICATOR */}
        {typingUser && (
          <p className="text-sm italic text-gray-500 ml-2">
            {typingUser} is typing...
          </p>
        )}

        {messages.map((msg) => {
          const isMine = msg.sender?._id === user?.id;

          const isSenderOnline = onlineUsers.some(
            (u) => u.userId === msg.sender?._id
          );

          return (
            <div
              key={msg._id}
              className={`max-w-md p-3 rounded-xl shadow ${
                isMine
                  ? "bg-blue-600 text-white ml-auto"
                  : "bg-white text-gray-800"
              }`}
            >
              {/* Name + online dot */}
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-sm">{msg.sender?.name}</p>
                {isSenderOnline && (
                  <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                )}
              </div>

              {/* EDITING UI */}
              {editingId === msg._id ? (
                <>
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="border p-2 w-full rounded text-black"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={saveEdit}
                      className="text-xs bg-yellow-500 px-3 py-1 rounded text-white"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs bg-gray-400 px-3 py-1 rounded text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <p>{msg.text}</p>
              )}

              {/* Time */}
              <p className="text-xs mt-2 opacity-70">
                {msg.createdAt &&
                  new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
              </p>

              {/* EDIT / DELETE BUTTONS */}
              {isMine && editingId !== msg._id && (
                <div className="flex gap-3 mt-2 text-xs">
                  <button
                    className="text-yellow-200 underline"
                    onClick={() => startEditing(msg)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-200 underline"
                    onClick={() => deleteMsg(msg._id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          );
        })}

        <div ref={bottomRef}></div>
      </div>

      {/* INPUT BAR */}
      <form
        onSubmit={sendMessage}
        className="p-4 bg-white border-t flex gap-3"
      >
        <input
          type="text"
          className="flex-1 border rounded-lg p-3"
          placeholder="Type your message..."
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleTyping();
          }}
        />

        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Send
        </button>
      </form>
    </div>
  );
}
