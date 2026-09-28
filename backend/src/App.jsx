import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/auth/login",
        {
          username,
          password,
        }
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.user.role);
      localStorage.setItem("username", response.data.user.username);

      setMessage(
        `Login successful! Role: ${response.data.user.role}`
      );

    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Unable to connect to server"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="logo">
          🎓
        </div>

        <h1>Student Management System</h1>

        <p className="subtitle">
          Manage students, teachers and academic performance
        </p>

        <form onSubmit={handleLogin}>

          <label>Username</label>

          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>

        </form>

        {message && (
          <div className="message">
            {message}
          </div>
        )}

        <div className="login-info">
          <span>Admin</span>
          <span>Teacher</span>
          <span>Student</span>
        </div>

      </div>

    </div>
  );
}

export default App;