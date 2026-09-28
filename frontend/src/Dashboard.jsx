import { useEffect, useState } from "react";
import "./Dashboard.css";

function Dashboard() {
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    setRole(localStorage.getItem("role") || "");
    setUsername(localStorage.getItem("username") || "");
  }, []);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="dashboard">

      <aside className="sidebar">

        <div className="brand">
          🎓 SMS
        </div>

        <div className="menu">

          <div className="menu-item active">
            📊 Dashboard
          </div>

          {role === "admin" && (
            <>
              <div className="menu-item">👨‍🎓 Students</div>
              <div className="menu-item">👨‍🏫 Teachers</div>
              <div className="menu-item">➕ Add Student</div>
              <div className="menu-item">➕ Add Teacher</div>
            </>
          )}

          {role === "teacher" && (
            <>
              <div className="menu-item">👨‍🎓 Students</div>
              <div className="menu-item">📝 Marks</div>
              <div className="menu-item">📅 Attendance</div>
            </>
          )}

          {role === "student" && (
            <>
              <div className="menu-item">👤 My Profile</div>
              <div className="menu-item">📝 My Marks</div>
              <div className="menu-item">📅 Attendance</div>
              <div className="menu-item">📈 Performance</div>
            </>
          )}

        </div>

        <button className="logout" onClick={logout}>
          🚪 Logout
        </button>

      </aside>

      <main className="main-content">

        <header className="topbar">

          <div>
            <h2>
              {role
                ? `${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard`
                : "Dashboard"}
            </h2>

            <p>
              Welcome back, {username}
            </p>
          </div>

          <div className="profile">
            👤 {username}
          </div>

        </header>

        <section className="cards">

          <div className="stat-card">
            <span>👨‍🎓</span>
            <h3>Students</h3>
            <strong>
              {role === "student" ? "1" : "View"}
            </strong>
          </div>

          <div className="stat-card">
            <span>📚</span>
            <h3>Subjects</h3>
            <strong>1</strong>
          </div>

          <div className="stat-card">
            <span>📝</span>
            <h3>Marks</h3>
            <strong>85</strong>
          </div>

          <div className="stat-card">
            <span>📅</span>
            <h3>Attendance</h3>
            <strong>90%</strong>
          </div>

        </section>

        <section className="welcome-card">

          <h2>Student Management System</h2>

          <p>
            Manage students, teachers, marks, attendance and
            academic performance from one centralized system.
          </p>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;