let Book = require('../models/book');
let Author = require('../models/author');
let Genre = require('../models/genre');
let Bookinstance = require('../models/bookinstance');

let async = require('async');
let {body, validationResult} = require('express-validator/check');
let {sanitizeBody} = require('express-validator/filter');

//Get the count of every model
exports.index = function (req, res, next) {

    async.parallel({
        book_count: function (callback) {
            Book.countDocuments().exec(callback);
        },
        author_count: function (callback) {
            Author.countDocuments().exec(callback);
        },
        genre_count: function (callback) {
            Genre.countDocuments().exec(callback);
        },
        bookinstance_count: function (callback) {
            Bookinstance.countDocuments().exec(callback);
        }
    }, function (err, results) {
        if (err) {return next(err);}

        res.render('index', {title: 'Wellcome to the local library', count: results});
    });

};

//Get the book list from the database
exports.book_list_get = function (req, res, next) {
    Book.find()
    .exec(function (err, books) {
        if (err) {return next(err);}

        res.render('book', {title: 'List of Books', books: books});
    });
};

exports.book_detail = function (req, res, next) {
    async.parallel({
        bookinstances: function (callback) {
            Bookinstance.find({'book': req.params.id}).exec(callback);
        },
        book: function (callback) {
            Book.findById(req.params.id)
            .populate('author genre')
            .exec(callback);
        }
    }, function (err, results) {
        if (err) {return next(err);}

        res.render('book_detail', {title: results.book.title + ' Detail', book: results.book, bookinstances: results.bookinstances});
    });
};

exports.book_create_get = function (req, res, next) {

    async.parallel(
        {
            genres: function (callback) {
                Genre.find().exec(callback);
            },
            authors: function (callback) {
                Author.find().exec(callback);
            }
        }, function (err, results) {
            if (err) {return next(err);}

            res.render('book_form', {title: 'Create a new book', authors: results.authors, genres: results.genres});
        }
    );
};

exports.book_create_post = [

    (req, res, next) => {
        if (!(req.body.genre instanceof Array)) {
            if (typeof req.body.genre !== undefined) {
                req.body.genre = new Array(req.body.genre);
            } else {
                req.body.genre = [];
            }
        }
        next();
    },

    body('title', 'The title of the book is required').trim().isLength({min: 1}),
    body('author', 'The author of the book is required').trim().isLength({min: 1}),
    body('summary', 'The summary of the book is required').trim().isLength({min: 1}),
    body('isbn', 'The isbn of the book is required').trim(),

    sanitizeBody('title').escape(),
    sanitizeBody('author').escape(),
    sanitizeBody('isbn').escape(),
    sanitizeBody('genre.*').escape(),

    (req, res, next) => {
        let errors = validationResult(req);

        let book = new Book({
            title: req.body.title,
            author: req.body.author,
            genre: req.body.genre,
            summary: req.body.summary,
            isbn: req.body.isbn
        });

        if (!errors.isEmpty()) {
            async.parallel({
                authors: function (callback) {
                    Author.find().exec(callback);
                },
                genres: function (callback) {
                    Genre.find().exec(callback);
                }
            }, function (err, results) {
                if (err) { return next(err); }

                for (let i = 0; i < results.genres.length; i++) {
                    if (book.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked = 'true';
                    }
                }
        
                res.render('book_form', {title: 'New book', errors: errors.array(), book: book, authors: results.authors, genres: results.genres});
            });
        } else {
            book.save({}, function (err, prod) {
                if (err) {return next(err);}

                res.redirect(prod.url);
            });
        }
    }

];

