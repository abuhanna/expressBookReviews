const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
      return res.status(400).json({message: "User already exists!"});    
    }
  } 
  return res.status(400).json({message: "Username and/or password not provided."});
});

// Get the book list available in the shop using Promises (Task 10)
// This handler wraps the retrieval of the books list in a Promise to demonstrate non-blocking operations.
public_users.get('/', function (req, res) {
  const get_books = new Promise((resolve, reject) => {
    resolve(books);
  });
  get_books.then((b) => res.status(200).send(JSON.stringify(b, null, 4)));
});

// Get book details based on ISBN using Promises (Task 11)
// This handler extracts the ISBN parameter and searches for the matching book within a Promise.
// Successful matches resolve to the book object, while failures reject with a 404 status.
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const get_book = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject({status: 404, message: "Book not found"});
    }
  });
  get_book
    .then((book) => res.status(200).send(JSON.stringify(book, null, 4)))
    .catch((err) => res.status(err.status || 500).json({message: err.message}));
});
  
// Get book details based on author using Promises (Task 12)
// This handler scans the entire books catalog to filter books matching the given author name.
// Scans are handled asynchronously inside a Promise; rejects if no matching books are found.
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const get_books_by_author = new Promise((resolve, reject) => {
    const keys = Object.keys(books);
    const matchingBooks = [];
    // Iterate through all books to find matches
    for (let i = 0; i < keys.length; i++) {
      const book = books[keys[i]];
      if (book.author === author) {
        matchingBooks.push({
          isbn: keys[i],
          author: book.author,
          title: book.title,
          reviews: book.reviews
        });
      }
    }
    if (matchingBooks.length > 0) {
      resolve(matchingBooks);
    } else {
      reject({status: 404, message: "No books found by this author"});
    }
  });
  get_books_by_author
    .then((matching) => res.status(200).send(JSON.stringify(matching, null, 4)))
    .catch((err) => res.status(err.status || 500).json({message: err.message}));
});

// Get all books based on title using Promises (Task 13)
// Iterates through books asynchronously via a Promise, matching titles with the route parameter.
// Resolves to an array of matching books, or rejects if none are found.
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const get_books_by_title = new Promise((resolve, reject) => {
    const keys = Object.keys(books);
    const matchingBooks = [];
    // Iterate through all books to find matches
    for (let i = 0; i < keys.length; i++) {
      const book = books[keys[i]];
      if (book.title === title) {
        matchingBooks.push({
          isbn: keys[i],
          author: book.author,
          title: book.title,
          reviews: book.reviews
        });
      }
    }
    if (matchingBooks.length > 0) {
      resolve(matchingBooks);
    } else {
      reject({status: 404, message: "No books found with this title"});
    }
  });
  get_books_by_title
    .then((matching) => res.status(200).send(JSON.stringify(matching, null, 4)))
    .catch((err) => res.status(err.status || 500).json({message: err.message}));
});

// Get book reviews by ISBN
// Returns the review object directly if the book exists in our local store.
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).send(JSON.stringify(book.reviews, null, 4));
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});

// Helper client-side test functions using Axios to test Tasks 10-13 asynchronously
// These helper functions can be triggered to simulate HTTP client behavior.

// 1. Fetch the complete list of books
const getBooksAxios = () => {
  axios.get('http://localhost:5000/')
    .then(res => console.log("Axios Get Books Success"))
    .catch(err => console.error("Axios Get Books Error:", err.message));
};

// 2. Fetch book details by specific ISBN
const getBookByISBNAxios = (isbn) => {
  axios.get(`http://localhost:5000/isbn/${isbn}`)
    .then(res => console.log("Axios Get ISBN Success"))
    .catch(err => console.error("Axios Get ISBN Error:", err.message));
};

// 3. Fetch book details by specific author
const getBookByAuthorAxios = (author) => {
  axios.get(`http://localhost:5000/author/${author}`)
    .then(res => console.log("Axios Get Author Success"))
    .catch(err => console.error("Axios Get Author Error:", err.message));
};

// 4. Fetch book details by specific title
const getBookByTitleAxios = (title) => {
  axios.get(`http://localhost:5000/title/${title}`)
    .then(res => console.log("Axios Get Title Success"))
    .catch(err => console.error("Axios Get Title Error:", err.message));
};

module.exports.general = public_users;
