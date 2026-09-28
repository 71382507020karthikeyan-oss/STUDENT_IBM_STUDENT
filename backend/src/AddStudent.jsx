import { useState } from "react";
import "./AddStudent.css";

function AddStudent() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    phone: "",
    department: "AI&DS",
    year: 2,
    section: "A",
    date_of_birth: "",
    address: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://127.0.0.1:5000/api/admin/students",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create student");
        return;
      }

      setMessage(
        `Student "${data.student.name}" created successfully!`
      );

      setForm({
        username: "",
        password: "",
        name: "",
        email: "",
        phone: "",
        department: "AI&DS",
        year: 2,
        section: "A",
        date_of_birth: "",
        address: "",
      });
    } catch (err) {
      setError("Backend server is not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-student-page">

      <div className="page-heading">
        <h2>Add New Student</h2>
        <p>Create a student account and profile.</p>
      </div>

      <form className="student-form" onSubmit={handleSubmit}>

        <div className="form-section">
          <h3>Login Details</h3>

          <div className="form-grid">

            <div>
              <label>Username *</label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="student002"
                required
              />
            </div>

            <div>
              <label>Password *</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
              />
            </div>

          </div>
        </div>

        <div className="form-section">
          <h3>Personal Details</h3>

          <div className="form-grid">

            <div>
              <label>Full Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Student Name"
                required
              />
            </div>

            <div>
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="student@example.com"
                required
              />
            </div>

            <div>
              <label>Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="9876543210"
              />
            </div>

            <div>
              <label>Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={form.date_of_birth}
                onChange={handleChange}
              />
            </div>

          </div>
        </div>

        <div className="form-section">
          <h3>Academic Details</h3>

          <div className="form-grid">

            <div>
              <label>Department</label>
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Year</label>
              <input
                type="number"
                name="year"
                min="1"
                max="4"
                value={form.year}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Section</label>
              <input
                name="section"
                value={form.section}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Address</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Tamil Nadu"
              />
            </div>

          </div>
        </div>

        {message && (
          <div className="success-message">
            ✅ {message}
          </div>
        )}

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        <button
          className="create-button"
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating Student..." : "Create Student"}
        </button>

      </form>
    </div>
  );
}

export default AddStudent;