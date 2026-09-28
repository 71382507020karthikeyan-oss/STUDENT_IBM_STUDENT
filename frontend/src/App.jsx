import { useEffect, useState } from "react";

const API = "http://127.0.0.1:5000";


/* =========================================================
   REUSABLE INPUT
========================================================= */

function FormInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
}) {
  return (
    <div className="form-field">

      <label>{label}</label>

      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value)
        }
        required={label.includes("*")}
        autoComplete="off"
      />

    </div>
  );
}


/* =========================================================
   SELECT INPUT
========================================================= */

function FormSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select",
}) {
  return (
    <div className="form-field">

      <label>{label}</label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        required
      >

        <option value="">
          {placeholder}
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}

      </select>

    </div>
  );
}


/* =========================================================
   PROFILE ITEM
========================================================= */

function ProfileItem({ title, value }) {
  return (
    <div className="profile-item">

      <span>{title}</span>

      <strong>
        {value || "-"}
      </strong>

    </div>
  );
}


/* =========================================================
   APP
========================================================= */

function App() {

  /* =======================================================
     AUTH
  ======================================================= */

  const [token, setToken] = useState(
    localStorage.getItem("token") || ""
  );

  const [role, setRole] = useState(
    localStorage.getItem("role") || ""
  );

  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );


  /* =======================================================
     VIEW
  ======================================================= */

  const [view, setView] =
    useState("dashboard");


  /* =======================================================
     COMMON
  ======================================================= */

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  /* =======================================================
     ADMIN DATA
  ======================================================= */

  const [adminStudents, setAdminStudents] =
    useState([]);

  const [adminTeachers, setAdminTeachers] =
    useState([]);

  const [
    editingAdminStudent,
    setEditingAdminStudent,
  ] = useState(null);

  const [
    editingAdminTeacher,
    setEditingAdminTeacher,
  ] = useState(null);


  const [
    adminStudentForm,
    setAdminStudentForm,
  ] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    phone: "",
    department: "",
    year: "",
    section: "",
    date_of_birth: "",
    address: "",
  });


  const [
    adminTeacherForm,
    setAdminTeacherForm,
  ] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    phone: "",
    department: "",
  });


  /* =======================================================
     TEACHER DATA
  ======================================================= */

  const [students, setStudents] =
    useState([]);

  const [subjects, setSubjects] =
    useState([]);

  const [
    editingStudent,
    setEditingStudent,
  ] = useState(null);


  const [editForm, setEditForm] =
    useState({
      name: "",
      email: "",
      phone: "",
      department: "",
      year: "",
      section: "",
      date_of_birth: "",
      address: "",
    });


  /* =======================================================
     STUDENT DATA
  ======================================================= */

  const [profile, setProfile] =
    useState(null);

  const [marks, setMarks] =
    useState([]);

  const [attendance, setAttendance] =
    useState([]);

  const [performance, setPerformance] =
    useState(null);


  /* =======================================================
     LOGIN FORM
  ======================================================= */

  const [loginForm, setLoginForm] =
    useState({
      username: "",
      password: "",
    });


  /* =======================================================
     ADD STUDENT
  ======================================================= */

  const [studentForm, setStudentForm] =
    useState({
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


  /* =======================================================
     ADD TEACHER
  ======================================================= */

  const [teacherForm, setTeacherForm] =
    useState({
      username: "",
      password: "",
      name: "",
      email: "",
      phone: "",
      department: "AI&DS",
    });


  /* =======================================================
     SUBJECT FORM
  ======================================================= */

  const [subjectForm, setSubjectForm] =
    useState({
      subject_name: "",
      department: "AI&DS",
      semester: 3,
    });


  /* =======================================================
     MARKS
  ======================================================= */

  const [marksForm, setMarksForm] =
    useState({
      student_id: "",
      subject_id: "",
      internal_mark: "",
      external_mark: "",
    });


  /* =======================================================
     ATTENDANCE
  ======================================================= */

  const [
    attendanceForm,
    setAttendanceForm,
  ] = useState({
    student_id: "",
    subject_id: "",
    total_classes: "",
    attended_classes: "",
  });


  /* =======================================================
     LOAD ON LOGIN
  ======================================================= */

  useEffect(() => {

    if (!token || !role) {
      return;
    }

    loadRoleData();

  }, [token, role]);


  /* =======================================================
     API
  ======================================================= */

  const apiRequest = async (
    endpoint,
    options = {}
  ) => {

    const headers = {
      "Content-Type":
        "application/json",
      ...(options.headers || {}),
    };

    if (token) {
      headers.Authorization =
        `Bearer ${token}`;
    }


    const response =
      await fetch(
        `${API}${endpoint}`,
        {
          ...options,
          headers,
        }
      );


    let data = {};

    try {
      data = await response.json();
    } catch {
      data = {};
    }


    if (
      response.status === 401 ||
      response.status === 422
    ) {

      localStorage.clear();

      setToken("");
      setRole("");
      setUsername("");

      throw new Error(
        "Session expired. Please login again."
      );

    }


    if (!response.ok) {

      throw new Error(
        data.message ||
        data.msg ||
        "Request failed"
      );

    }


    return data;
  };


  /* =======================================================
     MESSAGE
  ======================================================= */

  const showMessage = (text) => {

    setMessage(text);
    setError("");

    window.setTimeout(
      () => setMessage(""),
      4000
    );

  };


  const showError = (text) => {

    setError(text);
    setMessage("");

    window.setTimeout(
      () => setError(""),
      5000
    );

  };


  /* =======================================================
     LOGIN
  ======================================================= */

  const handleLogin = async (
    event
  ) => {

    event.preventDefault();

    setLoading(true);

    setError("");
    setMessage("");

    try {

      const response =
        await fetch(
          `${API}/api/auth/login`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              loginForm
            ),
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Login failed"
        );

      }


      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "role",
        data.user.role
      );

      localStorage.setItem(
        "username",
        data.user.username
      );


      setToken(data.token);
      setRole(data.user.role);
      setUsername(
        data.user.username
      );

      setView("dashboard");

      setLoginForm({
        username: "",
        password: "",
      });

      showMessage(
        "Login successful"
      );

    } catch (err) {

      showError(
        err.message
      );

    } finally {

      setLoading(false);

    }

  };


  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {

    localStorage.clear();

    setToken("");
    setRole("");
    setUsername("");

    setView("dashboard");

    setAdminStudents([]);
    setAdminTeachers([]);
    setStudents([]);
    setSubjects([]);

    setProfile(null);
    setMarks([]);
    setAttendance([]);
    setPerformance(null);

  };


  /* =======================================================
     LOAD ROLE DATA
  ======================================================= */

  const loadRoleData = async () => {

    try {

      if (role === "admin") {

        await loadAdminStudents();
        await loadAdminTeachers();

      }


      if (role === "teacher") {

        await loadTeacherStudents();
        await loadSubjects();

      }


      if (role === "student") {

        const profileData =
          await apiRequest(
            "/api/student/profile"
          );

        const marksData =
          await apiRequest(
            "/api/student/marks"
          );

        const attendanceData =
          await apiRequest(
            "/api/student/attendance"
          );

        const performanceData =
          await apiRequest(
            "/api/student/performance"
          );


        setProfile(profileData);

        setMarks(
          marksData.marks || []
        );

        setAttendance(
          attendanceData.attendance ||
          []
        );

        setPerformance(
          performanceData
        );

      }

    } catch (err) {

      console.error(err);

    }

  };


  /* =======================================================
     ADMIN STUDENTS
  ======================================================= */

  const loadAdminStudents =
    async () => {

      try {

        const data =
          await apiRequest(
            "/api/admin/students"
          );

        setAdminStudents(
          data.students || []
        );

      } catch (err) {

        showError(
          err.message
        );

      }

    };


  /* =======================================================
     ADMIN TEACHERS
  ======================================================= */

  const loadAdminTeachers =
    async () => {

      try {

        const data =
          await apiRequest(
            "/api/admin/teachers"
          );

        setAdminTeachers(
          data.teachers || []
        );

      } catch (err) {

        showError(
          err.message
        );

      }

    };


  /* =======================================================
     TEACHER STUDENTS
  ======================================================= */

  const loadTeacherStudents =
    async () => {

      try {

        const data =
          await apiRequest(
            "/api/teacher/students"
          );

        setStudents(
          data.students || []
        );

      } catch (err) {

        showError(
          err.message
        );

      }

    };


  /* =======================================================
     SUBJECTS
  ======================================================= */

  const loadSubjects =
    async () => {

      try {

        const data =
          await apiRequest(
            "/api/academic/subjects"
          );

        setSubjects(
          data.subjects || []
        );

      } catch (err) {

        showError(
          err.message
        );

      }

    };


  /* =======================================================
     ADD STUDENT
  ======================================================= */

  const handleAddStudent =
    async (event) => {

      event.preventDefault();

      setLoading(true);

      try {

        const data =
          await apiRequest(
            "/api/admin/students",
            {
              method: "POST",

              body:
                JSON.stringify({
                  ...studentForm,

                  year:
                    Number(
                      studentForm.year
                    ),
                }),
            }
          );


        showMessage(
          `Student "${data.student.name}" created successfully`
        );


        setStudentForm({

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


        await loadAdminStudents();

      } catch (err) {

        showError(
          err.message
        );

      } finally {

        setLoading(false);

      }

    };


  /* =======================================================
     ADD TEACHER
  ======================================================= */

  const handleAddTeacher =
    async (event) => {

      event.preventDefault();

      setLoading(true);

      try {

        const data =
          await apiRequest(
            "/api/admin/teachers",
            {
              method: "POST",

              body:
                JSON.stringify(
                  teacherForm
                ),
            }
          );


        showMessage(
          `Teacher "${data.teacher.name}" created successfully`
        );


        setTeacherForm({

          username: "",
          password: "",
          name: "",
          email: "",
          phone: "",
          department: "AI&DS",

        });


        await loadAdminTeachers();

      } catch (err) {

        showError(
          err.message
        );

      } finally {

        setLoading(false);

      }

    };


  /* =======================================================
     ADMIN STUDENT EDIT
  ======================================================= */

  const startAdminStudentEdit =
    (student) => {

      setEditingAdminStudent(
        student
      );


      setAdminStudentForm({

        username:
          student.username || "",

        password: "",

        name:
          student.name || "",

        email:
          student.email || "",

        phone:
          student.phone || "",

        department:
          student.department || "",

        year:
          student.year || "",

        section:
          student.section || "",

        date_of_birth:
          student.date_of_birth ||
          "",

        address:
          student.address || "",

      });


      setView(
        "admin-edit-student"
      );

    };


  const handleAdminStudentUpdate =
    async (event) => {

      event.preventDefault();

      if (!editingAdminStudent) {
        return;
      }

      try {

        await apiRequest(
          `/api/admin/students/${editingAdminStudent.student_id}`,
          {
            method: "PUT",

            body:
              JSON.stringify({

                ...adminStudentForm,

                year:
                  Number(
                    adminStudentForm.year
                  ),

              }),
          }
        );


        showMessage(
          "Student updated successfully"
        );


        setEditingAdminStudent(
          null
        );


        setAdminStudentForm({

          username: "",
          password: "",
          name: "",
          email: "",
          phone: "",
          department: "",
          year: "",
          section: "",
          date_of_birth: "",
          address: "",

        });


        await loadAdminStudents();


        setView(
          "admin-students"
        );

      } catch (err) {

        showError(
          err.message
        );

      }

    };


  /* =======================================================
     ADMIN TEACHER EDIT
  ======================================================= */

  const startAdminTeacherEdit =
    (teacher) => {

      setEditingAdminTeacher(
        teacher
      );


      setAdminTeacherForm({

        username:
          teacher.username || "",

        password: "",

        name:
          teacher.name || "",

        email:
          teacher.email || "",

        phone:
          teacher.phone || "",

        department:
          teacher.department || "",

      });


      setView(
        "admin-edit-teacher"
      );

    };


  const handleAdminTeacherUpdate =
    async (event) => {

      event.preventDefault();

      if (!editingAdminTeacher) {
        return;
      }

      try {

        await apiRequest(
          `/api/admin/teachers/${editingAdminTeacher.teacher_id}`,
          {
            method: "PUT",

            body:
              JSON.stringify(
                adminTeacherForm
              ),
          }
        );


        showMessage(
          "Teacher updated successfully"
        );


        setEditingAdminTeacher(
          null
        );


        setAdminTeacherForm({

          username: "",
          password: "",
          name: "",
          email: "",
          phone: "",
          department: "",

        });


        await loadAdminTeachers();


        setView(
          "admin-teachers"
        );

      } catch (err) {

        showError(
          err.message
        );

      }

    };


  /* =======================================================
     TEACHER EDIT STUDENT
  ======================================================= */

  const startTeacherStudentEdit =
    (student) => {

      setEditingStudent(
        student
      );


      setEditForm({

        name:
          student.name || "",

        email:
          student.email || "",

        phone:
          student.phone || "",

        department:
          student.department || "",

        year:
          student.year || "",

        section:
          student.section || "",

        date_of_birth:
          student.date_of_birth ||
          "",

        address:
          student.address || "",

      });


      setView(
        "teacher-edit-student"
      );

    };


  const handleTeacherStudentUpdate =
    async (event) => {

      event.preventDefault();

      if (!editingStudent) {
        return;
      }

      try {

        await apiRequest(
          `/api/teacher/students/${editingStudent.student_id}`,
          {
            method: "PUT",

            body:
              JSON.stringify({
                ...editForm,

                year:
                  Number(
                    editForm.year
                  ),
              }),
          }
        );


        showMessage(
          "Student updated successfully"
        );


        setEditingStudent(
          null
        );


        await loadTeacherStudents();


        setView(
          "teacher-students"
        );

      } catch (err) {

        showError(
          err.message
        );

      }

    };


  /* =======================================================
     ADD SUBJECT
  ======================================================= */

  const handleAddSubject =
    async (event) => {

      event.preventDefault();

      try {

        const data =
          await apiRequest(
            "/api/academic/subjects",
            {
              method: "POST",

              body:
                JSON.stringify({

                  ...subjectForm,

                  semester:
                    Number(
                      subjectForm.semester
                    ),

                }),
            }
          );


        showMessage(
          `Subject "${data.subject_name}" added successfully`
        );


        setSubjectForm({

          subject_name: "",
          department: "AI&DS",
          semester: 3,

        });


        await loadSubjects();

      } catch (err) {

        showError(
          err.message
        );

      }

    };


  /* =======================================================
     ADD MARKS
  ======================================================= */

  const handleAddMarks =
    async (event) => {

      event.preventDefault();


      if (
        !marksForm.student_id ||
        !marksForm.subject_id
      ) {

        showError(
          "Please select a student and subject"
        );

        return;

      }


      try {

        const data =
          await apiRequest(
            "/api/academic/marks",
            {
              method: "POST",

              body:
                JSON.stringify({

                  student_id:
                    Number(
                      marksForm.student_id
                    ),

                  subject_id:
                    Number(
                      marksForm.subject_id
                    ),

                  internal_mark:
                    Number(
                      marksForm.internal_mark
                    ),

                  external_mark:
                    Number(
                      marksForm.external_mark
                    ),

                }),
            }
          );


        showMessage(
          `Marks added successfully. Total: ${data.total_mark}`
        );


        setMarksForm({

          student_id: "",
          subject_id: "",
          internal_mark: "",
          external_mark: "",

        });

      } catch (err) {

        showError(
          err.message
        );

      }

    };


  /* =======================================================
     ADD ATTENDANCE
  ======================================================= */

  const handleAddAttendance =
    async (event) => {

      event.preventDefault();


      if (
        !attendanceForm.student_id ||
        !attendanceForm.subject_id
      ) {

        showError(
          "Please select a student and subject"
        );

        return;

      }


      try {

        const data =
          await apiRequest(
            "/api/academic/attendance",
            {
              method: "POST",

              body:
                JSON.stringify({

                  student_id:
                    Number(
                      attendanceForm.student_id
                    ),

                  subject_id:
                    Number(
                      attendanceForm.subject_id
                    ),

                  total_classes:
                    Number(
                      attendanceForm.total_classes
                    ),

                  attended_classes:
                    Number(
                      attendanceForm.attended_classes
                    ),

                }),
            }
          );


        showMessage(
          `Attendance added successfully: ${data.percentage}%`
        );


        setAttendanceForm({

          student_id: "",
          subject_id: "",
          total_classes: "",
          attended_classes: "",

        });

      } catch (err) {

        showError(
          err.message
        );

      }

    };


  /* =======================================================
     LOGIN PAGE
  ======================================================= */

  const renderLoginPage =
    () => {

      return (
        <div className="login-page">

          <div className="login-card">

            <div className="logo-circle">
              🎓
            </div>

            <h1>
              Student Management System
            </h1>

            <p className="login-subtitle">
              Manage students, teachers and
              academic performance
            </p>


            {message && (
              <div className="success-box">
                ✅ {message}
              </div>
            )}


            {error && (
              <div className="error-box">
                ❌ {error}
              </div>
            )}


            <form
              onSubmit={
                handleLogin
              }
            >

              <label>
                Username
              </label>

              <input
                type="text"
                value={
                  loginForm.username
                }

                onChange={(e) =>
                  setLoginForm({
                    ...loginForm,
                    username:
                      e.target.value,
                  })
                }

                placeholder="Enter username"

                autoComplete="username"

                required
              />


              <label>
                Password
              </label>

              <input
                type="password"
                value={
                  loginForm.password
                }

                onChange={(e) =>
                  setLoginForm({
                    ...loginForm,
                    password:
                      e.target.value,
                  })
                }

                placeholder="Enter password"

                autoComplete="current-password"

                required
              />


              <button
                className="primary-button login-button"
                type="submit"
                disabled={loading}
              >

                {loading
                  ? "Signing in..."
                  : "Login"}

              </button>

            </form>


            <div className="role-badges">

              <span>Admin</span>
              <span>Teacher</span>
              <span>Student</span>

            </div>

          </div>

        </div>
      );

    };


  /* =======================================================
     SIDEBAR
  ======================================================= */

  const renderSidebar =
    () => {

      let menuItems = [];


      if (role === "admin") {

        menuItems = [

          [
            "dashboard",
            "📊",
            "Dashboard",
          ],

          [
            "admin-students",
            "👨‍🎓",
            "Students",
          ],

          [
            "admin-teachers",
            "👨‍🏫",
            "Teachers",
          ],

          [
            "add-student",
            "➕",
            "Add Student",
          ],

          [
            "add-teacher",
            "➕",
            "Add Teacher",
          ],

        ];

      }


      if (role === "teacher") {

        menuItems = [

          [
            "dashboard",
            "📊",
            "Dashboard",
          ],

          [
            "teacher-students",
            "👨‍🎓",
            "Students",
          ],

          [
            "subject",
            "📚",
            "Add Subject",
          ],

          [
            "marks",
            "📝",
            "Add Marks",
          ],

          [
            "attendance",
            "📅",
            "Attendance",
          ],

        ];

      }


      if (role === "student") {

        menuItems = [

          [
            "dashboard",
            "📊",
            "Dashboard",
          ],

          [
            "profile",
            "👤",
            "My Profile",
          ],

          [
            "marks",
            "📝",
            "My Marks",
          ],

          [
            "attendance",
            "📅",
            "Attendance",
          ],

          [
            "performance",
            "📈",
            "Performance",
          ],

        ];

      }


      return (
        <aside className="sidebar">

          <div className="brand">

            <div className="brand-icon">
              🎓
            </div>

            <div>

              <strong>
                SMS
              </strong>

              <small>
                Management System
              </small>

            </div>

          </div>


          <div className="sidebar-section-title">
            MENU
          </div>


          <nav className="sidebar-menu">

            {menuItems.map(
              ([key, icon, label]) => (

                <button
                  key={key}
                  type="button"

                  className={
                    view === key
                      ? "sidebar-button active"
                      : "sidebar-button"
                  }

                  onClick={() => {

                    setView(key);


                    if (
                      key ===
                      "admin-students"
                    ) {

                      loadAdminStudents();

                    }


                    if (
                      key ===
                      "admin-teachers"
                    ) {

                      loadAdminTeachers();

                    }


                    if (
                      key ===
                      "teacher-students"
                    ) {

                      loadTeacherStudents();

                    }


                    if (
                      key ===
                      "marks" &&
                      role === "teacher"
                    ) {

                      loadTeacherStudents();
                      loadSubjects();

                    }


                    if (
                      key ===
                      "attendance" &&
                      role === "teacher"
                    ) {

                      loadTeacherStudents();
                      loadSubjects();

                    }


                    if (
                      key ===
                      "subject" &&
                      role === "teacher"
                    ) {

                      loadSubjects();

                    }


                    if (
                      role ===
                      "student"
                    ) {

                      loadRoleData();

                    }

                  }}
                >

                  <span>
                    {icon}
                  </span>

                  {label}

                </button>

              )
            )}

          </nav>


          <div className="sidebar-bottom">

            <div className="user-mini-card">

              <div className="avatar">
                {
                  username
                    .charAt(0)
                    .toUpperCase()
                }
              </div>

              <div>

                <strong>
                  {username}
                </strong>

                <small>
                  {role}
                </small>

              </div>

            </div>


            <button
              type="button"
              className="logout-button"
              onClick={
                handleLogout
              }
            >
              🚪 Logout
            </button>

          </div>

        </aside>
      );

    };


  /* =======================================================
     TOP BAR
  ======================================================= */

  const renderTopBar =
    () => {

      const titleMap = {

        dashboard:
          "Dashboard",

        "admin-students":
          "Manage Students",

        "admin-teachers":
          "Manage Teachers",

        "admin-edit-student":
          "Edit Student",

        "admin-edit-teacher":
          "Edit Teacher",

        "add-student":
          "Add Student",

        "add-teacher":
          "Add Teacher",

        "teacher-students":
          "Student Management",

        "teacher-edit-student":
          "Edit Student",

        subject:
          "Subjects",

        marks:
          role === "student"
            ? "My Marks"
            : "Add Marks",

        attendance:
          role === "student"
            ? "My Attendance"
            : "Attendance",

        profile:
          "My Profile",

        performance:
          "Performance",

      };


      return (
        <header className="topbar">

          <div>

            <h2>
              {
                titleMap[view] ||
                "Dashboard"
              }
            </h2>

            <p>
              Welcome back,{" "}
              {username}
            </p>

          </div>


          <div className="topbar-user">

            <div className="top-avatar">
              {
                username
                  .charAt(0)
                  .toUpperCase()
              }
            </div>

            <div>

              <strong>
                {username}
              </strong>

              <span>
                {role}
              </span>

            </div>

          </div>

        </header>
      );

    };


  /* =======================================================
     ADMIN DASHBOARD
  ======================================================= */

  const renderAdminDashboard =
    () => {

      return (
        <div>

          <div className="hero-panel">

            <div>

              <span className="eyebrow">
                ADMIN PORTAL
              </span>

              <h1>
                Welcome to the Admin Dashboard
              </h1>

              <p>
                Manage students, teachers,
                accounts and credentials.
              </p>

            </div>

            <div className="hero-icon">
              🏫
            </div>

          </div>


          <div className="dashboard-grid">

            <div className="info-card">

              <div className="card-icon purple">
                👨‍🎓
              </div>

              <h3>
                Students
              </h3>

              <div className="big-number">
                {
                  adminStudents.length
                }
              </div>

              <button
                type="button"
                className="small-button"

                onClick={() => {

                  loadAdminStudents();

                  setView(
                    "admin-students"
                  );

                }}
              >
                View Students
              </button>

            </div>


            <div className="info-card">

              <div className="card-icon blue">
                👨‍🏫
              </div>

              <h3>
                Teachers
              </h3>

              <div className="big-number">
                {
                  adminTeachers.length
                }
              </div>

              <button
                type="button"
                className="small-button"

                onClick={() => {

                  loadAdminTeachers();

                  setView(
                    "admin-teachers"
                  );

                }}
              >
                View Teachers
              </button>

            </div>


            <div className="info-card">

              <div className="card-icon green">
                🔐
              </div>

              <h3>
                Account Control
              </h3>

              <p>
                Change usernames and passwords
                for student and teacher accounts.
              </p>

            </div>

          </div>

        </div>
      );

    };


  /* =======================================================
     ADMIN STUDENTS
  ======================================================= */

  const renderAdminStudents =
    () => {

      return (
        <div className="content-card">

          <div className="section-heading">

            <div>

              <h2>
                All Students
              </h2>

              <p>
                View, edit and manage student
                login credentials.
              </p>

            </div>


            <button
              type="button"
              className="small-button"
              onClick={
                loadAdminStudents
              }
            >
              Refresh
            </button>

          </div>


          {adminStudents.length ===
          0 ? (

            <div className="empty-state">
              No students found.
            </div>

          ) : (

            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>

                    <th>ID</th>
                    <th>Username</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Year</th>
                    <th>Section</th>
                    <th>Action</th>

                  </tr>

                </thead>


                <tbody>

                  {adminStudents.map(
                    (student) => (

                      <tr
                        key={
                          student.student_id
                        }
                      >

                        <td>
                          {
                            student.student_id
                          }
                        </td>

                        <td>
                          {
                            student.username
                          }
                        </td>

                        <td>
                          {student.name}
                        </td>

                        <td>
                          {student.email}
                        </td>

                        <td>
                          {
                            student.department
                          }
                        </td>

                        <td>
                          {student.year}
                        </td>

                        <td>
                          {student.section}
                        </td>

                        <td>

                          <button
                            type="button"
                            className="table-button"

                            onClick={() =>
                              startAdminStudentEdit(
                                student
                              )
                            }
                          >
                            Edit
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>
      );

    };


  /* =======================================================
     ADMIN EDIT STUDENT
  ======================================================= */

  const renderAdminEditStudent =
    () => {

      if (!editingAdminStudent) {

        return (
          <div className="empty-state">
            No student selected.
          </div>
        );

      }


      return (
        <div className="content-card">

          <div className="section-heading">

            <div>

              <h2>
                Edit{" "}
                {
                  editingAdminStudent.name
                }
              </h2>

              <p>
                Change profile, username or
                password.
              </p>

            </div>


            <button
              type="button"
              className="cancel-button"

              onClick={() => {

                setEditingAdminStudent(
                  null
                );

                setView(
                  "admin-students"
                );

              }}
            >
              Cancel
            </button>

          </div>


          <form
            className="form-layout"

            onSubmit={
              handleAdminStudentUpdate
            }
          >

            <div className="form-section">

              <h3>
                Login Details
              </h3>


              <div className="form-grid">

                <FormInput
                  label="Username *"
                  value={
                    adminStudentForm.username
                  }
                  placeholder="student001"

                  onChange={(value) =>
                    setAdminStudentForm({
                      ...adminStudentForm,
                      username: value,
                    })
                  }
                />


                <FormInput
                  label="New Password"
                  type="password"

                  value={
                    adminStudentForm.password
                  }

                  placeholder="Leave empty to keep current password"

                  onChange={(value) =>
                    setAdminStudentForm({
                      ...adminStudentForm,
                      password: value,
                    })
                  }
                />

              </div>

            </div>


            <div className="form-section">

              <h3>
                Student Details
              </h3>


              <div className="form-grid">

                <FormInput
                  label="Name"
                  value={
                    adminStudentForm.name
                  }

                  onChange={(value) =>
                    setAdminStudentForm({
                      ...adminStudentForm,
                      name: value,
                    })
                  }
                />


                <FormInput
                  label="Email"
                  type="email"
                  value={
                    adminStudentForm.email
                  }

                  onChange={(value) =>
                    setAdminStudentForm({
                      ...adminStudentForm,
                      email: value,
                    })
                  }
                />


                <FormInput
                  label="Phone"
                  value={
                    adminStudentForm.phone
                  }

                  onChange={(value) =>
                    setAdminStudentForm({
                      ...adminStudentForm,
                      phone: value,
                    })
                  }
                />


                <FormInput
                  label="Department"
                  value={
                    adminStudentForm.department
                  }

                  onChange={(value) =>
                    setAdminStudentForm({
                      ...adminStudentForm,
                      department: value,
                    })
                  }
                />


                <FormInput
                  label="Year"
                  type="number"
                  value={
                    adminStudentForm.year
                  }

                  onChange={(value) =>
                    setAdminStudentForm({
                      ...adminStudentForm,
                      year: value,
                    })
                  }
                />


                <FormInput
                  label="Section"
                  value={
                    adminStudentForm.section
                  }

                  onChange={(value) =>
                    setAdminStudentForm({
                      ...adminStudentForm,
                      section: value,
                    })
                  }
                />


                <FormInput
                  label="Date of Birth"
                  type="date"

                  value={
                    adminStudentForm.date_of_birth
                  }

                  onChange={(value) =>
                    setAdminStudentForm({
                      ...adminStudentForm,
                      date_of_birth: value,
                    })
                  }
                />


                <FormInput
                  label="Address"
                  value={
                    adminStudentForm.address
                  }

                  onChange={(value) =>
                    setAdminStudentForm({
                      ...adminStudentForm,
                      address: value,
                    })
                  }
                />

              </div>

            </div>


            <button
              className="primary-button"
              type="submit"
            >
              Save Student Changes
            </button>

          </form>

        </div>
      );

    };


  /* =======================================================
     ADMIN TEACHERS
  ======================================================= */

  const renderAdminTeachers =
    () => {

      return (
        <div className="content-card">

          <div className="section-heading">

            <div>

              <h2>
                All Teachers
              </h2>

              <p>
                View, edit and manage teacher
                login credentials.
              </p>

            </div>


            <button
              type="button"
              className="small-button"
              onClick={
                loadAdminTeachers
              }
            >
              Refresh
            </button>

          </div>


          {adminTeachers.length ===
          0 ? (

            <div className="empty-state">
              No teachers found.
            </div>

          ) : (

            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>

                    <th>ID</th>
                    <th>Username</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Department</th>
                    <th>Action</th>

                  </tr>

                </thead>


                <tbody>

                  {adminTeachers.map(
                    (teacher) => (

                      <tr
                        key={
                          teacher.teacher_id
                        }
                      >

                        <td>
                          {
                            teacher.teacher_id
                          }
                        </td>

                        <td>
                          {
                            teacher.username
                          }
                        </td>

                        <td>
                          {teacher.name}
                        </td>

                        <td>
                          {teacher.email}
                        </td>

                        <td>
                          {teacher.phone}
                        </td>

                        <td>
                          {
                            teacher.department
                          }
                        </td>

                        <td>

                          <button
                            type="button"
                            className="table-button"

                            onClick={() =>
                              startAdminTeacherEdit(
                                teacher
                              )
                            }
                          >
                            Edit
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>
      );

    };


  /* =======================================================
     ADMIN EDIT TEACHER
  ======================================================= */

  const renderAdminEditTeacher =
    () => {

      if (!editingAdminTeacher) {

        return (
          <div className="empty-state">
            No teacher selected.
          </div>
        );

      }


      return (
        <div className="content-card">

          <div className="section-heading">

            <div>

              <h2>
                Edit{" "}
                {
                  editingAdminTeacher.name
                }
              </h2>

              <p>
                Change profile, username or
                password.
              </p>

            </div>


            <button
              type="button"
              className="cancel-button"

              onClick={() => {

                setEditingAdminTeacher(
                  null
                );

                setView(
                  "admin-teachers"
                );

              }}
            >
              Cancel
            </button>

          </div>


          <form
            className="form-layout"

            onSubmit={
              handleAdminTeacherUpdate
            }
          >

            <div className="form-section">

              <h3>
                Login Details
              </h3>


              <div className="form-grid">

                <FormInput
                  label="Username *"
                  value={
                    adminTeacherForm.username
                  }

                  placeholder="teacher001"

                  onChange={(value) =>
                    setAdminTeacherForm({
                      ...adminTeacherForm,
                      username: value,
                    })
                  }
                />


                <FormInput
                  label="New Password"
                  type="password"

                  value={
                    adminTeacherForm.password
                  }

                  placeholder="Leave empty to keep current password"

                  onChange={(value) =>
                    setAdminTeacherForm({
                      ...adminTeacherForm,
                      password: value,
                    })
                  }
                />

              </div>

            </div>


            <div className="form-section">

              <h3>
                Teacher Details
              </h3>


              <div className="form-grid">

                <FormInput
                  label="Name"
                  value={
                    adminTeacherForm.name
                  }

                  onChange={(value) =>
                    setAdminTeacherForm({
                      ...adminTeacherForm,
                      name: value,
                    })
                  }
                />


                <FormInput
                  label="Email"
                  type="email"

                  value={
                    adminTeacherForm.email
                  }

                  onChange={(value) =>
                    setAdminTeacherForm({
                      ...adminTeacherForm,
                      email: value,
                    })
                  }
                />


                <FormInput
                  label="Phone"
                  value={
                    adminTeacherForm.phone
                  }

                  onChange={(value) =>
                    setAdminTeacherForm({
                      ...adminTeacherForm,
                      phone: value,
                    })
                  }
                />


                <FormInput
                  label="Department"
                  value={
                    adminTeacherForm.department
                  }

                  onChange={(value) =>
                    setAdminTeacherForm({
                      ...adminTeacherForm,
                      department: value,
                    })
                  }
                />

              </div>

            </div>


            <button
              className="primary-button"
              type="submit"
            >
              Save Teacher Changes
            </button>

          </form>

        </div>
      );

    };


  /* =======================================================
     ADD STUDENT
  ======================================================= */

  const renderAddStudent =
    () => {

      return (
        <div className="content-card">

          <div className="section-heading">

            <div>

              <h2>
                Create Student Account
              </h2>

              <p>
                Create login credentials and
                student details.
              </p>

            </div>

          </div>


          <form
            className="form-layout"

            onSubmit={
              handleAddStudent
            }
          >

            <div className="form-section">

              <h3>
                Login Details
              </h3>


              <div className="form-grid">

                <FormInput
                  label="Username *"
                  value={
                    studentForm.username
                  }

                  placeholder="student002"

                  onChange={(value) =>
                    setStudentForm({
                      ...studentForm,
                      username: value,
                    })
                  }
                />


                <FormInput
                  label="Password *"
                  type="password"

                  value={
                    studentForm.password
                  }

                  placeholder="Enter password"

                  onChange={(value) =>
                    setStudentForm({
                      ...studentForm,
                      password: value,
                    })
                  }
                />

              </div>

            </div>


            <div className="form-section">

              <h3>
                Personal Details
              </h3>


              <div className="form-grid">

                <FormInput
                  label="Full Name *"
                  value={
                    studentForm.name
                  }

                  placeholder="Student Name"

                  onChange={(value) =>
                    setStudentForm({
                      ...studentForm,
                      name: value,
                    })
                  }
                />


                <FormInput
                  label="Email *"
                  type="email"

                  value={
                    studentForm.email
                  }

                  placeholder="student@example.com"

                  onChange={(value) =>
                    setStudentForm({
                      ...studentForm,
                      email: value,
                    })
                  }
                />


                <FormInput
                  label="Phone"
                  value={
                    studentForm.phone
                  }

                  placeholder="9876543210"

                  onChange={(value) =>
                    setStudentForm({
                      ...studentForm,
                      phone: value,
                    })
                  }
                />


                <FormInput
                  label="Date of Birth"
                  type="date"

                  value={
                    studentForm.date_of_birth
                  }

                  onChange={(value) =>
                    setStudentForm({
                      ...studentForm,
                      date_of_birth: value,
                    })
                  }
                />

              </div>

            </div>


            <div className="form-section">

              <h3>
                Academic Details
              </h3>


              <div className="form-grid">

                <FormInput
                  label="Department"
                  value={
                    studentForm.department
                  }

                  onChange={(value) =>
                    setStudentForm({
                      ...studentForm,
                      department: value,
                    })
                  }
                />


                <FormInput
                  label="Year"
                  type="number"

                  value={
                    studentForm.year
                  }

                  onChange={(value) =>
                    setStudentForm({
                      ...studentForm,
                      year: value,
                    })
                  }
                />


                <FormInput
                  label="Section"
                  value={
                    studentForm.section
                  }

                  onChange={(value) =>
                    setStudentForm({
                      ...studentForm,
                      section: value,
                    })
                  }
                />


                <FormInput
                  label="Address"
                  value={
                    studentForm.address
                  }

                  placeholder="Tamil Nadu"

                  onChange={(value) =>
                    setStudentForm({
                      ...studentForm,
                      address: value,
                    })
                  }
                />

              </div>

            </div>


            <button
              className="primary-button"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Creating..."
                : "Create Student"}
            </button>

          </form>

        </div>
      );

    };


  /* =======================================================
     ADD TEACHER
  ======================================================= */

  const renderAddTeacher =
    () => {

      return (
        <div className="content-card">

          <div className="section-heading">

            <div>

              <h2>
                Create Teacher Account
              </h2>

              <p>
                Create teacher login and profile.
              </p>

            </div>

          </div>


          <form
            className="form-layout"

            onSubmit={
              handleAddTeacher
            }
          >

            <div className="form-grid">

              <FormInput
                label="Username *"
                value={
                  teacherForm.username
                }

                placeholder="teacher002"

                onChange={(value) =>
                  setTeacherForm({
                    ...teacherForm,
                    username: value,
                  })
                }
              />


              <FormInput
                label="Password *"
                type="password"

                value={
                  teacherForm.password
                }

                placeholder="Enter password"

                onChange={(value) =>
                  setTeacherForm({
                    ...teacherForm,
                    password: value,
                  })
                }
              />


              <FormInput
                label="Full Name *"
                value={
                  teacherForm.name
                }

                placeholder="Teacher Name"

                onChange={(value) =>
                  setTeacherForm({
                    ...teacherForm,
                    name: value,
                  })
                }
              />


              <FormInput
                label="Email *"
                type="email"

                value={
                  teacherForm.email
                }

                placeholder="teacher@example.com"

                onChange={(value) =>
                  setTeacherForm({
                    ...teacherForm,
                    email: value,
                  })
                }
              />


              <FormInput
                label="Phone"
                value={
                  teacherForm.phone
                }

                placeholder="9876543210"

                onChange={(value) =>
                  setTeacherForm({
                    ...teacherForm,
                    phone: value,
                  })
                }
              />


              <FormInput
                label="Department"
                value={
                  teacherForm.department
                }

                onChange={(value) =>
                  setTeacherForm({
                    ...teacherForm,
                    department: value,
                  })
                }
              />

            </div>


            <button
              className="primary-button"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Creating..."
                : "Create Teacher"}
            </button>

          </form>

        </div>
      );

    };


  /* =======================================================
     TEACHER DASHBOARD
  ======================================================= */

  const renderTeacherDashboard =
    () => {

      return (
        <div>

          <div className="hero-panel teacher-hero">

            <div>

              <span className="eyebrow">
                TEACHER PORTAL
              </span>

              <h1>
                Manage your students
              </h1>

              <p>
                Update student details,
                subjects, marks and attendance.
              </p>

            </div>

            <div className="hero-icon">
              👨‍🏫
            </div>

          </div>


          <div className="dashboard-grid">

            <div className="info-card">

              <div className="card-icon purple">
                👨‍🎓
              </div>

              <h3>
                Total Students
              </h3>

              <div className="big-number">
                {
                  students.length
                }
              </div>

              <button
                type="button"
                className="small-button"

                onClick={() => {

                  loadTeacherStudents();

                  setView(
                    "teacher-students"
                  );

                }}
              >
                View Students
              </button>

            </div>


            <div className="info-card">

              <div className="card-icon blue">
                📚
              </div>

              <h3>
                Subjects
              </h3>

              <div className="big-number">
                {
                  subjects.length
                }
              </div>

              <button
                type="button"
                className="small-button"

                onClick={() => {

                  loadSubjects();

                  setView(
                    "subject"
                  );

                }}
              >
                Manage Subjects
              </button>

            </div>


            <div className="info-card">

              <div className="card-icon green">
                📅
              </div>

              <h3>
                Attendance
              </h3>

              <p>
                Record student attendance.
              </p>

              <button
                type="button"
                className="small-button"

                onClick={() => {

                  loadTeacherStudents();
                  loadSubjects();

                  setView(
                    "attendance"
                  );

                }}
              >
                Add Attendance
              </button>

            </div>

          </div>

        </div>
      );

    };


  /* =======================================================
     TEACHER STUDENTS
  ======================================================= */

  const renderTeacherStudents =
    () => {

      return (
        <div className="content-card">

          <div className="section-heading">

            <div>

              <h2>
                All Students
              </h2>

              <p>
                View and update student details.
              </p>

            </div>


            <button
              type="button"
              className="small-button"

              onClick={
                loadTeacherStudents
              }
            >
              Refresh
            </button>

          </div>


          {students.length ===
          0 ? (

            <div className="empty-state">
              No students found.
            </div>

          ) : (

            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Year</th>
                    <th>Section</th>
                    <th>Action</th>
                  </tr>

                </thead>


                <tbody>

                  {students.map(
                    (student) => (

                      <tr
                        key={
                          student.student_id
                        }
                      >

                        <td>
                          {
                            student.student_id
                          }
                        </td>

                        <td>
                          {student.name}
                        </td>

                        <td>
                          {student.email}
                        </td>

                        <td>
                          {
                            student.department
                          }
                        </td>

                        <td>
                          {student.year}
                        </td>

                        <td>
                          {student.section}
                        </td>

                        <td>

                          <button
                            type="button"
                            className="table-button"

                            onClick={() => {

                              setEditingStudent(
                                student
                              );


                              setEditForm({

                                name:
                                  student.name ||
                                  "",

                                email:
                                  student.email ||
                                  "",

                                phone:
                                  student.phone ||
                                  "",

                                department:
                                  student.department ||
                                  "",

                                year:
                                  student.year ||
                                  "",

                                section:
                                  student.section ||
                                  "",

                                date_of_birth:
                                  student.date_of_birth ||
                                  "",

                                address:
                                  student.address ||
                                  "",

                              });


                              setView(
                                "teacher-edit-student"
                              );

                            }}
                          >
                            Edit
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>
      );

    };


  /* =======================================================
     TEACHER EDIT STUDENT
  ======================================================= */

  const renderTeacherEditStudent =
    () => {

      if (!editingStudent) {

        return (
          <div className="empty-state">
            No student selected.
          </div>
        );

      }


      return (
        <div className="content-card">

          <div className="section-heading">

            <div>

              <h2>
                Edit{" "}
                {editingStudent.name}
              </h2>

              <p>
                Update student information.
              </p>

            </div>


            <button
              type="button"
              className="cancel-button"

              onClick={() => {

                setEditingStudent(null);

                setView(
                  "teacher-students"
                );

              }}
            >
              Cancel
            </button>

          </div>


          <form
            className="form-grid"

            onSubmit={
              handleTeacherStudentUpdate
            }
          >

            <FormInput
              label="Name"
              value={
                editForm.name
              }

              onChange={(value) =>
                setEditForm({
                  ...editForm,
                  name: value,
                })
              }
            />


            <FormInput
              label="Email"
              type="email"

              value={
                editForm.email
              }

              onChange={(value) =>
                setEditForm({
                  ...editForm,
                  email: value,
                })
              }
            />


            <FormInput
              label="Phone"
              value={
                editForm.phone
              }

              onChange={(value) =>
                setEditForm({
                  ...editForm,
                  phone: value,
                })
              }
            />


            <FormInput
              label="Department"
              value={
                editForm.department
              }

              onChange={(value) =>
                setEditForm({
                  ...editForm,
                  department: value,
                })
              }
            />


            <FormInput
              label="Year"
              type="number"

              value={
                editForm.year
              }

              onChange={(value) =>
                setEditForm({
                  ...editForm,
                  year: value,
                })
              }
            />


            <FormInput
              label="Section"
              value={
                editForm.section
              }

              onChange={(value) =>
                setEditForm({
                  ...editForm,
                  section: value,
                })
              }
            />


            <FormInput
              label="Date of Birth"
              type="date"

              value={
                editForm.date_of_birth
              }

              onChange={(value) =>
                setEditForm({
                  ...editForm,
                  date_of_birth: value,
                })
              }
            />


            <FormInput
              label="Address"
              value={
                editForm.address
              }

              onChange={(value) =>
                setEditForm({
                  ...editForm,
                  address: value,
                })
              }
            />


            <button
              className="primary-button"
              type="submit"
            >
              Save Changes
            </button>

          </form>

        </div>
      );

    };


  /* =======================================================
     SUBJECT
  ======================================================= */

  const renderSubject =
    () => {

      return (
        <div>

          <div className="content-card">

            <div className="section-heading">

              <div>

                <h2>
                  Add Subject
                </h2>

                <p>
                  Create a subject for
                  academic records.
                </p>

              </div>

            </div>


            <form
              className="form-layout"

              onSubmit={
                handleAddSubject
              }
            >

              <div className="form-grid">

                <FormInput
                  label="Subject Name"
                  value={
                    subjectForm.subject_name
                  }

                  placeholder="Data Structures"

                  onChange={(value) =>
                    setSubjectForm({
                      ...subjectForm,
                      subject_name:
                        value,
                    })
                  }
                />


                <FormInput
                  label="Department"
                  value={
                    subjectForm.department
                  }

                  onChange={(value) =>
                    setSubjectForm({
                      ...subjectForm,
                      department:
                        value,
                    })
                  }
                />


                <FormInput
                  label="Semester"
                  type="number"

                  value={
                    subjectForm.semester
                  }

                  onChange={(value) =>
                    setSubjectForm({
                      ...subjectForm,
                      semester:
                        value,
                    })
                  }
                />

              </div>


              <button
                className="primary-button"
                type="submit"
              >
                Add Subject
              </button>

            </form>

          </div>


          <div className="content-card chart-card">

            <div className="section-heading">

              <div>

                <h2>
                  Available Subjects
                </h2>

                <p>
                  These subjects appear in
                  marks and attendance.
                </p>

              </div>


              <button
                type="button"
                className="small-button"
                onClick={
                  loadSubjects
                }
              >
                Refresh
              </button>

            </div>


            {subjects.length ===
            0 ? (

              <div className="empty-state">
                No subjects available.
              </div>

            ) : (

              <div className="table-wrapper">

                <table>

                  <thead>

                    <tr>

                      <th>
                        Subject ID
                      </th>

                      <th>
                        Subject Name
                      </th>

                      <th>
                        Department
                      </th>

                      <th>
                        Semester
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {subjects.map(
                      (subject) => (

                        <tr
                          key={
                            subject.subject_id
                          }
                        >

                          <td>
                            {
                              subject.subject_id
                            }
                          </td>

                          <td>
                            {
                              subject.subject_name
                            }
                          </td>

                          <td>
                            {
                              subject.department
                            }
                          </td>

                          <td>
                            {
                              subject.semester
                            }
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>
      );

    };


  /* =======================================================
     MARKS
  ======================================================= */

  const renderMarks =
    () => {

      if (role === "student") {

        return (
          <div className="content-card">

            <div className="section-heading">

              <div>

                <h2>
                  My Marks
                </h2>

                <p>
                  Your academic marks.
                </p>

              </div>

            </div>


            {marks.length ===
            0 ? (

              <div className="empty-state">
                No marks available.
              </div>

            ) : (

              <div className="table-wrapper">

                <table>

                  <thead>

                    <tr>

                      <th>
                        Subject
                      </th>

                      <th>
                        Internal
                      </th>

                      <th>
                        External
                      </th>

                      <th>
                        Total
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {marks.map(
                      (mark) => (

                        <tr
                          key={
                            mark.mark_id
                          }
                        >

                          <td>
                            {
                              mark.subject_name
                            }
                          </td>

                          <td>
                            {
                              mark.internal_mark
                            }
                          </td>

                          <td>
                            {
                              mark.external_mark
                            }
                          </td>

                          <td className="strong-cell">
                            {
                              mark.total_mark
                            }
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>
        );

      }


      return (
        <div className="content-card">

          <div className="section-heading">

            <div>

              <h2>
                Add Marks
              </h2>

              <p>
                Select student and subject
                from the dropdowns.
              </p>

            </div>


            <button
              type="button"
              className="small-button"

              onClick={() => {

                loadTeacherStudents();
                loadSubjects();

              }}
            >
              Refresh
            </button>

          </div>


          <form
            className="form-layout"

            onSubmit={
              handleAddMarks
            }
          >

            <div className="form-grid">


              <FormSelect
                label="Select Student *"

                value={
                  marksForm.student_id
                }

                onChange={(value) =>
                  setMarksForm({
                    ...marksForm,
                    student_id: value,
                  })
                }

                placeholder="Select Student"

                options={
                  students.map(
                    (student) => ({
                      value:
                        student.student_id,
                      label:
                        `${student.name} - ${student.email}`,
                    })
                  )
                }
              />


              <FormSelect
                label="Select Subject *"

                value={
                  marksForm.subject_id
                }

                onChange={(value) =>
                  setMarksForm({
                    ...marksForm,
                    subject_id: value,
                  })
                }

                placeholder="Select Subject"

                options={
                  subjects.map(
                    (subject) => ({
                      value:
                        subject.subject_id,
                      label:
                        `${subject.subject_name} | ${subject.department} | Sem ${subject.semester}`,
                    })
                  )
                }
              />


              <FormInput
                label="Internal Mark"
                type="number"

                value={
                  marksForm.internal_mark
                }

                placeholder="25"

                onChange={(value) =>
                  setMarksForm({
                    ...marksForm,
                    internal_mark:
                      value,
                  })
                }
              />


              <FormInput
                label="External Mark"
                type="number"

                value={
                  marksForm.external_mark
                }

                placeholder="60"

                onChange={(value) =>
                  setMarksForm({
                    ...marksForm,
                    external_mark:
                      value,
                  })
                }
              />

            </div>


            <button
              className="primary-button"
              type="submit"
            >
              Save Marks
            </button>

          </form>

        </div>
      );

    };


  /* =======================================================
     ATTENDANCE
  ======================================================= */

  const renderAttendance =
    () => {

      if (role === "student") {

        return (
          <div className="content-card">

            <div className="section-heading">

              <div>

                <h2>
                  My Attendance
                </h2>

                <p>
                  Your subject-wise attendance.
                </p>

              </div>

            </div>


            {attendance.length ===
            0 ? (

              <div className="empty-state">
                No attendance available.
              </div>

            ) : (

              <div className="table-wrapper">

                <table>

                  <thead>

                    <tr>

                      <th>
                        Subject
                      </th>

                      <th>
                        Total Classes
                      </th>

                      <th>
                        Attended
                      </th>

                      <th>
                        Percentage
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {attendance.map(
                      (item) => (

                        <tr
                          key={
                            item.attendance_id
                          }
                        >

                          <td>
                            {
                              item.subject_name
                            }
                          </td>

                          <td>
                            {
                              item.total_classes
                            }
                          </td>

                          <td>
                            {
                              item.attended_classes
                            }
                          </td>

                          <td className="strong-cell">
                            {
                              item.percentage
                            }%
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>
        );

      }


      return (
        <div className="content-card">

          <div className="section-heading">

            <div>

              <h2>
                Add Attendance
              </h2>

              <p>
                Select student and subject
                from the dropdowns.
              </p>

            </div>


            <button
              type="button"
              className="small-button"

              onClick={() => {

                loadTeacherStudents();
                loadSubjects();

              }}
            >
              Refresh
            </button>

          </div>


          <form
            className="form-layout"

            onSubmit={
              handleAddAttendance
            }
          >

            <div className="form-grid">


              <FormSelect
                label="Select Student *"

                value={
                  attendanceForm.student_id
                }

                onChange={(value) =>
                  setAttendanceForm({
                    ...attendanceForm,
                    student_id:
                      value,
                  })
                }

                placeholder="Select Student"

                options={
                  students.map(
                    (student) => ({
                      value:
                        student.student_id,

                      label:
                        `${student.name} - ${student.email}`,
                    })
                  )
                }
              />


              <FormSelect
                label="Select Subject *"

                value={
                  attendanceForm.subject_id
                }

                onChange={(value) =>
                  setAttendanceForm({
                    ...attendanceForm,
                    subject_id:
                      value,
                  })
                }

                placeholder="Select Subject"

                options={
                  subjects.map(
                    (subject) => ({
                      value:
                        subject.subject_id,

                      label:
                        `${subject.subject_name} | ${subject.department} | Sem ${subject.semester}`,
                    })
                  )
                }
              />


              <FormInput
                label="Total Classes"
                type="number"

                value={
                  attendanceForm.total_classes
                }

                placeholder="50"

                onChange={(value) =>
                  setAttendanceForm({
                    ...attendanceForm,
                    total_classes:
                      value,
                  })
                }
              />


              <FormInput
                label="Attended Classes"
                type="number"

                value={
                  attendanceForm.attended_classes
                }

                placeholder="45"

                onChange={(value) =>
                  setAttendanceForm({
                    ...attendanceForm,
                    attended_classes:
                      value,
                  })
                }
              />

            </div>


            <button
              className="primary-button"
              type="submit"
            >
              Save Attendance
            </button>

          </form>

        </div>
      );

    };


  /* =======================================================
     STUDENT DASHBOARD
  ======================================================= */

  const renderStudentDashboard =
    () => {

      const subjectInsights = marks
        .map((item) => ({
          ...item,
          mark: Number(
            item.total_mark || 0
          ),
          subject:
            item.subject_name ||
            "Unknown Subject",
        }))
        .sort(
          (a, b) =>
            a.mark - b.mark
        );

      const focusSubject =
        subjectInsights.length > 0
          ? subjectInsights[0]
          : null;

      const getSubjectAdvice =
        (mark) => {

          if (mark < 50) {
            return {
              level: "Needs Immediate Attention",
              advice:
                "Focus strongly on this subject. Revise the basic concepts, practice questions regularly and ask your teacher when you have doubts.",
              icon: "🔴",
            };
          }

          if (mark < 65) {
            return {
              level: "Needs Improvement",
              advice:
                "Spend extra study time on this subject. Revise important concepts and practice more questions before the next assessment.",
              icon: "🟠",
            };
          }

          if (mark < 75) {
            return {
              level: "Focus More",
              advice:
                "You have a basic understanding, but you should focus more on this subject to improve your score. Practice regularly and revise weak topics.",
              icon: "🟡",
            };
          }

          if (mark < 90) {
            return {
              level: "Good",
              advice:
                "Your performance is good. Keep practicing and revise the important topics regularly to maintain or improve your score.",
              icon: "🟢",
            };
          }

          return {
            level: "Excellent",
            advice:
              "Excellent performance. Keep maintaining this level and continue practicing advanced questions.",
            icon: "⭐",
          };
        };

      return (
        <div>

          <div className="hero-panel student-hero">

            <div>

              <span className="eyebrow">
                STUDENT PORTAL
              </span>

              <h1>
                Welcome,{" "}
                {
                  profile?.name ||
                  username
                }
              </h1>

              <p>
                View your profile, marks,
                attendance and performance.
              </p>

            </div>


            <div className="hero-icon">
              🎓
            </div>

          </div>


          <div className="dashboard-grid">

            <div className="info-card">

              <div className="card-icon purple">
                📝
              </div>

              <h3>
                Average Marks
              </h3>

              <div className="big-number">

                {
                  performance
                    ? performance.average_marks
                    : 0
                }

              </div>

            </div>


            <div className="info-card">

              <div className="card-icon green">
                📅
              </div>

              <h3>
                Attendance
              </h3>

              <div className="big-number">

                {
                  performance
                    ? performance.average_attendance
                    : 0
                }%

              </div>

            </div>


            <div className="info-card">

              <div className="card-icon blue">
                📚
              </div>

              <h3>
                Total Subjects
              </h3>

              <div className="big-number">

                {
                  performance
                    ? performance.total_subjects
                    : 0
                }

              </div>

            </div>

          </div>


          {/* =====================================================
             PERSONALIZED PERFORMANCE ADVICE
          ===================================================== */}

          <div
            className="content-card"
            style={{
              marginTop: "24px",
            }}
          >

            <div className="section-heading">

              <div>

                <h2>
                  🎯 Personalized Study Advice
                </h2>

                <p>
                  Your advice is based on your
                  subject-wise marks.
                </p>

              </div>

            </div>


            {!focusSubject ? (

              <div className="empty-state">
                No marks available yet.
                Once marks are added, this
                section will suggest which
                subjects need more focus.
              </div>

            ) : (

              <>

                <div className="info-card">

                  <div className="card-icon purple">
                    🎯
                  </div>

                  <h3>
                    {
                      focusSubject.mark < 75
                        ? "Subject You Should Focus On"
                        : "Subject to Keep Improving"
                    }
                  </h3>

                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      marginBottom: "8px",
                    }}
                  >
                    {focusSubject.subject}
                  </div>

                  <p>
                    Current Mark:{" "}
                    <strong>
                      {focusSubject.mark}
                    </strong>
                  </p>

                  <p>
                    {
                      focusSubject.mark < 75
                        ? `You should focus more on ${focusSubject.subject} based on your current mark.`
                        : `${focusSubject.subject} is currently your lowest-scoring subject. Keep practicing it to improve further.`
                    }
                  </p>

                </div>


                <div
                  className="dashboard-grid"
                  style={{
                    marginTop: "18px",
                  }}
                >

                  {subjectInsights.map(
                    (item) => {

                      const advice =
                        getSubjectAdvice(
                          item.mark
                        );

                      return (
                        <div
                          className="info-card"
                          key={
                            item.mark_id ||
                            item.subject_id ||
                            item.subject
                          }
                        >

                          <div className="card-icon blue">
                            {advice.icon}
                          </div>

                          <h3>
                            {item.subject}
                          </h3>

                          <div className="big-number">
                            {item.mark}
                          </div>

                          <p>
                            <strong>
                              {advice.level}
                            </strong>
                          </p>

                          <p>
                            {advice.advice}
                          </p>

                        </div>
                      );

                    }
                  )}

                </div>

              </>

            )}

          </div>

        </div>
      );

    };


  /* =======================================================
     PROFILE
  ======================================================= */

  const renderProfile =
    () => {

      return (
        <div className="content-card">

          <div className="section-heading">

            <div>

              <h2>
                My Profile
              </h2>

              <p>
                Your registered student details.
              </p>

            </div>

          </div>


          {profile ? (

            <div className="profile-grid">

              <ProfileItem
                title="Student ID"
                value={
                  profile.student_id
                }
              />

              <ProfileItem
                title="Name"
                value={
                  profile.name
                }
              />

              <ProfileItem
                title="Email"
                value={
                  profile.email
                }
              />

              <ProfileItem
                title="Phone"
                value={
                  profile.phone
                }
              />

              <ProfileItem
                title="Department"
                value={
                  profile.department
                }
              />

              <ProfileItem
                title="Year"
                value={
                  profile.year
                }
              />

              <ProfileItem
                title="Section"
                value={
                  profile.section
                }
              />

              <ProfileItem
                title="Date of Birth"
                value={
                  profile.date_of_birth
                }
              />

              <ProfileItem
                title="Address"
                value={
                  profile.address
                }
              />

            </div>

          ) : (

            <div className="empty-state">
              Loading profile...
            </div>

          )}

        </div>
      );

    };


  /* =======================================================
     PERFORMANCE
  ======================================================= */

  const renderPerformance =
    () => {

      return (
        <div>

          <div className="content-card">

            <div className="section-heading">

              <div>

                <h2>
                  Performance Analysis
                </h2>

                <p>
                  Subject-wise marks and
                  attendance performance.
                </p>

              </div>

            </div>


            <div className="performance-summary">

              <div className="performance-card">

                <h3>
                  Average Marks
                </h3>

                <div className="performance-number">

                  {
                    performance
                      ? performance.average_marks
                      : 0
                  }

                </div>

                <div className="progress-bar">

                  <div
                    className="progress-fill purple-fill"

                    style={{
                      width:
                        `${Math.min(
                          Number(
                            performance?.average_marks ||
                            0
                          ),
                          100
                        )}%`,
                    }}
                  />

                </div>

              </div>


              <div className="performance-card">

                <h3>
                  Average Attendance
                </h3>

                <div className="performance-number">

                  {
                    performance
                      ? performance.average_attendance
                      : 0
                  }%

                </div>

                <div className="progress-bar">

                  <div
                    className="progress-fill green-fill"

                    style={{
                      width:
                        `${Math.min(
                          Number(
                            performance?.average_attendance ||
                            0
                          ),
                          100
                        )}%`,
                    }}
                  />

                </div>

              </div>


              <div className="performance-card">

                <h3>
                  Total Subjects
                </h3>

                <div className="performance-number">

                  {
                    performance
                      ? performance.total_subjects
                      : 0
                  }

                </div>

              </div>

            </div>

          </div>


          <div className="content-card chart-card">

            <div className="section-heading">

              <div>

                <h2>
                  Subject-wise Marks
                </h2>

                <p>
                  Your marks for each subject.
                </p>

              </div>

            </div>


            {marks.length ===
            0 ? (

              <div className="empty-state">
                No marks available yet.
              </div>

            ) : (

              <div className="bar-chart">

                {marks.map(
                  (item) => {

                    const mark =
                      Number(
                        item.total_mark ||
                        0
                      );

                    const height =
                      Math.min(
                        mark,
                        100
                      );


                    return (

                      <div
                        className="bar-column"

                        key={
                          item.mark_id
                        }
                      >

                        <div className="bar-value">
                          {mark}
                        </div>


                        <div className="bar-area">

                          <div
                            className="chart-bar"

                            style={{
                              height:
                                `${height}%`,
                            }}
                          />

                        </div>


                        <div className="bar-label">
                          {
                            item.subject_name
                          }
                        </div>

                      </div>

                    );

                  }
                )}

              </div>

            )}

          </div>


          <div className="content-card chart-card">

            <div className="section-heading">

              <div>

                <h2>
                  Attendance Analysis
                </h2>

                <p>
                  Subject-wise attendance
                  percentage.
                </p>

              </div>

            </div>


            {attendance.length ===
            0 ? (

              <div className="empty-state">
                No attendance available yet.
              </div>

            ) : (

              <div className="attendance-chart">

                {attendance.map(
                  (item) => {

                    const percentage =
                      Number(
                        item.percentage ||
                        0
                      );


                    return (

                      <div
                        className="attendance-row"

                        key={
                          item.attendance_id
                        }
                      >

                        <div className="attendance-name">
                          {
                            item.subject_name
                          }
                        </div>


                        <div className="attendance-track">

                          <div
                            className="attendance-fill"

                            style={{
                              width:
                                `${Math.min(
                                  percentage,
                                  100
                                )}%`,
                            }}
                          />

                        </div>


                        <strong>
                          {percentage}%
                        </strong>

                      </div>

                    );

                  }
                )}

              </div>

            )}

          </div>

        </div>
      );

    };


  /* =======================================================
     ROUTER
  ======================================================= */

  const renderContent =
    () => {

      if (
        view === "dashboard"
      ) {

        if (role === "admin") {
          return renderAdminDashboard();
        }

        if (role === "teacher") {
          return renderTeacherDashboard();
        }

        if (role === "student") {
          return renderStudentDashboard();
        }

      }


      if (
        view === "admin-students"
      ) {
        return renderAdminStudents();
      }


      if (
        view === "admin-edit-student"
      ) {
        return renderAdminEditStudent();
      }


      if (
        view === "admin-teachers"
      ) {
        return renderAdminTeachers();
      }


      if (
        view === "admin-edit-teacher"
      ) {
        return renderAdminEditTeacher();
      }


      if (
        view === "add-student"
      ) {
        return renderAddStudent();
      }


      if (
        view === "add-teacher"
      ) {
        return renderAddTeacher();
      }


      if (
        view === "teacher-students"
      ) {
        return renderTeacherStudents();
      }


      if (
        view === "teacher-edit-student"
      ) {
        return renderTeacherEditStudent();
      }


      if (view === "subject") {
        return renderSubject();
      }


      if (view === "marks") {
        return renderMarks();
      }


      if (view === "attendance") {
        return renderAttendance();
      }


      if (view === "profile") {
        return renderProfile();
      }


      if (view === "performance") {
        return renderPerformance();
      }


      return renderAdminDashboard();

    };


  /* =======================================================
     LOGIN CHECK
  ======================================================= */

  if (!token || !role) {
    return renderLoginPage();
  }


  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <div className="app-layout">

      {renderSidebar()}


      <main className="main-area">

        {renderTopBar()}


        <div className="page-content">

          {message && (
            <div className="floating-success">
              ✅ {message}
            </div>
          )}


          {error && (
            <div className="floating-error">
              ❌ {error}
            </div>
          )}


          {renderContent()}

        </div>

      </main>

    </div>
  );
}

export default App;