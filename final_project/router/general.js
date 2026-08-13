const express = require('express');
const axios = require('axios'); 
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

// Helper: Exposing raw book data for axios to fetch
public_users.get('/all-books-data', (req, res) => {
  return res.send(Object.values(books));
});

// Get the book list available in the shop (using Async/Await with Axios)
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/all-books-data');
    return res.status(200).send(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("Error fetching books:", error.message);
    return res.status(500).json({ message: "Failed to fetch books" });
  }
});

// Get book details based on ISBN (using async/await with Axios)
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    // Fetch all books data from the internal endpoint
    const response = await axios.get('http://localhost:5000/all-books-data');
    const books = response.data;
    // Find the specific book by ISBN
    const book = books.find(b => b.isbn === isbn) || books[isbn-1];

    if (book) {
      return res.status(200).send(JSON.stringify(book, null, 2));
    }
    return res.status(404).json({ message: "Book not found" });

  } catch (error) {
    console.error("Error fetching book by ISBN:", error.message);
    return res.status(500).json({ message: "Failed to fetch book details" });
  }
});   

// Get book details based on Author (using async/await with Axios)
public_users.get('/author/:author', async function (req, res) {
  const { author } = req.params;

  try {
    const response = await axios.get('http://localhost:5000/all-books-data');
    const books = response.data;
    // Filter the fetched array for matching authors
    const foundBooks = books.filter(
      book => book.author.toLowerCase() === author.toLowerCase()
    );

    if (foundBooks.length > 0) {
      return res.status(200).send(JSON.stringify(foundBooks, null, 2));
    }
    return res.status(404).json({ message: "No books found by this author" });

  } catch (error) {
    console.error("Error fetching books by author:", error.message);
    return res.status(500).json({ message: "Failed to fetch books" });
  }
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