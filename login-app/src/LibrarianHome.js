import React, { useState, useEffect } from "react";
import Modal from "react-modal";

Modal.setAppElement("#root"); // Set the app element for accessibility

function LibrarianHome() {
  const [books, setBooks] = useState([]);
  const [staffInfo, setStaffInfo] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isStaffInfoModalOpen, setIsStaffInfoModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [bookFormData, setBookFormData] = useState({ title: "", author: "", genre: "", description: "" });

  // Fetch popular books on load
  useEffect(() => {
    fetch("http://localhost:5000/popular-books")
      .then((res) => res.json())
      .then((data) => setBooks(data))
      .catch((err) => console.error(err));
  }, []);

  // Fetch staff info on load
  useEffect(() => {
    const staffId = localStorage.getItem("staffId");
    if (staffId) {
      fetch(`http://localhost:5000/staff-info/${staffId}`)
        .then((res) => res.json())
        .then((data) => setStaffInfo(data))
        .catch((err) => console.error(err));
    } else {
      console.error("Staff ID not found in local storage");
    }
  }, []);

  // Add or update book
  const handleSaveBook = (e) => {
    e.preventDefault();
    const endpoint = selectedBook ? `http://localhost:5000/books/${selectedBook.id}` : "http://localhost:5000/books";
    const method = selectedBook ? "PUT" : "POST";

    fetch(endpoint, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookFormData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (selectedBook) {
          setBooks(books.map((book) => (book.id === data.id ? data : book)));
        } else {
          setBooks([...books, data]);
        }
        setIsBookModalOpen(false);
        setBookFormData({ title: "", author: "", genre: "", description: "" });
      })
      .catch((err) => console.error(err));
  };

  // Delete book
  const handleDeleteBook = (bookId) => {
    fetch(`http://localhost:5000/books/${bookId}`, { method: "DELETE" })
      .then(() => {
        setBooks(books.filter((book) => book.id !== bookId));
        handleSearch(); // Refresh search results to maintain 5 books
      })
      .catch((err) => console.error(err));
  };

  // Open book modal for adding or updating
  const openBookModal = (book = null) => {
    setSelectedBook(book);
    setBookFormData(book ? { title: book.title, author: book.author, genre: book.genre, description: book.description } : { title: "", author: "", genre: "", description: "" });
    setIsBookModalOpen(true);
  };

  // Handle search
  const handleSearch = () => {
    fetch(`http://localhost:5000/search-books?query=${searchQuery}`)
      .then((res) => res.json())
      .then((data) => setSearchResults(data.slice(0, 5))) // Display top 5 results
      .catch((err) => console.error(err));
  };

  return (
    <div className="librarian-home">
      <h1>Welcome, Librarian!</h1>

      <div className="button-container">
        <button onClick={() => setIsSearchModalOpen(true)} className="btn">
          Search Books
        </button>
        <button onClick={() => setIsStaffInfoModalOpen(true)} className="btn">
          View Staff Info
        </button>
      </div>

      <div className="book-list">
        <h2>Book Inventory</h2>
        <ul>
          {books.map((book) => (
            <li key={book.id}>
              <h3>{book.title}</h3>
              <p>Author: {book.author}</p>
              <p>Genre: {book.genre}</p>
              <button onClick={() => openBookModal(book)} className="btn">Update</button>
              <button onClick={() => handleDeleteBook(book.id)} className="btn">Delete</button>
            </li>
          ))}
        </ul>
      </div>

      <Modal
        isOpen={isBookModalOpen}
        onRequestClose={() => setIsBookModalOpen(false)}
        contentLabel="Book Form"
      >
        <h2>{selectedBook ? "Update Book" : "Add New Book"}</h2>
        <form onSubmit={handleSaveBook}>
          <input
            type="text"
            placeholder="Title"
            value={bookFormData.title}
            onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Author"
            value={bookFormData.author}
            onChange={(e) => setBookFormData({ ...bookFormData, author: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Genre"
            value={bookFormData.genre}
            onChange={(e) => setBookFormData({ ...bookFormData, genre: e.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            value={bookFormData.description}
            onChange={(e) => setBookFormData({ ...bookFormData, description: e.target.value })}
            required
          />
          <button type="submit" className="btn">
            {selectedBook ? "Update Book" : "Add Book"}
          </button>
        </form>
        <button onClick={() => setIsBookModalOpen(false)} className="btn">
          Close
        </button>
      </Modal>

      <Modal
        isOpen={isStaffInfoModalOpen}
        onRequestClose={() => setIsStaffInfoModalOpen(false)}
        contentLabel="Staff Info"
      >
        <h2>Your Information</h2>
        {staffInfo && (
          <div>
            <p>Name: {staffInfo.name}</p>
            <p>Phone: {staffInfo.phone_number}</p>
            <p>Email: {staffInfo.mail}</p>
          </div>
        )}
        <button onClick={() => setIsStaffInfoModalOpen(false)} className="btn">
          Close
        </button>
      </Modal>

      <Modal
        isOpen={isSearchModalOpen}
        onRequestClose={() => setIsSearchModalOpen(false)}
        contentLabel="Search Books"
      >
        <h2>Search Books</h2>
        <input
          type="text"
          placeholder="Search by title or author"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch} className="btn">
          Search
        </button>
        <button onClick={() => openBookModal()} className="btn">
          Add New Book
        </button>
        <ul>
          {searchResults.map((book) => (
            <li key={book.id}>
              <h3>{book.title}</h3>
              <p>Author: {book.author}</p>
              <p>Genre: {book.genre}</p>
              <button onClick={() => openBookModal(book)} className="btn">Update</button>
              <button onClick={() => handleDeleteBook(book.id)} className="btn">Delete</button>
            </li>
          ))}
        </ul>
        <button onClick={() => setIsSearchModalOpen(false)} className="btn">
          Close
        </button>
      </Modal>
    </div>
  );
}

export default LibrarianHome;
