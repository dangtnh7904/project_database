const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const pool = require("./db");

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes

// Member Sign-In
app.post("/signin/member", async (req, res) => {
  const { email, password } = req.body;

  try {
    const query = "SELECT * FROM users WHERE email = $1;";
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    const user = result.rows[0];
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid password." });
    }

    res.status(200).json({ message: "Sign-in successful.", userId: user.user_id });
  } catch (error) {
    console.error("Error during sign-in:", error);
    res.status(500).json({ error: "Sign-in failed. Please try again." });
  }
});

// Librarian Sign-In
app.post("/signin/librarian", async (req, res) => {
  const { email, password } = req.body;

  try {
    const query = "SELECT * FROM staff WHERE mail = $1;";
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Staff not found." });
    }

    const staff = result.rows[0];
    if (staff.password !== password) {
      return res.status(401).json({ error: "Invalid password." });
    }

    res.status(200).json({ message: "Sign-in successful.", staffId: staff.staff_id });
  } catch (error) {
    console.error("Error during sign-in:", error);
    res.status(500).json({ error: "Sign-in failed. Please try again." });
  }
});

// Fetch user info
app.get("/user-info/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const userInfo = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [userId]
    );
    res.json(userInfo.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Fetch borrowing info
app.get("/borrowing-info/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const borrowingInfo = await pool.query(
      `SELECT r.reserve_date,r.return_date,r.due, b.title AS title
       FROM re r
       JOIN books b ON r.book_id = b.book_id
       WHERE r.user_id = $1`,
       [userId]
    );
    res.json(borrowingInfo.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Search books
app.get("/search-books", async (req, res) => {
  const { query } = req.query;
  try {
    const books = await pool.query(
      `SELECT b.book_id, b.title, b.genre, b.avg_star, a.name AS author
       FROM books b
       JOIN authors a ON b.author_id = a.author_id
       WHERE b.title ILIKE $1 OR b.author_id IN (SELECT author_id FROM authors WHERE name ILIKE $1)`,
       [`%${query}%`]
    );
    res.json(books.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Fetch popular books
app.get("/popular-books", async (req, res) => {
  try {
    const popularBooks = await pool.query(
      `SELECT b.title, b.genre, a.name AS author, b.avg_star
       FROM books b 
       JOIN authors a ON b.author_id = a.author_id 
       ORDER BY b.avg_star DESC 
       LIMIT 10`
    );
    res.json(popularBooks.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Fetch staff info
app.get("/staff-info/:staffId", async (req, res) => {
  const { staffId } = req.params;
  try {
    const staffInfo = await pool.query(
      "SELECT * FROM staff WHERE staff_id = $1",
      [staffId]
    );
    res.json(staffInfo.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Add new book
app.post("/books", async (req, res) => {
  const { title, author, genre } = req.body;
  try {
    const newBook = await pool.query(
      "INSERT INTO books (title, author, genre) VALUES ($1, $2, $3) RETURNING *",
      [title, author, genre]
    );
    res.json(newBook.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Update book
app.put("/books/:id", async (req, res) => {
  const { id } = req.params;
  const { title, author, genre } = req.body;
  try {
    const updatedBook = await pool.query(
      "UPDATE books SET title = $1, author = $2, genre = $3 WHERE book_id = $5 RETURNING *",
      [title, author, genre, id]
    );
    res.json(updatedBook.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Delete book
app.delete("/books/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM books WHERE book_id = $1", [id]);
    res.send("Book deleted successfully");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
