const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a user 
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }
  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  const booksList = Object.values(books);

  return res.status(200).send(JSON.stringify(booksList, null, 2));
  });

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).send(JSON.stringify(book, null, 2));
  }
  return res.status(404).json({ message: "Book not found" });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const { author } = req.params;
  const foundBooks = Object.values(books).filter(
    book => book.author.toLowerCase() === author.toLowerCase()
  );

  if (foundBooks.length > 0) {
    return res.status(200).send(JSON.stringify(foundBooks, null, 2));
  }
  return res.status(404).json({ message: "No books found by this author" });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const { title } = req.params;
  const foundBooks = Object.values(books).filter(
    book => book.title.toLowerCase() === title.toLowerCase()
  );

  if (foundBooks.length > 0) {
    return res.status(200).send(JSON.stringify(foundBooks, null, 2));
  }
  return res.status(404).json({ message: "No books found under this title" });
});

// Get book reviews based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).send(JSON.stringify(book.reviews, null, 2));
  }
  return res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;  