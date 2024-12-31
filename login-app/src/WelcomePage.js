import React from "react";

function WelcomePage({ setView }) {
  return (
    <div className="welcome-container">
      <h1>Welcome to the Library Management System</h1>
      <button onClick={() => setView("member-options")} className="btn">
        Sign In as Member
      </button>
      <button onClick={() => setView("librarian-signin")} className="btn">
        Sign In as Librarian
      </button>
    </div>
  );
}

export default WelcomePage;
