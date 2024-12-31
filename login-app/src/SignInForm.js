import React, { useState } from "react";

function SignInForm({ setView, userType }) {
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint =
      userType === "member"
        ? "http://localhost:5000/signin/member"
        : "http://localhost:5000/signin/librarian";

    try {
      console.log("Sending request to:", endpoint); // Debugging log
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Sign-in successful!"); // Debugging log

        // Store userId or staff_id in local storage
        if (userType === "member") {
          localStorage.setItem("userId", data.userId);
          setView("memberHome");
        } else {
          localStorage.setItem("staffId", data.staffId);
          setView("librarianHome");
        }
      } else {
        const errorData = await response.json();
        console.error("Sign-in failed:", errorData.error); // Debugging log
        alert(`Sign-in failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error during sign-in:", error); // Debugging log
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <h2>{userType === "member" ? "Member Sign In" : "Librarian Sign In"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
        />
        <button type="submit" className="btn">
          Sign In
        </button>
      </form>
      <button onClick={() => setView("")} className="btn back-btn">
        Back
      </button>
    </div>
  );
}

export default SignInForm;
