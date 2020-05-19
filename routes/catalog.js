let express = require('express');
let router = express.Router();

let book_control = require('../controllers/book_controller');
let author_control = require('../controllers/author_controllers');
let genre_control = require('../controllers/genre._control');
let bookinstance_control = require('../controllers/bookinstance_controllers');

// Get request to display the home page
router.get('/', book_control.index);

/* BOOK ROUTER */

// Get request to desplay the book list page 
router.get('/book', book_control.book_list_get);

// Get request to desplay the book create form
router.get('/book/create', book_control.book_create_get);

// Post request to create a new book
router.post('/book/create', book_control.book_create_post);

// Get request to desplay the book create form with author id
router.get('/book/create/author/:arg', book_control.book_create_id_get);

// Get request to desplay the book create form with genre id
router.get('/book/create/genre/:arg', book_control.book_create_id_get);

// Post request to create a new book with author id
// router.post('/book/create/:author', book_control.book_create_post);

// Get request to desplay the book detail
router.get('/book/:id', book_control.book_detail);

// Get request to desplay the update form 
router.get('/book/update/:id', book_control.book_update_get);

// Post request to update the book
router.post('/book/update/:id', book_control.book_update_post);

// Get request to desplay the delete page
router.get('/book/delete/:id', book_control.book_delete_get);

// Post request to delete a book
router.post('/book/delete/:id', book_control.book_delete_post);

/* AUTHOR ROUTER */

// Get request to display the author list
router.get('/author', author_control.author_list_get);

// Get request to display the author form
router.get('/author/create', author_control.author_create_get);

// Post request to create a new author
router.post('/author/create', author_control.author_create_post);

// Get request to desplay the author detail
router.get('/author/:id', author_control.author_detail);

// Get request to display the author update form
router.get('/author/update/:id', author_control.author_update_get);

// Post request to update an author
router.post('/author/update/:id', author_control.author_update_post);

// Get request to delete an author
router.get('/author/delete/:id', author_control.author_delete_get);

// Post request to delete an author
router.post('/author/delete/:id', author_control.author_delete_post);

/* GENRE ROUTER */

// Get request to display the list of the genres
router.get('/genre', genre_control.genre_list);

// Get get request to display the genre create form
router.get('/genre/create', genre_control.genre_create_get);

// Get request to display the single genre details
router.get('/genre/:id', genre_control.genre_detail);

// Post request to create a genre
router.post('/genre/create', genre_control.genre_create_post);

// Get request to despay the delete page
router.get('/genre/delete/:id', genre_control.genre_delete_get);

// Post request to delete a genre
router.post('/genre/delete/:id', genre_control.genre_delete_post);

// Get request to display the update form
router.get('/genre/update/:id', genre_control.genre_update_get);

// Post request to update a genre
router.post('/genre/update/:id', genre_control.genre_update_post);

/* BOOKINSTANCE ROUTER */

// Get request to display the list of bookinstances
router.get('/bookinstance', bookinstance_control.bookinstance_list);

// Get request to display the bookinstance create form
router.get('/bookinstance/create', bookinstance_control.bookinstance_create_get);

// Post request to create a bookinstance
router.post('/bookinstance/create', bookinstance_control.bookinstance_create_post);

// Get request to display the single bookinstance detail page
router.get('/bookinstance/:id', bookinstance_control.bookinstance_detail);

// Get request to display a bookinstance delete page 
router.get('/bookinstance/delete/:id', bookinstance_control.bookinstance_delete_get);

// Post request to delete a bookinstance
router.post('/bookinstance/delete/:id', bookinstance_control.bookinstance_delete_post);

// Get request to display the update form
router.get('/bookinstance/update/:id', bookinstance_control.bookinstance_update_get);

// Post request to update a bookinstance
router.post('/bookinstance/update/:id', bookinstance_control.bookinstance_update_post);


module.exports = router;