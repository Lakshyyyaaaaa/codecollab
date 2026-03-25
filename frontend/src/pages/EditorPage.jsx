import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const LANGUAGES = ["javascript", "python", "cpp", "java", "typescript"];

const EditorPage = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [code, setCode] = useState("// Loading...");
  const [language, setLanguage] = useState("javascript");
  const [users, setUsers] = useState([]);
  const [roomName, setRoomName] = useState("");
  const [connected, setConnected] = useState(false);
  const [copied, setCopied] = useState(false);

  const socketRef = useRef(null);
  const codeRef = useRef(code);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    // Connect to socket
    socketRef.current = io("https://codecollab-backend-zu29.onrender.com", {
      auth: { token },
    });

    const socket = socketRef.current;

    // Connected to server
    socket.on("connect", () => {
      setConnected(true);
      // Join the room
      socket.emit("join-room", {
        roomId,
        username: user?.username,
      });
    });

    // Successfully joined room — get current state
    socket.on("room-joined", ({ room, users }) => {
      setCode(room.code);
      codeRef.current = room.code;
      setLanguage(room.language);
      setRoomName(room.name);
      setUsers(users);
      toast.success(`Joined ${room.name}!`);
    });

    // Someone else joined
    socket.on("user-joined", ({ users }) => {
      setUsers(users);
    });

    // Someone left
    socket.on("user-left", ({ username, users }) => {
      setUsers(users);
      toast(`${username} left the room`, { icon: "👋" });
    });

    // Receive code update from others
    socket.on("code-update", ({ code }) => {
      setCode(code);
      codeRef.current = code;
    });

    // Receive language update
    socket.on("language-update", ({ language }) => {
      setLanguage(language);
    });

    // Error
    socket.on("error", ({ message }) => {
      toast.error(message);
      navigate("/dashboard");
    });

    // Disconnect
    socket.on("disconnect", () => {
      setConnected(false);
    });

    return () => {
      socket.emit("leave-room", { roomId });
      socket.disconnect();
    };
  }, [roomId, user]);

  // Handle code change
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    codeRef.current = newCode;
    socketRef.current?.emit("code-change", { roomId, code: newCode });
  };

  // Handle language change
  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    socketRef.current?.emit("language-change", { roomId, language: newLang });
  };

  // Copy room ID
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    toast.success("Room ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={styles.container}>
      {/* Top Bar */}
      <div style={styles.topBar}>
        <div style={styles.topLeft}>
          <span style={styles.logo}>⚡</span>
          <span style={styles.roomName}>{roomName || "Loading..."}</span>
          <div style={styles.statusDot(connected)} />
          <span style={styles.statusText}>
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>

        <div style={styles.topMiddle}>
          <select
            value={language}
            onChange={handleLanguageChange}
            style={styles.langSelect}
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.topRight}>
          {/* Active users */}
          <div style={styles.usersRow}>
            {users.map((u) => (
              <div
                key={u.socketId}
                style={styles.avatar(u.color)}
                title={u.username}
              >
                {u.username?.[0]?.toUpperCase()}
              </div>
            ))}
          </div>

          <button onClick={copyRoomId} style={styles.copyBtn}>
            {copied ? "✅ Copied!" : "🔗 Share Room"}
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            style={styles.leaveBtn}
          >
            ← Leave
          </button>
        </div>
      </div>

      {/* Editor */}
      <div style={styles.editorContainer}>
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={handleCodeChange}
          theme="vs-dark"
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            automaticLayout: true,
            tabSize: 2,
            lineNumbers: "on",
            renderLineHighlight: "all",
            cursorBlinking: "smooth",
            smoothScrolling: true,
          }}
        />
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#1e1e2e",
    overflow: "hidden",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    background: "#313244",
    borderBottom: "1px solid #45475a",
    height: "56px",
  },
  topLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logo: {
    fontSize: "1.4rem",
  },
  roomName: {
    color: "#cdd6f4",
    fontWeight: "700",
    fontSize: "1rem",
  },
  statusDot: (connected) => ({
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: connected ? "#a6e3a1" : "#f38ba8",
  }),
  statusText: {
    color: "#6c7086",
    fontSize: "0.8rem",
  },
  topMiddle: {
    display: "flex",
    alignItems: "center",
  },
  langSelect: {
    padding: "6px 12px",
    borderRadius: "6px",
    border: "1px solid #45475a",
    background: "#1e1e2e",
    color: "#cdd6f4",
    fontSize: "0.9rem",
    cursor: "pointer",
    outline: "none",
  },
  topRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  usersRow: {
    display: "flex",
    gap: "6px",
  },
  avatar: (color) => ({
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#1e1e2e",
    fontWeight: "700",
    fontSize: "0.85rem",
    border: `2px solid ${color}`,
  }),
  copyBtn: {
    padding: "6px 14px",
    borderRadius: "6px",
    border: "1px solid #45475a",
    background: "transparent",
    color: "#cdd6f4",
    cursor: "pointer",
    fontSize: "0.85rem",
  },
  leaveBtn: {
    padding: "6px 14px",
    borderRadius: "6px",
    border: "1px solid #f38ba8",
    background: "transparent",
    color: "#f38ba8",
    cursor: "pointer",
    fontSize: "0.85rem",
  },
  editorContainer: {
    flex: 1,
    overflow: "hidden",
  },
};

export default EditorPage;
