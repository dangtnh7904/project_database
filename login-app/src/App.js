import React, { useState } from "react";
import SignInForm from "./SignInForm";
import MemberHome from "./MemberHome";
import LibrarianHome from "./LibrarianHome";

function App() {
  const [view, setView] = useState(""); // Tracks current view
  const [userType, setUserType] = useState(""); // Tracks user type

  console.log("Current view:", view); // Debugging log
  console.log("Current userType:", userType); // Debugging log

  if (view === "signin") {
    return <SignInForm setView={setView} userType={userType} />;
  }

  if (view === "memberHome") {
    return <MemberHome />;
  }

  if (view === "librarianHome") {
    return <LibrarianHome />;
  }

  return (
    <div className="app-container">
      <h1>Library Management System</h1>
      <button
        onClick={() => {
          setUserType("member"); // Set user type to "member"
          setView("signin"); // Navigate to sign-in view
        }}
        className="btn"
      >
        Member Sign In
      </button>
      <button
        onClick={() => {
          setUserType("librarian"); // Set user type to "librarian"
          setView("signin"); // Navigate to sign-in view
        }}
        className="btn"
      >
        Librarian Sign In
      </button>
    </div>
  );
}

export default App;
