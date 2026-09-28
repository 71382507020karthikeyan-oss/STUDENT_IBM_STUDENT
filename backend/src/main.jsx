import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import Dashboard from "./Dashboard.jsx";
import AddStudent from "./AddStudent.jsx";

function Root() {
  const path = window.location.pathname;

  if (path === "/dashboard") {
    return <Dashboard />;
  }

  if (path === "/add-student") {
    return <AddStudent />;
  }

  return <App />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>
);