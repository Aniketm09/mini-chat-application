import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import { useNavigate } from "react-router-dom";
import { socket } from "../App"; // ⬅ global socket

export default function ChannelListPage() {
  const navigate = useNavigate();

  const [channels, setChannels] = useState([]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const [onlineUsers, setOnlineUsers] = useState([]); // ⭐ online users

  // LOAD USER CHANNELS
  const loadChannels = async () => {
    const res = await api.get("/channels");
    setChannels(res.data);
  };

  useEffect(() => {
    loadChannels();
  }, []);

  // LISTEN FOR ONLINE USERS
  useEffect(() => {
    const handleUsers = (list) => setOnlineUsers(list);
    socket.on("online-users", handleUsers);

    return () => socket.off("online-users", handleUsers);
  }, []);

  const createChannel = async (e) => {
    e.preventDefault();
    await api.post("/channels", { name, description: desc });
    setName("");
    setDesc("");
    loadChannels();
  };

  const joinChannel = async (id) => {
    await api.post(`/channels/${id}/join`);
    loadChannels();
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">

      {/* SIDEBAR */}
      <div className="w-72 bg-white shadow-xl border-r flex flex-col">

        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-800">MiniChat</h1>
        </div>

        <div className="p-4">
          <button
            onClick={logout}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold"
          >
            Logout
          </button>
        </div>

        {/* ⭐ ONLINE USERS SECTION */}
        <div className="mt-6 px-4">
          <h3 className="text-gray-600 font-semibold uppercase text-xs mb-2">
            Online Users ({onlineUsers.length})
          </h3>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {onlineUsers.map((user) => (
              <div
                key={user.userId}
                className="flex items-center gap-2 bg-gray-200 p-2 rounded-lg"
              >
                <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                <p className="text-sm text-gray-700">{user.name}</p>
              </div>
            ))}
          </div>
        </div>

        <h3 className="pl-6 pt-6 text-gray-600 font-semibold uppercase text-sm">
          Your Channels
        </h3>

        <div className="mt-3 px-4 space-y-3 overflow-y-auto flex-1 pb-5">
          {channels.map((ch) => (
            <div
              key={ch._id}
              className="p-4 bg-gray-200 rounded-lg shadow"
            >
              <p className="font-bold">{ch.name}</p>
              <p className="text-sm text-gray-600">{ch.description}</p>
              <p className="text-xs text-gray-500 mt-1">
                Members: {ch.memberCount}
              </p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => navigate(`/chat/${ch._id}`)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Open
                </button>

                <button
                  onClick={() => joinChannel(ch._id)}
                  className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Join
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-10">
        <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-6 text-gray-800">
            Create New Channel
          </h2>

          <form className="space-y-4" onSubmit={createChannel}>
            <input
              type="text"
              className="w-full border p-3 rounded-lg"
              placeholder="Channel Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <textarea
              className="w-full border p-3 rounded-lg"
              placeholder="Description..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            ></textarea>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold">
              Create Channel
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
