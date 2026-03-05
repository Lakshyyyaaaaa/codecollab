import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [joinId, setJoinId] = useState("");

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await api.get("/rooms/my-rooms");
      setRooms(res.data.rooms);
    } catch {
      toast.error("Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async () => {
    if (!roomName.trim()) return toast.error("Enter a room name!");
    try {
      const res = await api.post("/rooms", { name: roomName, language });
      toast.success("Room created!");
      setShowModal(false);
      setRoomName("");
      navigate(`/room/${res.data.room.roomId}`);
    } catch {
      toast.error("Failed to create room");
    }
  };

  const joinRoom = () => {
    if (!joinId.trim()) return toast.error("Enter a room ID!");
    navigate(`/room/${joinId.trim()}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.logo}>⚡ CodeCollab</div>
        <div style={styles.navRight}>
          <span style={styles.username}>👤 {user?.username}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </nav>

      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>My Rooms</h1>
            <p style={styles.subtitle}>
              Create or join a collaborative coding session
            </p>
          </div>
          <button onClick={() => setShowModal(true)} style={styles.createBtn}>
            + New Room
          </button>
        </div>

        {/* Join Room */}
        <div style={styles.joinBox}>
          <input
            value={joinId}
            onChange={(e) => setJoinId(e.target.value)}
            placeholder="Enter Room ID to join..."
            style={styles.joinInput}
          />
          <button onClick={joinRoom} style={styles.joinBtn}>
            Join Room
          </button>
        </div>

        {/* Rooms Grid */}
        {loading ? (
          <div style={styles.center}>Loading rooms...</div>
        ) : rooms.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🚀</div>
            <p>No rooms yet! Create your first room.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {rooms.map((room) => (
              <div key={room._id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.langBadge}>{room.language}</span>
                  <span style={styles.cardDate}>
                    {new Date(room.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 style={styles.cardTitle}>{room.name}</h3>
                <p style={styles.roomId}>ID: {room.roomId}</p>
                <button
                  onClick={() => navigate(`/room/${room.roomId}`)}
                  style={styles.openBtn}
                >
                  Open Room →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Create New Room</h2>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Room Name</label>
              <input
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="My awesome project..."
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={styles.input}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="typescript">TypeScript</option>
              </select>
            </div>

            <div style={styles.modalButtons}>
              <button
                onClick={() => setShowModal(false)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button onClick={createRoom} style={styles.createBtn}>
                Create Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "#1e1e2e",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 32px",
    background: "#313244",
    borderBottom: "1px solid #45475a",
  },
  logo: {
    fontSize: "1.5rem",
    fontWeight: "800",
    color: "#cba6f7",
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  username: {
    color: "#cdd6f4",
    fontSize: "0.9rem",
  },
  logoutBtn: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "1px solid #45475a",
    background: "transparent",
    color: "#cdd6f4",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  content: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "40px 24px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#cdd6f4",
  },
  subtitle: {
    color: "#6c7086",
    marginTop: "4px",
  },
  createBtn: {
    padding: "12px 24px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #cba6f7, #89b4fa)",
    color: "#1e1e2e",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "0.95rem",
  },
  joinBox: {
    display: "flex",
    gap: "12px",
    marginBottom: "40px",
  },
  joinInput: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #45475a",
    background: "#313244",
    color: "#cdd6f4",
    fontSize: "1rem",
    outline: "none",
  },
  joinBtn: {
    padding: "12px 24px",
    borderRadius: "8px",
    border: "none",
    background: "#45475a",
    color: "#cdd6f4",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "0.95rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "#313244",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid #45475a",
    transition: "transform 0.2s",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  langBadge: {
    background: "#45475a",
    color: "#cba6f7",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "600",
  },
  cardDate: {
    color: "#6c7086",
    fontSize: "0.8rem",
  },
  cardTitle: {
    color: "#cdd6f4",
    fontSize: "1.1rem",
    fontWeight: "600",
    marginBottom: "8px",
  },
  roomId: {
    color: "#6c7086",
    fontSize: "0.85rem",
    marginBottom: "16px",
    fontFamily: "monospace",
  },
  openBtn: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #cba6f7",
    background: "transparent",
    color: "#cba6f7",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  center: {
    textAlign: "center",
    color: "#6c7086",
    marginTop: "60px",
  },
  emptyState: {
    textAlign: "center",
    color: "#6c7086",
    marginTop: "80px",
  },
  emptyIcon: {
    fontSize: "4rem",
    marginBottom: "16px",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#313244",
    borderRadius: "16px",
    padding: "40px",
    width: "100%",
    maxWidth: "440px",
    boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
  },
  modalTitle: {
    color: "#cdd6f4",
    fontSize: "1.4rem",
    fontWeight: "700",
    marginBottom: "28px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "20px",
  },
  label: {
    color: "#cdd6f4",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  input: {
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #45475a",
    background: "#1e1e2e",
    color: "#cdd6f4",
    fontSize: "1rem",
    outline: "none",
  },
  modalButtons: {
    display: "flex",
    gap: "12px",
    marginTop: "8px",
  },
  cancelBtn: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #45475a",
    background: "transparent",
    color: "#cdd6f4",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default Dashboard;
