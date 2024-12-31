import React, { useState, useEffect } from "react";
import Modal from "react-modal";

Modal.setAppElement("#root"); // Set the app element for accessibility

function MemberHome() {
  const [userInfo, setUserInfo] = useState(null);
  const [borrowingInfo, setBorrowingInfo] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [isUserInfoModalOpen, setIsUserInfoModalOpen] = useState(false);
  const [isBorrowingInfoModalOpen, setIsBorrowingInfoModalOpen] = useState(false);
  const [isBookDetailModalOpen, setIsBookDetailModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Fetch popular books on load
  useEffect(() => {
    fetch("http://localhost:5000/popular-books")
      .then((res) => res.json())
      .then((data) => setPopularBooks(data))
      .catch((err) => console.error(err));
  }, []);

  // Fetch user info
  const handleViewUserInfo = () => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetch(`http://localhost:5000/user-info/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          setUserInfo(data);
          setIsUserInfoModalOpen(true);
        })
        .catch((err) => console.error(err));
    } else {
      console.error("User ID not found in local storage");
    }
  };

  // Fetch borrowing info
  const handleViewBorrowingInfo = () => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetch(`http://localhost:5000/borrowing-info/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          setBorrowingInfo(data);
          setIsBorrowingInfoModalOpen(true);
        })
        .catch((err) => console.error(err));
    } else {
      console.error("User ID not found in local storage");
    }
  };

  // Search books
  const handleSearch = () => {
    fetch(`http://localhost:5000/search-books?query=${searchQuery}`)
      .then((res) => res.json())
      .then((data) => setSearchResults(data))
      .catch((err) => console.error(err));
  };

  // View book detail
  const handleViewBookDetail = (book) => {
    setSelectedBook(book);
    setIsBookDetailModalOpen(true);
  };

  return (
    <div className="member-home">
      <h1>Welcome, Member!</h1>

      <div className="button-container">
        <button onClick={handleViewUserInfo} className="btn">
          View User Info
        </button>
        <button onClick={handleViewBorrowingInfo} className="btn">
          View Borrowing Info
        </button>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search by book title or author"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch} className="btn">
          Search
        </button>
      </div>

      <div className="popular-books">
        <h2>{searchResults.length > 0 ? "Search Results" : "Most Popular Books"}</h2>
        <ul>
          {(searchResults.length > 0 ? searchResults : popularBooks).map((book, index) => (
            <li key={index}>
              <h3>{book.title}</h3>
              <p>Genre: {book.genre}</p>
              <p>Author: {book.author}</p>
              <p>Rating: {book.avg_star}</p>
              <button onClick={() => handleViewBookDetail(book)} className="btn">View Detail</button>
            </li>
          ))}
        </ul>
      </div>

      <Modal
        isOpen={isUserInfoModalOpen}
        onRequestClose={() => setIsUserInfoModalOpen(false)}
        contentLabel="User Info"
      >
        <h2>Your Information</h2>
        {userInfo && (
          <div>
            <p>Name: {userInfo.user_name}</p>
            <p>Date of Birth: {userInfo.birth_year}</p>
            <p>Email: {userInfo.email}</p>
            <p>Address: {userInfo.address}</p>
          </div>
        )}
        <button onClick={() => setIsUserInfoModalOpen(false)} className="btn">
          Close
        </button>
      </Modal>

      <Modal
        isOpen={isBorrowingInfoModalOpen}
        onRequestClose={() => setIsBorrowingInfoModalOpen(false)}
        contentLabel="Borrowing Info"
      >
        <h2>Your Borrowing History</h2>
        {borrowingInfo.length > 0 && (
          <ul>
            {borrowingInfo.map((record, index) => (
              <li key={index}>
                Book Title: {record.title}, Reserve Date: {record.reserve_date}, Return Date: {record.return_date}, Due Date: {record.due}
              </li>
            ))}
          </ul>
        )}
        <button onClick={() => setIsBorrowingInfoModalOpen(false)} className="btn">
          Close
        </button>
      </Modal>

      <Modal
        isOpen={isBookDetailModalOpen}
        onRequestClose={() => setIsBookDetailModalOpen(false)}
        contentLabel="Book Detail"
      >
        <h2>Book Detail</h2>
        {selectedBook && (
          <div>
            <h3>{selectedBook.title}</h3>
            <p>Genre: {selectedBook.genre}</p>
            <p>Author: {selectedBook.author}</p>
            <p>Rating: {selectedBook.avg_star}</p>
            <p>Description: {selectedBook.description}</p> {/* Assuming there's a description field */}
          </div>
        )}
        <button onClick={() => setIsBookDetailModalOpen(false)} className="btn">
          Close
        </button>
      </Modal>
    </div>
  );
}

export default MemberHome;
