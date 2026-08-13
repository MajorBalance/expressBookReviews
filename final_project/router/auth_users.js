const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Helper: Check if username exists
const isValid = (username) => users.some(u => u.username === username);

// Helper: Check credentials
const authenticatedUser = (username, password) => 
  users.some(u => u.username === username && u.password === password);

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }  
  const accessToken = jwt.sign({ username }, 'access_token', { expiresIn: '5m' });
  return res.status(200).json({ message: "Login successful", token: accessToken });
});

// Add/Modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;
  const username = req.user.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  
  if (!books[isbn].reviews) books[isbn].reviews = {};
  books[isbn].reviews[username] = review;
  return res.status(200).json({ message: "Review successfully added/updated", review: books[isbn].reviews });
});

// Delete Review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username;

  if (!books[isbn] || !books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found" });
  }
  delete books[isbn].reviews[username];
  return res.status(200).json({ message: "Review deleted successfully", review: books[isbn].reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;   