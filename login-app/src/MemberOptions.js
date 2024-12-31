import React from "react";

function MemberOptions({ setView }) {
  return (
    <div className="member-options-container">
      <h2>Member Options</h2>
      <button onClick={() => setView("signin")} className="btn">Sign In</button>
      <button onClick={() => setView("welcome")} className="btn back-btn">Back</button>
    </div>
  );
}

export default MemberOptions;