// Get book form to create a new book with author sent as request parameter
exports.book_create_id_get = function (req, res, next) {

    async.parallel(
        {
            genres: function (callback) {
                Genre.find().exec(callback);
            },
            authors: function (callback) {
                Author.find().exec(callback);
            }, 
            selectedGenre: function (callback) {
                Genre.findById(req.params.arg).exec(callback);
            },
            selectedAuthor: function (callback) {
                Author.findById(req.params.arg).exec(callback);
            }
        }, function (err, results) {
            if (err) {return next(err);}

            if (results.selectedGenre !== undefined && results.selectedGenre !== null) {
                console.log(results.selectedGenre);
                for (let i = 0; i < results.genres.length; i++) {
                    if (results.selectedGenre._id.toString().indexOf(results.genres[i]._id.toString()) > -1) {
                        results.genres[i].checked = 'true';
                    }
                }
            }

            res.render('book_form', {title: 'Create a new book', authors: results.authors, selectedAuthor: results.selectedAuthor, selectedGenre: results.selectedGenre, genres: results.genres});
        }
    );

};

// Get book form to create a new book with author sent as request parameter
// exports.book_create_genre_get = function (req, res, next) {

// //     async.parallel(
// //         {
// //             genres: function (callback) {
// //                 Genre.find().exec(callback);
// //             },
// //             authors: function (callback) {
// //                 Author.find().exec(callback);
// //             }
// //         }, function (err, results) {
// //             if (err) {return next(err);}
// //             console.log(req.params.genre);
// //             res.render('book_form', {title: 'Create a new book', authors: results.authors, selectedGenre: req.params.genre, genres: results.genres});
// //         }
// //     );

// };

exports.book_delete_get = function (req, res, next) {
    Book.findById(req.params.id).populate('author genre').exec(function (err, results) {
        if (err) {return next(err);}
        if (results === undefined) {
            res.redirect('/catalog/book');
        }
        res.render('book_delete', {title: 'Delete a book', book: results});
    });
};

exports.book_delete_post = function (req, res, next) {
    Book.findByIdAndRemove(req.params.id, function (err) {
        if (err) {return next(err);}

        res.render('book_delete', {title: 'Delete a book', message: 'The book is successfully deleted'});
    });
};

exports.book_update_get = function (req, res, next) {

    async.parallel({
        book: function (callback) {
            Book.findById(req.params.id).exec(callback);
        },
        authors: function (callback) {
            Author.find().exec(callback);
        },
        genres: function (callback) {
            Genre.find().exec(callback);
        }
    }, function (err, results) {
        if (err) {return next(err);}

        for (let i = 0; i < results.genres.length; i++) {
            if (results.book.genre.indexOf(results.genres[i]._id.toString()) > -1) {
                results.genres[i].checked = 'true';
            }
        }

        res.render('book_form', {title: 'Update ' + results.book.title, genres: results.genres, authors: results.authors, book: results.book});
    });

};

//Update a book
exports.book_update_post = [

    (req, res, next) => {
        if (!(req.body.genre instanceof Array)) {
            if (typeof req.body.genre === undefined) {
                req.body.genre = [];
            } else {
                req.body.genre = new Array(req.body.genre);
            }
        }
        next();
    },

    body('title', 'The title of the book is required').trim().isLength({min: 1}),
    body('author', 'The author of the book is required').trim().isAlphanumeric(),
    body('summary', 'The summary of the book is required').trim().isLength({min: 1}),
    body('isbn', 'The isbn of the book is required').trim().isLength({min: 1}),

    sanitizeBody('title').escape(),
    sanitizeBody('author').escape(),
    sanitizeBody('isbn').escape(),
    sanitizeBody('genre.*').escape(),

    (req, res, next) => {

        let errors = validationResult(req);

        let book = new Book({
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre,
            _id: req.params.id
        });

        if (!errors.isEmpty()) {
            async.parallel({
                authors: function (callback) {
                    Author.find().exec(callback);
                },
                genres: function (callback) {
                    Genre.find().exec(callback);
                }
            }, function (err, results) {
                if (err) { return next(err); }

                for (let i = 0; i < results.genres.length; i++) {
                    if (book.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genre[i].checked = 'true';
                    }
                }
        
                res.render('book_form', {title: 'Update' + book.title, errors: errors.array(), book: book, authors: results.authors, genres: results.genres});
            });
        } else {
            Book.findByIdAndUpdate(req.params.id, book, function (err, newBook) {
                if (err) {return next(err);}

                res.redirect(newBook.url);
            });
        }
    }
];